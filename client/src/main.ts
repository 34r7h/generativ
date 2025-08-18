import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Create and mount the app
const app = createApp(App)

// Use the router and state management
app.use(createPinia())
app.use(router)

// Mount the app
app.mount('#app')

// Configure document title
router.beforeEach((to, from, next) => {
  // Set default title
  document.title = to.meta.title 
    ? `${to.meta.title} | Generativ Consulting Company` 
    : 'Generativ Consulting Company | AI Safety & Performance';
  next();
});