<script setup>
import BrandMark from './BrandMark.vue';
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue';
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

/*
 * The current page, shown beside the wordmark on small screens where the nav
 * itself is behind the menu button and nothing else says where you are.
 * Empty on the home page — the hero already says it.
 */
const pageLabel = computed(() => {
  if (route.path === '/') return '';
  const top = navItems.find((item) => item.path !== '/' && route.path.startsWith(item.path));
  if (top) return top.name;
  const last = route.path.split('/').filter(Boolean).pop() || '';
  return last.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
});

// The drawer covers the page; letting the page behind it scroll leaves the
// reader somewhere else when it closes.
watch(isMobileMenuOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : '';
});

onBeforeUnmount(() => {
  document.body.style.overflow = '';
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('keydown', onKeydown);
});

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

function onKeydown(e) {
  if (e.key === 'Escape') isMobileMenuOpen.value = false;
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  window.addEventListener('keydown', onKeydown);
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
        <span class="header-page" v-if="pageLabel">{{ pageLabel }}</span>
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
    
    <!--
      Teleported to the body on purpose. The header carries a backdrop-filter,
      which makes it a containing block for its fixed-position descendants: in
      Safari the drawer resolved against the 72px header instead of the
      viewport, so translateY(-100%) moved it only 72px and its first links sat
      visible under the logo, scrolling, on every page load.
    -->
    <Teleport to="body">
      <div
        class="mobile-scrim"
        :class="{ open: isMobileMenuOpen }"
        @click="isMobileMenuOpen = false"
      ></div>

      <div :class="['mobile-nav', { 'open': isMobileMenuOpen }]">
        <div class="mobile-nav-head">
          <span class="mobile-nav-title">Menu</span>
          <button
            class="mobile-nav-close"
            type="button"
            aria-label="Close menu"
            @click="isMobileMenuOpen = false"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M6 6 L18 18 M18 6 L6 18" fill="none" stroke="currentColor"
                    stroke-width="1.6" stroke-linecap="round" />
            </svg>
          </button>
        </div>

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
    </Teleport>
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

.logo-container {
  flex: 0 0 auto;
  display: flex;
  align-items: baseline;
  gap: 10px;
  min-width: 0;
}

/* Where you are, next to the wordmark. Only on the screens where the nav is
   behind the menu button; the desktop nav already marks the active item. */
.header-page {
  display: none;
  font-size: 0.9375rem;
  font-weight: 500;
  letter-spacing: -0.02em;
  color: var(--g-volt);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

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

.mobile-scrim {
  position: fixed;
  inset: 0;
  background: rgba(4, 4, 6, 0.62);
  z-index: 199;
  opacity: 0;
  visibility: hidden;
  transition: opacity 260ms ease, visibility 0s linear 260ms;
  display: none;
}

.mobile-scrim.open {
  opacity: 1;
  visibility: visible;
  transition: opacity 260ms ease, visibility 0s;
}

/* Anchored to the right, under the button that opens it, rather than a panel
   dropping from the top-left. */
.mobile-nav {
  position: fixed;
  top: 0;
  right: 0;
  width: min(340px, 86vw);
  /* dvh, not vh: on iOS the address bar makes 100vh taller than what is on
     screen, which would leave the closed panel short of fully off-stage. */
  height: 100dvh;
  background: var(--g-ink);
  color: var(--g-text);
  border-left: 1px solid var(--g-line);
  z-index: var(--z-drawer);
  transform: translateX(100%);
  /* visibility is what takes the closed panel out of the accessibility tree and
     out of reach of a stray tap; the delay lets it finish sliding out first. */
  transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1), visibility 0s linear 300ms;
  visibility: hidden;
  display: none;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.mobile-nav.open {
  transform: translateX(0);
  visibility: visible;
  transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1), visibility 0s;
}

@supports not (height: 100dvh) {
  .mobile-nav { height: 100vh; }
}

.mobile-nav-head {
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px 0 24px;
  border-bottom: 1px solid var(--g-line);
}

.mobile-nav-title {
  font-family: var(--g-mono);
  font-size: 0.688rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--g-text-faint);
}

/* The panel covers the button that opened it, so it carries its own way out. */
.mobile-nav-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--g-line);
  border-radius: var(--g-r);
  background: transparent;
  color: var(--g-text);
  cursor: pointer;
}

.mobile-nav-close:hover { border-color: var(--g-volt); color: var(--g-volt); }

.mobile-nav-container {
  padding: 12px 24px 40px;
}

.mobile-nav ul { list-style: none; margin: 0; padding: 0; }

.mobile-nav li { border-bottom: 1px solid var(--g-line); }

.mobile-nav a:not(.g-btn) {
  display: block;
  font-size: 1.25rem;
  font-weight: 500;
  letter-spacing: -0.03em;
  color: var(--g-text);
  text-decoration: none;
  padding: 15px 0;
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
  .header-page { display: block; }
  .mobile-menu-button { display: flex; }
  .mobile-nav,
  .mobile-scrim { display: block; }
  .header-container { gap: 16px; }
  .auth-buttons { margin-left: auto; }
}

/* The primary call to action stays on the smallest screens — only the
   secondary one goes. Hiding both left the mobile header with nothing but a
   hamburger, on the site's most-visited page. */
@media (max-width: 560px) {
  .auth-buttons .g-btn--sm { padding: 9px 13px; font-size: 0.8125rem; }
}

@media (max-width: 390px) {
  .auth-buttons .g-btn { display: none; }
}
</style>
