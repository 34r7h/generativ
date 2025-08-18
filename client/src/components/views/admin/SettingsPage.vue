<template>
  <div class="admin-page">
    <div class="admin-container">
      <div class="admin-header">
        <h1>Site Settings</h1>
        <p>Configure website settings</p>
      </div>
      
      <div class="placeholder-message">
        <p>Settings management functionality coming soon</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-page {
  padding: 40px 0;
}

.admin-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.admin-header {
  margin-bottom: 30px;
}

.admin-header h1 {
  font-size: 2rem;
  color: var(--dark-blue);
  margin-bottom: 5px;
}

.admin-header p {
  color: var(--light-text);
}

.placeholder-message {
  padding: 80px 0;
  text-align: center;
  color: var(--light-text);
  font-size: 1.2rem;
  background-color: var(--light-blue);
  border-radius: var(--border-radius);
}
</style>
