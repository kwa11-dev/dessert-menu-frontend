<!-- src/components/admin/AdminSidebar.vue -->
<script setup>
defineProps({
  menuItems: {
    type: Array,
    required: true
  },
  visible: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['navigate'])
</script>

<template>
  <aside 
    class="admin-sidebar"
    :class="visible ? 'sidebar-visible' : 'sidebar-hidden'"
  >
    <div class="sidebar-header">
      <div class="logo-container">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M19.4 15C19.2669 15.3031 19.1338 15.6062 19.0006 15.9094C18.619 16.6612 18.2374 17.413 17.8558 18.1648C17.292 19.2612 16.7282 20.3576 16.1644 21.454C15.919 21.9298 15.6736 22.4056 15.4282 22.8814C15.3065 23.1193 15.1848 23.3572 15.0631 23.5951C14.9414 23.833 14.8197 24.0709 14.698 24.3088L14.674 24.3576C14.5865 24.5265 14.499 24.6954 14.4115 24.8643C14.324 25.0332 14.2365 25.2021 14.149 25.371C14.0615 25.5399 13.974 25.7088 13.8865 25.8777C13.799 26.0466 13.7115 26.2155 13.624 26.3844L12 22.5L10.376 26.3844C10.2885 26.2155 10.201 26.0466 10.1135 25.8777C10.026 25.7088 9.9385 25.5399 9.851 25.371C9.7635 25.2021 9.676 25.0332 9.5885 24.8643C9.501 24.6954 9.41397 24.5265 9.32644 24.3576L9.302 24.3088C9.1803 24.0709 9.0586 23.833 8.9369 23.5951C8.8152 23.3572 8.6935 23.1193 8.5718 22.8814C8.3264 22.4056 8.081 21.9298 7.8356 21.454C7.2718 20.3576 6.708 19.2612 6.1442 18.1648C5.7626 17.413 5.381 16.6612 4.9994 15.9094C4.8662 15.6062 4.7331 15.3031 4.6 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12H22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 2V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h2 class="sidebar-title">Admin Panel</h2>
        <div class="status-indicator"></div>
      </div>
    </div>
    
    <nav class="sidebar-nav">
      <ul class="nav-list">
        <li v-for="item in menuItems" :key="item.to" class="nav-item">
          <button
            @click="emit('navigate', item.to)"
            class="nav-button"
            :class="{ 'nav-button-active': $route.path === item.to }"
          >
            <div class="icon-wrapper">
              <i :class="item.icon" class="nav-icon"></i>
            </div>
            <span class="nav-label">{{ item.label }}</span>
            <div class="nav-highlight"></div>
          </button>
        </li>
      </ul>
    </nav>
    
    <div class="sidebar-footer">
      <div class="user-profile">
        <div class="avatar">
          <span>AD</span>
        </div>
        <div class="user-info">
          <p class="user-name">Admin User</p>
          <p class="user-role">Administrator</p>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.admin-sidebar {
  background: linear-gradient(165deg, #1a1f36 0%, #0f1324 100%);
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.3),
    inset 1px 0 0 rgba(255, 255, 255, 0.05);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.admin-sidebar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.5), transparent);
}

.sidebar-visible {
  width: 280px;
}

.sidebar-hidden {
  width: 0;
  overflow: hidden;
}

/* Header Styles */
.sidebar-header {
  padding: 24px 20px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
}

.sidebar-title {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #ffffff 0%, #c7d2fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.5px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  margin-left: auto;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

/* Navigation Styles */
.sidebar-nav {
  padding: 20px 16px;
  flex: 1;
  overflow-y: auto;
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  position: relative;
}

.nav-button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  background: transparent;
  border: none;
  color: #94a3b8;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.nav-button:hover {
  color: #e2e8f0;
  background: rgba(255, 255, 255, 0.05);
  transform: translateX(4px);
}

.nav-button-active {
  color: white;
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(79, 70, 229, 0.2) 100%);
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.15);
}

.nav-button-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background: linear-gradient(to bottom, #7c3aed, #4f46e5);
  border-radius: 0 4px 4px 0;
}

.icon-wrapper {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.nav-button-active .icon-wrapper {
  background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
  box-shadow: 0 4px 8px rgba(124, 58, 237, 0.3);
}

.nav-icon {
  font-size: 18px;
  transition: all 0.3s ease;
}

.nav-label {
  font-weight: 500;
  font-size: 15px;
  transition: all 0.3s ease;
}

.nav-highlight {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.nav-button:hover .nav-highlight {
  left: 100%;
}

/* Footer Styles */
.sidebar-footer {
  padding: 20px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  transition: all 0.3s ease;
}

.user-profile:hover {
  background: rgba(255, 255, 255, 0.05);
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 4px 8px rgba(124, 58, 237, 0.3);
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: white;
  margin: 0;
}

.user-role {
  font-size: 12px;
  color: #94a3b8;
  margin: 0;
}

/* Scrollbar Styling */
.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(124, 58, 237, 0.5);
  border-radius: 10px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(124, 58, 237, 0.7);
}
</style>