// API Client for Generativ Consulting Company

// Import API configuration
import { API_CONFIG } from '../config/api';

// Configuration
const API_URL = API_CONFIG.API_URL;

// Custom error class for API errors
class APIError extends Error {
  public status: number;
  public data: any;
  
  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

// Utility to get auth token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Base headers with content type
const baseHeaders = {
  'Content-Type': 'application/json'
};

// Get authenticated headers
const getAuthHeaders = (): HeadersInit => {
  const token = getToken();
  if (token) {
    return {
      ...baseHeaders,
      'Authorization': `Bearer ${token}`
    };
  }
  return baseHeaders;
};

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  method: string = 'GET',
  data?: any,
  requireAuth: boolean = false
): Promise<T> {
  const headers = requireAuth ? getAuthHeaders() : baseHeaders;
  const options: RequestInit = {
    method,
    headers
  };

  // Only include credentials for authenticated requests
  if (requireAuth) {
    options.credentials = 'include';
  }

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }

  try {
    console.log(`Making API request to ${endpoint}:`, data);
    
    // Add timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
      }
      
      throw new APIError(
        errorData.error || `Request failed with status ${response.status}`,
        response.status,
        errorData
      );
    }

    const responseData = await response.json();
    console.log(`API response from ${endpoint}:`, responseData);
    
    // Validate response structure
    if (typeof responseData !== 'object' || responseData === null) {
      throw new APIError('Invalid response format', 500, responseData);
    }
    
    // Handle standardized API responses
    if (responseData.hasOwnProperty('success')) {
      if (!responseData.success && responseData.error) {
        throw new APIError(responseData.error, response.status, responseData);
      }
      // Return the data field if it exists, otherwise return the full response
      return responseData.data || responseData;
    }
    
    return responseData;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    
    if (error.name === 'AbortError') {
      throw new APIError('Request timeout', 408, null);
    }
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new APIError('Network error - please check your connection', 0, null);
    }
    
    console.error('API request error:', error);
    throw new APIError(error.message || 'Unknown error occurred', 500, null);
  }
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    return apiRequest<any>('/auth', 'POST', {
      operation: 'login',
      email,
      password
    });
  },

  signup: async (email: string, password: string) => {
    return apiRequest<any>('/auth', 'POST', {
      operation: 'signup',
      email,
      password
    });
  },

  logout: async () => {
    return apiRequest<any>('/auth', 'POST', {
      operation: 'logout'
    }, true);
  }
};

// CMS API
export const cmsAPI = {
  // Pages
  getPages: async () => {
    return apiRequest<any>('/cms', 'POST', {
      operation: 'getAllPages'
    });
  },

  getPageBySlug: async (slug: string) => {
    return apiRequest<any>('/cms', 'POST', {
      operation: 'getPageBySlug',
      slug
    });
  },

  createPage: async (page: any) => {
    return apiRequest<any>('/cms', 'POST', {
      operation: 'createPage',
      page
    }, true);
  },

  updatePage: async (pageId: string, updates: any) => {
    return apiRequest<any>('/cms', 'POST', {
      operation: 'updatePage',
      pageId,
      updates
    }, true);
  },

  deletePage: async (pageId: string) => {
    return apiRequest<any>('/cms', 'POST', {
      operation: 'deletePage',
      pageId
    }, true);
  },

  // Team Members
  getTeamMembers: async () => {
    return apiRequest<any>('/cms', 'POST', {
      operation: 'getAllTeamMembers'
    });
  },

  createTeamMember: async (member: any) => {
    return apiRequest<any>('/cms', 'POST', {
      operation: 'createTeamMember',
      member
    }, true);
  },

  updateTeamMember: async (memberId: string, updates: any) => {
    return apiRequest<any>('/cms', 'POST', {
      operation: 'updateTeamMember',
      memberId,
      updates
    }, true);
  },

  deleteTeamMember: async (memberId: string) => {
    return apiRequest<any>('/cms', 'POST', {
      operation: 'deleteTeamMember',
      memberId
    }, true);
  },

  // Services
  getServices: async () => {
    return apiRequest<any>('/cms', 'POST', {
      operation: 'getAllServices'
    });
  },

  getServiceBySlug: async (slug: string) => {
    return apiRequest<any>('/cms', 'POST', {
      operation: 'getServiceBySlug',
      slug
    });
  },

  createService: async (service: any) => {
    return apiRequest<any>('/cms', 'POST', {
      operation: 'createService',
      service
    }, true);
  },

  updateService: async (serviceId: string, updates: any) => {
    return apiRequest<any>('/cms', 'POST', {
      operation: 'updateService',
      serviceId,
      updates
    }, true);
  },

  deleteService: async (serviceId: string) => {
    return apiRequest<any>('/cms', 'POST', {
      operation: 'deleteService',
      serviceId
    }, true);
  },

  // Blog Posts
  getBlogPosts: async () => {
    return apiRequest<any>('/cms', 'POST', {
      operation: 'getAllBlogPosts'
    });
  },

  getBlogPostBySlug: async (slug: string) => {
    return apiRequest<any>('/cms', 'POST', {
      operation: 'getBlogPostBySlug',
      slug
    });
  },

  createBlogPost: async (post: any) => {
    return apiRequest<any>('/cms', 'POST', {
      operation: 'createBlogPost',
      post
    }, true);
  },

  updateBlogPost: async (postId: string, updates: any) => {
    return apiRequest<any>('/cms', 'POST', {
      operation: 'updateBlogPost',
      postId,
      updates
    }, true);
  },

  deleteBlogPost: async (postId: string) => {
    return apiRequest<any>('/cms', 'POST', {
      operation: 'deleteBlogPost',
      postId
    }, true);
  },

  // Media
  getAllMedia: async () => {
    return apiRequest<any>('/cms', 'POST', {
      operation: 'getAllMedia'
    }, true);
  },

  uploadMedia: async (media: any) => {
    return apiRequest<any>('/cms', 'POST', {
      operation: 'uploadMedia',
      media
    }, true);
  },

  deleteMedia: async (mediaId: string) => {
    return apiRequest<any>('/cms', 'POST', {
      operation: 'deleteMedia',
      mediaId
    }, true);
  },

  // Resources
  getAllResources: async () => {
    return apiRequest<any>('/cms', 'POST', {
      operation: 'getAllResources'
    });
  },

  getResourceBySlug: async (slug: string) => {
    return apiRequest<any>('/cms', 'POST', {
      operation: 'getResourceBySlug',
      slug
    });
  },

  createResource: async (resource: any) => {
    return apiRequest<any>('/cms', 'POST', {
      operation: 'createResource',
      resource
    }, true);
  },

  updateResource: async (resourceId: string, updates: any) => {
    return apiRequest<any>('/cms', 'POST', {
      operation: 'updateResource',
      resourceId,
      updates
    }, true);
  },

  deleteResource: async (resourceId: string) => {
    return apiRequest<any>('/cms', 'POST', {
      operation: 'deleteResource',
      resourceId
    }, true);
  },

  // Settings
  getSiteSettings: async () => {
    return apiRequest<any>('/cms', 'POST', {
      operation: 'getSiteSettings'
    });
  },

  updateSiteSettings: async (settings: any) => {
    return apiRequest<any>('/cms', 'POST', {
      operation: 'updateSiteSettings',
      settings
    }, true);
  }
};

// Export API error class and default client
export { APIError };

export default {
  auth: authAPI,
  cms: cmsAPI
};
