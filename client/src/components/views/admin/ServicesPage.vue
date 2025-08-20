<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import AdminSidebar from './components/AdminSidebar.vue';
import AdminHeader from './components/AdminHeader.vue';
import { cmsAPI } from '../../../api/client';

const router = useRouter();
const loading = ref(true);
const error = ref(null);
const services = ref([]);
const filteredServices = ref([]);
const searchQuery = ref('');
const showModal = ref(false);
const editingService = ref(null);
const saving = ref(false);

// Form data for creating/editing services
const serviceForm = ref({
  title: '',
  slug: '',
  shortDescription: '',
  fullDescription: '',
  icon: '🔧',
  benefits: [],
  pricing: '',
  isPublished: false,
  sortOrder: 1,
  seo: {
    title: '',
    description: '',
    keywords: []
  }
});

// Computed properties
const publishedCount = computed(() => services.value.filter(service => service.isPublished).length);
const draftCount = computed(() => services.value.filter(service => !service.isPublished).length);

// Filter services based on search
const filterServices = () => {
  let filtered = [...services.value];
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(service => 
      service.title.toLowerCase().includes(query) ||
      service.shortDescription.toLowerCase().includes(query) ||
      service.slug.toLowerCase().includes(query)
    );
  }
  
  filteredServices.value = filtered.sort((a, b) => a.sortOrder - b.sortOrder);
};

// Watch for changes in search
const updateFilters = () => {
  filterServices();
};

// Load services
const loadServices = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const response = await cmsAPI.getServices();
    if (response.success) {
      services.value = response.services || [];
      filterServices();
    } else {
      throw new Error(response.error || 'Failed to load services');
    }
  } catch (err) {
    console.error('Error loading services:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

// Create new service
const createService = () => {
  editingService.value = null;
  serviceForm.value = {
    title: '',
    slug: '',
    shortDescription: '',
    fullDescription: '',
    icon: '🔧',
    benefits: [],
    pricing: '',
    isPublished: false,
    sortOrder: services.value.length + 1,
    seo: {
      title: '',
      description: '',
      keywords: []
    }
  };
  showModal.value = true;
};

// Edit existing service
const editService = (service) => {
  editingService.value = service;
  serviceForm.value = {
    title: service.title,
    slug: service.slug,
    shortDescription: service.shortDescription,
    fullDescription: service.fullDescription,
    icon: service.icon,
    benefits: [...(service.benefits || [])],
    pricing: service.pricing,
    isPublished: service.isPublished,
    sortOrder: service.sortOrder,
    seo: {
      title: service.seo?.title || '',
      description: service.seo?.description || '',
      keywords: [...(service.seo?.keywords || [])]
    }
  };
  showModal.value = true;
};

// Generate slug from title
const generateSlug = () => {
  if (serviceForm.value.title) {
    serviceForm.value.slug = serviceForm.value.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
};

// Add benefit
const addBenefit = () => {
  serviceForm.value.benefits.push('');
};

// Remove benefit
const removeBenefit = (index) => {
  serviceForm.value.benefits.splice(index, 1);
};

// Add keyword
const addKeyword = () => {
  serviceForm.value.seo.keywords.push('');
};

// Remove keyword
const removeKeyword = (index) => {
  serviceForm.value.seo.keywords.splice(index, 1);
};

// Save service
const saveService = async () => {
  try {
    saving.value = true;
    
    // Validate form
    if (!serviceForm.value.title || !serviceForm.value.slug) {
      throw new Error('Title and slug are required');
    }
    
    // Filter out empty benefits and keywords
    serviceForm.value.benefits = serviceForm.value.benefits.filter(benefit => benefit.trim());
    serviceForm.value.seo.keywords = serviceForm.value.seo.keywords.filter(keyword => keyword.trim());
    
    let response;
    if (editingService.value) {
      response = await cmsAPI.updateService(editingService.value.id, serviceForm.value);
    } else {
      response = await cmsAPI.createService(serviceForm.value);
    }
    
    if (response.success) {
      showModal.value = false;
      await loadServices();
    } else {
      throw new Error(response.error || 'Failed to save service');
    }
  } catch (err) {
    console.error('Error saving service:', err);
    error.value = err.message;
  } finally {
    saving.value = false;
  }
};

// Delete service
const deleteService = async (service) => {
  if (!confirm(`Are you sure you want to delete "${service.title}"?`)) {
    return;
  }
  
  try {
    const response = await cmsAPI.deleteService(service.id);
    if (response.success) {
      await loadServices();
    } else {
      throw new Error(response.error || 'Failed to delete service');
    }
  } catch (err) {
    console.error('Error deleting service:', err);
    error.value = err.message;
  }
};

// Close modal
const closeModal = () => {
  showModal.value = false;
  editingService.value = null;
};

// Format date
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

onMounted(() => {
  loadServices();
});
</script>

<template>
  <div class="admin-layout">
    <AdminSidebar />
    
    <main class="admin-main">
      <AdminHeader />
      
      <div class="admin-content">
  <div class="admin-page">
    <div class="admin-container">
            <!-- Header -->
      <div class="admin-header">
              <div class="header-left">
        <h1>Services Management</h1>
                <p>Manage your service offerings and content</p>
              </div>
              <div class="header-right">
                <button @click="createService" class="btn btn-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  Add Service
                </button>
              </div>
            </div>
            
            <!-- Stats Cards -->
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ services.length }}</div>
                  <div class="stat-label">Total Services</div>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon published">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22,4 12,14.01 9,11.01"/>
                  </svg>
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ publishedCount }}</div>
                  <div class="stat-label">Published</div>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon draft">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                  </svg>
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ draftCount }}</div>
                  <div class="stat-label">Drafts</div>
                </div>
              </div>
            </div>
            
            <!-- Search and Filters -->
            <div class="admin-filters">
              <div class="search-box">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
                <input 
                  type="text" 
                  v-model="searchQuery" 
                  @input="updateFilters"
                  placeholder="Search services..." 
                  class="search-input"
                />
              </div>
            </div>
            
            <!-- Error Message -->
            <div v-if="error" class="error-message">
              {{ error }}
            </div>
            
            <!-- Loading State -->
            <div v-if="loading" class="loading-state">
              <div class="spinner"></div>
              <p>Loading services...</p>
            </div>
            
            <!-- Services Table -->
            <div v-else-if="filteredServices.length > 0" class="admin-table-container">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Status</th>
                    <th>Order</th>
                    <th>Last Modified</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="service in filteredServices" :key="service.id" class="table-row">
                    <td class="service-cell">
                      <div class="service-info">
                        <div class="service-icon">{{ service.icon }}</div>
                        <div class="service-details">
                          <div class="service-title">{{ service.title }}</div>
                          <div class="service-description">{{ service.shortDescription }}</div>
                          <div class="service-slug">/services/{{ service.slug }}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span :class="['status-badge', service.isPublished ? 'published' : 'draft']">
                        {{ service.isPublished ? 'Published' : 'Draft' }}
                      </span>
                    </td>
                    <td>{{ service.sortOrder }}</td>
                    <td class="date-cell">{{ formatDate(service.updatedAt) }}</td>
                    <td class="actions-cell">
                      <div class="action-buttons">
                        <button @click="editService(service)" class="btn btn-sm btn-secondary" title="Edit">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                          </svg>
                        </button>
                        <button @click="deleteService(service)" class="btn btn-sm btn-danger" title="Delete">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3,6 5,6 21,6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
      </div>
      
            <!-- Empty State -->
            <div v-else class="empty-state">
              <div class="empty-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3>No services found</h3>
              <p>{{ searchQuery ? 'No services match your search criteria.' : 'Get started by creating your first service.' }}</p>
              <button v-if="!searchQuery" @click="createService" class="btn btn-primary">
                Create Service
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--gray-50);
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.admin-content {
  flex: 1;
  overflow-y: auto;
}

.admin-page {
  padding: 20px;
}

.admin-container {
  max-width: 1200px;
  margin: 0 auto;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
}

.header-left h1 {
  font-size: 2rem;
  color: var(--gray-900);
  margin-bottom: 5px;
}

.header-left p {
  color: var(--gray-600);
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: var(--border-radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--border-radius-md);
  background: var(--primary-light);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.published {
  background: var(--success-light);
  color: var(--success);
}

.stat-icon.draft {
  background: var(--warning-light);
  color: var(--warning);
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--gray-900);
}

.stat-label {
  color: var(--gray-600);
  font-size: 0.875rem;
}

.admin-filters {
  background: white;
  border-radius: var(--border-radius-lg);
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-sm);
}

.search-box {
  position: relative;
  max-width: 400px;
}

.search-box svg {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-500);
}

.search-input {
  width: 100%;
  padding: 10px 10px 10px 40px;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius-md);
  font-size: 0.875rem;
}

.search-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.admin-table-container {
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th {
  background: var(--gray-50);
  padding: 15px 20px;
  text-align: left;
  font-weight: 600;
  color: var(--gray-700);
  border-bottom: 1px solid var(--gray-200);
}

.admin-table td {
  padding: 15px 20px;
  border-bottom: 1px solid var(--gray-100);
}

.table-row:hover {
  background: var(--gray-50);
}

.service-cell {
  min-width: 300px;
}

.service-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.service-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gray-100);
  border-radius: var(--border-radius-md);
}

.service-title {
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: 4px;
}

.service-description {
  color: var(--gray-600);
  font-size: 0.875rem;
  margin-bottom: 4px;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.service-slug {
  color: var(--gray-500);
  font-size: 0.75rem;
  font-family: var(--font-mono);
}

.status-badge {
  padding: 4px 8px;
  border-radius: var(--border-radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.published {
  background: var(--success-light);
  color: var(--success-dark);
}

.status-badge.draft {
  background: var(--warning-light);
  color: var(--warning-dark);
}

.date-cell {
  color: var(--gray-600);
  font-size: 0.875rem;
}

.actions-cell {
  width: 120px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.empty-state {
  background: white;
  border-radius: var(--border-radius-lg);
  padding: 60px 20px;
  text-align: center;
  box-shadow: var(--shadow-sm);
}

.empty-icon {
  color: var(--gray-400);
  margin-bottom: 20px;
}

.empty-state h3 {
  color: var(--gray-900);
  margin-bottom: 10px;
}

.empty-state p {
  color: var(--gray-600);
  margin-bottom: 30px;
}

.loading-state {
  background: white;
  border-radius: var(--border-radius-lg);
  padding: 60px 20px;
  text-align: center;
  box-shadow: var(--shadow-sm);
}

.error-message {
  background: var(--danger-light);
  color: var(--danger-dark);
  padding: 15px;
  border-radius: var(--border-radius-md);
  margin-bottom: 20px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .admin-header {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .admin-table-container {
    overflow-x: auto;
  }
  
  .service-cell {
    min-width: 250px;
  }
  
  .service-description {
    max-width: 200px;
  }
}
</style>
