<!-- src/views/admin/ItemForm.vue -->
<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { getItem, createItem, updateItem } from '@/api/item'
import { getCategories } from '@/api/category'

const baseURL = import.meta.env.VITE_API_BASE_URL.replace('/api', '')
const getItemImage = (img) =>
  img ? `${baseURL}/storage/images/items${img}` : `${baseURL}/storage/images/items/default.png`

const toast = useToast()
const route = useRoute()
const router = useRouter()

const loading = ref(false)
const submitting = ref(false)
const uploadingImage = ref(false)
const isDragOver = ref(false)
const uploadProgress = ref(0)
const imageError = ref('')
const fileInput = ref(null)

const item = ref({
  name: '',
  price: 0,
  category_id: null,
  is_sale: false,
  sale_price: 0,
  description: '',
  image: null, // Changed to null for file upload
})

const categories = ref([])
const currentImageUrl = ref('')
const selectedImageFile = ref(null)

const isEdit = computed(() => route.params.id !== undefined)
const pageTitle = computed(() => (isEdit.value ? 'Edit Item' : 'Create New Item'))

// Watch for image changes to update preview
watch(
  () => item.value.image,
  (newImage) => {
    if (newImage) {
      currentImageUrl.value = getItemImage(newImage)
    } else {
      currentImageUrl.value = getItemImage('default.png')
    }
  },
)

onMounted(async () => {
  await loadCategories()
  if (isEdit.value) {
    await loadItem()
  } else {
    // Set default image for new items
    currentImageUrl.value = getItemImage('default.png')
  }
})

const loadItem = async () => {
  loading.value = true
  try {
    const response = await getItem(route.params.id)
    item.value = response.data
    // Set current image URL when loading existing item
    if (item.value.image) {
      currentImageUrl.value = getItemImage(item.value.image)
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load item',
      life: 3000,
    })
    router.push('/admin/items')
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const response = await getCategories()
    categories.value = response.data
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load categories',
      life: 3000,
    })
  }
}

// Image Upload Functions
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = async (event) => {
  const file = event.target.files[0]
  if (file) {
    await processImageFile(file)
  }
  // Reset file input
  event.target.value = ''
}

const handleDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false

  const files = event.dataTransfer.files
  if (files.length > 0) {
    const file = files[0]
    if (file.type.startsWith('image/')) {
      processImageFile(file)
    } else {
      imageError.value = 'Please select an image file'
    }
  }
}

const handleDragOver = (event) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (event) => {
  event.preventDefault()
  isDragOver.value = false
}

const processImageFile = async (file) => {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    imageError.value = 'Please select a valid image file'
    return
  }

  // Validate file size (2MB limit as per your API)
  if (file.size > 2 * 1024 * 1024) {
    imageError.value = 'Image size must be less than 2MB'
    return
  }

  imageError.value = ''
  uploadingImage.value = true
  uploadProgress.value = 0

  try {
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      uploadProgress.value = Math.min(uploadProgress.value + 20, 90)
    }, 100)

    // Create image preview
    const reader = new FileReader()
    reader.onload = (e) => {
      currentImageUrl.value = e.target.result
    }
    reader.readAsDataURL(file)

    // Store the file for form submission
    selectedImageFile.value = file

    clearInterval(progressInterval)
    uploadProgress.value = 100

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Image selected successfully',
      life: 2000,
    })
  } catch (error) {
    imageError.value = 'Failed to process image. Please try again.'
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to process image',
      life: 3000,
    })
  } finally {
    uploadingImage.value = false
    uploadProgress.value = 0
    setTimeout(() => {
      imageError.value = ''
    }, 5000)
  }
}

const removeImage = async () => {
  // For existing items, we'll set image to null which should remove it on update
  // For new items, just clear the selected file
  selectedImageFile.value = null
  item.value.image = null
  currentImageUrl.value = getItemImage('default.png')

  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Image removed',
    life: 2000,
  })
}

const submitForm = async () => {
  submitting.value = true

  try {
    // Create FormData for the request
    const formData = new FormData()

    // Append all item data
    if (isEdit) {
      formData.append('id', item.value.id)
    }
    formData.append('name', item.value.name)
    formData.append('price', item.value.price)
    formData.append('category_id', item.value.category_id)
    formData.append('is_sale', item.value.is_sale ? '1' : '0')
    formData.append('sale_price', item.value.sale_price || '')
    formData.append('description', item.value.description || '')

    // Append image if selected
    if (selectedImageFile.value) {
      formData.append('image', selectedImageFile.value)
    } else if (item.value.image === null && isEdit.value) {
      // If image was removed in edit mode, we need to send null to remove it
      formData.append('image', '')
    }

    if (isEdit.value) {
      console.log(Object.fromEntries(formData))
      await updateItem(formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Item updated successfully',
        life: 3000,
      })
    } else {
      await createItem(formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Item created successfully',
        life: 3000,
      })
    }
    router.push('/admin/items')
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `Failed to ${isEdit.value ? 'update' : 'create'} item`,
      life: 3000,
    })
  } finally {
    submitting.value = false
  }
}

const cancel = () => {
  router.push('/admin/items')
}
</script>

<template>
  <div class="item-form">
    <!-- Animated Background -->
    <div class="page-background">
      <div class="floating-shape shape-1"></div>
      <div class="floating-shape shape-2"></div>
      <div class="floating-shape shape-3"></div>
    </div>

    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <div class="title-icon" :class="{ 'edit-mode': isEdit }">
            <i class="pi" :class="isEdit ? 'pi-pencil' : 'pi-plus'"></i>
          </div>
          <div class="title-text">
            <h2 class="page-title">{{ pageTitle }}</h2>
            <p class="page-subtitle">
              {{ isEdit ? 'Update item information' : 'Create a new menu item' }}
            </p>
          </div>
        </div>

        <button @click="cancel" class="back-btn">
          <div class="btn-content">
            <i class="pi pi-arrow-left"></i>
            <span>Back to Items</span>
          </div>
          <div class="btn-glow"></div>
        </button>
      </div>

      <div class="header-decoration">
        <div class="decoration-line"></div>
      </div>
    </div>

    <!-- Form Card -->
    <div class="form-card">
      <div class="card-header">
        <div class="card-icon">
          <i class="pi pi-shopping-bag"></i>
        </div>
        <div class="card-title">
          <h3>Item Details</h3>
          <p>Fill in the information below</p>
        </div>
        <div class="form-badge" :class="{ 'edit-badge': isEdit }">
          {{ isEdit ? 'Editing' : 'Creating' }}
        </div>
      </div>

      <div class="card-content">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading item data...</p>
        </div>

        <!-- Form -->
        <form
          v-else
          @submit.prevent="submitForm"
          class="form-container"
          enctype="multipart/form-data"
        >
          <div class="form-grid">
            <!-- Name Field -->
            <div class="form-field">
              <label for="name" class="field-label">
                <span>Item Name</span>
                <span class="required-star">*</span>
              </label>
              <div class="input-container">
                <div class="input-icon">
                  <i class="pi pi-tag"></i>
                </div>
                <input
                  id="name"
                  v-model="item.name"
                  type="text"
                  required
                  class="form-input"
                  :class="{ 'input-error': !item.name }"
                  placeholder="Enter item name"
                />
                <div class="input-underline"></div>
              </div>
              <div class="field-hint" v-if="!item.name">
                <i class="pi pi-exclamation-circle"></i>
                <span>Item name is required</span>
              </div>
            </div>

            <!-- Category Field -->
            <div class="form-field">
              <label for="category" class="field-label">
                <span>Category</span>
                <span class="required-star">*</span>
              </label>
              <div class="input-container">
                <div class="input-icon">
                  <i class="pi pi-folder"></i>
                </div>
                <select
                  id="category"
                  v-model="item.category_id"
                  required
                  class="form-input"
                  :class="{ 'input-error': !item.category_id }"
                >
                  <option value="" disabled>Select a category</option>
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
                <div class="select-arrow">
                  <i class="pi pi-chevron-down"></i>
                </div>
                <div class="input-underline"></div>
              </div>
              <div class="field-hint" v-if="!item.category_id">
                <i class="pi pi-exclamation-circle"></i>
                <span>Please select a category</span>
              </div>
            </div>

            <!-- Price Field -->
            <div class="form-field">
              <label for="price" class="field-label">
                <span>Regular Price</span>
                <span class="required-star">*</span>
              </label>
              <div class="input-container">
                <div class="input-icon">
                  <i class="pi pi-dollar"></i>
                </div>
                <input
                  id="price"
                  v-model.number="item.price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  class="form-input"
                  :class="{ 'input-error': item.price === null || item.price < 0 }"
                  placeholder="0.00"
                />
                <div class="input-underline"></div>
              </div>
              <div class="field-hint" v-if="item.price === null || item.price < 0">
                <i class="pi pi-exclamation-circle"></i>
                <span>Valid price is required</span>
              </div>
            </div>

            <!-- Sale Price Field -->
            <div class="form-field">
              <label for="sale_price" class="field-label">
                <span>Sale Price</span>
                <span class="optional-text">(optional)</span>
              </label>
              <div class="input-container">
                <div class="input-icon">
                  <i class="pi pi-percentage"></i>
                </div>
                <input
                  id="sale_price"
                  v-model.number="item.sale_price"
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-input"
                  :class="{ 'sale-active': item.is_sale }"
                  placeholder="0.00"
                  :disabled="!item.is_sale"
                />
                <div class="input-underline"></div>
              </div>
              <div class="field-hint" v-if="item.is_sale && item.sale_price > item.price">
                <i class="pi pi-info-circle"></i>
                <span>Sale price should be lower than regular price</span>
              </div>
            </div>
          </div>

          <!-- Image Upload Field -->
          <div class="form-field full-width">
            <label class="field-label">
              <span>Item Image</span>
              <span class="optional-text">(optional)</span>
            </label>
            <div class="image-upload-container">
              <!-- Current Image Preview -->
              <div v-if="currentImageUrl" class="current-image-preview">
                <img
                  :src="currentImageUrl"
                  alt="Current item image"
                  class="image-preview"
                  :class="{ 'default-image': !item.image && !selectedImageFile }"
                />
                <button
                  v-if="item.image || selectedImageFile"
                  @click="removeImage"
                  class="image-delete-btn"
                  type="button"
                >
                  <i class="pi pi-trash"></i>
                </button>
              </div>

              <!-- Upload Area -->
              <div
                class="upload-area"
                :class="{
                  'upload-area-dragover': isDragOver,
                  'upload-area-has-image': item.image || selectedImageFile,
                  'upload-area-uploading': uploadingImage,
                }"
                @click="triggerFileInput"
                @drop="handleDrop"
                @dragover="handleDragOver"
                @dragleave="handleDragLeave"
              >
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  @change="handleFileSelect"
                  class="file-input"
                />

                <div v-if="uploadingImage" class="upload-loading">
                  <div class="loading-spinner small"></div>
                  <span class="upload-text">Processing...</span>
                </div>

                <div v-else class="upload-content">
                  <i class="pi pi-cloud-upload upload-icon"></i>
                  <div class="upload-text">
                    <template v-if="!item.image && !selectedImageFile">
                      <p class="upload-title">Click to upload or drag and drop</p>
                      <p class="upload-subtitle">PNG, JPG, WEBP up to 2MB</p>
                    </template>
                    <template v-else>
                      <p class="upload-title">Click to change image</p>
                      <p class="upload-subtitle">Replace current image</p>
                    </template>
                  </div>
                </div>
              </div>

              <!-- Upload Progress -->
              <div v-if="uploadProgress > 0 && uploadingImage" class="upload-progress">
                <div class="progress-bar-container">
                  <div class="progress-bar-fill" :style="{ width: uploadProgress + '%' }"></div>
                </div>
                <span class="progress-text">{{ uploadProgress }}%</span>
              </div>

              <!-- Error Message -->
              <div v-if="imageError" class="field-hint error">
                <i class="pi pi-exclamation-triangle"></i>
                <span>{{ imageError }}</span>
              </div>
            </div>
          </div>

          <!-- Description Field -->
          <div class="form-field full-width">
            <label for="description" class="field-label">
              <span>Description</span>
              <span class="optional-text">(optional)</span>
            </label>
            <div class="input-container">
              <div class="textarea-icon">
                <i class="pi pi-file-edit"></i>
              </div>
              <textarea
                id="description"
                v-model="item.description"
                rows="4"
                class="form-textarea"
                placeholder="Describe this item... (ingredients, preparation, special notes)"
                maxlength="500"
              ></textarea>
              <div class="input-underline"></div>
            </div>
            <div class="char-count">{{ item.description.length }}/500 characters</div>
          </div>

          <!-- On Sale Toggle -->
          <div class="toggle-field">
            <div class="toggle-container">
              <label class="toggle-label">
                <div class="toggle-switch">
                  <input id="is_sale" v-model="item.is_sale" type="checkbox" class="toggle-input" />
                  <span class="toggle-slider"></span>
                </div>
                <div class="toggle-content">
                  <span class="toggle-title">On Sale</span>
                  <span class="toggle-description">Enable to set a special sale price</span>
                </div>
              </label>
              <div class="sale-badge" :class="{ active: item.is_sale }">
                {{ item.is_sale ? 'SALE ACTIVE' : 'REGULAR PRICE' }}
              </div>
            </div>
          </div>

          <!-- Price Preview -->
          <div class="price-preview" v-if="item.price > 0">
            <div class="preview-title">Price Preview</div>
            <div class="preview-prices">
              <div class="regular-price" :class="{ 'on-sale': item.is_sale }">
                ${{ item.price.toFixed(2) }}
              </div>
              <div v-if="item.is_sale && item.sale_price > 0" class="sale-price">
                ${{ item.sale_price.toFixed(2) }}
                <div class="discount-badge">
                  -{{ ((1 - item.sale_price / item.price) * 100).toFixed(0) }}%
                </div>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button type="button" @click="cancel" class="action-btn cancel-btn">
              <i class="pi pi-times"></i>
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              :disabled="
                submitting ||
                !item.name ||
                !item.category_id ||
                item.price === null ||
                item.price < 0
              "
              class="action-btn submit-btn"
              :class="{ loading: submitting }"
            >
              <div class="btn-spinner" v-if="submitting"></div>
              <i class="pi" :class="isEdit ? 'pi-check' : 'pi-plus'" v-else></i>
              <span>{{ isEdit ? 'Update Item' : 'Create Item' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Image Upload Styles */
.image-upload-container {
  column-gap: 0.5rem;
}

.current-image-preview {
  position: relative;
  display: inline-block;
  margin-bottom: 1rem;
}

.image-preview {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
}

.image-preview.default-image {
  opacity: 0.6;
  filter: grayscale(0.3);
}

.image-preview:hover {
  border-color: #3b82f6;
  transform: scale(1.05);
}

.image-delete-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: #ef4444;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.image-delete-btn:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.upload-area {
  position: relative;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f9fafb;
  min-height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area:hover {
  border-color: #3b82f6;
  background: #f0f9ff;
}

.upload-area-dragover {
  border-color: #3b82f6;
  background: #dbeafe;
  transform: scale(1.02);
}

.upload-area-has-image {
  border-style: solid;
  border-color: #10b981;
  background: #f0fdf4;
}

.upload-area-uploading {
  cursor: not-allowed;
  opacity: 0.7;
}

.file-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.upload-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.upload-icon {
  font-size: 2rem;
  color: #6b7280;
}

.upload-area:hover .upload-icon {
  color: #3b82f6;
}

.upload-text {
  color: #6b7280;
}

.upload-title {
  font-weight: 600;
  margin: 0;
  color: #374151;
}

.upload-subtitle {
  font-size: 0.875rem;
  margin: 0;
  color: #9ca3af;
}

.upload-progress {
  margin-top: 1rem;
  column-gap: 0.5rem;
}

.progress-bar-container {
  width: 100%;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 600;
}

.loading-spinner.small {
  width: 24px;
  height: 24px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .image-preview {
    width: 100px;
    height: 100px;
  }

  .upload-area {
    padding: 1.5rem;
    min-height: 120px;
  }

  .upload-icon {
    font-size: 1.5rem;
  }
}
.item-form {
  position: relative;
  min-height: 100%;
  padding-bottom: 24px;
}

/* Animated Background */
.page-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.floating-shape {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.03) 0%, rgba(79, 70, 229, 0.03) 100%);
  animation: float 18s infinite ease-in-out;
}

.shape-1 {
  width: 160px;
  height: 160px;
  top: 10%;
  right: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 120px;
  height: 120px;
  bottom: 15%;
  left: 8%;
  animation-delay: -6s;
}

.shape-3 {
  width: 80px;
  height: 80px;
  top: 40%;
  right: 20%;
  animation-delay: -12s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-20px) rotate(120deg);
  }
  66% {
    transform: translateY(10px) rotate(240deg);
  }
}

/* Header Styles */
.page-header {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.8);
  position: relative;
  z-index: 1;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
  transition: all 0.3s ease;
}

.title-icon.edit-mode {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3);
}

.title-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.page-subtitle {
  color: #64748b;
  font-size: 14px;
  margin: 0;
  font-weight: 500;
}

/* Back Button */
.back-btn {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  border: none;
  border-radius: 14px;
  padding: 0;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(100, 116, 139, 0.3);
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(100, 116, 139, 0.4);
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  color: white;
  font-weight: 600;
  font-size: 14px;
  position: relative;
  z-index: 2;
}

.btn-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s ease;
}

.back-btn:hover .btn-glow {
  left: 100%;
}

.header-decoration {
  display: flex;
  justify-content: center;
}

.decoration-line {
  height: 2px;
  width: 100px;
  background: linear-gradient(90deg, transparent, #10b981, transparent);
  border-radius: 2px;
}

.title-icon.edit-mode ~ .title-text + .header-decoration .decoration-line {
  background: linear-gradient(90deg, transparent, #f59e0b, transparent);
}

/* Form Card */
.form-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.8);
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.card-header {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;
}

.card-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
}

.card-title h3 {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.card-title p {
  color: #64748b;
  font-size: 14px;
  margin: 0;
}

.form-badge {
  position: absolute;
  top: 20px;
  right: 24px;
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
}

.form-badge.edit-badge {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 4px 8px rgba(245, 158, 11, 0.3);
}

.card-content {
  padding: 32px;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid #f1f5f9;
  border-top: 3px solid #7c3aed;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-state p {
  color: #64748b;
  font-size: 14px;
  margin: 0;
}

/* Form Container */
.form-container {
  max-width: 100%;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.form-field {
  position: relative;
}

.form-field.full-width {
  grid-column: 1 / -1;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.required-star {
  color: #ef4444;
}

.optional-text {
  color: #9ca3af;
  font-size: 12px;
  font-weight: 400;
}

.input-container {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  z-index: 2;
  transition: color 0.3s ease;
}

.textarea-icon {
  position: absolute;
  left: 12px;
  top: 16px;
  color: #6b7280;
  z-index: 2;
  transition: color 0.3s ease;
}

.form-input,
.form-textarea,
select.form-input {
  width: 100%;
  padding: 12px 12px 12px 44px;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.form-textarea {
  padding-top: 12px;
  padding-bottom: 12px;
  resize: vertical;
  min-height: 100px;
}

select.form-input {
  appearance: none;
  cursor: pointer;
}

.select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  z-index: 2;
  pointer-events: none;
}

.form-input:focus,
.form-textarea:focus,
select.form-input:focus {
  outline: none;
  border-color: #7c3aed;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}

.form-input:focus ~ .input-icon,
.form-textarea:focus ~ .textarea-icon {
  color: #7c3aed;
}

.input-error {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
}

.input-error ~ .input-icon {
  color: #ef4444;
}

.sale-active {
  border-color: #10b981 !important;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
}

.sale-active ~ .input-icon {
  color: #10b981;
}

.input-underline {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #7c3aed, #4f46e5);
  transition: width 0.3s ease;
  z-index: 2;
}

.form-input:focus ~ .input-underline,
.form-textarea:focus ~ .input-underline,
select.form-input:focus ~ .input-underline {
  width: 100%;
}

.field-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  font-size: 12px;
  color: #ef4444;
}

.field-hint i {
  font-size: 14px;
}

.char-count {
  text-align: right;
  margin-top: 4px;
  font-size: 12px;
  color: #9ca3af;
}

/* Toggle Field */
.toggle-field {
  margin: 32px 0;
  padding: 20px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.toggle-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
}

.toggle-switch {
  position: relative;
  width: 52px;
  height: 28px;
}

.toggle-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #e5e7eb;
  border-radius: 28px;
  transition: all 0.3s ease;
}

.toggle-slider:before {
  position: absolute;
  content: '';
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 4px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-input:checked + .toggle-slider {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
}

.toggle-input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

.toggle-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.toggle-title {
  font-weight: 600;
  color: #1f2937;
  font-size: 16px;
}

.toggle-description {
  color: #6b7280;
  font-size: 13px;
}

.sale-badge {
  background: #e5e7eb;
  color: #6b7280;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.sale-badge.active {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  color: white;
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
}

/* Price Preview */
.price-preview {
  margin: 24px 0;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.preview-title {
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
  font-size: 14px;
}

.preview-prices {
  display: flex;
  align-items: center;
  gap: 16px;
}

.regular-price {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.regular-price.on-sale {
  color: #9ca3af;
  text-decoration: line-through;
}

.sale-price {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 28px;
  font-weight: 800;
  color: #10b981;
}

.discount-badge {
  background: #ef4444;
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.cancel-btn {
  background: rgba(100, 116, 139, 0.1);
  color: #64748b;
}

.cancel-btn:hover {
  background: rgba(100, 116, 139, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.submit-btn {
  background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(124, 58, 237, 0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(124, 58, 237, 0.4);
}

.submit-btn:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.submit-btn.loading {
  background: #e5e7eb;
  color: transparent;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid #9ca3af;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .toggle-container {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .form-actions {
    flex-direction: column;
  }

  .action-btn {
    justify-content: center;
  }

  .card-content {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 20px;
  }

  .title-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .preview-prices {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
