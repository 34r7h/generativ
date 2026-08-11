<script setup>
import BrandMark from './BrandMark.vue';
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
  // Deep links (e.g. /services/ai-opportunity-audit) match exactly so they
  // don't also light up their parent section.
  if (path.split('/').length > 2) {
    return route.path === path;
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
          <BrandMark v-else size="md" />
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
      
      <!-- Actions -->
      <div class="auth-buttons">
        <router-link to="/contact" class="g-btn g-btn--ghost g-btn--sm header-talk">
          Talk to us
        </router-link>
        <router-link to="/services/ai-opportunity-audit" class="g-btn g-btn--primary g-btn--sm">
          Book the audit
        </router-link>
        <router-link
          v-if="isLoggedIn"
          to="/admin/dashboard"
          class="header-admin"
          aria-label="Dashboard"
        >
          Dashboard
        </router-link>
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
            <router-link
              to="/services/ai-opportunity-audit"
              class="g-btn g-btn--primary"
              @click="isMobileMenuOpen = false"
            >
              Book the audit
            </router-link>
            <router-link
              :to="isLoggedIn ? '/admin/dashboard' : '/admin/login'"
              class="g-btn g-btn--ghost"
              @click="isMobileMenuOpen = false"
            >
              {{ isLoggedIn ? 'Dashboard' : 'Sign in' }}
            </router-link>
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
  height: 72px;
  display: flex;
  align-items: center;
  background: rgba(10, 10, 12, 0.72);
  backdrop-filter: saturate(160%) blur(14px);
  -webkit-backdrop-filter: saturate(160%) blur(14px);
  border-bottom: 1px solid transparent;
  transition: background-color 220ms ease, border-color 220ms ease;
}

.site-header.scrolled {
  background: rgba(10, 10, 12, 0.94);
  border-bottom-color: var(--g-line);
}

.header-container {
  display: flex;
  align-items: center;
  gap: 32px;
}

.logo-container { flex: 0 0 auto; }

.logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--g-text);
}

.logo img { height: 32px; width: auto; }

/* Nav sits hard against the wordmark, not centred: the eye runs left to right
   along one line rather than hopping across a gap. */
.desktop-nav { display: flex; margin-right: auto; }

.desktop-nav ul {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 2px;
}

.desktop-nav a {
  display: inline-block;
  position: relative;
  padding: 8px 12px;
  color: var(--g-text-dim);
  font-size: 0.875rem;
  font-weight: 450;
  letter-spacing: -0.005em;
  text-decoration: none;
  border-radius: var(--g-r);
  transition: color 160ms ease, background-color 160ms ease;
}

.desktop-nav a:hover {
  color: var(--g-text);
  background: rgba(255, 255, 255, 0.05);
}

.desktop-nav a.active {
  color: var(--g-text);
}

/* Absolute, so the marker cannot add height to the active item and knock it
   out of line with its siblings. */
.desktop-nav a.active::before {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 1px;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--g-volt);
}

.auth-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 0 0 auto;
}

.header-admin {
  font-family: var(--g-mono);
  font-size: 0.688rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--g-text-faint);
  text-decoration: none;
}

.header-admin:hover { color: var(--g-volt); }

.mobile-menu-button {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 26px;
  height: 15px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-left: auto;
}

.mobile-menu-button span {
  display: block;
  width: 100%;
  height: 1.5px;
  background-color: var(--g-text);
  transition: all var(--transition-normal);
}

.mobile-nav {
  position: fixed;
  inset: 0;
  background: var(--g-ink);
  z-index: var(--z-drawer);
  transform: translateY(-100%);
  transition: transform 320ms cubic-bezier(0.22, 1, 0.36, 1);
  display: none;
}

.mobile-nav.open { transform: translateY(0); }

.mobile-nav-container {
  padding: 96px 24px 40px;
  height: 100%;
  overflow-y: auto;
}

.mobile-nav ul { list-style: none; margin: 0; padding: 0; }

.mobile-nav li { border-bottom: 1px solid var(--g-line); }

/* Excludes the buttons in the drawer footer: this rule was repainting the
   primary button's label light, on its bone plate. */
.mobile-nav a:not(.g-btn) {
  display: block;
  font-size: 1.5rem;
  font-weight: 500;
  letter-spacing: -0.03em;
  color: var(--g-text);
  text-decoration: none;
  padding: 16px 0;
}

.mobile-nav a.active { color: var(--g-volt); }

.mobile-auth {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 28px;
  border-bottom: none !important;
}

@media (max-width: 1100px) {
  .desktop-nav { display: none; }
  .header-talk { display: none; }
  .mobile-menu-button { display: flex; }
  .mobile-nav { display: block; }
  .header-container { gap: 16px; }
  .auth-buttons { margin-left: auto; }
}

@media (max-width: 560px) {
  .auth-buttons .g-btn { display: none; }
}
</style>
