<!-- src/views/admin/ConstantsManagement.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { getConstants, updateConstants } from '@/api/constants' // Updated import

const toast = useToast()

const constants = ref({})
const loading = ref(false)
const submitting = ref(false)

const constantFields = [
  {
    key: 'facebook_url',
    label: 'Facebook URL',
    type: 'url',
    placeholder: 'https://facebook.com/your-page',
    icon: 'pi pi-facebook',
    color: '#1877F2',
    category: 'social'
  },
  {
    key: 'instagram_url',
    label: 'Instagram URL',
    type: 'url',
    placeholder: 'https://instagram.com/your-profile',
    icon: 'pi pi-instagram',
    color: '#E4405F',
    category: 'social'
  },
  {
    key: 'whatsapp_url',
    label: 'WhatsApp URL',
    type: 'url',
    placeholder: 'https://wa.me/your-number',
    icon: 'pi pi-whatsapp',
    color: '#25D366',
    category: 'social'
  },
  {
    key: 'merry_cream_first_flavor',
    label: 'Merrycream First Flavor',
    type: 'text',
    placeholder: 'Enter first flavor',
    icon: 'pi pi-star',
    color: '#F59E0B',
    category: 'menu'
  },
  {
    key: 'merry_cream_second_flavor',
    label: 'Merrycream Second Flavor',
    type: 'text',
    placeholder: 'Enter second flavor',
    icon: 'pi pi-star-fill',
    color: '#D97706',
    category: 'menu'
  }
]

onMounted(async () => {
  await loadConstants()
})

const loadConstants = async () => {
  loading.value = true
  try {
    const response = await getConstants()
    constants.value = response.data
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load constants',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const saveConstants = async () => {
  submitting.value = true
  try {
    // Send all constants in one request
    const response = await updateConstants(constants.value)
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: response.data.message || 'Constants updated successfully',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to update constants',
      life: 3000
    })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="constants-management">
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
          <div class="title-icon">
            <i class="pi pi-cog"></i>
          </div>
          <div class="title-text">
            <h2 class="page-title">Constants Management</h2>
            <p class="page-subtitle">Manage your application settings and configurations</p>
          </div>
        </div>
        
        <div class="header-stats">
          <div class="stat-item">
            <div class="stat-icon social">
              <i class="pi pi-share-alt"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ constantFields.filter(f => f.category === 'social').length }}</span>
              <span class="stat-label">Social Links</span>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon menu">
              <i class="pi pi-shopping-bag"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ constantFields.filter(f => f.category === 'menu').length }}</span>
              <span class="stat-label">Menu Settings</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="header-decoration">
        <div class="decoration-line"></div>
        <div class="decoration-gears">
          <i class="pi pi-cog"></i>
          <i class="pi pi-cog"></i>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="content-grid">
      <!-- Constants Form Card -->
      <div class="form-card">
        <div class="card-header">
          <div class="card-icon">
            <i class="pi pi-pencil"></i>
          </div>
          <div class="card-title">
            <h3>Edit Constants</h3>
            <p>Update your application settings</p>
          </div>
          <div class="card-badge">
            <i class="pi pi-edit"></i>
            <span>Editing Mode</span>
          </div>
        </div>

        <div class="card-content">
          <!-- Loading State -->
          <div v-if="loading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading application constants...</p>
            <div class="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>

          <!-- Constants Form -->
          <form v-else @submit.prevent="saveConstants" class="constants-form">
            <div class="form-sections">
              <!-- Social Media Section -->
              <div class="form-section">
                <div class="section-header">
                  <div class="section-icon social">
                    <i class="pi pi-share-alt"></i>
                  </div>
                  <div class="section-title">
                    <h4>Social Media Links</h4>
                    <p>Manage your social media profiles</p>
                  </div>
                </div>
                
                <div class="section-fields">
                  <div
                    v-for="field in constantFields.filter(f => f.category === 'social')"
                    :key="field.key"
                    class="form-field"
                  >
                    <label :for="field.key" class="field-label">
                      <div class="label-icon" :style="{ color: field.color }">
                        <i :class="field.icon"></i>
                      </div>
                      <span>{{ field.label }}</span>
                    </label>
                    <div class="input-container">
                      <div class="input-icon" :style="{ color: field.color }">
                        <i :class="field.icon"></i>
                      </div>
                      <input
                        :id="field.key"
                        v-model="constants[field.key]"
                        :type="field.type"
                        :placeholder="field.placeholder"
                        class="form-input"
                      />
                      <div class="input-underline" :style="{ background: field.color }"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Menu Settings Section -->
              <div class="form-section">
                <div class="section-header">
                  <div class="section-icon menu">
                    <i class="pi pi-shopping-bag"></i>
                  </div>
                  <div class="section-title">
                    <h4>Menu Settings</h4>
                    <p>Configure your menu preferences</p>
                  </div>
                </div>
                
                <div class="section-fields">
                  <div
                    v-for="field in constantFields.filter(f => f.category === 'menu')"
                    :key="field.key"
                    class="form-field"
                  >
                    <label :for="field.key" class="field-label">
                      <div class="label-icon" :style="{ color: field.color }">
                        <i :class="field.icon"></i>
                      </div>
                      <span>{{ field.label }}</span>
                    </label>
                    <div class="input-container">
                      <div class="input-icon" :style="{ color: field.color }">
                        <i :class="field.icon"></i>
                      </div>
                      <input
                        :id="field.key"
                        v-model="constants[field.key]"
                        :type="field.type"
                        :placeholder="field.placeholder"
                        class="form-input"
                      />
                      <div class="input-underline" :style="{ background: field.color }"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Save Button -->
            <div class="form-actions">
              <button 
                type="submit"
                :disabled="submitting"
                class="save-btn"
                :class="{ 'loading': submitting }"
              >
                <div class="btn-content">
                  <div class="btn-spinner" v-if="submitting"></div>
                  <i class="pi pi-save" v-else></i>
                  <span>{{ submitting ? 'Saving Changes...' : 'Save All Constants' }}</span>
                </div>
                <div class="btn-shine"></div>
                <div class="btn-particles"></div>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Preview Card -->
      <div class="preview-card">
        <div class="card-header">
          <div class="card-icon">
            <i class="pi pi-eye"></i>
          </div>
          <div class="card-title">
            <h3>Current Values</h3>
            <p>Live preview of your constants</p>
          </div>
          <div class="card-badge preview">
            <i class="pi pi-eye"></i>
            <span>Live Preview</span>
          </div>
        </div>

        <div class="card-content">
          <div class="preview-sections">
            <!-- Social Media Preview -->
            <div class="preview-section">
              <h4 class="preview-section-title">Social Media</h4>
              <div class="preview-grid">
                <div
                  v-for="field in constantFields.filter(f => f.category === 'social')"
                  :key="field.key"
                  class="preview-item"
                >
                  <div class="preview-header">
                    <div class="preview-icon" :style="{ background: field.color }">
                      <i :class="field.icon"></i>
                    </div>
                    <span class="preview-label">{{ field.label }}</span>
                  </div>
                  <div class="preview-value" :class="{ 'empty': !constants[field.key] }">
                    {{ constants[field.key] || 'Not configured' }}
                  </div>
                  <div class="preview-actions">
                    <a 
                      v-if="constants[field.key] && field.type === 'url'" 
                      :href="constants[field.key]" 
                      target="_blank"
                      class="preview-link"
                      :style="{ color: field.color }"
                    >
                      <i class="pi pi-external-link"></i>
                      Visit
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Menu Settings Preview -->
            <div class="preview-section">
              <h4 class="preview-section-title">Menu Settings</h4>
              <div class="preview-grid">
                <div
                  v-for="field in constantFields.filter(f => f.category === 'menu')"
                  :key="field.key"
                  class="preview-item"
                >
                  <div class="preview-header">
                    <div class="preview-icon" :style="{ background: field.color }">
                      <i :class="field.icon"></i>
                    </div>
                    <span class="preview-label">{{ field.label }}</span>
                  </div>
                  <div class="preview-value" :class="{ 'empty': !constants[field.key] }">
                    {{ constants[field.key] || 'Not configured' }}
                  </div>
                  <div class="flavor-badge" v-if="constants[field.key] && field.key.includes('flavor')">
                    Featured Flavor
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Summary Stats -->
          <div class="preview-summary">
            <div class="summary-item">
              <div class="summary-icon configured">
                <i class="pi pi-check-circle"></i>
              </div>
              <div class="summary-info">
                <span class="summary-value">
                  {{ Object.values(constants).filter(val => val).length }}/{{ constantFields.length }}
                </span>
                <span class="summary-label">Configured</span>
              </div>
            </div>
            <div class="summary-item">
              <div class="summary-icon pending">
                <i class="pi pi-clock"></i>
              </div>
              <div class="summary-info">
                <span class="summary-value">
                  {{ constantFields.length - Object.values(constants).filter(val => val).length }}
                </span>
                <span class="summary-label">Pending</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Save Success Overlay -->
    <div v-if="submitting" class="save-overlay">
      <div class="overlay-content">
        <div class="success-animation">
          <div class="checkmark">
            <div class="checkmark__circle"></div>
            <div class="checkmark__check"></div>
          </div>
        </div>
        <p class="overlay-text">Saving Constants...</p>
        <p class="overlay-subtext">Updating your application settings</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.constants-management {
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
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(139, 92, 246, 0.03) 100%);
  animation: float 25s infinite ease-in-out;
}

.shape-1 {
  width: 100px;
  height: 100px;
  top: 10%;
  right: 5%;
  animation-delay: 0s;
}

.shape-2 {
  width: 150px;
  height: 150px;
  bottom: 15%;
  left: 5%;
  animation-delay: -8s;
}

.shape-3 {
  width: 80px;
  height: 80px;
  top: 40%;
  right: 20%;
  animation-delay: -16s;
}

.shape-4 {
  width: 120px;
  height: 120px;
  bottom: 25%;
  right: 10%;
  animation-delay: -12s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg) scale(1);
  }
  20% {
    transform: translateY(-25px) rotate(72deg) scale(1.05);
  }
  40% {
    transform: translateY(15px) rotate(144deg) scale(0.95);
  }
  60% {
    transform: translateY(-20px) rotate(216deg) scale(1.02);
  }
  80% {
    transform: translateY(10px) rotate(288deg) scale(0.98);
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
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
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

.header-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
}

.stat-icon.social {
  background: linear-gradient(135deg, #1877F2 0%, #0d6efd 100%);
}

.stat-icon.menu {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

.stat-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.header-decoration {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.decoration-line {
  height: 2px;
  flex: 1;
  background: linear-gradient(90deg, transparent, #6366f1, transparent);
  border-radius: 2px;
}

.decoration-gears {
  display: flex;
  gap: 8px;
  color: #6366f1;
}

.decoration-gears i {
  font-size: 16px;
  animation: spin 4s linear infinite;
}

.decoration-gears i:nth-child(2) {
  animation-direction: reverse;
  animation-duration: 3s;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  position: relative;
  z-index: 1;
}

@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

/* Card Styles */
.form-card, .preview-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.8);
  overflow: hidden;
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
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.form-card .card-icon {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
}

.preview-card .card-icon {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
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

.card-badge {
  position: absolute;
  top: 20px;
  right: 24px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 4px 8px rgba(99, 102, 241, 0.3);
}

.card-badge.preview {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
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
  border-top: 3px solid #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
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
  background: #6366f1;
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

/* Form Sections */
.form-sections {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.form-section {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.section-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.section-icon.social {
  background: linear-gradient(135deg, #1877F2 0%, #0d6efd 100%);
}

.section-icon.menu {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.section-title h4 {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.section-title p {
  color: #64748b;
  font-size: 14px;
  margin: 0;
}

.section-fields {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-field {
  position: relative;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.label-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.input-container {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  font-size: 16px;
}

.form-input {
  width: 100%;
  padding: 12px 12px 12px 44px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.form-input:focus {
  outline: none;
  border-color: #6366f1;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.15);
  transform: translateY(-1px);
}

.input-underline {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  transition: width 0.3s ease;
  z-index: 2;
}

.form-input:focus ~ .input-underline {
  width: 100%;
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.save-btn {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  border-radius: 16px;
  padding: 0;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
  min-width: 200px;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(99, 102, 241, 0.4);
}

.save-btn:disabled {
  background: #e5e7eb;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.save-btn.loading {
  background: #e5e7eb;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  color: white;
  font-weight: 600;
  font-size: 16px;
  position: relative;
  z-index: 2;
}

.save-btn:disabled .btn-content {
  color: #9ca3af;
}

.btn-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid #9ca3af;
  border-radius: 50%;
  animation: spin 1s linear infinite;
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

.save-btn:hover .btn-shine {
  left: 100%;
}

.btn-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.save-btn:hover .btn-particles::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: particle-float 1s ease-out forwards;
}

@keyframes particle-float {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(calc(-50% + 40px), calc(-50% - 40px)) scale(0);
    opacity: 0;
  }
}

/* Preview Styles */
.preview-sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.preview-section-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #f1f5f9;
}

.preview-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.preview-item {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
}

.preview-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.preview-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
}

.preview-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.preview-value {
  font-size: 14px;
  color: #1f2937;
  margin-bottom: 8px;
  word-break: break-all;
}

.preview-value.empty {
  color: #9ca3af;
  font-style: italic;
}

.preview-actions {
  display: flex;
  justify-content: flex-end;
}

.preview-link {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
}

.preview-link:hover {
  transform: translateX(2px);
}

.flavor-badge {
  background: linear-gradient(135deg, #fef3c7 0%, #fef7cd 100%);
  color: #92400e;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-block;
}

/* Preview Summary */
.preview-summary {
  display: flex;
  gap: 16px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  padding: 16px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.summary-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
}

.summary-icon.configured {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
}

.summary-icon.pending {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.summary-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.summary-value {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

.summary-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

/* Save Overlay */
.save-overlay {
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
  stroke: #6366f1;
  stroke-miterlimit: 10;
  box-shadow: inset 0 0 0 #6366f1;
  animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
  position: relative;
}

.checkmark__circle {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 4;
  stroke-miterlimit: 10;
  stroke: #6366f1;
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
    box-shadow: inset 0 0 0 30px #6366f1;
  }
}

.overlay-text {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.overlay-subtext {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .header-stats {
    width: 100%;
    justify-content: space-between;
  }
  
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .card-content {
    padding: 20px;
  }
  
  .form-section {
    padding: 16px;
  }
  
  .preview-summary {
    flex-direction: column;
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
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .save-btn {
    min-width: auto;
    width: 100%;
  }
}
</style>