<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import AdminSidebar from './components/AdminSidebar.vue';
import AdminHeader from './components/AdminHeader.vue';
import RichTextEditor from './components/RichTextEditor.vue';
import { cmsAPI } from '../../../api/client';

const router = useRouter();
const loading = ref(true);
const error = ref(null);
const pages = ref([]);
const filteredPages = ref([]);
const searchQuery = ref('');
const selectedTemplate = ref('all');
const showModal = ref(false);
const editingPage = ref(null);
const saving = ref(false);

// Form data for creating/editing pages
const pageForm = ref({
  title: '',
  slug: '',
  content: '',
  template: 'default',
  isPublished: false,
  sections: [],
  seo: {
    title: '',
    description: '',
    keywords: []
  }
});

// Available templates
const templates = [
  { value: 'default', label: 'Default Page' },
  { value: 'home', label: 'Home Page' },
  { value: 'about', label: 'About Page' },
  { value: 'contact', label: 'Contact Page' },
  { value: 'services', label: 'Services Page' },
  { value: 'blog', label: 'Blog Page' }
];

// Computed properties
const publishedCount = computed(() => pages.value.filter(page => page.isPublished).length);
const draftCount = computed(() => pages.value.filter(page => !page.isPublished).length);

// Filter pages based on search and template
const filterPages = () => {
  let filtered = [...pages.value];
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(page => 
      page.title.toLowerCase().includes(query) ||
      page.slug.toLowerCase().includes(query) ||
      page.content.toLowerCase().includes(query)
    );
  }
  
  if (selectedTemplate.value !== 'all') {
    filtered = filtered.filter(page => page.template === selectedTemplate.value);
  }
  
  filteredPages.value = filtered;
};

// Watch for changes in search/filter
const updateFilters = () => {
  filterPages();
};

// Load pages
const loadPages = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const response = await cmsAPI.getPages();
    if (response.success) {
      pages.value = response.pages || [];
      filterPages();
    } else {
      throw new Error(response.error || 'Failed to load pages');
    }
  } catch (err) {
    console.error('Error loading pages:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

// Create new page
const createPage = () => {
  editingPage.value = null;
  pageForm.value = {
    title: '',
    slug: '',
    content: '',
    template: 'default',
    isPublished: false,
    sections: [],
    seo: {
      title: '',
      description: '',
      keywords: []
    }
  };
  showModal.value = true;
};

// Edit existing page
const editPage = (page) => {
  editingPage.value = page;
  pageForm.value = {
    title: page.title,
    slug: page.slug,
    content: page.content,
    template: page.template,
    isPublished: page.isPublished,
    sections: [...(page.sections || [])],
    seo: {
      title: page.seo?.title || '',
      description: page.seo?.description || '',
      keywords: [...(page.seo?.keywords || [])]
    }
  };
  showModal.value = true;
};

// Save page (create or update)
const savePage = async () => {
  try {
    saving.value = true;
    
    // Generate slug from title if empty
    if (!pageForm.value.slug) {
      pageForm.value.slug = pageForm.value.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }
    
    // Auto-generate SEO title if empty
    if (!pageForm.value.seo.title) {
      pageForm.value.seo.title = pageForm.value.title;
    }
    
    let response;
    if (editingPage.value) {
      response = await cmsAPI.updatePage(editingPage.value.id, pageForm.value);
    } else {
      response = await cmsAPI.createPage(pageForm.value);
    }
    
    if (response.success) {
      showModal.value = false;
      await loadPages();
    } else {
      throw new Error(response.error || 'Failed to save page');
    }
  } catch (err) {
    console.error('Error saving page:', err);
    error.value = err.message;
  } finally {
    saving.value = false;
  }
};

// Delete page
const deletePage = async (page) => {
  if (!confirm(`Are you sure you want to delete "${page.title}"?`)) {
    return;
  }
  
  try {
    const response = await cmsAPI.deletePage(page.id);
    if (response.success) {
      await loadPages();
    } else {
      throw new Error(response.error || 'Failed to delete page');
    }
  } catch (err) {
    console.error('Error deleting page:', err);
    error.value = err.message;
  }
};

// Toggle publish status
const togglePublish = async (page) => {
  try {
    const response = await cmsAPI.updatePage(page.id, {
      isPublished: !page.isPublished,
      publishedAt: !page.isPublished ? new Date().toISOString() : null
    });
    
    if (response.success) {
      await loadPages();
    } else {
      throw new Error(response.error || 'Failed to update page');
    }
  } catch (err) {
    console.error('Error updating page:', err);
    error.value = err.message;
  }
};

// Format date
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Add keyword to SEO
const addKeyword = (keyword) => {
  if (keyword && !pageForm.value.seo.keywords.includes(keyword)) {
    pageForm.value.seo.keywords.push(keyword);
  }
};

const removeKeyword = (index) => {
  pageForm.value.seo.keywords.splice(index, 1);
};

// Check authentication
const checkAuth = () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    router.push('/admin/login');
  }
};

onMounted(() => {
  checkAuth();
  loadPages();
});
</script>

<template>
  <div class="admin-layout">
    <AdminSidebar />
    
    <div class="admin-content">
      <AdminHeader title="Pages Management" />
      
      <!-- Stats Cards -->
      <div class="stats-section">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon published">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="16 12 12 8 8 12"></polyline><line x1="12" y1="16" x2="12" y2="8"></line></svg>
            </div>
            <div class="stat-details">
              <h3>Published</h3>
              <p class="stat-value">{{ publishedCount }}</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon draft">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
            </div>
            <div class="stat-details">
              <h3>Drafts</h3>
              <p class="stat-value">{{ draftCount }}</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon total">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <div class="stat-details">
              <h3>Total Pages</h3>
              <p class="stat-value">{{ pages.length }}</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon templates">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            </div>
            <div class="stat-details">
              <h3>Templates</h3>
              <p class="stat-value">{{ templates.length }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Controls -->
      <div class="controls-section">
        <div class="controls-left">
          <div class="search-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
            <input 
              v-model="searchQuery" 
              @input="updateFilters"
              type="text" 
              placeholder="Search pages..."
            >
          </div>
          
          <div class="filter-select">
            <select v-model="selectedTemplate" @change="updateFilters">
              <option value="all">All Templates</option>
              <option v-for="template in templates" :key="template.value" :value="template.value">
                {{ template.label }}
              </option>
            </select>
          </div>
        </div>
        
        <div class="controls-right">
          <button @click="createPage" class="btn btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            New Page
          </button>
        </div>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading pages...</p>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <p>{{ error }}</p>
        <button @click="loadPages" class="btn btn-primary">Try Again</button>
      </div>
      
      <!-- Pages List -->
      <div v-else class="pages-section">
        <div v-if="filteredPages.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <h3>No pages found</h3>
          <p>{{ searchQuery || selectedTemplate !== 'all' ? 'Try adjusting your filters' : 'Create your first page to get started' }}</p>
          <button v-if="!searchQuery && selectedTemplate === 'all'" @click="createPage" class="btn btn-primary">Create First Page</button>
        </div>
        
        <div v-else class="pages-table">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Slug</th>
                <th>Template</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="page in filteredPages" :key="page.id">
                <td>
                  <div class="page-title">
                    <h4>{{ page.title }}</h4>
                    <p v-if="page.content" class="page-excerpt">
                      {{ page.content.replace(/<[^>]*>/g, '').substring(0, 100) }}{{ page.content.length > 100 ? '...' : '' }}
                    </p>
                  </div>
                </td>
                <td>
                  <code class="slug">{{ page.slug }}</code>
                </td>
                <td>
                  <span class="template-badge">{{ templates.find(t => t.value === page.template)?.label || page.template }}</span>
                </td>
                <td>
                  <span :class="['status-badge', page.isPublished ? 'published' : 'draft']">
                    {{ page.isPublished ? 'Published' : 'Draft' }}
                  </span>
                </td>
                <td>{{ formatDate(page.updatedAt) }}</td>
                <td>
                  <div class="action-buttons">
                    <button @click="editPage(page)" class="btn-icon" title="Edit">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                    </button>
                    <button @click="togglePublish(page)" class="btn-icon" :title="page.isPublished ? 'Unpublish' : 'Publish'">
                      <svg v-if="page.isPublished" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="16 12 12 8 8 12"></polyline><line x1="12" y1="16" x2="12" y2="8"></line></svg>
                    </button>
                    <button @click="deletePage(page)" class="btn-icon btn-danger" title="Delete">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="m19 6-2 14H7L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M4 6h16l-1-2H5l-1 2z"></path></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- Modal for creating/editing pages -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ editingPage ? 'Edit Page' : 'Create New Page' }}</h2>
          <button @click="showModal = false" class="btn-close">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="savePage">
            <div class="form-grid">
              <div class="form-group">
                <label for="title">Title *</label>
                <input v-model="pageForm.title" type="text" id="title" required>
              </div>
              
              <div class="form-group">
                <label for="slug">Slug</label>
                <input v-model="pageForm.slug" type="text" id="slug" placeholder="Auto-generated from title">
              </div>
            </div>
            
            <div class="form-grid">
              <div class="form-group">
                <label for="template">Template</label>
                <select v-model="pageForm.template" id="template">
                  <option v-for="template in templates" :key="template.value" :value="template.value">
                    {{ template.label }}
                  </option>
                </select>
              </div>
              
              <div class="form-group">
                <label>
                  <input v-model="pageForm.isPublished" type="checkbox">
                  Publish immediately
                </label>
              </div>
            </div>
            
            <div class="form-group">
              <label for="content">Content *</label>
              <RichTextEditor v-model="pageForm.content" />
            </div>
            
            <!-- SEO Section -->
            <div class="seo-section">
              <h3>SEO Settings</h3>
              
              <div class="form-group">
                <label for="seo-title">SEO Title</label>
                <input v-model="pageForm.seo.title" type="text" id="seo-title" placeholder="Auto-generated from title">
              </div>
              
              <div class="form-group">
                <label for="seo-description">SEO Description</label>
                <textarea v-model="pageForm.seo.description" id="seo-description" rows="3" placeholder="Describe this page for search engines"></textarea>
              </div>
              
              <div class="form-group">
                <label>SEO Keywords</label>
                <div class="tag-input">
                  <div class="tags">
                    <span v-for="(keyword, index) in pageForm.seo.keywords" :key="index" class="tag">
                      {{ keyword }}
                      <button type="button" @click="removeKeyword(index)" class="tag-remove">×</button>
                    </span>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Add keyword and press Enter"
                    @keypress.enter.prevent="e => { addKeyword(e.target.value); e.target.value = ''; }"
                  >
                </div>
              </div>
            </div>
          </form>
        </div>
        
        <div class="modal-footer">
          <button @click="showModal = false" type="button" class="btn btn-secondary">Cancel</button>
          <button @click="savePage" type="button" class="btn btn-primary" :disabled="saving">
            <span v-if="saving">Saving...</span>
            <span v-else>{{ editingPage ? 'Update Page' : 'Create Page' }}</span>
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

.stat-icon.templates {
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
  align-items: center;
  margin-bottom: var(--spacing-lg);
  gap: var(--spacing-md);
}

.controls-left {
  display: flex;
  gap: var(--spacing-md);
  flex: 1;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-box svg {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-500);
}

.search-box input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius-md);
  background-color: white;
  font-size: 0.875rem;
}

.filter-select select {
  padding: 12px;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius-md);
  background-color: white;
  font-size: 0.875rem;
  min-width: 150px;
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

/* Pages Table */
.pages-table {
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.pages-table table {
  width: 100%;
  border-collapse: collapse;
}

.pages-table th,
.pages-table td {
  padding: var(--spacing-md);
  text-align: left;
  border-bottom: 1px solid var(--gray-200);
}

.pages-table th {
  background-color: var(--gray-50);
  font-weight: 600;
  color: var(--gray-700);
  font-size: 0.875rem;
}

.pages-table tr:last-child td {
  border-bottom: none;
}

.page-title h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  color: var(--gray-900);
}

.page-excerpt {
  margin: 0;
  font-size: 0.75rem;
  color: var(--gray-500);
  line-height: 1.4;
}

.slug {
  background-color: var(--gray-100);
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.75rem;
  color: var(--gray-700);
}

.template-badge {
  background-color: var(--gray-100);
  color: var(--gray-700);
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.75rem;
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

.action-buttons {
  display: flex;
  gap: var(--spacing-xs);
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

/* Modal Styles (same as BlogPage) */
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
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius-md);
  font-size: 0.875rem;
  transition: border-color var(--transition-fast);
}

.form-group input:focus,
.form-group textarea:focus,
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

.seo-section {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--gray-200);
}

.seo-section h3 {
  margin-bottom: var(--spacing-md);
  color: var(--gray-700);
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
  
  .controls-left {
    flex-direction: column;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .pages-table {
    overflow-x: auto;
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