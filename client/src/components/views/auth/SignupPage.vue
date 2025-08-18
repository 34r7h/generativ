<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authAPI } from '../../../api/client';

const router = useRouter();
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref('');
const successMessage = ref('');

async function handleSignup() {
  // Reset error
  error.value = '';
  
  // Validate form
  if (!email.value || !password.value) {
    error.value = 'Please enter both email and password';
    return;
  }
  
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match';
    return;
  }
  
  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters long';
    return;
  }
  
  try {
    loading.value = true;
    
    const response = await authAPI.signup(email.value, password.value);
    
    if (response.success) {
      successMessage.value = 'Account created successfully! You can now login.';
      
      // Reset form
      email.value = '';
      password.value = '';
      confirmPassword.value = '';
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } else {
      throw new Error(response.error || 'Failed to create account');
    }
  } catch (err) {
    console.error('Signup error:', err);
    error.value = err.message || 'Failed to create account. Please try again.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="signup-page">
    <div class="auth-container">
      <div class="auth-card">
        <h1>Create Account</h1>
        <p class="auth-description">Sign up for a new account to access admin features</p>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>
        
        <form @submit.prevent="handleSignup" class="auth-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              v-model="email" 
              placeholder="your@email.com" 
              required
              :disabled="loading"
            />
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              v-model="password" 
              placeholder="••••••••" 
              required
              :disabled="loading"
            />
          </div>
          
          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input 
              type="password" 
              id="confirmPassword" 
              v-model="confirmPassword" 
              placeholder="••••••••" 
              required
              :disabled="loading"
            />
          </div>
          
          <button 
            type="submit" 
            class="primary-button"
            :disabled="loading"
          >
            {{ loading ? 'Creating Account...' : 'Sign Up' }}
          </button>
        </form>
        
        <div class="auth-links">
          <p>
            Already have an account? 
            <router-link to="/login">Log in</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.signup-page {
  min-height: calc(100vh - 80px - 300px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  background-color: var(--light-blue);
}

.auth-container {
  width: 100%;
  max-width: 400px;
  padding: 0 20px;
}

.auth-card {
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 40px;
}

h1 {
  font-size: 2rem;
  color: var(--dark-blue);
  margin-bottom: 10px;
  text-align: center;
}

.auth-description {
  text-align: center;
  color: var(--light-text);
  margin-bottom: 30px;
}

.auth-form {
  margin-top: 20px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--dark-blue);
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: var(--border-radius);
  font-size: 16px;
}

.primary-button {
  width: 100%;
  padding: 14px;
  background-color: var(--primary-color);
  color: var(--white);
  border: none;
  border-radius: var(--border-radius);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.primary-button:hover {
  background-color: #3a5ad9;
}

.primary-button:disabled {
  background-color: #a0a0a0;
  cursor: not-allowed;
}

.error-message {
  background-color: rgba(229, 62, 62, 0.1);
  color: var(--error);
  padding: 12px;
  border-radius: var(--border-radius);
  margin-bottom: 20px;
}

.success-message {
  background-color: rgba(56, 161, 105, 0.1);
  color: var(--success);
  padding: 12px;
  border-radius: var(--border-radius);
  margin-bottom: 20px;
}

.auth-links {
  margin-top: 30px;
  text-align: center;
  font-size: 0.9rem;
}

.auth-links a {
  color: var(--primary-color);
  font-weight: 500;
}
</style>
