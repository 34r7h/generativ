<script setup>
/**
 * Admin navigation.
 *
 * Two independent pieces of state, deliberately not one:
 *
 *   collapsed  — desktop only. Narrow rail vs. full width. Persisted.
 *   drawerOpen — mobile only. Off-canvas drawer. Never persisted, because a
 *                drawer that is open on arrival is a mistake, not a preference.
 *
 * The mobile toggle is a FIXED SIBLING of <aside>, never a child of it. The
 * previous version put the toggle inside the element that gets translated
 * off-screen, so once the drawer closed on a phone there was no way to reopen
 * it — the only control had left the viewport with it.
 */
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import AppIcon from '../../../shared/AppIcon.vue';

const router = useRouter();
const route = useRoute();

const collapsed = ref(false);
const drawerOpen = ref(false);
const isMobile = ref(false);
const userName = ref('Admin');
const userRole = ref('Administrator');

// The rail (icon-only) treatment is a desktop affordance. On a phone the drawer
// is always full width, so labels stay readable regardless of the stored
// preference.
const rail = computed(() => collapsed.value && !isMobile.value);

let mediaQuery = null;
function syncViewport(event) {
  isMobile.value = event.matches;
  if (!event.matches) drawerOpen.value = false;
}

function toggleCollapsed() {
  collapsed.value = !collapsed.value;
  localStorage.setItem('adminSidebarCollapsed', collapsed.value.toString());
}

function toggleDrawer() {
  drawerOpen.value = !drawerOpen.value;
}

function closeDrawer() {
  drawerOpen.value = false;
}

// Navigating always closes the drawer — otherwise it covers the page you just
// asked for.
watch(() => route.path, closeDrawer);

// Navigation grouped so that every public page has one obvious place to manage
// its content.
const navGroups = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: 'chart', exact: true }
    ]
  },
  {
    label: 'Site pages',
    items: [
      { name: 'Home', path: '/admin/pages/home', icon: 'home', exact: true },
      { name: 'About', path: '/admin/pages/about', icon: 'document', exact: true },
      { name: 'Services', path: '/admin/services', icon: 'wrench' },
      { name: 'Team', path: '/admin/team', icon: 'users' },
      { name: 'Writing', path: '/admin/blog', icon: 'book' },
      { name: 'Resources', path: '/admin/resources', icon: 'folder' },
      { name: 'Contact', path: '/admin/contact', icon: 'mail' }
    ]
  },
  {
    label: 'Library',
    items: [
      { name: 'Media', path: '/admin/media', icon: 'image' },
      { name: 'All page records', path: '/admin/pages', icon: 'layers', exact: true }
    ]
  },
  {
    label: 'System',
    items: [
      { name: 'Settings', path: '/admin/settings', icon: 'gear' }
    ]
  }
];

// Exact items must not light up for their own children (/admin/pages should not
// look active while you are on /admin/pages/home).
function isActive(item) {
  if (item.exact) {
    if (item.path === '/admin/dashboard' && route.path === '/admin') return true;
    return route.path === item.path;
  }
  return route.path === item.path || route.path.startsWith(`${item.path}/`);
}

function handleLogout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('isAdmin');
  router.push('/admin/login');
}

onMounted(() => {
  collapsed.value = localStorage.getItem('adminSidebarCollapsed') === 'true';

  const storedUserName = localStorage.getItem('userName');
  if (storedUserName) {
    userName.value = storedUserName;
  }

  mediaQuery = window.matchMedia('(max-width: 992px)');
  syncViewport(mediaQuery);
  mediaQuery.addEventListener('change', syncViewport);
});

onBeforeUnmount(() => {
  if (mediaQuery) mediaQuery.removeEventListener('change', syncViewport);
});
</script>

<template>
  <div class="sidebar-root">
    <!-- Mobile toggle. Fixed, outside <aside>, so it survives the drawer
         sliding off-screen. -->
    <button
      class="drawer-toggle"
      type="button"
      :aria-expanded="drawerOpen"
      aria-controls="admin-nav"
      :aria-label="drawerOpen ? 'Close navigation' : 'Open navigation'"
      @click="toggleDrawer"
    >
      <AppIcon :name="drawerOpen ? 'close' : 'menu'" :size="20" />
    </button>

    <div v-if="drawerOpen" class="drawer-backdrop" @click="closeDrawer"></div>

    <aside
      id="admin-nav"
      :class="['admin-sidebar', { collapsed: rail, 'drawer-open': drawerOpen }]"
    >
      <div class="sidebar-header">
        <router-link to="/admin/dashboard" class="logo" :title="rail ? 'Generativ' : null">
          <span class="logo-mark">G</span>
          <span v-if="!rail" class="logo-text">Generativ</span>
        </router-link>

        <button
          class="collapse-btn"
          type="button"
          :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
          @click="toggleCollapsed"
        >
          <AppIcon :name="collapsed ? 'arrowRight' : 'arrowLeft'" :size="18" />
        </button>
      </div>

      <nav class="sidebar-nav" aria-label="Admin sections">
        <div v-for="group in navGroups" :key="group.label" class="nav-group">
          <p v-if="!rail" class="nav-group-label">{{ group.label }}</p>
          <ul>
            <li v-for="item in group.items" :key="item.path">
              <router-link
                :to="item.path"
                :class="{ active: isActive(item) }"
                :title="rail ? item.name : null"
                :aria-current="isActive(item) ? 'page' : null"
              >
                <span class="nav-icon"><AppIcon :name="item.icon" :size="20" /></span>
                <span v-if="!rail" class="nav-text">{{ item.name }}</span>
              </router-link>
            </li>
          </ul>
        </div>
      </nav>

      <div class="sidebar-footer">
        <a
          href="/"
          target="_blank"
          rel="noopener"
          class="footer-link"
          :title="rail ? 'View site' : null"
        >
          <span class="nav-icon"><AppIcon name="external" :size="20" /></span>
          <span v-if="!rail" class="nav-text">View site</span>
        </a>

        <button
          class="footer-link logout-button"
          type="button"
          :title="rail ? 'Log out' : null"
          @click="handleLogout"
        >
          <span class="nav-icon"><AppIcon name="logout" :size="20" /></span>
          <span v-if="!rail" class="nav-text">Log out</span>
        </button>

        <div class="user-profile">
          <div class="user-avatar">{{ userName.charAt(0).toUpperCase() }}</div>
          <div v-if="!rail" class="user-info">
            <p class="user-name">{{ userName }}</p>
            <p class="user-role">{{ userRole }}</p>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>

<style scoped>
/* The wrapper exists only to give the toggle and backdrop a home in the
   template. `display: contents` keeps <aside> as the direct grid child of the
   admin layout, exactly as before this component grew a wrapper. */
.sidebar-root {
  display: contents;
}

/* Colour contract for this component: the sidebar is a dark surface, so every
   piece of text on it is light. Nothing dark ever sits on a coloured fill. */
.admin-sidebar {
  background-color: var(--gray-900);
  color: var(--gray-100);
  height: 100vh;
  width: 260px;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  overflow-y: auto;
  overflow-x: hidden;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  transition: width var(--transition-normal);
}

.admin-sidebar.collapsed {
  width: 72px;
}

/* Deliberately no :hover width change — the sidebar sits in the page grid, so
   growing it on hover re-lays out everything to its right. */

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg) var(--spacing-md);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  text-decoration: none;
  color: var(--gray-100);
  min-width: 0;
}

.logo-mark {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  background-color: var(--primary);
  color: #ffffff;
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.logo-text {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.125rem;
  white-space: nowrap;
}

.collapse-btn {
  background: none;
  border: none;
  color: var(--gray-400);
  cursor: pointer;
  padding: 6px;
  border-radius: var(--border-radius-md);
  display: flex;
}

.collapse-btn:hover {
  background-color: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

.sidebar-nav {
  flex: 1;
  padding: var(--spacing-md) 0;
}

.nav-group + .nav-group {
  margin-top: var(--spacing-lg);
}

.nav-group-label {
  margin: 0 0 var(--spacing-xs);
  padding: 0 var(--spacing-lg);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--gray-500);
}

.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-nav a {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: 10px var(--spacing-lg);
  color: var(--gray-300);
  text-decoration: none;
  border-left: 3px solid transparent;
  transition: background-color var(--transition-fast), color var(--transition-fast);
  white-space: nowrap;
}

.sidebar-nav a:hover {
  background-color: rgba(255, 255, 255, 0.06);
  color: #ffffff;
}

.sidebar-nav a.active {
  background-color: var(--primary);
  border-left-color: #ffffff;
  color: #ffffff;
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  flex-shrink: 0;
}

.sidebar-footer {
  padding: var(--spacing-md);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.footer-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  width: 100%;
  padding: 10px var(--spacing-sm);
  background: none;
  border: none;
  border-radius: var(--border-radius-md);
  color: var(--gray-300);
  text-decoration: none;
  cursor: pointer;
  font: inherit;
  white-space: nowrap;
}

.footer-link:hover {
  background-color: rgba(255, 255, 255, 0.06);
  color: #ffffff;
}

.logout-button:hover {
  background-color: var(--danger);
  color: #ffffff;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
  padding: var(--spacing-sm);
  background-color: rgba(255, 255, 255, 0.06);
  border-radius: var(--border-radius-md);
}

.user-avatar {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  background-color: var(--primary);
  color: #ffffff;
  border-radius: var(--border-radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.user-info {
  min-width: 0;
}

.user-name {
  margin: 0;
  font-weight: 500;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  margin: 0;
  font-size: 0.75rem;
  color: var(--gray-400);
}

/* Mobile drawer -------------------------------------------------------- */

.drawer-toggle {
  display: none;
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: calc(var(--z-drawer) + 2);
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  background-color: var(--gray-900);
  color: #ffffff;
  border: none;
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  cursor: pointer;
}

.drawer-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(17, 24, 39, 0.5);
  z-index: calc(var(--z-drawer) - 1);
}

@media (max-width: 992px) {
  .drawer-toggle {
    display: flex;
  }

  .admin-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    z-index: var(--z-drawer);
    width: 260px;
    transform: translateX(-100%);
    transition: transform var(--transition-normal);
  }

  /* `rail` is false on mobile by construction, so .collapsed never applies
     here — the drawer is always full width with readable labels. */
  .admin-sidebar.drawer-open {
    transform: translateX(0);
  }

  .collapse-btn {
    display: none;
  }
}
</style>
