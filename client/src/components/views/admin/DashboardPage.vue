<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AdminSidebar from './components/AdminSidebar.vue';
import AdminHeader from './components/AdminHeader.vue';
import { cmsAPI } from '../../../api/client';

const router = useRouter();
const loading = ref(true);
const error = ref(null);
const stats = ref({
  pages: 0,
  services: 0,
  team: 0,
  media: 0,
  blogPosts: 0,
  contactSubmissions: 0
});

// Recent activity from audit log
const recentActivity = ref([]);

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}

// Load dashboard data
async function loadDashboardData() {
  try {
    loading.value = true;
    error.value = null;
    
    // Get data from API
    const [pagesResponse, servicesResponse, teamResponse, blogPostsResponse] = await Promise.all([
      cmsAPI.getPages(),
      cmsAPI.getServices(),
      cmsAPI.getTeamMembers(),
      cmsAPI.getBlogPosts()
    ]);
    
    // Get media (requires auth)
    let mediaCount = 0;
    try {
      const mediaResponse = await cmsAPI.getAllMedia();
      if (mediaResponse.success && mediaResponse.media) {
        mediaCount = mediaResponse.media.length;
      }
    } catch {
      console.warn('Could not load media data, might need authentication');
    }
    
    // Update stats with real data
    stats.value = {
      pages: pagesResponse.success ? pagesResponse.pages.length : 0,
      services: servicesResponse.success ? servicesResponse.services.length : 0,
      team: teamResponse.success ? teamResponse.members.length : 0,
      media: mediaCount,
      blogPosts: blogPostsResponse.success ? blogPostsResponse.posts.length : 0,
      contactSubmissions: 0 // Not implemented yet
    };
    
    loading.value = false;
  } catch (err) {
    console.error('Error loading dashboard data:', err);
    error.value = 'Failed to load dashboard data';
    loading.value = false;
  }
}

// Check if user is authenticated
function checkAuth() {
  const token = localStorage.getItem('authToken');
  if (!token) {
    router.push('/admin/login');
  }
}

onMounted(() => {
  checkAuth();
  loadDashboardData();
});
</script>

<template>
  <div class="admin-layout">
    <AdminSidebar />
    
    <div class="admin-content">
      <AdminHeader title="Dashboard" />
      
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-grid">
          <div class="loading-card" v-for="i in 4" :key="i">
            <div class="skeleton-icon"></div>
            <div class="skeleton-text">
              <div class="skeleton-line short"></div>
              <div class="skeleton-line long"></div>
            </div>
          </div>
        </div>
        <div class="loading-indicator">
          <div class="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <p>{{ error }}</p>
        <button @click="loadDashboardData" class="btn btn-primary">Try Again</button>
      </div>
      
      <!-- Dashboard Content -->
      <div v-else class="dashboard-content">
        <!-- Welcome Section -->
        <div class="welcome-section">
          <div class="welcome-card glass-card">
            <div class="welcome-content">
              <h2>Welcome to Generativ CMS</h2>
              <p>Manage your website content, track performance, and engage with your audience.</p>
              <div class="welcome-actions">
                <button class="btn btn-primary">Create Content</button>
                <button class="btn btn-secondary">View Website</button>
              </div>
            </div>
            <div class="welcome-graphic">
              <div class="dashboard-graphic"></div>
            </div>
          </div>
        </div>
        
        <!-- Stats Cards -->
        <div class="stats-section">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon" style="background-color: rgba(59, 130, 246, 0.1); color: var(--primary);">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
              <div class="stat-details">
                <h3>Pages</h3>
                <p class="stat-value">{{ stats.pages }}</p>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon" style="background-color: rgba(16, 185, 129, 0.1); color: var(--secondary);">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              </div>
              <div class="stat-details">
                <h3>Services</h3>
                <p class="stat-value">{{ stats.services }}</p>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon" style="background-color: rgba(139, 92, 246, 0.1); color: var(--accent);">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <div class="stat-details">
                <h3>Team</h3>
                <p class="stat-value">{{ stats.team }}</p>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon" style="background-color: rgba(245, 158, 11, 0.1); color: var(--warning);">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              </div>
              <div class="stat-details">
                <h3>Media</h3>
                <p class="stat-value">{{ stats.media }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Recent Activity -->
        <div class="activity-section">
          <div class="section-header">
            <h2>Recent Activity</h2>
            <button class="btn btn-sm btn-secondary">View All</button>
          </div>
          
          <div class="activity-card">
            <table class="activity-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>User</th>
                  <th>Time</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in recentActivity" :key="item.id">
                  <td>
                    <span class="activity-badge" :class="{
                      'created': item.action.includes('Created'),
                      'updated': item.action.includes('Updated'),
                      'deleted': item.action.includes('Deleted'),
                      'added': item.action.includes('Added')
                    }">{{ item.action }}</span>
                  </td>
                  <td>{{ item.resource }}</td>
                  <td>{{ item.user }}</td>
                  <td>{{ formatDate(item.timestamp) }}</td>
                  <td>
                    <button class="btn-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="actions-section">
          <div class="section-header">
            <h2>Quick Actions</h2>
          </div>
          
          <div class="actions-grid">
            <div class="action-card">
              <div class="action-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
              </div>
              <h3>Add Page</h3>
              <p>Create a new page for your website</p>
              <router-link to="/admin/pages" class="btn btn-sm btn-primary">Create</router-link>
            </div>
            
            <div class="action-card">
              <div class="action-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
              </div>
              <h3>Edit Content</h3>
              <p>Update existing website content</p>
              <router-link to="/admin/pages" class="btn btn-sm btn-primary">Edit</router-link>
            </div>
            
            <div class="action-card">
              <div class="action-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              </div>
              <h3>Upload Media</h3>
              <p>Add images and files to your library</p>
              <router-link to="/admin/media" class="btn btn-sm btn-primary">Upload</router-link>
            </div>
            
            <div class="action-card">
              <div class="action-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
              </div>
              <h3>View Analytics</h3>
              <p>Check your website performance</p>
              <router-link to="/admin/settings" class="btn btn-sm btn-primary">View</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  display: grid;
  grid-template-columns: auto 1fr;
  min-height: 100vh;
  background-color: var(--gray-100);
}

.admin-content {
  padding: var(--spacing-lg);

  max-width: 100%;
}

/* Loading and Error States */
.loading-state {
  padding: var(--spacing-lg) 0;
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.loading-card {
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
}

.skeleton-icon {
  width: 50px;
  height: 50px;
  border-radius: var(--border-radius-md);
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  margin-right: var(--spacing-md);
}

.skeleton-text {
  flex: 1;
}

.skeleton-line {
  height: 12px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 6px;
  margin-bottom: 8px;
}

.skeleton-line.short {
  width: 60%;
  height: 10px;
}

.skeleton-line.long {
  width: 40%;
  height: 20px;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--spacing-lg) 0;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3xl) 0;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(59, 130, 246, 0.1);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-md);
}

.error-icon {
  color: var(--danger);
  margin-bottom: var(--spacing-md);
}

.error-state p {
  margin-bottom: var(--spacing-md);
  color: var(--gray-600);
}

/* Welcome Section */
.welcome-section {
  margin-bottom: var(--spacing-lg);
}

.welcome-card {
  display: flex;
  align-items: center;
  padding: var(--spacing-xl);
  border-radius: var(--border-radius-lg);
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: var(--shadow-lg);
}

.welcome-content {
  flex: 1;
}

.welcome-content h2 {
  margin-bottom: var(--spacing-sm);
  font-size: 1.75rem;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
}

.welcome-content p {
  margin-bottom: var(--spacing-md);
  color: var(--gray-700);
  max-width: 500px;
}

.welcome-actions {
  display: flex;
  gap: var(--spacing-md);
}

.welcome-graphic {
  flex: 0 0 200px;
  height: 150px;
  position: relative;
}

.dashboard-graphic {
  width: 100%;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'%3E%3Cpath d='M20,130 L60,80 L100,110 L140,50 L180,90' stroke='%233b82f6' stroke-width='3' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3Ccircle cx='20' cy='130' r='5' fill='%233b82f6'/%3E%3Ccircle cx='60' cy='80' r='5' fill='%233b82f6'/%3E%3Ccircle cx='100' cy='110' r='5' fill='%233b82f6'/%3E%3Ccircle cx='140' cy='50' r='5' fill='%233b82f6'/%3E%3Ccircle cx='180' cy='90' r='5' fill='%233b82f6'/%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

/* Stats Section */
.stats-section {
  margin-bottom: var(--spacing-lg);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-md);
}

.stat-card {
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--spacing-md);
}

.stat-details h3 {
  margin: 0;
  font-size: 0.875rem;
  color: var(--gray-600);
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0;
  color: var(--gray-900);
}

/* Activity Section */
.activity-section {
  margin-bottom: var(--spacing-lg);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.section-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.activity-card {
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.activity-table {
  width: 100%;
  border-collapse: collapse;
}

.activity-table th,
.activity-table td {
  padding: var(--spacing-md);
  text-align: left;
}

.activity-table th {
  background-color: var(--gray-50);
  font-weight: 600;
  color: var(--gray-700);
  font-size: 0.875rem;
}

.activity-table tr:not(:last-child) {
  border-bottom: 1px solid var(--gray-200);
}

.activity-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-full);
  font-size: 0.75rem;
  font-weight: 500;
}

.activity-badge.created {
  background-color: rgba(16, 185, 129, 0.1);
  color: var(--success);
}

.activity-badge.updated {
  background-color: rgba(59, 130, 246, 0.1);
  color: var(--primary);
}

.activity-badge.deleted {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--danger);
}

.activity-badge.added {
  background-color: rgba(139, 92, 246, 0.1);
  color: var(--accent);
}

.btn-icon {
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: var(--border-radius-full);
  color: var(--gray-500);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.btn-icon:hover {
  background-color: var(--gray-100);
  color: var(--gray-700);
}

/* Actions Section */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-md);
}

.action-card {
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-lg);
  text-align: center;
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
}

.action-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
}

.action-icon {
  width: 60px;
  height: 60px;
  border-radius: var(--border-radius-full);
  background-color: var(--gray-100);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-md);
  color: var(--primary);
}

.action-card h3 {
  margin-bottom: var(--spacing-xs);
  font-size: 1.125rem;
}

.action-card p {
  margin-bottom: var(--spacing-md);
  color: var(--gray-600);
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 1200px) {
  .stats-grid,
  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 992px) {
  .admin-layout {
    grid-template-columns: 1fr;
  }
  
  .welcome-card {
    flex-direction: column;
    text-align: center;
  }
  
  .welcome-content {
    margin-bottom: var(--spacing-lg);
  }
  
  .welcome-actions {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .stats-grid,
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .activity-table {
    display: block;
    overflow-x: auto;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>