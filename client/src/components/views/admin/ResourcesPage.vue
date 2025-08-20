<script setup>
import { ref, onMounted } from 'vue';
import AdminSidebar from './components/AdminSidebar.vue';
import AdminHeader from './components/AdminHeader.vue';
import RichTextEditor from './components/RichTextEditor.vue';
import { cmsAPI } from '../../../api/client';
const loading = ref(true);
const error = ref(null);
const resources = ref([]);
const showModal = ref(false);
const editingResource = ref(null);
const saving = ref(false);
const resourceForm = ref({
  title: '',
  description: '',
  url: '',
  tags: [],
  category: '',
  isPublished: false
});

const categories = [
  'Whitepaper',
  'Case Study',
  'Guide',
  'Template',
  'Tool',
  'Research',
  'Other'
];

const loadResources = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await cmsAPI.getAllResources();
    if (response.success) {
      resources.value = response.resources || [];
    } else {
      throw new Error(response.error || 'Failed to load resources');
    }
  } catch (err) {
    console.error('Error loading resources:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const createResource = () => {
  editingResource.value = null;
  resourceForm.value = {
    title: '',
    description: '',
    url: '',
    tags: [],
    category: '',
    isPublished: false
  };
  showModal.value = true;
};

const editResource = (resource) => {
  editingResource.value = resource;
  resourceForm.value = {
    title: resource.title,
    description: resource.description,
    url: resource.url,
    tags: [...(resource.tags || [])],
    category: resource.category || '',
    isPublished: resource.isPublished || false
  };
  showModal.value = true;
};

const saveResource = async () => {
  try {
    saving.value = true;
    
    let response;
    if (editingResource.value) {
      response = await cmsAPI.updateResource(editingResource.value.id, resourceForm.value);
    } else {
      response = await cmsAPI.createResource(resourceForm.value);
    }
    
    if (response.success) {
      showModal.value = false;
      await loadResources();
    } else {
      throw new Error(response.error || 'Failed to save resource');
    }
  } catch (err) {
    console.error('Error saving resource:', err);
    error.value = err.message;
  } finally {
    saving.value = false;
  }
};

const deleteResource = async (resource) => {
  if (!confirm(`Are you sure you want to delete "${resource.title}"?`)) {
    return;
  }
  
  try {
    const response = await cmsAPI.deleteResource(resource.id);
    if (response.success) {
      await loadResources();
    } else {
      throw new Error(response.error || 'Failed to delete resource');
    }
  } catch (err) {
    console.error('Error deleting resource:', err);
    error.value = err.message;
  }
};

const addTag = (tag) => {
  if (tag && !resourceForm.value.tags.includes(tag)) {
    resourceForm.value.tags.push(tag);
  }
};

const removeTag = (index) => {
  resourceForm.value.tags.splice(index, 1);
};

const togglePublish = async (resource) => {
  try {
    const response = await cmsAPI.updateResource(resource.id, {
      isPublished: !resource.isPublished
    });
    
    if (response.success) {
      await loadResources();
    } else {
      throw new Error(response.error || 'Failed to update resource');
    }
  } catch (err) {
    console.error('Error updating resource:', err);
    error.value = err.message;
  }
};



onMounted(() => {
  loadResources();
});
</script>

<template>
  <div class="admin-layout">
    <AdminSidebar />
    
    <div class="admin-content">
      <AdminHeader title="Resources Management" />
      
      <!-- Stats Cards -->
      <div class="stats-section">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon published">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="16 12 12 8 8 12"></polyline><line x1="12" y1="16" x2="12" y2="8"></line></svg>
            </div>
            <div class="stat-details">
              <h3>Published</h3>
              <p class="stat-value">{{ resources.filter(r => r.isPublished).length }}</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon draft">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
            </div>
            <div class="stat-details">
              <h3>Drafts</h3>
              <p class="stat-value">{{ resources.filter(r => !r.isPublished).length }}</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon total">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <div class="stat-details">
              <h3>Total Resources</h3>
              <p class="stat-value">{{ resources.length }}</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon categories">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            </div>
            <div class="stat-details">
              <h3>Categories</h3>
              <p class="stat-value">{{ categories.length }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Controls -->
      <div class="controls-section">
        <div class="controls-left">
          <h2>Resources</h2>
          <p>Manage downloadable resources, guides, and tools</p>
        </div>
        
        <div class="controls-right">
          <button @click="createResource" class="btn btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            New Resource
          </button>
        </div>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading resources...</p>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <p>{{ error }}</p>
        <button @click="loadResources" class="btn btn-primary">Try Again</button>
      </div>
      
      <!-- Resources List -->
      <div v-else class="resources-section">
        <div v-if="resources.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <h3>No resources found</h3>
          <p>Create your first resource to get started</p>
          <button @click="createResource" class="btn btn-primary">Create First Resource</button>
        </div>
        
        <div v-else class="resources-grid">
          <div v-for="resource in resources" :key="resource.id" class="resource-card">
            <div class="resource-header">
              <div class="resource-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
              <div class="resource-status">
                <span :class="['status-badge', resource.isPublished ? 'published' : 'draft']">
                  {{ resource.isPublished ? 'Published' : 'Draft' }}
                </span>
              </div>
            </div>
            
            <div class="resource-content">
              <h3 class="resource-title">{{ resource.title }}</h3>
              <p v-if="resource.description" class="resource-description">
                {{ resource.description.replace(/<[^>]*>/g, '').substring(0, 120) }}{{ resource.description.length > 120 ? '...' : '' }}
              </p>
              
              <div class="resource-meta">
                <span v-if="resource.category" class="resource-category">{{ resource.category }}</span>
                <span v-if="resource.url" class="resource-url">
                  <a :href="resource.url" target="_blank" rel="noopener noreferrer">View Resource</a>
                </span>
              </div>
              
              <div v-if="resource.tags && resource.tags.length > 0" class="resource-tags">
                <span v-for="tag in resource.tags.slice(0, 3)" :key="tag" class="tag">{{ tag }}</span>
                <span v-if="resource.tags.length > 3" class="tag-more">+{{ resource.tags.length - 3 }}</span>
              </div>
            </div>
            
            <div class="resource-actions">
              <button @click="editResource(resource)" class="btn-icon" title="Edit">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
              </button>
              <button @click="togglePublish(resource)" class="btn-icon" :title="resource.isPublished ? 'Unpublish' : 'Publish'">
                <svg v-if="resource.isPublished" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="16 12 12 8 8 12"></polyline><line x1="12" y1="16" x2="12" y2="8"></line></svg>
              </button>
              <button @click="deleteResource(resource)" class="btn-icon btn-danger" title="Delete">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="m19 6-2 14H7L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M4 6h16l-1-2H5l-1 2z"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal for creating/editing resources -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ editingResource ? 'Edit Resource' : 'Create New Resource' }}</h2>
          <button @click="showModal = false" class="btn-close">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="saveResource">
            <div class="form-grid">
              <div class="form-group">
                <label for="title">Title *</label>
                <input v-model="resourceForm.title" type="text" id="title" required>
              </div>
              
              <div class="form-group">
                <label for="category">Category</label>
                <select v-model="resourceForm.category" id="category">
                  <option value="">Select Category</option>
                  <option v-for="category in categories" :key="category" :value="category">
                    {{ category }}
                  </option>
                </select>
              </div>
            </div>
            
            <div class="form-group">
              <label for="url">Resource URL *</label>
              <input v-model="resourceForm.url" type="url" id="url" required placeholder="https://example.com/resource">
            </div>
            
            <div class="form-group">
              <label for="description">Description</label>
              <RichTextEditor v-model="resourceForm.description" />
            </div>
            
            <div class="form-group">
              <label>Tags</label>
              <div class="tag-input">
                <div class="tags">
                  <span v-for="(tag, index) in resourceForm.tags" :key="index" class="tag">
                    {{ tag }}
                    <button type="button" @click="removeTag(index)" class="tag-remove">×</button>
                  </span>
                </div>
                <input 
                  type="text" 
                  placeholder="Add tag and press Enter"
                  @keypress.enter.prevent="e => { addTag(e.target.value); e.target.value = ''; }"
                >
              </div>
            </div>
            
            <div class="form-group">
              <label>
                <input v-model="resourceForm.isPublished" type="checkbox">
                Publish immediately
              </label>
            </div>
          </form>
        </div>
        
        <div class="modal-footer">
          <button @click="showModal = false" type="button" class="btn btn-secondary">Cancel</button>
          <button @click="saveResource" type="button" class="btn btn-primary" :disabled="saving">
            <span v-if="saving">Saving...</span>
            <span v-else>{{ editingResource ? 'Update Resource' : 'Create Resource' }}</span>
          </button>
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

.stat-icon.published {
  background-color: rgba(16, 185, 129, 0.1);
  color: var(--success);
}

.stat-icon.draft {
  background-color: rgba(245, 158, 11, 0.1);
  color: var(--warning);
}

.stat-icon.total {
  background-color: rgba(59, 130, 246, 0.1);
  color: var(--primary);
}

.stat-icon.categories {
  background-color: rgba(139, 92, 246, 0.1);
  color: var(--accent);
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

/* Controls Section */
.controls-section {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: var(--spacing-lg);
  gap: var(--spacing-md);
}

.controls-left h2 {
  margin: 0 0 var(--spacing-xs) 0;
  color: var(--gray-900);
}

.controls-left p {
  margin: 0;
  color: var(--gray-600);
}

/* Loading and Error States */
.loading-state,
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

/* Empty State */
.empty-state {
  text-align: center;
  padding: var(--spacing-3xl) 0;
}

.empty-icon {
  color: var(--gray-400);
  margin-bottom: var(--spacing-lg);
}

.empty-state h3 {
  margin-bottom: var(--spacing-sm);
  color: var(--gray-700);
}

.empty-state p {
  margin-bottom: var(--spacing-lg);
  color: var(--gray-600);
}

/* Resources Grid */
.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--spacing-lg);
}

.resource-card {
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-lg);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
  border: 1px solid var(--gray-200);
}

.resource-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.resource-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.resource-icon {
  width: 40px;
  height: 40px;
  background-color: var(--primary);
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-full);
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.published {
  background-color: rgba(16, 185, 129, 0.1);
  color: var(--success);
}

.status-badge.draft {
  background-color: rgba(245, 158, 11, 0.1);
  color: var(--warning);
}

.resource-content {
  margin-bottom: var(--spacing-md);
}

.resource-title {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: 1.125rem;
  color: var(--gray-900);
  line-height: 1.4;
}

.resource-description {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--gray-600);
  line-height: 1.5;
  font-size: 0.875rem;
}

.resource-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.resource-category {
  background-color: var(--gray-100);
  color: var(--gray-700);
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.75rem;
}

.resource-url a {
  color: var(--primary);
  text-decoration: none;
  font-size: 0.875rem;
}

.resource-url a:hover {
  text-decoration: underline;
}

.resource-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.tag {
  background-color: var(--primary);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.75rem;
}

.tag-more {
  background-color: var(--gray-200);
  color: var(--gray-600);
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.75rem;
}

.resource-actions {
  display: flex;
  gap: var(--spacing-xs);
  justify-content: flex-end;
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

.btn-icon.btn-danger:hover {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--danger);
}

.btn {
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color var(--transition-fast);
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.btn-primary {
  background-color: var(--primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary-dark);
}

.btn-secondary {
  background-color: var(--gray-200);
  color: var(--gray-700);
}

.btn-secondary:hover {
  background-color: var(--gray-300);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-md);
}

.modal-content {
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--gray-200);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.btn-close {
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: var(--border-radius-full);
  color: var(--gray-500);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.btn-close:hover {
  background-color: var(--gray-100);
  color: var(--gray-700);
}

.modal-body {
  padding: var(--spacing-lg);
  overflow-y: auto;
  flex: 1;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: 500;
  color: var(--gray-700);
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius-md);
  font-size: 0.875rem;
  transition: border-color var(--transition-fast);
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary);
}

.form-group input[type="checkbox"] {
  width: auto;
  margin-right: var(--spacing-xs);
}

.tag-input {
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-sm);
  background-color: white;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-xs);
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  background-color: var(--primary);
  color: white;
  border-radius: var(--border-radius-sm);
  font-size: 0.75rem;
  gap: var(--spacing-xs);
}

.tag-remove {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 0;
}

.tag-input input {
  border: none;
  outline: none;
  padding: 0.5rem 0;
  font-size: 0.875rem;
  width: 100%;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-top: 1px solid var(--gray-200);
}

/* Responsive */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 992px) {
  .admin-layout {
    grid-template-columns: 1fr;
  }
  
  .controls-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .resources-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-overlay {
    padding: var(--spacing-sm);
  }
  
  .modal-content {
    max-height: 95vh;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
