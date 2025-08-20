<script setup>
import { ref } from 'vue';

defineProps({
  title: {
    type: String,
    default: 'Dashboard'
  }
});

const showNotifications = ref(false);
const showUserMenu = ref(false);
const notifications = ref([
  {
    id: 1,
    type: 'info',
    message: 'Welcome to the Generativ CMS',
    time: '1 min ago'
  },
  {
    id: 2,
    type: 'success',
    message: 'Page "Home" has been updated',
    time: '2 hours ago'
  },
  {
    id: 3,
    type: 'warning',
    message: 'Remember to update your profile',
    time: '1 day ago'
  }
]);

function toggleNotifications() {
  showNotifications.value = !showNotifications.value;
  if (showNotifications.value) {
    showUserMenu.value = false;
  }
}

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value;
  if (showUserMenu.value) {
    showNotifications.value = false;
  }
}

function markAllAsRead() {
  // In a real app, this would call an API
  showNotifications.value = false;
}

function logout() {
  // Clear auth token and redirect to login
  localStorage.removeItem('authToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('isAdmin');
  window.location.href = '/admin/login';
}
</script>

<template>
  <header class="admin-header">
    <div class="header-title">
      <h1>{{ title }}</h1>
    </div>
    
    <div class="header-actions">
      <!-- Search -->
      <div class="search-bar">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input type="text" placeholder="Search..." />
      </div>
      
      <!-- Notifications -->
      <div class="notifications-dropdown">
        <button class="icon-button" @click="toggleNotifications">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          <span class="notification-badge">3</span>
        </button>
        
        <div v-if="showNotifications" class="dropdown-menu">
          <div class="dropdown-header">
            <h3>Notifications</h3>
            <button class="text-button" @click="markAllAsRead">Mark all as read</button>
          </div>
          
          <div class="notifications-list">
            <div v-for="notification in notifications" :key="notification.id" class="notification-item">
              <div :class="['notification-icon', notification.type]">
                <svg v-if="notification.type === 'info'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                <svg v-if="notification.type === 'success'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                <svg v-if="notification.type === 'warning'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              </div>
              <div class="notification-content">
                <p>{{ notification.message }}</p>
                <span class="notification-time">{{ notification.time }}</span>
              </div>
            </div>
          </div>
          
          <div class="dropdown-footer">
            <router-link to="/admin/notifications">View all notifications</router-link>
          </div>
        </div>
      </div>
      
      <!-- User Menu -->
      <div class="user-dropdown">
        <button class="user-button" @click="toggleUserMenu">
          <div class="user-avatar">A</div>
          <span class="user-name">Admin</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
        
        <div v-if="showUserMenu" class="dropdown-menu">
          <div class="dropdown-header">
            <h3>Admin</h3>
            <p>Administrator</p>
          </div>
          
          <div class="dropdown-links">
            <router-link to="/admin/profile" class="dropdown-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <span>Profile</span>
            </router-link>
            
            <router-link to="/admin/settings" class="dropdown-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              <span>Settings</span>
            </router-link>
          </div>
          
          <div class="dropdown-divider"></div>
          
          <div class="dropdown-links">
            <button @click="logout" class="dropdown-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--spacing-lg);
}

.header-title h1 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--gray-900);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: var(--gray-100);
  border-radius: var(--border-radius-md);
  padding: 0.5rem 1rem;
  width: 250px;
}

.search-bar svg {
  color: var(--gray-500);
  margin-right: 0.5rem;
}

.search-bar input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  color: var(--gray-900);
}

.icon-button {
  position: relative;
  background: none;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: var(--border-radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-700);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.icon-button:hover {
  background-color: var(--gray-100);
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: var(--danger);
  color: white;
  font-size: 0.75rem;
  width: 18px;
  height: 18px;
  border-radius: var(--border-radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-button {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.user-button:hover {
  background-color: var(--gray-100);
}

.user-avatar {
  width: 32px;
  height: 32px;
  background-color: var(--primary);
  border-radius: var(--border-radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  margin-right: 0.5rem;
}

.user-name {
  margin-right: 0.5rem;
  font-weight: 500;
}

/* Dropdown Menus */
.notifications-dropdown,
.user-dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 300px;
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-xl);
  z-index: var(--z-dropdown);
  overflow: hidden;
  animation: dropdown-slide-in var(--transition-fast) forwards;
}

@keyframes dropdown-slide-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-header {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dropdown-header h3 {
  margin: 0;
  font-size: 1rem;
  color: var(--gray-900);
}

.dropdown-header p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--gray-600);
}

.text-button {
  background: none;
  border: none;
  color: var(--primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
}

.notifications-list {
  max-height: 300px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--gray-200);
  transition: background-color var(--transition-fast);
}

.notification-item:hover {
  background-color: var(--gray-50);
}

.notification-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--border-radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--spacing-md);
}

.notification-icon.info {
  background-color: rgba(59, 130, 246, 0.1);
  color: var(--primary);
}

.notification-icon.success {
  background-color: rgba(16, 185, 129, 0.1);
  color: var(--success);
}

.notification-icon.warning {
  background-color: rgba(245, 158, 11, 0.1);
  color: var(--warning);
}

.notification-content {
  flex: 1;
}

.notification-content p {
  margin: 0 0 0.25rem;
  font-size: 0.875rem;
  color: var(--gray-800);
}

.notification-time {
  font-size: 0.75rem;
  color: var(--gray-500);
}

.dropdown-footer {
  padding: var(--spacing-md);
  text-align: center;
  border-top: 1px solid var(--gray-200);
}

.dropdown-footer a {
  color: var(--primary);
  font-size: 0.875rem;
  font-weight: 500;
}

.dropdown-links {
  padding: var(--spacing-xs) 0;
}

.dropdown-link {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--gray-800);
  text-decoration: none;
  transition: background-color var(--transition-fast);
}

.dropdown-link:hover {
  background-color: var(--gray-100);
}

.dropdown-link svg {
  margin-right: var(--spacing-sm);
  color: var(--gray-600);
}

.dropdown-divider {
  height: 1px;
  background-color: var(--gray-200);
  margin: var(--spacing-xs) 0;
}

/* Responsive */
@media (max-width: 768px) {
  .search-bar {
    display: none;
  }
  
  .user-name {
    display: none;
  }
}
</style>
