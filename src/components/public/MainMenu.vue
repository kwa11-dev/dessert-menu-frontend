<script setup>
import { ref, onMounted, computed } from 'vue'
import { getItems } from '@/api/item'
import { getCategories } from '@/api/category'
import { useToast } from 'primevue/usetoast'

const categories = ref([])
const items = ref([])
const selectedCategory = ref(null)
const searchQuery = ref('')
const selectedItem = ref(null)
const itemDialog = ref(false)
const toast = useToast()

const baseURL = import.meta.env.VITE_API_BASE_URL.replace('/api', '')

onMounted(async () => {
  try {
    const { data: categoriesData } = await getCategories()
    categories.value = categoriesData
    selectedCategory.value = categoriesData[0]?.id || null

    const { data: itemsData } = await getItems()
    items.value = itemsData
  } catch (error) {
    console.error('Error loading data:', error)
  }
})

// Computed property to filter items by selected category and search query
const filteredItems = computed(() => {
  let filtered = items.value

  // Filter by category
  if (selectedCategory.value) {
    filtered = filtered.filter((item) => item.category_id === selectedCategory.value)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (item) =>
        item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query),
    )
  }

  return filtered
})

const getCategoryImage = (img) =>
  img ? `${baseURL}/storage/${img}` : `${baseURL}/storage/images/categories/default.png`

const getItemImage = (img) =>
  img ? `${baseURL}/storage/${img}` : `${baseURL}/storage/images/items/default.png`

const onImageError = (event) => {
  event.target.src = `${baseURL}/storage/images/items/default.png`
}

const responsiveOptions = ref([
  {
    breakpoint: '1400px',
    numVisible: 5,
    numScroll: 4,
  },
  {
    breakpoint: '1199px',
    numVisible: 5,
    numScroll: 4,
  },
  {
    breakpoint: '991px',
    numVisible: 4,
    numScroll: 3,
  },
  {
    breakpoint: '767px',
    numVisible: 3,
    numScroll: 2,
  },
  {
    breakpoint: '575px',
    numVisible: 3,
    numScroll: 2,
  },
])

// Function to handle category selection
const selectCategory = (category) => {
  selectedCategory.value = category.id
}

// Function to handle share button click
const handleShare = () => {
  if (navigator.share) {
    navigator
      .share({
        title: 'Pate Cream - Premium Sweets',
        text: 'Check out our delicious sweets collection!',
        url: window.location.href,
      })
      .then(() => {
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Thanks for sharing!',
          life: 3000,
        })
      })
      .catch(console.error)
  } else if (navigator.clipboard && navigator.clipboard.writeText) {
    // Clipboard API available
    navigator.clipboard.writeText(window.location.href).then(() => {
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Link copied to clipboard!',
        life: 3000,
      })
    })
  } else {
    // Fallback for insecure contexts (HTTP)
    const input = document.createElement('input')
    input.value = window.location.href
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Link copied to clipboard!',
      life: 3000,
    })
  }
}

const openItemDialog = (item) => {
  selectedItem.value = item
  itemDialog.value = true
}

const closeItemDialog = () => {
  selectedItem.value = null
  itemDialog.value = false
}

// Function to clear search
const clearSearch = () => {
  searchQuery.value = ''
}

const formatPrice = (price) => {
  if (!price && price !== 0) return '0 L.L'
  return `${price.toLocaleString('en-US')} L.L`
}

const getPriceDisplay = (item) => {
  if (item.is_sale) {
    return {
      original: formatPrice(item.price),
      sale: formatPrice(item.sale_price),
    }
  }
  return {
    original: formatPrice(item.price),
    sale: null,
  }
}

const dynamicFontSize = (name) => {
    const baseSize = 10; // default font-size in px
    const maxLength = 20; // number of characters before shrinking
    const minSize = 14; // smallest font size in px

    if (!name) return baseSize;

    // Shrink font proportionally if name is longer than maxLength
    const size = baseSize - (name.length - maxLength);
    return size < minSize ? minSize : size;
  }
</script>

<template>
  <div class="page-container">
    <section class="section">
      <div class="categories-carousel-wrapper">
        <Carousel
          :value="categories"
          :numVisible="6"
          :numScroll="1"
          :responsiveOptions="responsiveOptions"
          :autoplayInterval="0"
          circular
          :showNavigators="true"
          :showIndicators="false"
        >
          <template #item="slotProps">
            <div
              class="category-card"
              :class="{ active: selectedCategory === slotProps.data.id }"
              @click="selectCategory(slotProps.data)"
            >
              <div class="category-image-container">
                <img
                  :src="getCategoryImage(slotProps.data.image)"
                  :alt="slotProps.data.name"
                  class="category-image"
                  @error="onImageError"
                />
              </div>
              <div class="category-name">{{ slotProps.data.name }}</div>
            </div>
          </template>

          <template #previousicon>
            <span class="carousel-nav-icon">‹</span>
          </template>
          <template #nexticon>
            <span class="carousel-nav-icon">›</span>
          </template>
        </Carousel>
      </div>
    </section>

    <section class="section">
      <!-- Search and Share Section -->
      <div class="flex justify-center">
        <div class="search-share-section">
          <div class="search-share-container">
            <div class="search-container">
              <span class="search-icon">
                <i class="pi pi-search"></i>
              </span>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search items..."
                class="search-input"
              />
              <button v-if="searchQuery" @click="clearSearch" class="clear-search-btn">
                <i class="pi pi-times"></i>
              </button>
            </div>

            <button class="share-btn" @click="handleShare">
              <i class="pi pi-share-alt"></i>
              <span class="share-text">Share</span>
            </button>
          </div>
        </div>
      </div>

      <div class="items-grid-wrapper">
        <div v-if="filteredItems.length > 0" class="items-grid">
          <div
            class="item-card"
            v-for="item in filteredItems"
            :key="item.id"
            @click="openItemDialog(item)"
          >
            <div class="item-image-container">
              <img
                :src="getItemImage(item.image)"
                :alt="item.name"
                class="item-image"
                @error="onImageError"
              />
            </div>
            <div class="item-info">
          <div class="item-name" :style="{ fontSize: dynamicFontSize(item.name) + 'px' }">
            {{ item.name }}
          </div>
              <div class="item-price">
                <template v-if="getPriceDisplay(item).sale">
                  <span class="original-price">{{ getPriceDisplay(item).original }}</span>
                  <span class="sale-price">{{ getPriceDisplay(item).sale }}</span>
                </template>
                <template v-else>
                  <span>{{ getPriceDisplay(item).original }}</span>
                </template>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="no-items-message">
          <p>No items found {{ searchQuery ? 'matching your search' : 'in this category' }}.</p>
        </div>
      </div>
    </section>

    <Dialog
      v-model:visible="itemDialog"
      :style="{ width: '90vw', maxWidth: '500px' }"
      :modal="true"
      :closable="false"
      @hide="closeItemDialog"
      style="background-color: #3c8280; border-radius: 5%; padding: 1rem"
    >
      <template #header>
        <button class="dialog-close-btn" @click="closeItemDialog">
          <i class="pi pi-times"></i>
        </button>
      </template>

      <div class="dialog-content" v-if="selectedItem">
        <div class="dialog-image-container">
          <img
            :src="getItemImage(selectedItem.image)"
            :alt="selectedItem.name"
            class="dialog-image"
          />
        </div>

        <div class="dialog-details">
          <div class="item-info">
            <div class="info-row flex justify-center">
              <div class="dialog-title">{{ selectedItem.name }}</div>
            </div>
            <div class="info-row flex justify-center">
              <span class="info-value description">{{ selectedItem.description }}</span>
            </div>
            <div class="info-row flex justify-center">
              <span class="info-value price">{{ formatPrice(selectedItem.price) }}</span>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.page-container {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.section {
  margin-bottom: 3rem;
}

.categories-carousel-wrapper {
  padding: 1rem 0;
  margin: 0 auto;
}

.category-card {
  background-color: #4ba8a7;
  border-radius: 20%;
  width: 115px;
  height: 138px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  padding: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.category-card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.category-card.active {
  background-color: #053a39;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

.category-image-container {
  width: 95px;
  height: 95px;
  border-radius: 30%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  margin-bottom: 8px;
}

.category-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-name {
  color: #fff1fb;
  font-weight: bolder;
  text-align: center;
  font-size: 14px;
  line-height: 1.2;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.items-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 0 1rem;
}

.section-title {
  color: #053a39;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

.items-count {
  color: #4ba8a7;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Search and Share Section */
.search-share-section {
  margin-bottom: 2rem;
  padding: 0 1rem;
  width: 100%;
  display: flex;
  justify-content: center;
}

.search-share-container {
  display: flex;
  gap: 1rem;
  align-items: center;
  max-width: 600px;
  width: 100%;
}

.search-container {
  position: relative;
  flex: 1;
  min-width: 200px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #4ba8a7;
  z-index: 2;
}

.search-input {
  width: 100%;
  padding: 12px 45px 12px 40px;
  border: 2px solid #4ba8a7;
  border-radius: 10px;
  font-size: 1rem;
  background-color: white;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(75, 168, 167, 0.1);
}

.search-input:focus {
  outline: none;
  border-color: #053a39;
  box-shadow: 0 4px 12px rgba(5, 58, 57, 0.2);
}

.clear-search-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.clear-search-btn:hover {
  background-color: #f0f0f0;
  color: #666;
}

.share-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 12px 20px;
  background-color: #053a39;
  color: white;
  border: none;
  border-radius: 20%;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(5, 58, 57, 0.2);
  flex-shrink: 0;
}

.share-btn:hover {
  background-color: #042a29;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(5, 58, 57, 0.3);
}

.items-grid-wrapper {
  padding: 1rem 0;
  margin: 0 auto;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  justify-items: center;
}

.item-card {
  background-color: #4ba8a7;
  border-radius: 20px;
  width: 100%;
  max-width: 280px;
  height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.item-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.2);
  background-color: #3a8a89;
}

.item-image-container {
  width: 180px;
  height: 180px;
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  margin-bottom: 15px;
  border: 3px solid white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  text-align: center;
  width: 100%;
  margin-top: auto;
}

.item-name {
  color: #fff1fb;
  font-weight: bold;
  line-height: 1.3;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.item-price {
  color: #053a39;
  font-weight: bold;
  font-size: 18px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.original-price {
  color: gray;
  text-decoration: line-through;
  font-size: 0.9em;
}

.sale-price {
  color: #e63946; /* red-ish for discount */
  font-weight: bold;
}
.no-items-message {
  text-align: center;
  padding: 3rem 1rem;
  color: #4ba8a7;
  font-size: 1.2rem;
}

.dialog-close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #fff1fb;
  cursor: pointer;
  z-index: 1000;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

.dialog-close-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-top: 1rem;
}

.dialog-image-container {
  width: 100%;
  max-width: 300px;
  height: 250px;
  margin: 0 auto;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
}

.dialog-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dialog-details {
  text-align: center;
}

.item-description {
  color: #555;
  font-size: 1rem;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-row {
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
}

.dialog-title {
  color: #fff1fb;
  font-weight: bold;
  font-size: 20px;
  line-height: 1.3;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.info-value.description {
  color: #fff1fb;
  font-size: 16px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}
.info-value.price {
  color: #053a39;
  font-weight: bold;
  font-size: 24px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.add-to-cart-btn {
  background-color: #053a39;
  border: none;
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
}

:deep(.p-carousel-prev),
:deep(.p-carousel-next) {
  background-color: #4ba8a7 !important;
  border: none !important;
  border-radius: 50% !important;
  width: 40px !important;
  height: 40px !important;
  color: white !important;
}

:deep(.p-carousel-prev:hover),
:deep(.p-carousel-next:hover) {
  background-color: #3a8a89 !important;
}

:deep(.p-carousel-prev .p-icon),
:deep(.p-carousel-next .p-icon) {
  color: white !important;
}

:deep(.custom-dialog) {
  background: #4ba8a7;
  border-radius: 20px;
  padding: 1rem;
}

:deep(.custom-dialog .p-dialog-header) {
  padding: 0;
  background: transparent;
  border: none;
}

:deep(.custom-dialog .p-dialog-content) {
  background: transparent;
  padding: 0;
}

:deep(.custom-dialog .p-dialog-footer) {
  background: transparent;
  border: none;
  padding: 1rem 0 0 0;
}

@media (max-width: 1200px) {
  .items-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }

  .item-card {
    max-width: 240px;
    height: 270px;
  }

  .item-image-container {
    width: 160px;
    height: 160px;
  }
}

@media (max-width: 992px) {
  .items-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  .item-card {
    max-width: 280px;
  }

  .item-image-container {
    width: 180px;
    height: 180px;
  }

  .category-card {
    width: 100px;
    height: 120px;
  }

  .category-image-container {
    width: 80px;
    height: 80px;
  }

  .items-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .search-share-container {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .items-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .item-card {
    max-width: 220px;
  }

  .item-image-container {
    width: 140px;
    height: 140px;
  }

  .dialog-image-container {
    height: 200px;
    max-width: 250px;
  }

  .category-card {
    width: 90px;
    height: 110px;
  }

  .category-image-container {
    width: 70px;
    height: 70px;
  }

  .search-container {
    min-width: 150px;
  }
}

@media (max-width: 576px) {
  .items-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .item-card {
    max-width: 280px;
  }

  .item-image-container {
    width: 160px;
    height: 160px;
  }

  .dialog-image-container {
    height: 180px;
    max-width: 220px;
  }

  .category-card {
    width: 80px;
    height: 100px;
  }

  .category-image-container {
    width: 60px;
    height: 60px;
  }

  .page-container {
    padding: 0.5rem;
  }

  .share-text {
    display: none;
  }

  .share-btn {
    padding: 12px 15px;
  }

  .search-share-container {
    gap: 0.75rem;
  }
}

@media (max-width: 400px) {
  .item-card {
    max-width: 240px;
  }

  .item-image-container {
    width: 140px;
    height: 140px;
  }

  .dialog-image-container {
    height: 160px;
    max-width: 200px;
  }

  .search-container {
    min-width: 120px;
  }

  .search-input {
    padding: 10px 40px 10px 35px;
    font-size: 0.9rem;
  }

  .share-btn {
    padding: 10px 12px;
  }
}

/* Extra small screens - ensure they stay side by side */
@media (max-width: 320px) {
  .search-share-container {
    gap: 0.5rem;
  }

  .search-container {
    min-width: 100px;
  }

  .search-input {
    padding: 8px 35px 8px 30px;
    font-size: 0.85rem;
  }

  .search-icon {
    left: 8px;
  }

  .clear-search-btn {
    right: 8px;
  }

  .share-btn {
    padding: 8px 10px;
  }
}
</style>
