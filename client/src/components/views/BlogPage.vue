<script setup>
import { ref } from 'vue';

// Placeholder blog posts
const posts = ref([
  {
    id: 1,
    title: 'Understanding AI Safety: A Primer',
    excerpt: 'An introduction to the key concepts in AI safety and why they matter for your organization.',
    date: '2023-09-15',
    author: 'Alex Rodriguez',
    category: 'AI Safety'
  },
  {
    id: 2,
    title: 'Parallelization Techniques for Modern AI Workloads',
    excerpt: 'How to dramatically improve performance through advanced parallelization strategies.',
    date: '2023-08-22',
    author: 'Jamie Lee',
    category: 'Performance'
  },
  {
    id: 3,
    title: 'Critical Thinking: The Human Edge in an AI World',
    excerpt: 'Building critical thinking skills that complement rather than compete with AI systems.',
    date: '2023-07-10',
    author: 'Morgan Chen',
    category: 'Education'
  }
]);
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
        <div class="blog-grid">
          <div v-for="post in posts" :key="post.id" class="blog-card">
            <div class="blog-category">{{ post.category }}</div>
            <h2>{{ post.title }}</h2>
            <p class="blog-excerpt">{{ post.excerpt }}</p>
            <div class="blog-meta">
              <span class="blog-date">{{ post.date }}</span>
              <span class="blog-author">by {{ post.author }}</span>
            </div>
            <router-link :to="`/blog/${post.id}`" class="blog-link">
              Read More
            </router-link>
          </div>
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
