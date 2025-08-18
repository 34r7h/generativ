import * as cmsDB from './db.js';
import { authenticateUser } from '../actions/db.js';
import type { 
  Page, 
  TeamMember, 
  Service, 
  CaseStudy, 
  BlogPost, 
  MediaAsset, 
  Event, 
  ContactSubmission, 
  SiteSettings,
  AdminUser
} from './schema';

// CMS operation types
export type CMSOperation = 
  // Pages
  'createPage' | 'getPage' | 'getPageBySlug' | 'getAllPages' | 'updatePage' | 'deletePage' |
  // Team members
  'createTeamMember' | 'getTeamMember' | 'getAllTeamMembers' | 'updateTeamMember' | 'deleteTeamMember' |
  // Services
  'createService' | 'getService' | 'getServiceBySlug' | 'getAllServices' | 'updateService' | 'deleteService' |
  // Media
  'uploadMedia' | 'getMedia' | 'getAllMedia' | 'updateMedia' | 'deleteMedia' |
  // Settings
  'getSiteSettings' | 'updateSiteSettings' |
  // Admin users
  'createAdminUser' | 'getAdminUser' | 'getAllAdminUsers' | 'updateAdminUser' | 'deleteAdminUser';

// Check if a user has admin permissions
export async function isAdminUser(userId: string): Promise<boolean> {
  const adminUser = await cmsDB.getAdminUser(userId);
  return !!adminUser;
}

// Check if a user has specific permissions
export async function hasPermission(userId: string, requiredPermission: string): Promise<boolean> {
  const adminUser = await cmsDB.getAdminUser(userId);
  if (!adminUser) return false;
  
  // Admin role has all permissions
  if (adminUser.role === 'admin') return true;
  
  // Check specific permission
  return adminUser.permissions.includes(requiredPermission);
}

// Main handler for CMS API operations
export async function handleCMSOperation(operation: CMSOperation, requestData: any, token?: string): Promise<any> {
  // For operations that require authentication
  let userId: string | null = null;
  let requiresAuth = true;
  let requiredPermission = '';
  
  // Define which operations are public (don't require authentication)
  const publicOperations = [
    'getPageBySlug', 
    'getAllPages', 
    'getAllTeamMembers', 
    'getServiceBySlug', 
    'getAllServices',
    'getMedia',
    'getSiteSettings'
  ];
  
  // Check if operation is public
  if (publicOperations.includes(operation)) {
    requiresAuth = false;
  } else {
    // Set required permissions based on operation
    if (operation.startsWith('create')) {
      requiredPermission = 'create';
    } else if (operation.startsWith('update')) {
      requiredPermission = 'update';
    } else if (operation.startsWith('delete')) {
      requiredPermission = 'delete';
    }
  }
  
  // Authenticate user for protected operations
  if (requiresAuth && token) {
    userId = await authenticateUser(token);
    
    // Check if user is authorized for this operation
    if (userId) {
      const authorized = requiredPermission ? 
        await hasPermission(userId, requiredPermission) : 
        await isAdminUser(userId);
      
      if (!authorized) {
        return { 
          success: false, 
          error: 'You do not have permission to perform this operation' 
        };
      }
    } else {
      return { 
        success: false, 
        error: 'Authentication required' 
      };
    }
  }
  
  // Handle different CMS operations
  try {
    switch (operation) {
      // Page operations
      case 'createPage':
        if (!requestData.page) {
          return { success: false, error: 'Page data is required' };
        }
        const pageId = await cmsDB.createPage(requestData.page);
        if (userId) {
          await cmsDB.createAuditLogEntry(userId, 'create', 'page', pageId, { title: requestData.page.title });
        }
        return { success: true, pageId };
        
      case 'getPage':
        if (!requestData.pageId) {
          return { success: false, error: 'Page ID is required' };
        }
        const page = await cmsDB.getPageById(requestData.pageId);
        return { success: !!page, page };
        
      case 'getPageBySlug':
        if (!requestData.slug) {
          return { success: false, error: 'Page slug is required' };
        }
        const pageBySlug = await cmsDB.getPageBySlug(requestData.slug);
        return { success: !!pageBySlug, page: pageBySlug };
        
      case 'getAllPages':
        const pages = await cmsDB.getAllPages();
        // For public requests, only return published pages
        if (!userId) {
          return { 
            success: true, 
            pages: pages.filter(page => page.isPublished) 
          };
        }
        return { success: true, pages };
        
      case 'updatePage':
        if (!requestData.pageId || !requestData.updates) {
          return { success: false, error: 'Page ID and updates are required' };
        }
        const pageUpdated = await cmsDB.updatePage(requestData.pageId, requestData.updates);
        if (pageUpdated && userId) {
          await cmsDB.createAuditLogEntry(userId, 'update', 'page', requestData.pageId, requestData.updates);
        }
        return { success: pageUpdated };
        
      case 'deletePage':
        if (!requestData.pageId) {
          return { success: false, error: 'Page ID is required' };
        }
        const pageDeleted = await cmsDB.deletePage(requestData.pageId);
        if (pageDeleted && userId) {
          await cmsDB.createAuditLogEntry(userId, 'delete', 'page', requestData.pageId, {});
        }
        return { success: pageDeleted };
      
      // Team member operations
      case 'createTeamMember':
        if (!requestData.member) {
          return { success: false, error: 'Team member data is required' };
        }
        const memberId = await cmsDB.createTeamMember(requestData.member);
        if (userId) {
          await cmsDB.createAuditLogEntry(userId, 'create', 'team_member', memberId, { name: requestData.member.name });
        }
        return { success: true, memberId };
        
      case 'getTeamMember':
        if (!requestData.memberId) {
          return { success: false, error: 'Team member ID is required' };
        }
        const member = await cmsDB.getTeamMemberById(requestData.memberId);
        return { success: !!member, member };
        
      case 'getAllTeamMembers':
        const members = await cmsDB.getAllTeamMembers();
        // For public requests, only return active members
        if (!userId) {
          return { 
            success: true, 
            members: members.filter(member => member.isActive) 
          };
        }
        return { success: true, members };
        
      case 'updateTeamMember':
        if (!requestData.memberId || !requestData.updates) {
          return { success: false, error: 'Team member ID and updates are required' };
        }
        const memberUpdated = await cmsDB.updateTeamMember(requestData.memberId, requestData.updates);
        if (memberUpdated && userId) {
          await cmsDB.createAuditLogEntry(userId, 'update', 'team_member', requestData.memberId, requestData.updates);
        }
        return { success: memberUpdated };
        
      case 'deleteTeamMember':
        if (!requestData.memberId) {
          return { success: false, error: 'Team member ID is required' };
        }
        const memberDeleted = await cmsDB.deleteTeamMember(requestData.memberId);
        if (memberDeleted && userId) {
          await cmsDB.createAuditLogEntry(userId, 'delete', 'team_member', requestData.memberId, {});
        }
        return { success: memberDeleted };
      
      // Service operations
      case 'createService':
        if (!requestData.service) {
          return { success: false, error: 'Service data is required' };
        }
        const serviceId = await cmsDB.createService(requestData.service);
        if (userId) {
          await cmsDB.createAuditLogEntry(userId, 'create', 'service', serviceId, { title: requestData.service.title });
        }
        return { success: true, serviceId };
        
      case 'getService':
        if (!requestData.serviceId) {
          return { success: false, error: 'Service ID is required' };
        }
        const service = await cmsDB.getServiceById(requestData.serviceId);
        return { success: !!service, service };
        
      case 'getServiceBySlug':
        if (!requestData.slug) {
          return { success: false, error: 'Service slug is required' };
        }
        const serviceBySlug = await cmsDB.getServiceBySlug(requestData.slug);
        return { success: !!serviceBySlug, service: serviceBySlug };
        
      case 'getAllServices':
        const services = await cmsDB.getAllServices();
        // For public requests, only return published services
        if (!userId) {
          return { 
            success: true, 
            services: services.filter(service => service.isPublished) 
          };
        }
        return { success: true, services };
        
      case 'updateService':
        if (!requestData.serviceId || !requestData.updates) {
          return { success: false, error: 'Service ID and updates are required' };
        }
        const serviceUpdated = await cmsDB.updateService(requestData.serviceId, requestData.updates);
        if (serviceUpdated && userId) {
          await cmsDB.createAuditLogEntry(userId, 'update', 'service', requestData.serviceId, requestData.updates);
        }
        return { success: serviceUpdated };
        
      case 'deleteService':
        if (!requestData.serviceId) {
          return { success: false, error: 'Service ID is required' };
        }
        const serviceDeleted = await cmsDB.deleteService(requestData.serviceId);
        if (serviceDeleted && userId) {
          await cmsDB.createAuditLogEntry(userId, 'delete', 'service', requestData.serviceId, {});
        }
        return { success: serviceDeleted };
      
      // Media operations
      case 'uploadMedia':
        if (!requestData.media) {
          return { success: false, error: 'Media data is required' };
        }
        const mediaId = await cmsDB.createMedia(requestData.media);
        if (userId) {
          await cmsDB.createAuditLogEntry(userId, 'create', 'media', mediaId, { title: requestData.media.title });
        }
        return { success: true, mediaId };
        
      case 'getMedia':
        if (!requestData.mediaId) {
          return { success: false, error: 'Media ID is required' };
        }
        const media = await cmsDB.getMediaById(requestData.mediaId);
        return { success: !!media, media };
        
      case 'getAllMedia':
        const mediaList = await cmsDB.getAllMedia();
        return { success: true, media: mediaList };
        
      case 'updateMedia':
        if (!requestData.mediaId || !requestData.updates) {
          return { success: false, error: 'Media ID and updates are required' };
        }
        const mediaUpdated = await cmsDB.updateMedia(requestData.mediaId, requestData.updates);
        if (mediaUpdated && userId) {
          await cmsDB.createAuditLogEntry(userId, 'update', 'media', requestData.mediaId, requestData.updates);
        }
        return { success: mediaUpdated };
        
      case 'deleteMedia':
        if (!requestData.mediaId) {
          return { success: false, error: 'Media ID is required' };
        }
        const mediaDeleted = await cmsDB.deleteMedia(requestData.mediaId);
        if (mediaDeleted && userId) {
          await cmsDB.createAuditLogEntry(userId, 'delete', 'media', requestData.mediaId, {});
        }
        return { success: mediaDeleted };
      
      // Settings operations
      case 'getSiteSettings':
        const settings = await cmsDB.getSiteSettings();
        return { success: !!settings, settings };
        
      case 'updateSiteSettings':
        if (!requestData.settings) {
          return { success: false, error: 'Settings data is required' };
        }
        const settingsUpdated = await cmsDB.saveSiteSettings(requestData.settings);
        if (settingsUpdated && userId) {
          await cmsDB.createAuditLogEntry(userId, 'update', 'site_settings', 'site_settings', {});
        }
        return { success: settingsUpdated };
      
      // Admin user operations
      case 'createAdminUser':
        if (!requestData.userId || !requestData.role) {
          return { success: false, error: 'User ID and role are required' };
        }
        const adminUserCreated = await cmsDB.createAdminUser(
          requestData.userId,
          requestData.role,
          requestData.permissions || []
        );
        if (adminUserCreated && userId) {
          await cmsDB.createAuditLogEntry(userId, 'create', 'admin_user', requestData.userId, { role: requestData.role });
        }
        return { success: adminUserCreated };
        
      case 'getAdminUser':
        if (!requestData.userId) {
          return { success: false, error: 'User ID is required' };
        }
        const adminUser = await cmsDB.getAdminUser(requestData.userId);
        return { success: !!adminUser, adminUser };
        
      case 'getAllAdminUsers':
        const adminUsers = await cmsDB.getAllAdminUsers();
        return { success: true, adminUsers };
        
      case 'updateAdminUser':
        if (!requestData.userId || !requestData.updates) {
          return { success: false, error: 'User ID and updates are required' };
        }
        const adminUserUpdated = await cmsDB.updateAdminUser(requestData.userId, requestData.updates);
        if (adminUserUpdated && userId) {
          await cmsDB.createAuditLogEntry(userId, 'update', 'admin_user', requestData.userId, requestData.updates);
        }
        return { success: adminUserUpdated };
        
      case 'deleteAdminUser':
        if (!requestData.userId) {
          return { success: false, error: 'User ID is required' };
        }
        const adminUserDeleted = await cmsDB.deleteAdminUser(requestData.userId);
        if (adminUserDeleted && userId) {
          await cmsDB.createAuditLogEntry(userId, 'delete', 'admin_user', requestData.userId, {});
        }
        return { success: adminUserDeleted };
      
      default:
        return { success: false, error: 'Invalid CMS operation' };
    }
  } catch (error) {
    console.error('CMS operation error:', error);
    return { success: false, error: 'Internal server error' };
  }
}
