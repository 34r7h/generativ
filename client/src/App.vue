<script setup>
import { onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import AppHeader from './components/shared/AppHeader.vue';
import AppFooter from './components/shared/AppFooter.vue';

// Import design system
import './assets/design-system.css';

// Get router instance
const router = useRouter();
const route = useRoute();

// Check if current route is an admin page
const isAdminPage = computed(() => {
  return route.path.startsWith('/admin');
});

// Check authentication on mount
onMounted(() => {
  // For initial page load, check if user is logged in
  checkAuthentication();
});

// Function to check authentication status
function checkAuthentication() {
  const token = localStorage.getItem('authToken');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  
  // You might want to validate the token with the server
  // before considering the user authenticated
}
</script>

<template>
  <div id="app-container" :class="{ 'admin-mode': isAdminPage }">
    <!-- Regular layout for public pages -->
    <template v-if="!isAdminPage">
      <AppHeader />
      <main>
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
      <AppFooter />
    </template>
    
    <!-- Admin layout -->
    <template v-else>
      <div class="admin-layout">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </template>
  </div>
</template>

<style>
/* Import fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.cdnfonts.com/css/clash-display');
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');

/* Global styles */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

#app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1;
  margin-top: 80px; /* Account for fixed header */
}

/* Page Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Admin mode specific styles */
.admin-mode {
  background-color: var(--gray-100);
}

.admin-mode main {
  margin-top: 0;
}
</style>