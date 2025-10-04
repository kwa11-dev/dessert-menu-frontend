<!-- src/views/admin/ItemsManagement.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { getItems, deleteItem } from '@/api/item'
import { getCategories } from '@/api/category'
const baseURL = import.meta.env.VITE_API_BASE_URL.replace('/api', '')
const getItemImage = (img) =>
  img ? `${baseURL}/storage/${img}` : `${baseURL}/storage/images/items/default.png`
const toast = useToast()
const router = useRouter()

const items = ref([])
const categories = ref([])
const loading = ref(false)
const deleteDialog = ref(false)
const itemToDelete = ref(null)

// Filters
const filters = ref({
  global: { value: null, matchMode: 'contains' },
  name: { value: null, matchMode: 'contains' },
  category: { value: null, matchMode: 'equals' },
})

const columns = [
  { field: 'image', header: '', sortable: false },
  { field: 'name', header: 'Name', sortable: false },

  { field: 'price', header: 'Price', sortable: false },
  { field: 'category', header: 'Category', sortable: false },
  { field: 'is_sale', header: 'On Sale', sortable: false },
  { field: 'sale_price', header: 'Sale Price', sortable: false },
  { field: 'description', header: 'Description' },
]

onMounted(async () => {
  await loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    const [itemsResponse, categoriesResponse] = await Promise.all([getItems(), getCategories()])
    items.value = itemsResponse.data
    categories.value = categoriesResponse.data
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load data',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

const createNewItem = () => {
  console.log('toggled')
  router.push('/admin/items/new')
}

const editItem = (id) => {
  router.push(`/admin/items/edit/${id}`)
}

const confirmDelete = (item) => {
  itemToDelete.value = item
  deleteDialog.value = true
}

const deleteItemHandler = async () => {
  if (!itemToDelete.value) return

  try {
    await deleteItem(itemToDelete.value.id)
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Item deleted successfully',
      life: 3000,
    })
    await loadData()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete item',
      life: 3000,
    })
  } finally {
    deleteDialog.value = false
    itemToDelete.value = null
  }
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'LBP',
  }).format(value)
}

const formatBoolean = (value) => {
  return value ? 'Yes' : 'No'
}
</script>

<template>
  <div class="items-management">
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
            <i class="pi pi-shopping-bag"></i>
          </div>
          <div class="title-text">
            <h2 class="page-title">Items Management</h2>
            <p class="page-subtitle">Manage your menu items and prices with style</p>
          </div>
        </div>

        <button @click="createNewItem" class="create-btn">
          <div class="btn-content">
            <i class="pi pi-plus"></i>
            <span>New Item</span>
          </div>
          <div class="btn-glow"></div>
        </button>
      </div>

      <div class="header-decoration">
        <div class="decoration-line"></div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon total-items">
          <i class="pi pi-box"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ items.length }}</h3>
          <p class="stat-label">Total Items</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon on-sale">
          <i class="pi pi-tag"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ items.filter((item) => item.is_sale).length }}</h3>
          <p class="stat-label">On Sale</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon categories">
          <i class="pi pi-layer-group"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ categories.length }}</h3>
          <p class="stat-label">Categories</p>
        </div>
      </div>
    </div>

    <!-- DataTable Card -->
    <div class="data-card">
      <div class="card-header">
        <div class="card-title">
          <h3>All Items</h3>
          <p>Complete list of menu items</p>
        </div>

        <div class="search-box">
          <div class="search-icon">
            <i class="pi pi-search"></i>
          </div>
          <input
            v-model="filters.global.value"
            placeholder="Search items..."
            type="text"
            class="search-input"
          />
          <div class="search-underline"></div>
        </div>
      </div>

      <div class="table-container">
        <DataTable
          :value="items"
          :loading="loading"
          :paginator="true"
          :rows="10"
          :rowsPerPageOptions="[5, 10, 20, 50]"
          :filters="filters"
          stripedRows
          removableSort
          dataKey="id"
          class="fancy-datatable"
        >
          <Column
            v-for="col of columns"
            :key="col.field"
            :field="col.field"
            :header="col.header"
            :sortable="col.sortable"
            :style="col.style"
          >
            <template #body="slotProps">
              <template v-if="col.field === 'price' || col.field === 'sale_price'">
                <div class="price-cell">
                  {{ formatCurrency(slotProps.data[col.field]) }}
                  <span
                    v-if="col.field === 'sale_price' && slotProps.data.is_sale"
                    class="sale-badge"
                  >
                    SALE
                  </span>
                </div>
              </template>
              <template v-else-if="col.field === 'is_sale'">
                <div class="sale-indicator" :class="{ 'on-sale': slotProps.data[col.field] }">
                  <div class="indicator-dot"></div>
                  <span>{{ formatBoolean(slotProps.data[col.field]) }}</span>
                </div>
              </template>
              <template v-else-if="col.field === 'image'">
                <img
                  :src="getItemImage(slotProps.data[col.field])"
                  :alt="slotProps.data[name]"
                  class="item-image"
                />
              </template>
              <template v-else-if="col.field === 'name'">
                <div class="item-name">
                  <span>{{ slotProps.data[col.field] }}</span>
                </div>
              </template>
              <template v-else-if="col.field === 'category'">
                {{ slotProps.data[col.field].name }}
              </template>
              <template v-else>
                <div class="text-cell">
                  {{ slotProps.data[col.field] }}
                </div>
              </template>
            </template>

            <template #header="slotProps">
              <div class="column-header">
                <span>{{ slotProps.header }}</span>
                <i class="pi pi-sort-alt sort-icon"></i>
              </div>
            </template>
          </Column>

          <Column header="Actions" :exportable="false" style="min-width: 12rem">
            <template #body="slotProps">
              <div class="action-buttons">
                <button
                  @click="editItem(slotProps.data.id)"
                  class="action-btn edit-btn"
                  v-tooltip="'Edit Item'"
                >
                  <i class="pi pi-pencil"></i>
                  <div class="btn-ripple"></div>
                </button>
                <button
                  @click="confirmDelete(slotProps.data)"
                  class="action-btn delete-btn"
                  v-tooltip="'Delete Item'"
                >
                  <i class="pi pi-trash"></i>
                  <div class="btn-ripple"></div>
                </button>
              </div>
            </template>
          </Column>

          <template #empty>
            <div class="empty-state">
              <div class="empty-icon">
                <i class="pi pi-inbox"></i>
              </div>
              <h3>No Items Found</h3>
              <p>Get started by creating your first menu item</p>
              <button @click="createNewItem" class="empty-action-btn">Create New Item</button>
            </div>
          </template>

          <template #loading>
            <div class="loading-state">
              <div class="loading-spinner"></div>
              <p>Loading items...</p>
            </div>
          </template>
        </DataTable>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:visible="deleteDialog" :modal="true" class="fancy-dialog">
      <template #header>
        <div class="dialog-header">
          <div class="dialog-icon warning">
            <i class="pi pi-exclamation-triangle"></i>
          </div>
          <h3>Confirm Deletion</h3>
        </div>
      </template>

      <div class="dialog-content">
        <p>
          Are you sure you want to delete <strong>{{ itemToDelete?.name }}</strong
          >?
        </p>
        <p class="dialog-warning">This action cannot be undone.</p>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <button @click="deleteDialog = false" class="dialog-btn cancel-btn">
            <span>Cancel</span>
          </button>
          <button @click="deleteItemHandler" class="dialog-btn confirm-btn">
            <span>Delete Item</span>
            <i class="pi pi-trash"></i>
          </button>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.items-management {
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
  animation: float 15s infinite ease-in-out;
}

.shape-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  right: 5%;
  animation-delay: 0s;
}

.shape-2 {
  width: 150px;
  height: 150px;
  bottom: 20%;
  left: 5%;
  animation-delay: -5s;
}

.shape-3 {
  width: 100px;
  height: 100px;
  top: 50%;
  right: 15%;
  animation-delay: -10s;
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
  background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
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

/* Create Button */
.create-btn {
  background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
  border: none;
  border-radius: 14px;
  padding: 0;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(124, 58, 237, 0.3);
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(124, 58, 237, 0.4);
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
  background: linear-gradient(90deg, transparent, #7c3aed, transparent);
  border-radius: 2px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
}

.stat-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-icon.total-items {
  background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
}

.stat-icon.on-sale {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
}

.stat-icon.categories {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.stat-label {
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  margin: 0;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 8px;
  color: #10b981;
  font-size: 12px;
  font-weight: 600;
}

.stat-trend.trend-down {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

/* Data Card */
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
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.search-box {
  position: relative;
  width: 300px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  z-index: 2;
}

.search-input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-input:focus {
  outline: none;
  border-color: #7c3aed;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.15);
}

.search-underline {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #7c3aed, #4f46e5);
  transition: width 0.3s ease;
}

.search-input:focus + .search-underline {
  width: 100%;
}

/* Table Styles */
.table-container {
  padding: 0 24px 24px 24px;
}

:deep(.fancy-datatable) {
  border: none;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

:deep(.fancy-datatable .p-datatable-header) {
  background: transparent;
  border: none;
  padding: 0;
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

:deep(.fancy-datatable .p-datatable-tbody > tr) {
  transition: all 0.3s ease;
  background: transparent;
}

:deep(.fancy-datatable .p-datatable-tbody > tr > td) {
  border: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding: 16px;
  background: transparent;
}

:deep(.fancy-datatable .p-datatable-tbody > tr:hover) {
  background: rgba(124, 58, 237, 0.03);
  transform: translateX(4px);
}

:deep(.fancy-datatable .p-datatable-tbody > tr:nth-child(even)) {
  background: rgba(0, 0, 0, 0.02);
}

:deep(.fancy-datatable .p-datatable-tbody > tr:nth-child(even):hover) {
  background: rgba(124, 58, 237, 0.05);
}

/* Custom Cell Styles */
.column-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-icon,
.action-icon {
  font-size: 12px;
  color: #94a3b8;
}

.price-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #1e293b;
}

.sale-badge {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
}

.sale-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #94a3b8;
}

.sale-indicator.on-sale .indicator-dot {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.item-name {
  display: flex;
  align-items: center;
  gap: 12px;
}

.name-avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 12px;
}

.category-tag {
  background: rgba(124, 58, 237, 0.1);
  color: #7c3aed;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
}

.text-cell {
  color: #64748b;
  font-size: 14px;
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

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.edit-btn:hover {
  background: #3b82f6;
  color: white;
}

.delete-btn:hover {
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
  background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
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
  box-shadow: 0 8px 20px rgba(124, 58, 237, 0.3);
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
}

.dialog-icon.warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
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

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .card-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .search-box {
    width: 100%;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .dialog-footer {
    flex-direction: column;
  }

  .dialog-btn {
    justify-content: center;
  }
}
.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
