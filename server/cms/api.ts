// Supported CMS operations
export type CMSOperation =
  // Contact form: public submit, authenticated read and triage
  'submitContactForm' | 'getContactSubmissions' | 'updateContactSubmission' |
  // Page operations
  'createPage' | 'getPage' | 'getPageBySlug' | 'getAllPages' | 'updatePage' | 'deletePage' |
  // Team member operations
  'createTeamMember' | 'getTeamMember' | 'getAllTeamMembers' | 'updateTeamMember' | 'deleteTeamMember' |
  // Service operations
  'createService' | 'getService' | 'getServiceBySlug' | 'getAllServices' | 'updateService' | 'deleteService' |
  // Blog post operations
  'createBlogPost' | 'getBlogPost' | 'getBlogPostBySlug' | 'getAllBlogPosts' | 'updateBlogPost' | 'deleteBlogPost' |
  // Media operations
  'uploadMedia' | 'getMedia' | 'getAllMedia' | 'updateMedia' | 'deleteMedia' |
  // Resource operations
  'createResource' | 'getResource' | 'getAllResources' | 'updateResource' | 'deleteResource' |
  // Settings
  'getSiteSettings' | 'updateSiteSettings' |
  // Admin users
  'createAdminUser' | 'getAdminUser' | 'getAllAdminUsers' | 'updateAdminUser' | 'deleteAdminUser' |
  // Payments
  'getPaymentConfig' | 'getPaymentSettings' | 'updatePaymentSettings' |
  'createCheckoutSession' | 'getOrders' | 'getOrder';
import * as cmsDB from './db.js';
import { authenticateUser } from '../actions/db.js';
import * as payments from './payments.js';

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

// Input validation helpers
function validateSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

function sanitizeString(input: string): string {
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').trim();
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
    'getBlogPostBySlug',
    'getAllBlogPosts',
    'getMedia',
    'getAllMedia',
    'getSiteSettings',
    // Publishable key and currency only; see payments.getPublicConfig.
    'getPaymentConfig',
    // Prices come from the stored service record, never from the request.
    'createCheckoutSession',
    // The public contact form. Fields are whitelisted and length-capped below;
    // status and timestamps are set server-side, never taken from the request.
    'submitContactForm'
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
  
  // Authenticate user for protected operations.
  //
  // The absence of a token has to fail here. This condition was previously
  // `requiresAuth && token`, so a request that simply omitted the Authorization
  // header skipped the whole block and fell through to the switch — every
  // protected operation, including updateSiteSettings and the admin-user
  // operations, was answerable by anyone who could reach the endpoint.
  if (requiresAuth) {
    if (!token) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    userId = await authenticateUser(token);

    if (!userId) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    const authorized = requiredPermission
      ? await hasPermission(userId, requiredPermission)
      : await isAdminUser(userId);

    if (!authorized) {
      return {
        success: false,
        error: 'You do not have permission to perform this operation'
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
        // Validate required fields
        const pageData = requestData.page;
        pageData.title = typeof pageData.title === 'string' ? pageData.title.trim() : '';
        if (pageData.title.length === 0) {
          return { success: false, error: 'Valid page title is required' };
        }
        if (!pageData.slug || typeof pageData.slug !== 'string' || !validateSlug(pageData.slug)) {
          return { success: false, error: 'Valid page slug is required (lowercase letters, numbers, and hyphens only)' };
        }
        if (!pageData.content || typeof pageData.content !== 'string') {
          return { success: false, error: 'Page content is required' };
        }
        // Sanitize inputs
        pageData.title = sanitizeString(pageData.title);
        pageData.content = sanitizeString(pageData.content);
        if (pageData.excerpt) pageData.excerpt = sanitizeString(pageData.excerpt);
        const pageId = await cmsDB.createPage(pageData);
        if (userId) {
          await cmsDB.createAuditLogEntry(userId, 'create', 'page', pageId, { title: pageData.title });
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
      
      // Blog post operations
      case 'createBlogPost':
        if (!requestData.post) {
          return { success: false, error: 'Blog post data is required' };
        }
        const postId = await cmsDB.createBlogPost(requestData.post);
        if (userId) {
          await cmsDB.createAuditLogEntry(userId, 'create', 'blog_post', postId, { title: requestData.post.title });
        }
        return { success: true, postId };
        
      case 'getBlogPost':
        if (!requestData.postId) {
          return { success: false, error: 'Blog post ID is required' };
        }
        const post = await cmsDB.getBlogPostById(requestData.postId);
        return { success: !!post, post };
        
      case 'getBlogPostBySlug':
        if (!requestData.slug) {
          return { success: false, error: 'Blog post slug is required' };
        }
        const postBySlug = await cmsDB.getBlogPostBySlug(requestData.slug);
        return { success: !!postBySlug, post: postBySlug };
        
      case 'getAllBlogPosts':
        const posts = await cmsDB.getAllBlogPosts();
        // For public requests, only return published posts
        if (!userId) {
          return { 
            success: true, 
            posts: posts.filter(post => post.isPublished) 
          };
        }
        return { success: true, posts };
        
      case 'updateBlogPost':
        if (!requestData.postId || !requestData.updates) {
          return { success: false, error: 'Blog post ID and updates are required' };
        }
        const postUpdated = await cmsDB.updateBlogPost(requestData.postId, requestData.updates);
        if (postUpdated && userId) {
          await cmsDB.createAuditLogEntry(userId, 'update', 'blog_post', requestData.postId, requestData.updates);
        }
        return { success: postUpdated };
        
      case 'deleteBlogPost':
        if (!requestData.postId) {
          return { success: false, error: 'Blog post ID is required' };
        }
        const postDeleted = await cmsDB.deleteBlogPost(requestData.postId);
        if (postDeleted && userId) {
          await cmsDB.createAuditLogEntry(userId, 'delete', 'blog_post', requestData.postId, {});
        }
        return { success: postDeleted };
      
      // Payment operations
      case 'getPaymentConfig':
        return { success: true, config: await payments.getPublicConfig() };

      case 'getPaymentSettings':
        // Deliberately the masked view: no operation returns the secret key.
        return { success: true, settings: await payments.getAdminView() };

      case 'updatePaymentSettings': {
        const result = await payments.updateSettings(requestData.settings || {});
        if (result.success && userId) {
          await cmsDB.createAuditLogEntry(userId, 'update', 'payment_settings', 'payment_settings', {
            enabled: requestData.settings?.enabled,
            rotatedSecretKey: !!requestData.settings?.secretKey,
            rotatedWebhookSecret: !!requestData.settings?.webhookSecret
          });
        }
        return result.success
          ? { success: true, settings: await payments.getAdminView() }
          : { success: false, error: result.error };
      }

      case 'createCheckoutSession':
        try {
          return await payments.createCheckoutSession({
            serviceSlug: requestData.serviceSlug,
            email: requestData.email
          });
        } catch (checkoutError: any) {
          return { success: false, error: checkoutError?.message || 'Could not start checkout' };
        }

      case 'getOrders':
        return { success: true, orders: await cmsDB.getAllOrders() };

      case 'getOrder':
        if (!requestData.orderId) {
          return { success: false, error: 'Order ID is required' };
        }
        return { success: true, order: await cmsDB.getOrderById(requestData.orderId) };

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
      
      // Contact form
      //
      // The public form used to resolve a timer and throw the message away, so
      // every enquiry made through this site was silently discarded. It is
      // stored now; `createContactSubmission` and the store behind it already
      // existed and had simply never been reachable.
      case 'submitContactForm': {
        const form = requestData.submission || {};
        const clean = (value: unknown, max: number) =>
          typeof value === 'string' ? value.trim().slice(0, max) : '';

        const name = clean(form.name, 120);
        const email = clean(form.email, 200);
        const subject = clean(form.subject, 200);
        const message = clean(form.message, 5000);

        if (!name || !email || !subject || !message) {
          return { success: false, error: 'Name, email, subject and message are required' };
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return { success: false, error: 'A valid email address is required' };
        }

        const allowedTypes = ['contact', 'assessment', 'newsletter'];
        const formType = allowedTypes.includes(form.formType) ? form.formType : 'contact';

        const submissionId = await cmsDB.createContactSubmission({
          name,
          email,
          phone: clean(form.phone, 40) || undefined,
          company: clean(form.company, 160) || undefined,
          subject,
          message,
          formType,
          status: 'new'
        });

        return { success: !!submissionId, id: submissionId };
      }

      case 'getContactSubmissions': {
        const submissions = await cmsDB.getAllContactSubmissions();
        submissions.sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''));
        return { success: true, submissions };
      }

      case 'updateContactSubmission': {
        if (!requestData.id || !requestData.status) {
          return { success: false, error: 'Submission id and status are required' };
        }
        const updated = await cmsDB.updateContactSubmission(requestData.id, {
          status: requestData.status
        });
        return { success: updated };
      }

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
