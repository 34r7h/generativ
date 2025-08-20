// API Configuration for Generativ Consulting Company

export const API_CONFIG = {
  // Development API URL
  DEV_API_URL: 'http://localhost:3003',
  
  // Production API URL
  PROD_API_URL: 'https://generativ.haxters.com',
  
  // Get the appropriate API URL based on environment
  get API_URL(): string {
    // If VITE_API_URL is explicitly set, use it (for Vercel deployment)
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
    
    // Otherwise, use environment-based fallback
    return import.meta.env.DEV ? this.DEV_API_URL : this.PROD_API_URL;
  }
};

// Log configuration in development mode
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', {
    mode: import.meta.env.MODE,
    apiUrl: API_CONFIG.API_URL,
    isDev: import.meta.env.DEV
  });
}
