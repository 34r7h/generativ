<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authAPI } from '../../../api/client';

const router = useRouter();
const email = ref('admin3@generativ.cc');
const password = ref('Admin123!');
const loading = ref(false);
const error = ref('');
const showPassword = ref(false);
const rememberMe = ref(false);

// Default admin credentials for demo purposes
const defaultCredentials = {
  email: 'admin3@generativ.cc',
  password: 'Admin123!'
};

async function handleLogin() {
  if (!email.value || !password.value) {
    error.value = 'Please enter both email and password';
    return;
  }
  
  loading.value = true;
  error.value = '';
  
  try {
    // First try to authenticate with the server
    const response = await authAPI.login(email.value, password.value);
    
    if (response.success) {
      // Store token and user info
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('userId', response.userId);
      localStorage.setItem('isAdmin', 'true');
      
      // Redirect to admin dashboard
      router.push('/admin/dashboard');
    } else {
      // If server auth fails, check if using demo credentials
      if (email.value === defaultCredentials.email && 
          password.value === defaultCredentials.password) {
        
        // For demo purposes, create a fake token
        localStorage.setItem('authToken', 'demo-token-123456');
        localStorage.setItem('userId', 'demo-admin-user');
        localStorage.setItem('isAdmin', 'true');
        
        // Redirect to admin dashboard
        router.push('/admin/dashboard');
      } else {
        error.value = response.error || 'Invalid email or password';
        return;
      }
    }
  } catch (err) {
    console.error('Login error:', err);
    
    // Check if using demo credentials even if API call fails
    if (email.value === defaultCredentials.email && 
        password.value === defaultCredentials.password) {
      
      // For demo purposes, create a fake token
      localStorage.setItem('authToken', 'demo-token-123456');
      localStorage.setItem('userId', 'demo-admin-user');
      localStorage.setItem('isAdmin', 'true');
      
      // Redirect to admin dashboard
      router.push('/admin/dashboard');
    } else {
      error.value = 'Invalid email or password. Try using the demo credentials shown in the form.';
    }
  } finally {
    loading.value = false;
  }
}

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value;
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card glass-card">
        <div class="auth-header">
          <h1 class="gradient-text">Sign In</h1>
          <p>Access the admin dashboard</p>
        </div>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <div class="input-with-icon">
              <input 
                type="email" 
                id="email" 
                v-model="email" 
                class="form-control"
                placeholder="admin@generativ.cc"
                :disabled="loading"
              />
              <span class="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </span>
            </div>
            <small class="form-text">Demo: admin@generativ.cc</small>
          </div>
          
          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <div class="input-with-icon">
              <input 
                :type="showPassword ? 'text' : 'password'" 
                id="password" 
                v-model="password" 
                class="form-control"
                placeholder="••••••••"
                :disabled="loading"
              />
              <button 
                type="button" 
                class="password-toggle" 
                @click="togglePasswordVisibility"
              >
                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              </button>
            </div>
            <small class="form-text">Demo: admin123</small>
          </div>
          
          <div class="form-options">
            <div class="remember-me">
              <input type="checkbox" id="remember-me" v-model="rememberMe" />
              <label for="remember-me">Remember me</label>
            </div>
            <a href="#" class="forgot-password">Forgot password?</a>
          </div>
          
          <button 
            type="submit" 
            class="btn btn-primary login-button"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner"></span>
            <span v-else>Sign In</span>
          </button>
        </form>
        
        <div class="auth-footer">
          <p>Don't have an account? <router-link to="/admin/signup">Sign up</router-link></p>
          <p><router-link to="/">Back to website</router-link></p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: var(--gradient-dark);
  position: relative;
  overflow: hidden;
}

.auth-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.3) 0%, transparent 30%),
    radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.3) 0%, transparent 30%);
  z-index: 0;
}

.auth-page::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  z-index: 0;
}

.auth-container {
  width: 100%;
  max-width: 450px;
  padding: 0 20px;
  position: relative;
  z-index: 1;
}

.auth-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-xl);
  padding: 40px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.auth-header {
  text-align: center;
  margin-bottom: 30px;
}

.auth-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.auth-header p {
  color: var(--gray-600);
}

.auth-form {
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.input-with-icon {
  position: relative;
}

.input-icon {
  position: absolute;
  top: 50%;
  left: 15px;
  transform: translateY(-50%);
  color: var(--gray-500);
}

.form-control {
  width: 100%;
  padding: 12px 15px;
  font-size: 1rem;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius-md);
  transition: all var(--transition-normal);
}

.form-control:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
}

.form-text {
  display: block;
  margin-top: 5px;
  color: var(--gray-500);
  font-size: 0.875rem;
}

.password-toggle {
  position: absolute;
  top: 50%;
  right: 15px;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--gray-500);
  cursor: pointer;
  padding: 0;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.remember-me {
  display: flex;
  align-items: center;
}

.remember-me input {
  margin-right: 8px;
}

.forgot-password {
  color: var(--primary);
  font-size: 0.875rem;
}

.login-button {
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.spinner {
  width: 20px;
  height: 20px;
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

.error-message {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--danger);
  padding: 15px;
  border-radius: var(--border-radius-md);
  margin-bottom: 20px;
  text-align: center;
}

.auth-footer {
  text-align: center;
  margin-top: 20px;
  color: var(--gray-600);
}

.auth-footer a {
  color: var(--primary);
  font-weight: 500;
}

@media (max-width: 480px) {
  .auth-card {
    padding: 30px 20px;
  }
  
  .auth-header h1 {
    font-size: 2rem;
  }
  
  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>