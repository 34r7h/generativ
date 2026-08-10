<script setup>
/**
 * Admin page header.
 *
 * Everything here does something. The previous version shipped a search box
 * wired to nothing, a notification bell with three hardcoded messages and a
 * permanent "3" badge, and dropdown links to /admin/profile and
 * /admin/notifications — neither of which is a route. All removed rather than
 * left as furniture.
 *
 * `title` stays optional so the pages that render <AdminHeader /> with no props
 * keep working; the route supplies a name when the prop is absent.
 */
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppIcon from '../../../shared/AppIcon.vue';

const props = defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' }
});

const route = useRoute();
const router = useRouter();
const showUserMenu = ref(false);
const userName = ref('Admin');

const ROUTE_TITLES = {
  '/admin/dashboard': 'Dashboard',
  '/admin/pages': 'Page records',
  '/admin/pages/home': 'Home page',
  '/admin/pages/about': 'About page',
  '/admin/services': 'Services',
  '/admin/team': 'Team',
  '/admin/blog': 'Writing',
  '/admin/resources': 'Resources',
  '/admin/contact': 'Contact details',
  '/admin/media': 'Media',
  '/admin/settings': 'Settings'
};

const heading = computed(() => props.title || ROUTE_TITLES[route.path] || 'Admin');

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value;
}

function closeUserMenu(event) {
  if (!event.target.closest('.user-dropdown')) {
    showUserMenu.value = false;
  }
}

function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('isAdmin');
  router.push('/admin/login');
}

onMounted(() => {
  const stored = localStorage.getItem('userName');
  if (stored) userName.value = stored;
  document.addEventListener('click', closeUserMenu);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', closeUserMenu);
});
</script>

<template>
  <header class="admin-header">
    <div class="header-title">
      <h1>{{ heading }}</h1>
      <p v-if="subtitle" class="header-subtitle">{{ subtitle }}</p>
    </div>

    <div class="header-actions">
      <a href="/" target="_blank" rel="noopener" class="ghost-button">
        <AppIcon name="external" :size="16" />
        <span>View site</span>
      </a>

      <div class="user-dropdown">
        <button class="user-button" type="button" :aria-expanded="showUserMenu" @click="toggleUserMenu">
          <span class="user-avatar">{{ userName.charAt(0).toUpperCase() }}</span>
          <span class="user-label">{{ userName }}</span>
        </button>

        <div v-if="showUserMenu" class="dropdown-menu">
          <router-link to="/admin/settings" class="dropdown-link" @click="showUserMenu = false">
            <AppIcon name="gear" :size="16" />
            <span>Settings</span>
          </router-link>
          <button type="button" class="dropdown-link danger" @click="logout">
            <AppIcon name="logout" :size="16" />
            <span>Log out</span>
          </button>
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
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: #ffffff;
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius-lg);
  margin-bottom: var(--spacing-lg);
}

.header-title h1 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--gray-900);
}

.header-subtitle {
  margin: 4px 0 0;
  color: var(--gray-600);
  font-size: 0.875rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.ghost-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius-md);
  background-color: #ffffff;
  color: var(--gray-700);
  text-decoration: none;
  font-size: 0.875rem;
  cursor: pointer;
}

.ghost-button:hover {
  background-color: var(--gray-100);
  color: var(--gray-900);
}

.user-dropdown {
  position: relative;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px 6px 6px;
  background: none;
  border: 1px solid transparent;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  color: var(--gray-700);
  font: inherit;
}

.user-button:hover {
  border-color: var(--gray-300);
}

.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: var(--border-radius-full);
  background-color: var(--primary);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  min-width: 180px;
  background-color: #ffffff;
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-lg);
  padding: 6px;
  z-index: var(--z-dropdown);
}

.dropdown-link {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  background: none;
  border: none;
  border-radius: var(--border-radius-sm);
  color: var(--gray-700);
  text-decoration: none;
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.dropdown-link:hover {
  background-color: var(--gray-100);
  color: var(--gray-900);
}

.dropdown-link.danger:hover {
  background-color: var(--danger);
  color: #ffffff;
}

/* Leave room for the fixed drawer toggle the sidebar renders on small screens. */
@media (max-width: 992px) {
  .admin-header {
    padding-left: 64px;
  }

  .user-label {
    display: none;
  }
}

@media (max-width: 600px) {
  .admin-header {
    flex-wrap: wrap;
  }

  .ghost-button span {
    display: none;
  }
}
</style>
