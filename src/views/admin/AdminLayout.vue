<!-- src/views/admin/AdminLayout.vue -->
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'

const router = useRouter()
const sidebarVisible = ref(true)

const menuItems = [
  { label: 'Items', icon: 'pi pi-shopping-bag', to: '/admin/items' },
  { label: 'Categories', icon: 'pi pi-tags', to: '/admin/categories' },
  { label: 'Constants', icon: 'pi pi-cog', to: '/admin/constants' }
]

const navigate = (to) => {
  router.push(to)
}
</script>

<template>
  <div class="admin-layout">
    <!-- Animated Background Elements -->
    <div class="background-elements">
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>
      <div class="bg-circle bg-circle-3"></div>
      <div class="bg-gradient"></div>
    </div>
    
    <!-- Sidebar -->
    <AdminSidebar 
      :menuItems="menuItems"
      :visible="sidebarVisible"
      @navigate="navigate"
    />
    
    <!-- Main Content -->
    <div class="main-content" :class="{ 'expanded': !sidebarVisible }">
      <!-- Top Header -->
      <header class="admin-header">
        <div class="header-content">
          <button 
            @click="sidebarVisible = !sidebarVisible"
            class="menu-toggle"
            :class="{ 'menu-toggle-rotated': !sidebarVisible }"
          >
            <div class="menu-icon">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div class="menu-ripple"></div>
          </button>
          
          <div class="header-center">
            <h1 class="page-title">Admin Dashboard</h1>
            <div class="breadcrumb">
              <span class="breadcrumb-item">Admin</span>
              <span class="breadcrumb-separator">/</span>
              <span class="breadcrumb-item active">Dashboard</span>
            </div>
          </div>
        </div>
        
        <!-- Header Decoration -->
        <div class="header-decoration">
          <div class="decoration-line"></div>
          <div class="decoration-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </header>
      
      <!-- Page Content -->
      <main class="page-content">
        <div class="content-wrapper">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%);
  position: relative;
  overflow: hidden;
  display: flex;
}

/* Animated Background Elements */
.background-elements {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.03) 0%, rgba(79, 70, 229, 0.03) 100%);
  animation: float 20s infinite linear;
}

.bg-circle-1 {
  width: 300px;
  height: 300px;
  top: -150px;
  right: -100px;
  animation-delay: 0s;
}

.bg-circle-2 {
  width: 200px;
  height: 200px;
  bottom: 100px;
  left: -50px;
  animation-delay: -5s;
  animation-duration: 25s;
}

.bg-circle-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  right: 20%;
  animation-delay: -10s;
  animation-duration: 30s;
}

.bg-gradient {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at top right, rgba(124, 58, 237, 0.05) 0%, transparent 50%);
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  25% {
    transform: translateY(-20px) rotate(90deg);
  }
  50% {
    transform: translateY(0px) rotate(180deg);
  }
  75% {
    transform: translateY(20px) rotate(270deg);
  }
}

/* Main Content Area */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
  margin-left: 0;
}

.main-content.expanded {
  margin-left: 0;
}

/* Header Styles */
.admin-header {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.08),
    0 1px 0 rgba(255, 255, 255, 0.8) inset;
  position: relative;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 24px;
  position: relative;
}

/* Menu Toggle Button */
.menu-toggle {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.05),
    0 1px 0 rgba(255, 255, 255, 0.8) inset;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.menu-toggle:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 8px 20px rgba(0, 0, 0, 0.1),
    0 1px 0 rgba(255, 255, 255, 0.8) inset;
  border-color: rgba(124, 58, 237, 0.2);
}

.menu-toggle-rotated {
  transform: rotate(180deg);
}

.menu-toggle-rotated:hover {
  transform: rotate(180deg) translateY(-2px);
}

.menu-icon {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 20px;
}

.menu-icon span {
  height: 2px;
  background: linear-gradient(135deg, #475569 0%, #64748b 100%);
  border-radius: 2px;
  transition: all 0.3s ease;
}

.menu-icon span:nth-child(1) {
  width: 16px;
}

.menu-icon span:nth-child(2) {
  width: 20px;
}

.menu-icon span:nth-child(3) {
  width: 12px;
}

.menu-toggle:hover .menu-icon span {
  background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
}

.menu-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(124, 58, 237, 0.1);
  transform: translate(-50%, -50%);
  transition: all 0.3s ease;
}

.menu-toggle:active .menu-ripple {
  width: 100%;
  height: 100%;
}

/* Header Center Content */
.header-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
  margin: 0;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.breadcrumb-item {
  color: #64748b;
  font-weight: 500;
  transition: color 0.3s ease;
}

.breadcrumb-item.active {
  color: #7c3aed;
  font-weight: 600;
}

.breadcrumb-separator {
  color: #cbd5e1;
}

/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-btn {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.05),
    0 1px 0 rgba(255, 255, 255, 0.8) inset;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.header-btn:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 8px 20px rgba(0, 0, 0, 0.1),
    0 1px 0 rgba(255, 255, 255, 0.8) inset;
  border-color: rgba(124, 58, 237, 0.2);
}

.notification-btn {
  position: relative;
}

.notification-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border-radius: 50%;
  border: 2px solid white;
  animation: pulse 2s infinite;
}

.header-btn i {
  font-size: 18px;
  color: #64748b;
  transition: all 0.3s ease;
}

.header-btn:hover i {
  color: #7c3aed;
}

.btn-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(124, 58, 237, 0.1);
  transform: translate(-50%, -50%);
  transition: all 0.3s ease;
}

.header-btn:active .btn-ripple {
  width: 100%;
  height: 100%;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 12px;
  box-shadow: 0 4px 8px rgba(124, 58, 237, 0.3);
}

/* Header Decoration */
.header-decoration {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.decoration-line {
  height: 1px;
  flex: 1;
  background: linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.3), transparent);
}

.decoration-dots {
  display: flex;
  gap: 4px;
  padding: 0 16px;
}

.decoration-dots span {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
  opacity: 0.6;
}

/* Page Content */
.page-content {
  flex: 1;
  padding: 0;
  overflow: auto;
  position: relative;
}

.content-wrapper {
  padding: 24px;
  max-width: 100%;
  height: 100%;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    padding: 12px 16px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .content-wrapper {
    padding: 16px;
  }
  
  .menu-toggle,
  .header-btn {
    width: 44px;
    height: 44px;
  }
}

/* Scrollbar Styling */
.page-content::-webkit-scrollbar {
  width: 6px;
}

.page-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 10px;
}

.page-content::-webkit-scrollbar-thumb {
  background: rgba(124, 58, 237, 0.3);
  border-radius: 10px;
}

.page-content::-webkit-scrollbar-thumb:hover {
  background: rgba(124, 58, 237, 0.5);
}
</style>