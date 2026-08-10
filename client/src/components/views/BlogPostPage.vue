<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { cmsAPI } from '../../api/client';

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const error = ref(null);
const blogPost = ref(null);
const relatedPosts = ref([]);

// Get blog post slug from route (/blog/:slug)
const postSlug = computed(() => route.params.slug);



// Get the current post
// Load blog post data
async function loadBlogPost() {
  try {
    loading.value = true;
    error.value = null;
    
    // Try to get blog post by slug first, then fall back to an ID lookup
    let response;
    if (postSlug.value) {
      try {
        response = await cmsAPI.getBlogPostBySlug(postSlug.value);
      } catch (slugErr) {
        response = null;
      }

      if (!response || !response.success || !response.post) {
        const allPosts = await cmsAPI.getBlogPosts();
        if (allPosts.success) {
          const post = allPosts.posts.find(p => p.id === postSlug.value);
          response = post ? { success: true, post } : { success: false, error: 'Post not found' };
        }
      }
    }

    if (response && response.success && response.post) {
      blogPost.value = response.post;
      
      // Load related posts
      const allPostsResponse = await cmsAPI.getBlogPosts();
      if (allPostsResponse.success) {
        relatedPosts.value = allPostsResponse.posts
          .filter(p => p.id !== blogPost.value.id && p.isPublished)
          .slice(0, 3);
      }
    } else {
      error.value = 'Blog post not found';
    }
  } catch (err) {
    console.error('Error loading blog post:', err);
    error.value = 'Failed to load blog post';
  } finally {
    loading.value = false;
  }
}



function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return isNaN(date.getTime()) ? '' : date.toLocaleDateString();
}

function goBack() {
  router.push('/blog');
}

onMounted(() => {
  loadBlogPost();
});

// Navigating between posts reuses this component, so reload on slug change
watch(postSlug, (slug) => {
  if (slug) loadBlogPost();
});
</script>

<template>
  <div class="blog-post-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading blog post...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <h2>Post Not Found</h2>
      <p>{{ error }}</p>
      <button @click="goBack" class="btn btn-primary">Back to Blog</button>
    </div>
    
    <div v-else-if="blogPost">
      <!-- Post Header -->
      <section class="post-header">
        <div class="container">
          <div class="post-meta">
            <span class="post-category">{{ blogPost.categories?.[0] || 'Uncategorized' }}</span>
            <span class="post-date">{{ formatDate(blogPost.publishedAt) }}</span>
          </div>
          <h1>{{ blogPost.title }}</h1>
          <p class="post-author">By {{ blogPost.author }}</p>
        </div>
      </section>
      
      <!-- Post Content -->
      <section class="post-content">
        <div class="container">
          <div class="post-body" v-html="blogPost.content"></div>
          
          <div class="post-tags" v-if="blogPost.tags && blogPost.tags.length">
            <h3>Tags:</h3>
            <div class="tags-list">
              <span 
                v-for="(tag, index) in blogPost.tags" 
                :key="index" 
                class="tag"
              >
                {{ tag }}
              </span>
            </div>
          </div>
          
          <div class="post-navigation">
            <button @click="goBack" class="back-button">
              ← Back to All Posts
            </button>
          </div>
        </div>
      </section>
      
      <!-- Related Posts -->
      <section class="related-posts" v-if="relatedPosts.length">
        <div class="container">
          <h2>Related Articles</h2>
          
          <div class="related-posts-grid">
            <div 
              v-for="post in relatedPosts" 
              :key="post.id" 
              class="related-post-card"
            >
              <div class="post-category">{{ post.categories?.[0] || 'Uncategorized' }}</div>
              <h3>{{ post.title }}</h3>
              <div class="post-meta">
                <span class="post-date">{{ formatDate(post.publishedAt) }}</span>
                <span class="post-author">by {{ post.author }}</span>
              </div>
              <router-link :to="`/blog/${post.slug}`" class="post-link">
                Read Article
              </router-link>
            </div>
          </div>
        </div>
      </section>
    </div>
    
    <!-- Not Found -->
    <div v-else class="not-found">
      <div class="container">
        <h1>Post Not Found</h1>
        <p>The blog post you're looking for doesn't exist or has been removed.</p>
        <button @click="goBack" class="primary-button">
          Back to Blog
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.blog-post-page {
  min-height: calc(100vh - 80px - 300px);
}

/* Post Header */
.post-header {
  padding: 60px 0;
  background-color: var(--light-blue);
}

.post-meta {
  margin-bottom: 20px;
}

.post-category {
  display: inline-block;
  background-color: var(--primary-color);
  color: var(--white);
  font-size: 0.8rem;
  font-weight: 500;
  padding: 5px 10px;
  border-radius: 15px;
  margin-right: 15px;
}

.post-date {
  color: var(--light-text);
  font-size: 0.9rem;
}

.post-header h1 {
  font-size: 2.8rem;
  color: var(--dark-blue);
  margin-bottom: 15px;
  line-height: 1.2;
}

.post-author {
  color: var(--light-text);
  font-size: 1rem;
}

/* Post Content */
.post-content {
  padding: 60px 0;
}

.post-body {
  max-width: 800px;
  margin: 0 auto;
  font-size: 1.1rem;
  line-height: 1.7;
  color: var(--text-color);
}

.post-body :deep(h2) {
  font-size: 1.8rem;
  color: var(--dark-blue);
  margin: 40px 0 20px;
}

.post-body :deep(p) {
  margin-bottom: 20px;
}

.post-body :deep(ul) {
  margin-bottom: 20px;
  padding-left: 20px;
}

.post-body :deep(li) {
  margin-bottom: 10px;
}

.post-tags {
  max-width: 800px;
  margin: 40px auto 0;
  border-top: 1px solid #eee;
  padding-top: 30px;
}

.post-tags h3 {
  font-size: 1.2rem;
  margin-bottom: 15px;
  color: var(--dark-blue);
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag {
  background-color: var(--light-blue);
  color: var(--primary-color);
  font-size: 0.8rem;
  padding: 5px 10px;
  border-radius: 15px;
}

.post-navigation {
  max-width: 800px;
  margin: 40px auto 0;
  text-align: center;
}

.back-button {
  background: none;
  border: none;
  color: var(--primary-color);
  font-weight: 500;
  cursor: pointer;
  padding: 10px 15px;
  font-size: 1rem;
  transition: var(--transition);
}

.back-button:hover {
  color: var(--dark-blue);
  text-decoration: underline;
}

/* Related Posts */
.related-posts {
  padding: 60px 0;
  background-color: var(--light-blue);
}

.related-posts h2 {
  text-align: center;
  font-size: 2rem;
  color: var(--dark-blue);
  margin-bottom: 40px;
}

.related-posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.related-post-card {
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 25px;
  transition: transform 0.3s;
}

.related-post-card:hover {
  transform: translateY(-5px);
}

.related-post-card h3 {
  font-size: 1.3rem;
  color: var(--dark-blue);
  margin: 10px 0;
  line-height: 1.3;
}

.related-post-card .post-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--light-text);
  margin-bottom: 15px;
}

.post-link {
  color: var(--primary-color);
  font-weight: 500;
  font-size: 0.9rem;
}

.post-link:hover {
  text-decoration: underline;
}

/* Not Found */
.not-found {
  text-align: center;
  padding: 100px 0;
}

.not-found h1 {
  font-size: 2.5rem;
  color: var(--dark-blue);
  margin-bottom: 20px;
}

.not-found p {
  color: var(--light-text);
  margin-bottom: 30px;
}

.primary-button {
  background-color: var(--primary-color);
  color: var(--white);
  border: none;
  padding: 12px 24px;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
}

.primary-button:hover {
  background-color: #3a5ad9;
}

/* Responsive */
@media (max-width: 768px) {
  .post-header h1 {
    font-size: 2rem;
  }
  
  .post-body {
    font-size: 1rem;
  }
}
</style>
