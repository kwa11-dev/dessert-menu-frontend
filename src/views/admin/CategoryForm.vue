<!-- src/views/admin/CategoryForm.vue -->
<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { getCategory, createCategory, updateCategory } from '@/api/category'

const baseURL = import.meta.env.VITE_API_BASE_URL.replace('/api', '')
const getCategoryImage = (img) =>
    img ? `${baseURL}/storage/${img}` : `${baseURL}/storage/default.png`

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

const category = ref({
  name: '',
  image: null
})

const currentImageUrl = ref('')
const selectedImageFile = ref(null)
console.log(route.params);
const isEdit = computed(() => route?.params?.id !== undefined)
const pageTitle = computed(() => isEdit.value ? 'Edit Category' : 'Create New Category')

// Watch for image changes to update preview
watch(() => category.value.image, (newImage) => {
  if (newImage) {
    currentImageUrl.value = getCategoryImage(newImage)
  } else {
    currentImageUrl.value = getCategoryImage('default.png')
  }
})

onMounted(async () => {
  if (isEdit.value) {
    await loadCategory()
  } else {
    // Set default image for new categories
    currentImageUrl.value = getCategoryImage('default.png')
  }
})

const loadCategory = async () => {
  loading.value = true
  try {
    const response = await getCategory(route.params.id)
    category.value = response.data
    // Set current image URL when loading existing category
    if (category.value.image) {
      currentImageUrl.value = getCategoryImage(category.value.image)
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load category',
      life: 3000
    })
    router.push('/admin/categories')
  } finally {
    loading.value = false
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

  // Validate file size (2MB limit)
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
      life: 2000
    })

  } catch (error) {
    imageError.value = 'Failed to process image. Please try again.'
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to process image',
      life: 3000
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
  // For existing categories, we'll set image to null which should remove it on update
  // For new categories, just clear the selected file
  selectedImageFile.value = null
  category.value.image = null
  currentImageUrl.value = getCategoryImage('default.png')

  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Image removed',
    life: 2000
  })
}

const submitForm = async () => {
  if (!category.value.name.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Validation Error',
      detail: 'Category name is required',
      life: 3000
    })
    return
  }

  submitting.value = true
  
  try {
    // Create FormData for the request
    const formData = new FormData()
    
    // Append category data
    formData.append('name', category.value.name)
    
    // Append image if selected
    if(isEdit){
      formData.append('id',category.value.id);
    }
    if (selectedImageFile.value) {
      formData.append('image', selectedImageFile.value)
    } else if (category.value.image === null && isEdit.value) {
      // If image was removed in edit mode, we need to send empty string to remove it
      formData.append('image', '')
    }

    if (isEdit.value) {
      await updateCategory(formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Category updated successfully',
        life: 3000
      })
    } else {
      await createCategory(formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Category created successfully',
        life: 3000
      })
    }
    router.push('/admin/categories')
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `Failed to ${isEdit.value ? 'update' : 'create'} category`,
      life: 3000
    })
  } finally {
    submitting.value = false
  }
}

const cancel = () => {
  router.push('/admin/categories')
}
</script>

<template>
  <div class="category-form">
    <!-- Animated Background -->
    <div class="page-background">
      <div class="floating-shape shape-1"></div>
      <div class="floating-shape shape-2"></div>
      <div class="floating-shape shape-3"></div>
      <div class="floating-shape shape-4"></div>
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
              {{ isEdit ? 'Update category information' : 'Create a new category to organize your menu' }}
            </p>
          </div>
        </div>
        
        <button 
          @click="cancel"
          class="back-btn"
        >
          <div class="btn-content">
            <i class="pi pi-arrow-left"></i>
            <span>Back to Categories</span>
          </div>
          <div class="btn-glow"></div>
        </button>
      </div>
      
      <div class="header-decoration">
        <div class="decoration-line"></div>
        <div class="decoration-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>

    <!-- Form Card -->
    <div class="form-card">
      <div class="card-header">
        <div class="card-icon">
          <i class="pi pi-tags"></i>
        </div>
        <div class="card-title">
          <h3>Category Details</h3>
          <p>Enter the category information below</p>
        </div>
        <div class="form-badge" :class="{ 'edit-badge': isEdit }">
          {{ isEdit ? 'Editing' : 'Creating' }}
        </div>
      </div>

      <div class="card-content">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading category data...</p>
          <div class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <!-- Form -->
        <form v-else @submit.prevent="submitForm" class="form-container" enctype="multipart/form-data">
          <!-- Name Field -->
          <div class="form-field">
            <label for="name" class="field-label">
              <span>Category Name</span>
              <span class="required-star">*</span>
            </label>
            <div class="input-container">
              <div class="input-icon">
                <i class="pi pi-tag"></i>
              </div>
              <input
                id="name"
                v-model="category.name"
                type="text"
                required
                class="form-input"
                :class="{ 'input-error': !category.name }"
                placeholder="Enter category name (e.g., Appetizers, Main Courses, Desserts)"
                maxlength="50"
              />
              <div class="input-underline"></div>
              <div class="input-focus-border"></div>
            </div>
            <div class="field-meta">
              <div class="char-count">
                {{ category.name.length }}/50 characters
              </div>
              <div class="field-hint" v-if="!category.name">
                <i class="pi pi-exclamation-circle"></i>
                <span>Category name is required</span>
              </div>
            </div>
          </div>

          <!-- Image Upload Field -->
          <div class="form-field">
            <label class="field-label">
              <span>Category Image</span>
              <span class="optional-text">(optional)</span>
            </label>
            <div class="image-upload-container">
              <!-- Current Image Preview -->
              <div v-if="currentImageUrl" class="current-image-preview">
                <img 
                  :src="currentImageUrl" 
                  alt="Current category image" 
                  class="image-preview"
                  :class="{ 'default-image': !category.image && !selectedImageFile }"
                />
                <button
                  v-if="category.image || selectedImageFile"
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
                  'upload-area-has-image': category.image || selectedImageFile,
                  'upload-area-uploading': uploadingImage
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
                    <template v-if="!category.image && !selectedImageFile">
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
                  <div 
                    class="progress-bar-fill" 
                    :style="{ width: uploadProgress + '%' }"
                  ></div>
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



          <!-- Quick Tips -->
          <div class="tips-card">
            <div class="tips-header">
              <i class="pi pi-lightbulb"></i>
              <h4>Quick Tips</h4>
            </div>
            <div class="tips-content">
              <div class="tip-item">
                <i class="pi pi-check-circle"></i>
                <span>Use clear, descriptive names</span>
              </div>
              <div class="tip-item">
                <i class="pi pi-check-circle"></i>
                <span>Keep names short and memorable</span>
              </div>
              <div class="tip-item">
                <i class="pi pi-check-circle"></i>
                <span>Add relevant images for better visual appeal</span>
              </div>
              <div class="tip-item">
                <i class="pi pi-check-circle"></i>
                <span>Consider your menu structure</span>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button 
              type="button" 
              @click="cancel"
              class="action-btn cancel-btn"
            >
              <i class="pi pi-times"></i>
              <span>Cancel</span>
            </button>
            <button 
              type="submit"
              :disabled="submitting || !category.name"
              class="action-btn submit-btn"
              :class="{ 'loading': submitting, 'pulse-animation': !category.name }"
            >
              <div class="btn-spinner" v-if="submitting"></div>
              <i class="pi" :class="isEdit ? 'pi-check' : 'pi-plus'" v-else></i>
              <span>{{ isEdit ? 'Update Category' : 'Create Category' }}</span>
              <div class="btn-shine"></div>
            </button>
          </div>
        </form>
      </div>

      <!-- Card Footer -->
      <div class="card-footer">
        <div class="footer-content">
          <i class="pi pi-info-circle"></i>
          <span>Categories help organize your menu and improve customer experience. Adding images makes them more appealing.</span>
        </div>
      </div>
    </div>

    <!-- Success Animation Overlay -->
    <div v-if="submitting" class="submit-overlay">
      <div class="overlay-content">
        <div class="success-animation">
          <div class="checkmark"></div>
        </div>
        <p class="overlay-text">
          {{ isEdit ? 'Updating Category...' : 'Creating Category...' }}
        </p>
      </div>
    </div>
  </div>
</template>
<style scoped>
.category-form {
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
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.03) 0%, rgba(217, 119, 6, 0.03) 100%);
  animation: float 20s infinite ease-in-out;
}

.shape-1 {
  width: 120px;
  height: 120px;
  top: 15%;
  right: 8%;
  animation-delay: 0s;
}

.shape-2 {
  width: 80px;
  height: 80px;
  bottom: 20%;
  left: 6%;
  animation-delay: -5s;
}

.shape-3 {
  width: 60px;
  height: 60px;
  top: 60%;
  right: 15%;
  animation-delay: -10s;
}

.shape-4 {
  width: 100px;
  height: 100px;
  bottom: 30%;
  right: 25%;
  animation-delay: -15s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg) scale(1);
  }
  25% {
    transform: translateY(-20px) rotate(90deg) scale(1.05);
  }
  50% {
    transform: translateY(10px) rotate(180deg) scale(0.95);
  }
  75% {
    transform: translateY(-15px) rotate(270deg) scale(1.02);
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
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3);
  transition: all 0.3s ease;
}

.title-icon.edit-mode {
  background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
  box-shadow: 0 8px 20px rgba(124, 58, 237, 0.3);
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
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.decoration-line {
  height: 2px;
  flex: 1;
  background: linear-gradient(90deg, transparent, #f59e0b, transparent);
  border-radius: 2px;
}

.title-icon.edit-mode ~ .title-text + .header-decoration .decoration-line {
  background: linear-gradient(90deg, transparent, #7c3aed, transparent);
}

.decoration-dots {
  display: flex;
  gap: 6px;
}

.decoration-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  animation: dot-pulse 2s infinite ease-in-out;
}

.decoration-dots span:nth-child(2) {
  animation-delay: 0.4s;
}

.decoration-dots span:nth-child(3) {
  animation-delay: 0.8s;
}

@keyframes dot-pulse {
  0%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
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
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
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
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 8px rgba(245, 158, 11, 0.3);
}

.form-badge.edit-badge {
  background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
  box-shadow: 0 4px 8px rgba(124, 58, 237, 0.3);
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
  border-top: 3px solid #f59e0b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p {
  color: #64748b;
  font-size: 14px;
  margin: 0 0 16px 0;
}

.loading-dots {
  display: flex;
  justify-content: center;
  gap: 4px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f59e0b;
  animation: loading-bounce 1.4s infinite ease-in-out;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes loading-bounce {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}

/* Form Container */
.form-container {
  max-width: 100%;
}

.form-field {
  position: relative;
  margin-bottom: 32px;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 12px;
  font-weight: 600;
  color: #374151;
  font-size: 16px;
}

.required-star {
  color: #ef4444;
  font-size: 18px;
}

.input-container {
  position: relative;
  max-width: 500px;
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  z-index: 2;
  transition: all 0.3s ease;
}

.form-input {
  width: 100%;
  padding: 16px 16px 16px 52px;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.form-input:focus {
  outline: none;
  border-color: #f59e0b;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.15);
  transform: translateY(-1px);
}

.form-input:focus ~ .input-icon {
  color: #f59e0b;
  transform: translateY(-50%) scale(1.1);
}

.input-error {
  border-color: #ef4444 !important;
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.15) !important;
}

.input-error ~ .input-icon {
  color: #ef4444;
}

.input-underline {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #f59e0b, #d97706);
  transition: width 0.3s ease;
  z-index: 2;
}

.form-input:focus ~ .input-underline {
  width: 100%;
}

.input-focus-border {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 18px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 0;
}

.form-input:focus ~ .input-focus-border {
  opacity: 1;
}

.field-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.char-count {
  font-size: 12px;
  color: #9ca3af;
}

.field-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #ef4444;
}

.field-hint i {
  font-size: 14px;
}

/* Preview Card */
.preview-card {
  background: linear-gradient(135deg, #fefce8 0%, #fef3c7 100%);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 16px;
  padding: 20px;
  margin: 24px 0;
  animation: slideUp 0.5s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.preview-header h4 {
  font-size: 16px;
  font-weight: 600;
  color: #92400e;
  margin: 0;
}

.preview-badge {
  background: rgba(245, 158, 11, 0.1);
  color: #92400e;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.preview-category {
  display: flex;
  align-items: center;
  gap: 12px;
}

.preview-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 18px;
  box-shadow: 0 4px 8px rgba(245, 158, 11, 0.3);
}

.preview-info {
  flex: 1;
}

.preview-name {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.preview-stats {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

/* Tips Card */
.tips-card {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 16px;
  padding: 20px;
  margin: 24px 0;
}

.tips-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.tips-header i {
  color: #0ea5e9;
  font-size: 18px;
}

.tips-header h4 {
  font-size: 16px;
  font-weight: 600;
  color: #0369a1;
  margin: 0;
}

.tips-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #475569;
}

.tip-item i {
  color: #10b981;
  font-size: 14px;
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
  padding: 14px 28px;
  border: none;
  border-radius: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  font-size: 14px;
}

.cancel-btn {
  background: rgba(100, 116, 139, 0.1);
  color: #64748b;
}

.cancel-btn:hover {
  background: rgba(100, 116, 139, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.submit-btn {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.3);
  position: relative;
  overflow: hidden;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
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

.submit-btn.pulse-animation {
  animation: pulse-gentle 2s infinite;
}

@keyframes pulse-gentle {
  0%, 100% {
    box-shadow: 0 4px 16px rgba(245, 158, 11, 0.3);
  }
  50% {
    box-shadow: 0 4px 20px rgba(245, 158, 11, 0.5);
  }
}

.btn-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid transparent;
  border-top: 2px solid #9ca3af;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.btn-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.6s ease;
}

.submit-btn:hover .btn-shine {
  left: 100%;
}

/* Card Footer */
.card-footer {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 16px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.footer-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #64748b;
}

.footer-content i {
  color: #6b7280;
}

/* Submit Overlay */
.submit-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.overlay-content {
  text-align: center;
  animation: fadeInUp 0.5s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.success-animation {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  position: relative;
}

.checkmark {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: block;
  stroke-width: 4;
  stroke: #f59e0b;
  stroke-miterlimit: 10;
  box-shadow: inset 0 0 0 #f59e0b;
  animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
  position: relative;
}

.checkmark__circle {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 4;
  stroke-miterlimit: 10;
  stroke: #f59e0b;
  fill: none;
  animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.checkmark__check {
  transform-origin: 50% 50%;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}

@keyframes stroke {
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes scale {
  0%, 100% {
    transform: none;
  }
  50% {
    transform: scale3d(1.1, 1.1, 1);
  }
}

@keyframes fill {
  100% {
    box-shadow: inset 0 0 0 30px #f59e0b;
  }
}

.overlay-text {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
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
  
  .input-container {
    max-width: 100%;
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
  
  .preview-category {
    flex-direction: column;
    align-items: flex-start;
    text-align: center;
  }
  
  .preview-icon {
    align-self: center;
  }
}
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
</style>