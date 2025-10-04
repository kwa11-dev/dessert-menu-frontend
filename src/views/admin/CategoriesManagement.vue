<!-- src/views/admin/CategoriesManagement.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { getCategories, deleteCategory } from '@/api/category'
const baseURL = import.meta.env.VITE_API_BASE_URL.replace('/api', '')
const getCategoryImage = (img) =>
  img
    ? `${baseURL}/storage/images/categories${img}`
    : `${baseURL}/storage/images/categories/default.png`
const toast = useToast()
const router = useRouter()

const categories = ref([])
const loading = ref(false)
const deleteDialog = ref(false)
const categoryToDelete = ref(null)

onMounted(async () => {
  await loadCategories()
})

const loadCategories = async () => {
  loading.value = true
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
  } finally {
    loading.value = false
  }
}

const createNewCategory = () => {
  router.push('/admin/categories/new')
}

const editCategory = (id) => {
  console.log(id)
  router.push(`/admin/categories/edit/${id}`)
}

const confirmDelete = (category) => {
  categoryToDelete.value = category
  deleteDialog.value = true
}

const deleteCategoryHandler = async () => {
  if (!categoryToDelete.value) return

  try {
    await deleteCategory(categoryToDelete.value.id)
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Category deleted successfully',
      life: 3000,
    })
    await loadCategories()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete category',
      life: 3000,
    })
  } finally {
    deleteDialog.value = false
    categoryToDelete.value = null
  }
}
</script>

<template>
  <div class="categories-management">
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
          <div class="title-icon">
            <i class="pi pi-tags"></i>
          </div>
          <div class="title-text">
            <h2 class="page-title">Categories Management</h2>
            <p class="page-subtitle">Organize your menu with beautiful categories</p>
          </div>
        </div>

        <button @click="createNewCategory" class="create-btn">
          <div class="btn-content">
            <i class="pi pi-plus"></i>
            <span>New Category</span>
          </div>
          <div class="btn-glow"></div>
        </button>
      </div>

      <div class="header-decoration">
        <div class="decoration-line"></div>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="stats-overview">
      <div class="stat-item">
        <div class="stat-icon total-categories">
          <i class="pi pi-tags"></i>
        </div>
        <div class="stat-info">
          <h3 class="stat-value">{{ categories.length }}</h3>
          <p class="stat-label">Total Categories</p>
        </div>
      </div>

      <div class="stat-item">
        <div class="stat-icon items-count">
          <i class="pi pi-box"></i>
        </div>
        <div class="stat-info">
          <h3 class="stat-value">
            {{ categories.reduce((total, cat) => total + (cat.items?.length || 0), 0) }}
          </h3>
          <p class="stat-label">Total Items</p>
        </div>
      </div>

      <div class="stat-item">
        <div class="stat-icon empty-categories">
          <i class="pi pi-inbox"></i>
        </div>
        <div class="stat-info">
          <h3 class="stat-value">
            {{ categories.filter((cat) => !cat.items || cat.items.length === 0).length }}
          </h3>
          <p class="stat-label">Empty Categories</p>
        </div>
      </div>
    </div>

    <!-- Categories Grid -->
    <div class="categories-grid" v-if="!loading && categories.length > 0">
      <div
        v-for="category in categories"
        :key="category.id"
        class="category-card"
        :class="{ 'empty-category': !category.items || category.items.length === 0 }"
      >
        <div class="card-header">
          <div class="category-icon">
            <img
              :src="getCategoryImage(category.image)"
              :alt="category.name"
              class="category-image"
            />
          </div>
          <div class="category-actions">
            <button
              @click="editCategory(category.id)"
              class="action-btn edit-btn"
              v-tooltip="'Edit Category'"
            >
              <i class="pi pi-pencil"></i>
            </button>
            <button
              @click="confirmDelete(category)"
              class="action-btn delete-btn"
              v-tooltip="'Delete Category'"
              :disabled="category.items?.length > 0"
            >
              <i class="pi pi-trash"></i>
            </button>
          </div>
        </div>

        <div class="card-content">
          <h3 class="category-name">{{ category.name }}</h3>
        </div>

        <div class="card-footer">
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{
                width: Math.min(((category.items?.length || 0) / 10) * 100, 100) + '%',
              }"
            ></div>
          </div>
          <div class="last-updated">Updated recently</div>
        </div>

        <div class="card-hover-effect"></div>
      </div>
    </div>

    <!-- DataTable Fallback -->
    <div class="data-card" v-else>
      <div class="card-header">
        <div class="card-title">
          <h3>All Categories</h3>
          <p>Complete list of menu categories</p>
        </div>
      </div>

      <div class="table-container">
        <DataTable
          :value="categories"
          :loading="loading"
          :paginator="true"
          :rows="10"
          stripedRows
          dataKey="id"
          class="fancy-datatable"
        >
          <Column field="name" header="Name" sortable>
            <template #body="slotProps">
              <div class="category-cell">
                <div class="category-avatar">
                  {{ slotProps.data.name?.charAt(0) }}
                </div>
                <span class="category-name-text">{{ slotProps.data.name }}</span>
              </div>
            </template>

            <template #header>
              <div class="column-header">
                <span>Category Name</span>
                <i class="pi pi-sort-alt sort-icon"></i>
              </div>
            </template>
          </Column>

          <Column field="item_count" header="Items" sortable>
            <template #body="slotProps">
              <div class="items-count-cell">
                <div
                  class="count-badge"
                  :class="{
                    empty: !slotProps.data.items || slotProps.data.items.length === 0,
                  }"
                >
                  {{ slotProps.data.items?.length || 0 }}
                </div>
                <span class="count-text">items</span>
              </div>
            </template>

            <template #header>
              <div class="column-header">
                <span>Items Count</span>
                <i class="pi pi-box header-icon"></i>
              </div>
            </template>
          </Column>

          <Column header="Actions" :exportable="false" style="min-width: 12rem">
            <template #body="slotProps">
              <div class="action-buttons">
                <button
                  @click="editCategory(slotProps.data.id)"
                  class="action-btn edit-btn"
                  v-tooltip="'Edit Category'"
                >
                  <i class="pi pi-pencil"></i>
                  <div class="btn-ripple"></div>
                </button>
                <button
                  @click="confirmDelete(slotProps.data)"
                  class="action-btn delete-btn"
                  v-tooltip="'Delete Category'"
                  :disabled="slotProps.data.items?.length > 0"
                >
                  <i class="pi pi-trash"></i>
                  <div class="btn-ripple"></div>
                </button>
              </div>
            </template>

            <template #header>
              <div class="column-header">
                <span>Actions</span>
                <i class="pi pi-cog action-icon"></i>
              </div>
            </template>
          </Column>

          <template #empty>
            <div class="empty-state">
              <div class="empty-icon">
                <i class="pi pi-tags"></i>
              </div>
              <h3>No Categories Found</h3>
              <p>Start organizing your menu by creating categories</p>
              <button @click="createNewCategory" class="empty-action-btn">
                Create First Category
              </button>
            </div>
          </template>

          <template #loading>
            <div class="loading-state">
              <div class="loading-spinner"></div>
              <p>Loading categories...</p>
            </div>
          </template>
        </DataTable>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:visible="deleteDialog" :modal="true" class="fancy-dialog">
      <template #header>
        <div class="dialog-header">
          <div
            class="dialog-icon"
            :class="categoryToDelete?.items?.length > 0 ? 'warning' : 'danger'"
          >
            <i
              class="pi"
              :class="categoryToDelete?.items?.length > 0 ? 'pi-exclamation-triangle' : 'pi-trash'"
            ></i>
          </div>
          <h3>
            {{
              categoryToDelete?.items?.length > 0 ? 'Cannot Delete Category' : 'Confirm Deletion'
            }}
          </h3>
        </div>
      </template>

      <div class="dialog-content">
        <template v-if="categoryToDelete?.items?.length > 0">
          <div class="warning-message">
            <i class="pi pi-exclamation-circle"></i>
            <div class="message-content">
              <h4>Category Contains Items</h4>
              <p>
                The category
                <strong>"{{ categoryToDelete?.name }}"</strong> contains
                {{ categoryToDelete?.items?.length }} item(s) and cannot be deleted.
              </p>
              <p class="hint">Please move or delete all items from this category first.</p>
            </div>
          </div>
        </template>
        <template v-else>
          <p>
            Are you sure you want to delete the category
            <strong>"{{ categoryToDelete?.name }}"</strong>?
          </p>
          <p class="dialog-warning">This action cannot be undone.</p>
        </template>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <button @click="deleteDialog = false" class="dialog-btn cancel-btn">
            <span>Cancel</span>
          </button>
          <button
            v-if="!categoryToDelete?.items?.length > 0"
            @click="deleteCategoryHandler"
            class="dialog-btn confirm-btn"
          >
            <span>Delete Category</span>
            <i class="pi pi-trash"></i>
          </button>
          <button v-else @click="deleteDialog = false" class="dialog-btn understand-btn">
            <span>I Understand</span>
            <i class="pi pi-check"></i>
          </button>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.categories-management {
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
  animation: float 20s infinite ease-in-out;
}

.shape-1 {
  width: 180px;
  height: 180px;
  top: 15%;
  right: 8%;
  animation-delay: 0s;
}

.shape-2 {
  width: 120px;
  height: 120px;
  bottom: 25%;
  left: 8%;
  animation-delay: -7s;
}

.shape-3 {
  width: 90px;
  height: 90px;
  top: 60%;
  right: 20%;
  animation-delay: -14s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-25px) rotate(120deg);
  }
  66% {
    transform: translateY(15px) rotate(240deg);
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

/* Create Button */
.create-btn {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border: none;
  border-radius: 14px;
  padding: 0;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.3);
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(245, 158, 11, 0.4);
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
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

.create-btn:hover .btn-glow {
  left: 100%;
}

.header-decoration {
  display: flex;
  justify-content: center;
}

.decoration-line {
  height: 2px;
  width: 100px;
  background: linear-gradient(90deg, transparent, #f59e0b, transparent);
  border-radius: 2px;
}

/* Stats Overview */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
}

.stat-item {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
}

.stat-icon.total-categories {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.stat-icon.items-count {
  background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
}

.stat-icon.empty-categories {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.stat-label {
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
  margin: 0;
}

/* Categories Grid */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
}

.category-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.8);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.category-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.category-card.empty-category {
  opacity: 0.7;
}

.category-card.empty-category::before {
  content: 'Empty';
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(100, 116, 139, 0.1);
  color: #64748b;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.category-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.category-card.empty-category .category-icon {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
}

.category-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.edit-btn {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.delete-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.delete-btn:disabled {
  background: rgba(100, 116, 139, 0.1);
  color: #94a3b8;
  cursor: not-allowed;
  transform: none !important;
}

.action-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.edit-btn:not(:disabled):hover {
  background: #3b82f6;
  color: white;
}

.delete-btn:not(:disabled):hover {
  background: #ef4444;
  color: white;
}

.card-content {
  margin-bottom: 20px;
}

.category-name {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 12px 0;
  line-height: 1.2;
}

.items-count {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.count-number {
  font-size: 28px;
  font-weight: 800;
  background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.category-card.empty-category .count-number {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.count-label {
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-right: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b, #d97706);
  border-radius: 3px;
  transition: width 0.8s ease;
}

.category-card.empty-category .progress-fill {
  background: linear-gradient(90deg, #64748b, #475569);
}

.last-updated {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 500;
}

.card-hover-effect {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.6s ease;
}

.category-card:hover .card-hover-effect {
  left: 100%;
}

/* Data Card (Fallback) */
.data-card {
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
  padding: 24px 24px 0 24px;
  margin-bottom: 20px;
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

.table-container {
  padding: 0 24px 24px 24px;
}

/* Custom Table Styles */
:deep(.fancy-datatable) {
  border: none;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

:deep(.fancy-datatable .p-datatable-thead > tr > th) {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: none;
  padding: 16px;
  font-weight: 600;
  color: #475569;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

:deep(.fancy-datatable .p-datatable-tbody > tr > td) {
  border: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding: 16px;
  background: transparent;
}

:deep(.fancy-datatable .p-datatable-tbody > tr:hover) {
  background: rgba(245, 158, 11, 0.03);
  transform: translateX(4px);
}

/* Custom Cell Styles */
.column-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-icon,
.action-icon,
.header-icon {
  font-size: 12px;
  color: #94a3b8;
}

.category-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 14px;
  box-shadow: 0 4px 8px rgba(245, 158, 11, 0.3);
}

.category-name-text {
  font-weight: 600;
  color: #1e293b;
}

.items-count-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.count-badge {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 13px;
  box-shadow: 0 4px 8px rgba(124, 58, 237, 0.3);
}

.count-badge.empty {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
}

.count-text {
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.edit-btn {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.delete-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.delete-btn:disabled {
  background: rgba(100, 116, 139, 0.1);
  color: #94a3b8;
  cursor: not-allowed;
  transform: none !important;
}

.action-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.edit-btn:not(:disabled):hover {
  background: #3b82f6;
  color: white;
}

.delete-btn:not(:disabled):hover {
  background: #ef4444;
  color: white;
}

.btn-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: all 0.3s ease;
}

.action-btn:active .btn-ripple {
  width: 100%;
  height: 100%;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: #94a3b8;
  font-size: 32px;
}

.empty-state h3 {
  color: #475569;
  margin: 0 0 8px 0;
  font-size: 18px;
}

.empty-state p {
  color: #64748b;
  margin: 0 0 20px 0;
}

.empty-action-btn {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border: none;
  border-radius: 10px;
  padding: 10px 20px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.empty-action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3);
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 40px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f1f5f9;
  border-top: 3px solid #f59e0b;
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

/* Dialog Styles */
:deep(.fancy-dialog) {
  border-radius: 20px;
  border: none;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

:deep(.fancy-dialog .p-dialog-header) {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding: 24px;
}

:deep(.fancy-dialog .p-dialog-content) {
  background: white;
  padding: 24px;
}

:deep(.fancy-dialog .p-dialog-footer) {
  background: #f8fafc;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding: 20px 24px;
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dialog-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
}

.dialog-icon.warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.dialog-icon.danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.dialog-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 20px;
  font-weight: 700;
}

.dialog-content {
  color: #475569;
  line-height: 1.6;
}

.warning-message {
  display: flex;
  gap: 16px;
  background: rgba(245, 158, 11, 0.05);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 12px;
  padding: 16px;
}

.warning-message i {
  color: #f59e0b;
  font-size: 24px;
  flex-shrink: 0;
}

.message-content h4 {
  color: #d97706;
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
}

.message-content p {
  margin: 0 0 8px 0;
}

.hint {
  font-size: 13px;
  color: #64748b;
  font-style: italic;
}

.dialog-warning {
  color: #ef4444;
  font-size: 14px;
  font-weight: 500;
  margin: 8px 0 0 0;
}

.dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.dialog-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.cancel-btn {
  background: rgba(100, 116, 139, 0.1);
  color: #64748b;
}

.cancel-btn:hover {
  background: rgba(100, 116, 139, 0.2);
  transform: translateY(-1px);
}

.confirm-btn {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.confirm-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
}

.understand-btn {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.understand-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3);
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .stats-overview {
    grid-template-columns: 1fr;
  }

  .categories-grid {
    grid-template-columns: 1fr;
  }

  .dialog-footer {
    flex-direction: column;
  }

  .dialog-btn {
    justify-content: center;
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

  .category-card {
    padding: 20px;
  }

  .card-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .category-actions {
    align-self: flex-end;
  }
}
.category-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
