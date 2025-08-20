<script setup>
import { ref, onMounted } from 'vue';
import { cmsAPI } from '../../api/client';

const loading = ref(true);
const error = ref(null);
const posts = ref([]);

// Fetch blog posts from CMS
async function fetchBlogPosts() {
  try {
    loading.value = true;
    error.value = null;
    
    const response = await cmsAPI.getBlogPosts();
    if (response.success) {
      posts.value = response.posts || [];
    } else {
      console.error('Failed to load blog posts:', response.error);
      error.value = 'Failed to load blog posts';
      posts.value = [];
    }
  } catch (err) {
    console.error('Error fetching blog posts:', err);
    error.value = 'Failed to load blog posts';
    posts.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchBlogPosts();
});
</script>

<template>
  <div class="blog-page">
    <!-- Hero Section -->
    <section class="page-hero">
      <div class="container">
        <h1>Our Blog</h1>
        <p class="hero-description">
          Insights, updates, and expertise from our team of AI safety and performance specialists.
        </p>
      </div>
    </section>
    
    <!-- Blog Content -->
    <section class="blog-content">
      <div class="container">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading blog posts...</p>
        </div>
        
        <div v-else-if="error" class="error-message">
          {{ error }}
        </div>
        
        <div v-else-if="posts.length > 0" class="blog-grid">
          <div v-for="post in posts" :key="post.id" class="blog-card">
            <div class="blog-category">{{ post.categories?.[0] || 'Uncategorized' }}</div>
            <h2>{{ post.title }}</h2>
            <p class="blog-excerpt">{{ post.excerpt }}</p>
            <div class="blog-meta">
              <span class="blog-date">{{ new Date(post.publishedAt).toLocaleDateString() }}</span>
              <span class="blog-author">by {{ post.author }}</span>
            </div>
            <router-link :to="`/blog/${post.slug}`" class="blog-link">
              Read More
            </router-link>
          </div>
        </div>
        
        <div v-else class="empty-state">
          <h3>No blog posts yet</h3>
          <p>Check back soon for insights and updates from our team.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.blog-page {
  min-height: calc(100vh - 80px - 300px);
}

/* Hero Section */
.page-hero {
  padding: 80px 0;
  background-color: var(--light-blue);
  text-align: center;
}

.page-hero h1 {
  font-size: 3rem;
  color: var(--dark-blue);
  margin-bottom: 1rem;
}

.hero-description {
  max-width: 700px;
  margin: 0 auto;
  font-size: 1.2rem;
  color: var(--light-text);
}

/* Blog Content */
.blog-content {
  padding: 80px 0;
}

.blog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
}

.blog-card {
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 30px;
  transition: transform 0.3s;
}

.blog-card:hover {
  transform: translateY(-5px);
}

.blog-category {
  display: inline-block;
  background-color: var(--light-blue);
  color: var(--primary-color);
  font-size: 0.8rem;
  font-weight: 500;
  padding: 5px 10px;
  border-radius: 15px;
  margin-bottom: 15px;
}

.blog-card h2 {
  font-size: 1.5rem;
  color: var(--dark-blue);
  margin-bottom: 15px;
}

.blog-excerpt {
  color: var(--light-text);
  margin-bottom: 20px;
  line-height: 1.6;
}

.blog-meta {
  display: flex;
  justify-content: space-between;
  color: var(--light-text);
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.blog-link {
  color: var(--primary-color);
  font-weight: 500;
  display: inline-block;
}

.blog-link:hover {
  text-decoration: underline;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
}

.error-message {
  background: var(--danger-light);
  color: var(--danger-dark);
  padding: 15px;
  border-radius: var(--border-radius-md);
  text-align: center;
  margin-bottom: 20px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-state h3 {
  color: var(--gray-900);
  margin-bottom: 10px;
}

.empty-state p {
  color: var(--gray-600);
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--gray-300);
  border-radius: 50%;
  border-top-color: var(--primary);
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .page-hero h1 {
    font-size: 2.5rem;
  }
  
  .blog-grid {
    grid-template-columns: 1fr;
  }
}
</style>
