<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { cmsAPI } from '../../api/client';

const route = useRoute();
const isScrolled = ref(false);
const isMobileMenuOpen = ref(false);
const siteSettings = ref(null);
const isLoggedIn = ref(false);

// Check if user is logged in
const checkLoginStatus = () => {
  const token = localStorage.getItem('authToken');
  isLoggedIn.value = !!token;
};

// Handle scroll events for header styling
const handleScroll = () => {
  isScrolled.value = window.scrollY > 20;
};

// Get site settings
const fetchSiteSettings = async () => {
  try {
    const response = await cmsAPI.getSiteSettings();
    if (response.success && response.settings) {
      siteSettings.value = response.settings;
    }
  } catch (error) {
    console.error('Failed to load site settings:', error);
  }
};

// Navigation items
const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Services', path: '/services' },
  { name: 'About', path: '/about' },
  { name: 'Team', path: '/team' },
  { name: 'Blog', path: '/blog' },
  { name: 'Resources', path: '/resources' },
  { name: 'Contact', path: '/contact' }
];

// Check if a route is active
const isActive = (path) => {
  if (path === '/') {
    return route.path === '/';
  }
  return route.path.startsWith(path);
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  checkLoginStatus();
  fetchSiteSettings();
  
  // Clean up event listener
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
});
</script>

<template>
  <header :class="['site-header', { 'scrolled': isScrolled }]">
    <div class="container header-container">
      <div class="logo-container">
        <router-link to="/" class="logo">
          <img v-if="siteSettings?.logo?.filePath" :src="siteSettings.logo.filePath" alt="Generativ Consulting" />
          <span v-else class="logo-text">
            <span class="gradient-text">Generativ</span>
          </span>
        </router-link>
      </div>
      
      <!-- Desktop Navigation -->
      <nav class="desktop-nav">
        <ul>
          <li v-for="item in navItems" :key="item.path">
            <router-link :to="item.path" :class="{ active: isActive(item.path) }">
              {{ item.name }}
            </router-link>
          </li>
        </ul>
      </nav>
      
      <!-- Auth Buttons -->
      <div class="auth-buttons">
        <template v-if="isLoggedIn">
          <router-link to="/admin/dashboard" class="btn btn-sm btn-primary">
            Dashboard
          </router-link>
        </template>
        <template v-else>
          <router-link to="/admin/login" class="btn btn-sm btn-secondary">
            Sign In
          </router-link>
        </template>
      </div>
      
      <!-- Mobile Menu Button -->
      <button class="mobile-menu-button" @click="isMobileMenuOpen = !isMobileMenuOpen">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
    
    <!-- Mobile Navigation -->
    <div :class="['mobile-nav', { 'open': isMobileMenuOpen }]">
      <div class="mobile-nav-container">
        <ul>
          <li v-for="item in navItems" :key="item.path">
            <router-link 
              :to="item.path" 
              :class="{ active: isActive(item.path) }"
              @click="isMobileMenuOpen = false"
            >
              {{ item.name }}
            </router-link>
          </li>
          <li class="mobile-auth">
            <template v-if="isLoggedIn">
              <router-link 
                to="/admin/dashboard" 
                class="btn btn-primary"
                @click="isMobileMenuOpen = false"
              >
                Dashboard
              </router-link>
            </template>
            <template v-else>
              <router-link 
                to="/admin/login" 
                class="btn btn-secondary"
                @click="isMobileMenuOpen = false"
              >
                Sign In
              </router-link>
            </template>
          </li>
        </ul>
      </div>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: var(--z-sticky);
  padding: 1rem 0;
  transition: all var(--transition-normal);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.site-header.scrolled {
  box-shadow: var(--shadow-md);
  padding: 0.75rem 0;
  background: rgba(255, 255, 255, 0.95);
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--dark);
  text-decoration: none;
}

.logo img {
  height: 40px;
  width: auto;
}

.logo-text {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.75rem;
  letter-spacing: -0.025em;
}

.desktop-nav {
  display: flex;
}

.desktop-nav ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.desktop-nav li {
  margin: 0 0.75rem;
}

.desktop-nav a {
  display: inline-block;
  padding: 0.5rem 0.75rem;
  color: var(--gray-700);
  font-weight: 500;
  text-decoration: none;
  transition: all var(--transition-fast);
  border-radius: var(--border-radius-md);
  position: relative;
}

.desktop-nav a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background: var(--gradient-primary);
  transition: width var(--transition-normal);
}

.desktop-nav a:hover {
  color: var(--primary);
}

.desktop-nav a.active {
  color: var(--primary);
}

.desktop-nav a.active::after {
  width: 80%;
}

.auth-buttons {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.mobile-menu-button {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 30px;
  height: 20px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
}

.mobile-menu-button span {
  display: block;
  width: 100%;
  height: 2px;
  background-color: var(--dark);
  transition: all var(--transition-normal);
}

.mobile-nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  z-index: var(--z-drawer);
  transform: translateY(-100%);
  transition: transform var(--transition-normal);
  display: none;
}

.mobile-nav.open {
  transform: translateY(0);
}

.mobile-nav-container {
  padding: 5rem 2rem;
  height: 100%;
  overflow-y: auto;
}

.mobile-nav ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.mobile-nav li {
  margin-bottom: 1.5rem;
}

.mobile-nav a {
  display: block;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--dark);
  text-decoration: none;
  padding: 0.5rem 0;
  transition: all var(--transition-fast);
}

.mobile-nav a:hover,
.mobile-nav a.active {
  color: var(--primary);
}

.mobile-auth {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--gray-200);
}

@media (max-width: 1024px) {
  .desktop-nav {
    display: none;
  }
  
  .mobile-menu-button {
    display: flex;
  }
  
  .mobile-nav {
    display: block;
  }
}
</style>
