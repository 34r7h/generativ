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
const blogPosts = ref([]);
const filteredPosts = ref([]);
const searchQuery = ref('');
const selectedCategory = ref('all');
const showModal = ref(false);
const editingPost = ref(null);
const saving = ref(false);

// Form data for creating/editing posts
const postForm = ref({
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  author: '',
  categories: [],
  tags: [],
  isPublished: false,
  seo: {
    title: '',
    description: '',
    keywords: []
  }
});

// Computed properties
const categories = computed(() => {
  const cats = new Set();
  blogPosts.value.forEach(post => {
    post.categories?.forEach(cat => cats.add(cat));
  });
  return Array.from(cats);
});

const publishedCount = computed(() => blogPosts.value.filter(post => post.isPublished).length);
const draftCount = computed(() => blogPosts.value.filter(post => !post.isPublished).length);

// Filter posts based on search and category
const filterPosts = () => {
  let filtered = [...blogPosts.value];
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(post => 
      post.title.toLowerCase().includes(query) ||
      post.excerpt.toLowerCase().includes(query) ||
      post.author.toLowerCase().includes(query)
    );
  }
  
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(post => 
      post.categories?.includes(selectedCategory.value)
    );
  }
  
  filteredPosts.value = filtered;
};

// Watch for changes in search/filter
const updateFilters = () => {
  filterPosts();
};

// Load blog posts
const loadBlogPosts = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const response = await cmsAPI.getBlogPosts();
    if (response.success) {
      blogPosts.value = response.posts || [];
      filterPosts();
    } else {
      throw new Error(response.error || 'Failed to load blog posts');
    }
  } catch (err) {
    console.error('Error loading blog posts:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

// Create new post
const createPost = () => {
  editingPost.value = null;
  postForm.value = {
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    author: 'admin',
    categories: [],
    tags: [],
    isPublished: false,
    seo: {
      title: '',
      description: '',
      keywords: []
    }
  };
  showModal.value = true;
};

// Edit existing post
const editPost = (post) => {
  editingPost.value = post;
  postForm.value = {
    title: post.title,
    slug: post.slug,
    content: post.content,
    excerpt: post.excerpt,
    author: post.author,
    categories: [...(post.categories || [])],
    tags: [...(post.tags || [])],
    isPublished: post.isPublished,
    seo: {
      title: post.seo?.title || '',
      description: post.seo?.description || '',
      keywords: [...(post.seo?.keywords || [])]
    }
  };
  showModal.value = true;
};

// Save post (create or update)
const savePost = async () => {
  try {
    saving.value = true;
    
    // Generate slug from title if empty
    if (!postForm.value.slug) {
      postForm.value.slug = postForm.value.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }
    
    // Auto-generate SEO title if empty
    if (!postForm.value.seo.title) {
      postForm.value.seo.title = postForm.value.title;
    }
    
    // Auto-generate SEO description from excerpt if empty
    if (!postForm.value.seo.description) {
      postForm.value.seo.description = postForm.value.excerpt;
    }
    
    let response;
    if (editingPost.value) {
      response = await cmsAPI.updateBlogPost(editingPost.value.id, postForm.value);
    } else {
      response = await cmsAPI.createBlogPost(postForm.value);
    }
    
    if (response.success) {
      showModal.value = false;
      await loadBlogPosts();
    } else {
      throw new Error(response.error || 'Failed to save post');
    }
  } catch (err) {
    console.error('Error saving post:', err);
    error.value = err.message;
  } finally {
    saving.value = false;
  }
};

// Delete post
const deletePost = async (post) => {
  if (!confirm(`Are you sure you want to delete "${post.title}"?`)) {
    return;
  }
  
  try {
    const response = await cmsAPI.deleteBlogPost(post.id);
    if (response.success) {
      await loadBlogPosts();
    } else {
      throw new Error(response.error || 'Failed to delete post');
    }
  } catch (err) {
    console.error('Error deleting post:', err);
    error.value = err.message;
  }
};

// Toggle publish status
const togglePublish = async (post) => {
  try {
    const response = await cmsAPI.updateBlogPost(post.id, {
      isPublished: !post.isPublished,
      publishedAt: !post.isPublished ? new Date().toISOString() : null
    });
    
    if (response.success) {
      await loadBlogPosts();
    } else {
      throw new Error(response.error || 'Failed to update post');
    }
  } catch (err) {
    console.error('Error updating post:', err);
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

// Add/remove categories and tags
const addCategory = (category) => {
  if (category && !postForm.value.categories.includes(category)) {
    postForm.value.categories.push(category);
  }
};

const removeCategory = (index) => {
  postForm.value.categories.splice(index, 1);
};

const addTag = (tag) => {
  if (tag && !postForm.value.tags.includes(tag)) {
    postForm.value.tags.push(tag);
  }
};

const removeTag = (index) => {
  postForm.value.tags.splice(index, 1);
};

const addKeyword = (keyword) => {
  if (keyword && !postForm.value.seo.keywords.includes(keyword)) {
    postForm.value.seo.keywords.push(keyword);
  }
};

const removeKeyword = (index) => {
  postForm.value.seo.keywords.splice(index, 1);
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
  loadBlogPosts();
});
</script>

<template>
  <div class="admin-layout">
    <AdminSidebar />
    
    <div class="admin-content">
      <AdminHeader title="Blog Management" />
      
      <!-- Stats Cards -->
      <div class="stats-section">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon published">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.828 14.828a4 4 0 0 1-5.656 0M9 10h1m4 0h1m-6 4h6m6-10h.01M12 18h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path></svg>
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
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path><path d="M18 14h-8"></path><path d="M15 18h-5"></path><path d="M10 6h8v4h-8V6Z"></path></svg>
            </div>
            <div class="stat-details">
              <h3>Total Posts</h3>
              <p class="stat-value">{{ blogPosts.length }}</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon categories">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path><rect x="7" y="7" width="10" height="10" rx="1"></rect></svg>
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
          <div class="search-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
            <input 
              v-model="searchQuery" 
              @input="updateFilters"
              type="text" 
              placeholder="Search posts..."
            >
          </div>
          
          <div class="filter-select">
            <select v-model="selectedCategory" @change="updateFilters">
              <option value="all">All Categories</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>
        </div>
        
        <div class="controls-right">
          <button @click="createPost" class="btn btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            New Post
          </button>
        </div>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading blog posts...</p>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <p>{{ error }}</p>
        <button @click="loadBlogPosts" class="btn btn-primary">Try Again</button>
      </div>
      
      <!-- Posts List -->
      <div v-else class="posts-section">
        <div v-if="filteredPosts.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <h3>No posts found</h3>
          <p>{{ searchQuery || selectedCategory !== 'all' ? 'Try adjusting your filters' : 'Create your first blog post to get started' }}</p>
          <button v-if="!searchQuery && selectedCategory === 'all'" @click="createPost" class="btn btn-primary">Create First Post</button>
        </div>
        
        <div v-else class="posts-grid">
          <div v-for="post in filteredPosts" :key="post.id" class="post-card">
            <div class="post-header">
              <div class="post-status">
                <span :class="['status-badge', post.isPublished ? 'published' : 'draft']">
                  {{ post.isPublished ? 'Published' : 'Draft' }}
                </span>
              </div>
              <div class="post-actions">
                <button @click="editPost(post)" class="btn-icon" title="Edit">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                </button>
                <button @click="togglePublish(post)" class="btn-icon" :title="post.isPublished ? 'Unpublish' : 'Publish'">
                  <svg v-if="post.isPublished" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.828 14.828a4 4 0 0 1-5.656 0M9 10h1m4 0h1m-6 4h6m6-10h.01M12 18h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path></svg>
                </button>
                <button @click="deletePost(post)" class="btn-icon btn-danger" title="Delete">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="m19 6-2 14H7L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M4 6h16l-1-2H5l-1 2z"></path></svg>
                </button>
              </div>
            </div>
            
            <div class="post-content">
              <h3>{{ post.title }}</h3>
              <p class="post-excerpt">{{ post.excerpt }}</p>
              
              <div class="post-meta">
                <div class="meta-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  <span>{{ post.author }}</span>
                </div>
                
                <div class="meta-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  <span>{{ formatDate(post.createdAt) }}</span>
                </div>
              </div>
              
              <div v-if="post.categories?.length" class="post-categories">
                <span v-for="category in post.categories" :key="category" class="category-tag">
                  {{ category }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal for creating/editing posts -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ editingPost ? 'Edit Post' : 'Create New Post' }}</h2>
          <button @click="showModal = false" class="btn-close">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="savePost">
            <div class="form-grid">
              <div class="form-group">
                <label for="title">Title *</label>
                <input v-model="postForm.title" type="text" id="title" required>
              </div>
              
              <div class="form-group">
                <label for="slug">Slug</label>
                <input v-model="postForm.slug" type="text" id="slug" placeholder="Auto-generated from title">
              </div>
            </div>
            
            <div class="form-group">
              <label for="excerpt">Excerpt *</label>
              <textarea v-model="postForm.excerpt" id="excerpt" rows="3" required placeholder="Brief summary of the post"></textarea>
            </div>
            
            <div class="form-group">
              <label for="content">Content *</label>
              <RichTextEditor v-model="postForm.content" />
            </div>
            
            <div class="form-grid">
              <div class="form-group">
                <label for="author">Author</label>
                <input v-model="postForm.author" type="text" id="author">
              </div>
              
              <div class="form-group">
                <label>
                  <input v-model="postForm.isPublished" type="checkbox">
                  Publish immediately
                </label>
              </div>
            </div>
            
            <div class="form-group">
              <label>Categories</label>
              <div class="tag-input">
                <div class="tags">
                  <span v-for="(category, index) in postForm.categories" :key="index" class="tag">
                    {{ category }}
                    <button type="button" @click="removeCategory(index)" class="tag-remove">×</button>
                  </span>
                </div>
                <input 
                  type="text" 
                  placeholder="Add category and press Enter"
                  @keypress.enter.prevent="e => { addCategory(e.target.value); e.target.value = ''; }"
                >
              </div>
            </div>
            
            <div class="form-group">
              <label>Tags</label>
              <div class="tag-input">
                <div class="tags">
                  <span v-for="(tag, index) in postForm.tags" :key="index" class="tag">
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
            
            <!-- SEO Section -->
            <div class="seo-section">
              <h3>SEO Settings</h3>
              
              <div class="form-group">
                <label for="seo-title">SEO Title</label>
                <input v-model="postForm.seo.title" type="text" id="seo-title" placeholder="Auto-generated from title">
              </div>
              
              <div class="form-group">
                <label for="seo-description">SEO Description</label>
                <textarea v-model="postForm.seo.description" id="seo-description" rows="3" placeholder="Auto-generated from excerpt"></textarea>
              </div>
              
              <div class="form-group">
                <label>SEO Keywords</label>
                <div class="tag-input">
                  <div class="tags">
                    <span v-for="(keyword, index) in postForm.seo.keywords" :key="index" class="tag">
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
          <button @click="savePost" type="button" class="btn btn-primary" :disabled="saving">
            <span v-if="saving">Saving...</span>
            <span v-else>{{ editingPost ? 'Update Post' : 'Create Post' }}</span>
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

/* Posts Grid */
.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: var(--spacing-lg);
}

.post-card {
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
}

.post-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--gray-200);
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

.post-actions {
  display: flex;
  gap: var(--spacing-sm);
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

.post-content {
  padding: var(--spacing-md);
}

.post-content h3 {
  margin-bottom: var(--spacing-sm);
  font-size: 1.125rem;
  color: var(--gray-900);
}

.post-excerpt {
  margin-bottom: var(--spacing-md);
  color: var(--gray-600);
  font-size: 0.875rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-meta {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--gray-500);
  font-size: 0.75rem;
}

.post-categories {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.category-tag {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background-color: var(--gray-100);
  color: var(--gray-700);
  border-radius: var(--border-radius-sm);
  font-size: 0.75rem;
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
  
  .posts-grid {
    grid-template-columns: 1fr;
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