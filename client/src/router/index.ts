import { createRouter, createWebHistory } from 'vue-router'

// Public pages
import HomePage from '../components/views/HomePage.vue'
import ServicesPage from '../components/views/ServicesPage.vue'
import ServiceDetailPage from '../components/views/ServiceDetailPage.vue'
import AboutPage from '../components/views/AboutPage.vue'
import TeamPage from '../components/views/TeamPage.vue'
import BlogPage from '../components/views/BlogPage.vue'
import BlogPostPage from '../components/views/BlogPostPage.vue'
import ContactPage from '../components/views/ContactPage.vue'
import ResourcesPage from '../components/views/ResourcesPage.vue'
import ResourceDetailPage from '../components/views/ResourceDetailPage.vue'

// Auth pages
import LoginPage from '../components/views/auth/LoginPage.vue'
import SignupPage from '../components/views/auth/SignupPage.vue'

// Admin pages
import AdminDashboard from '../components/views/admin/DashboardPage.vue'
import AdminPages from '../components/views/admin/PagesPage.vue'
import AdminTeam from '../components/views/admin/TeamPage.vue'
import AdminServices from '../components/views/admin/ServicesPage.vue'
import AdminBlog from '../components/views/admin/BlogPage.vue'
import AdminMedia from '../components/views/admin/MediaPage.vue'
import AdminSettings from '../components/views/admin/SettingsPage.vue'

// Auth guard for admin routes
function requireAuth(to: any, from: any, next: any) {
  const token = localStorage.getItem('authToken')
  const isAdmin = localStorage.getItem('isAdmin') === 'true'
  
  if (token && isAdmin) {
    next()
  } else {
    next('/admin/login?redirect=' + to.fullPath)
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Public routes
    {
      path: '/',
      name: 'home',
      component: HomePage
    },
    {
      path: '/services',
      name: 'services',
      component: ServicesPage
    },
    {
      path: '/services/:slug',
      name: 'service-detail',
      component: ServiceDetailPage
    },
    {
      path: '/about',
      name: 'about',
      component: AboutPage
    },
    {
      path: '/team',
      name: 'team',
      component: TeamPage
    },
    {
      path: '/blog',
      name: 'blog',
      component: BlogPage
    },
    {
      path: '/blog/:slug',
      name: 'blog-post',
      component: BlogPostPage
    },
    {
      path: '/contact',
      name: 'contact',
      component: ContactPage
    },
    {
      path: '/resources',
      name: 'resources',
      component: ResourcesPage
    },
    {
      path: '/resources/:slug',
      name: 'resource-detail',
      component: ResourceDetailPage
    },
    
    // Auth routes
    {
      path: '/admin/login',
      name: 'admin-login',
      component: LoginPage
    },
    {
      path: '/admin/signup',
      name: 'admin-signup',
      component: SignupPage
    },
    
    // Admin routes
    {
      path: '/admin',
      redirect: '/admin/dashboard'
    },
    {
      path: '/admin/dashboard',
      name: 'admin-dashboard',
      component: AdminDashboard,
      beforeEnter: requireAuth,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/pages',
      name: 'admin-pages',
      component: AdminPages,
      beforeEnter: requireAuth,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/team',
      name: 'admin-team',
      component: AdminTeam,
      beforeEnter: requireAuth,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/services',
      name: 'admin-services',
      component: AdminServices,
      beforeEnter: requireAuth,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/blog',
      name: 'admin-blog',
      component: AdminBlog,
      beforeEnter: requireAuth,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/media',
      name: 'admin-media',
      component: AdminMedia,
      beforeEnter: requireAuth,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/settings',
      name: 'admin-settings',
      component: AdminSettings,
      beforeEnter: requireAuth,
      meta: { requiresAuth: true }
    },
    
    // Catch-all/404 route
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../components/views/NotFoundPage.vue')
    }
  ],
  // Smooth scrolling behavior
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  }
})

export default router