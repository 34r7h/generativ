// API Client for Generativ Consulting Company

// Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
    headers,
    credentials: 'include'
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }

  try {
    console.log(`Making API request to ${endpoint}:`, data);
    const response = await fetch(`${API_URL}${endpoint}`, options);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }

    const responseData = await response.json();
    console.log(`API response from ${endpoint}:`, responseData);
    return responseData;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    return apiRequest<any>('/auth', 'POST', {
      type: 'login',
      email,
      password
    });
  },

  signup: async (email: string, password: string) => {
    return apiRequest<any>('/auth', 'POST', {
      type: 'signup',
      email,
      password
    });
  },

  logout: async () => {
    return apiRequest<any>('/auth', 'POST', {
      type: 'logout'
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

// Export default API client
export default {
  auth: authAPI,
  cms: cmsAPI
};
