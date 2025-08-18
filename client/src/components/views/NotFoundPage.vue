<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

function goBack() {
  router.back();
}

function goHome() {
  router.push('/');
}
</script>

<template>
  <div class="not-found-page">
    <div class="container">
      <div class="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <div class="not-found-actions">
          <button @click="goBack" class="secondary-button">Go Back</button>
          <button @click="goHome" class="primary-button">Go Home</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found-page {
  padding: 100px 0;
  text-align: center;
}

.not-found-content {
  max-width: 500px;
  margin: 0 auto;
}

h1 {
  font-size: 8rem;
  color: var(--primary-color);
  margin-bottom: 10px;
  line-height: 1;
}

h2 {
  font-size: 2.5rem;
  color: var(--dark-blue);
  margin-bottom: 20px;
}

p {
  font-size: 1.2rem;
  color: var(--light-text);
  margin-bottom: 40px;
}

.not-found-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.primary-button {
  background-color: var(--primary-color);
  color: var(--white);
  padding: 14px 28px;
  border-radius: var(--border-radius);
  font-weight: 500;
  border: none;
  cursor: pointer;
}

.secondary-button {
  background-color: rgba(76, 111, 255, 0.1);
  color: var(--primary-color);
  padding: 14px 28px;
  border-radius: var(--border-radius);
  font-weight: 500;
  border: none;
  cursor: pointer;
}

@media (max-width: 768px) {
  .not-found-actions {
    flex-direction: column;
    gap: 16px;
    max-width: 200px;
    margin: 0 auto;
  }
  
  h1 {
    font-size: 6rem;
  }
}
</style>
