import { Resource } from './schema';

// CMS database instances
let resourcesDB: any = null;

export async function initResourcesDB(db: any) {
  resourcesDB = db.openDB('cms_resources', {
    keyPath: 'id',
    autoIncrement: false,
  });
}

export async function getAllResources(): Promise<Resource[]> {
  return resourcesDB.getAll();
}

export async function getResource(id: string): Promise<Resource | null> {
  return resourcesDB.get(id);
}

export async function createResource(resource: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const id = `resource_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const newResource: Resource = {
    ...resource,
    id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await resourcesDB.put(newResource);
  return id;
}

export async function updateResource(id: string, updates: Partial<Resource>): Promise<boolean> {
  const resource = await resourcesDB.get(id);
  if (!resource) return false;
  const updatedResource = {
    ...resource,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await resourcesDB.put(updatedResource);
  return true;
}

export async function deleteResource(id: string): Promise<boolean> {
  await resourcesDB.delete(id);
  return true;
}
import { getDB } from '../actions/db.js';
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
  AdminUser,
  AuditLogEntry
} from './schema';

// CMS database instances
let pagesDB: any = null;
let teamDB: any = null;
let servicesDB: any = null;
let caseStudiesDB: any = null;
let blogPostsDB: any = null;
let mediaDB: any = null;
let eventsDB: any = null;
let contactSubmissionsDB: any = null;
let settingsDB: any = null;
let adminUsersDB: any = null;
let auditLogDB: any = null;

// Indexes for efficient lookups
let pageSlugIndexDB: any = null;
let serviceSlugIndexDB: any = null;
let caseStudySlugIndexDB: any = null;
let blogPostSlugIndexDB: any = null;

// Initialize CMS databases
export async function initCMSDB() {
  try {
    const db = getDB();
    if (!db) {
      throw new Error('Main database not initialized');
    }
    
    console.log('Initializing CMS databases...');
    
    // Create separate databases for different content types
    pagesDB = db.openDB('cms_pages', { 
      encoding: 'msgpack',
      cache: true 
    });
    
    teamDB = db.openDB('cms_team', { 
      encoding: 'msgpack',
      cache: true 
    });
    
    servicesDB = db.openDB('cms_services', { 
      encoding: 'msgpack',
      cache: true 
    });
    
    caseStudiesDB = db.openDB('cms_case_studies', { 
      encoding: 'msgpack',
      cache: true 
    });
    
    blogPostsDB = db.openDB('cms_blog_posts', { 
      encoding: 'msgpack',
      cache: true 
    });
    
    mediaDB = db.openDB('cms_media', { 
      encoding: 'msgpack',
      cache: true 
    });
    
    eventsDB = db.openDB('cms_events', { 
      encoding: 'msgpack',
      cache: true 
    });
    
    contactSubmissionsDB = db.openDB('cms_contact_submissions', { 
      encoding: 'msgpack',
      cache: true 
    });
    
    settingsDB = db.openDB('cms_settings', { 
      encoding: 'msgpack',
      cache: true 
    });
    
    adminUsersDB = db.openDB('cms_admin_users', { 
      encoding: 'msgpack',
      cache: true 
    });
    
    auditLogDB = db.openDB('cms_audit_log', { 
      encoding: 'msgpack',
      cache: true 
    });
    
    // Indexes for efficient lookups
    pageSlugIndexDB = db.openDB('cms_page_slug_index', {
      encoding: 'ordered-binary',
      dupSort: true
    });
    
    serviceSlugIndexDB = db.openDB('cms_service_slug_index', {
      encoding: 'ordered-binary',
      dupSort: true
    });
    
    caseStudySlugIndexDB = db.openDB('cms_case_study_slug_index', {
      encoding: 'ordered-binary',
      dupSort: true
    });
    
    blogPostSlugIndexDB = db.openDB('cms_blog_post_slug_index', {
      encoding: 'ordered-binary',
      dupSort: true
    });
    
    console.log('CMS databases initialized successfully');
    
    // Create default site settings if they don't exist
    await ensureDefaultSettings();
    
    return true;
  } catch (error) {
    console.error('CMS database initialization error:', error);
    throw error;
  }
}

// Helper to create default site settings
async function ensureDefaultSettings() {
  const settings = await getSiteSettings();
  if (!settings) {
    const defaultSettings: SiteSettings = {
      siteName: 'Generativ Consulting Company',
      tagline: 'Where AI speed meets human trust',
      contactEmail: 'info@generativ.cc',
      socialLinks: {},
      footer: {
        copyrightText: `© ${new Date().getFullYear()} Generativ Consulting Company. All rights reserved.`,
        showLogo: true,
        columns: []
      },
      analytics: {
        enableCookieBanner: true
      },
      globalSEO: {
        title: 'Generativ Consulting Company | AI Safety & Performance',
        description: 'The foremost experts in AI safety and performance, accelerating industry progress through rigorous testing, parallelization, and critical-thinking education.',
        keywords: ['AI consulting', 'AI safety', 'AI performance', 'AI testing']
      },
      updatedAt: new Date().toISOString()
    };
    
    await saveSiteSettings(defaultSettings);
  }
}

// Create an audit log entry
export async function createAuditLogEntry(userId: string, action: 'create' | 'update' | 'delete' | 'publish' | 'unpublish', resourceType: string, resourceId: string, details: Record<string, any> = {}): Promise<void> {
  const entry: AuditLogEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    action,
    resourceType,
    resourceId,
    details,
    timestamp: new Date().toISOString()
  };
  
  await auditLogDB.put(entry.id, entry);
}

// BlogPost operations
export async function createBlogPost(post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const id = `blog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  
  const newPost: BlogPost = {
    ...post,
    id,
    createdAt: now,
    updatedAt: now
  };
  
  await getDB().transaction(() => {
    blogPostsDB.put(id, newPost);
    blogPostSlugIndexDB.put(post.slug, id);
  });
  
  return id;
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  return blogPostsDB.get(id);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const ids = blogPostSlugIndexDB.getValues(slug);
  
  for (const id of ids) {
    const post = await getBlogPostById(id);
    if (post) return post;
  }
  
  return null;
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const posts: BlogPost[] = [];
  const entries = blogPostsDB.getRange();
  
  for (const { value } of entries) {
    posts.push(value);
  }
  
  return posts;
}

export async function updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<boolean> {
  const post = await getBlogPostById(id);
  if (!post) return false;
  
  const updatedPost: BlogPost = {
    ...post,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  await getDB().transaction(() => {
    blogPostsDB.put(id, updatedPost);
    
    // If slug changed, update the index
    if (updates.slug && updates.slug !== post.slug) {
      blogPostSlugIndexDB.remove(post.slug, id);
      blogPostSlugIndexDB.put(updates.slug, id);
    }
  });
  
  return true;
}

export async function deleteBlogPost(id: string): Promise<boolean> {
  const post = await getBlogPostById(id);
  if (!post) return false;
  
  await getDB().transaction(() => {
    blogPostsDB.remove(id);
    blogPostSlugIndexDB.remove(post.slug, id);
  });
  
  return true;
}

// Page operations
export async function createPage(page: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const id = `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  
  const newPage: Page = {
    ...page,
    id,
    createdAt: now,
    updatedAt: now
  };
  
  await getDB().transaction(() => {
    pagesDB.put(id, newPage);
    pageSlugIndexDB.put(page.slug, id);
  });
  
  return id;
}

export async function getPageById(id: string): Promise<Page | null> {
  return pagesDB.get(id);
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  // Bypass the corrupted index and always use full scan
  // This ensures we get consistent results
  const pages = await getAllPages();
  const matchingPages = pages.filter(p => p.slug === slug);
  
  if (matchingPages.length === 0) {
    return null;
  }
  
  if (matchingPages.length === 1) {
    return matchingPages[0];
  }
  
  // If multiple pages with same slug, prioritize published ones
  const publishedPages = matchingPages.filter(p => p.isPublished);
  if (publishedPages.length > 0) {
    // Return the most recently updated published page
    return publishedPages.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )[0];
  }
  
  // If no published pages, return the most recently updated one
  return matchingPages.sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )[0];
}

export async function getAllPages(): Promise<Page[]> {
  const pages: Page[] = [];
  const entries = pagesDB.getRange();
  
  for (const { value } of entries) {
    pages.push(value);
  }
  
  return pages;
}

export async function updatePage(id: string, updates: Partial<Page>): Promise<boolean> {
  const page = await getPageById(id);
  if (!page) return false;
  
  const updatedPage: Page = {
    ...page,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  await getDB().transaction(() => {
    pagesDB.put(id, updatedPage);
    
    // If slug changed, update the index
    if (updates.slug && updates.slug !== page.slug) {
      pageSlugIndexDB.remove(page.slug, id);
      pageSlugIndexDB.put(updates.slug, id);
    }
  });
  
  return true;
}

export async function deletePage(id: string): Promise<boolean> {
  const page = await getPageById(id);
  if (!page) return false;
  
  await getDB().transaction(() => {
    pagesDB.remove(id);
    pageSlugIndexDB.remove(page.slug, id);
  });
  
  return true;
}

// TeamMember operations
export async function createTeamMember(member: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const id = `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  
  const newMember: TeamMember = {
    ...member,
    id,
    createdAt: now,
    updatedAt: now
  };
  
  await teamDB.put(id, newMember);
  return id;
}

export async function getTeamMemberById(id: string): Promise<TeamMember | null> {
  return teamDB.get(id);
}

export async function getAllTeamMembers(): Promise<TeamMember[]> {
  const members: TeamMember[] = [];
  const entries = teamDB.getRange();
  
  for (const { value } of entries) {
    members.push(value);
  }
  
  return members;
}

export async function updateTeamMember(id: string, updates: Partial<TeamMember>): Promise<boolean> {
  const member = await getTeamMemberById(id);
  if (!member) return false;
  
  const updatedMember: TeamMember = {
    ...member,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  await teamDB.put(id, updatedMember);
  return true;
}

export async function deleteTeamMember(id: string): Promise<boolean> {
  const member = await getTeamMemberById(id);
  if (!member) return false;
  
  await teamDB.remove(id);
  return true;
}

// Service operations
export async function createService(service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const id = `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  
  const newService: Service = {
    ...service,
    id,
    createdAt: now,
    updatedAt: now
  };
  
  await getDB().transaction(() => {
    servicesDB.put(id, newService);
    serviceSlugIndexDB.put(service.slug, id);
  });
  
  return id;
}

export async function getServiceById(id: string): Promise<Service | null> {
  return servicesDB.get(id);
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const ids = serviceSlugIndexDB.getValues(slug);
  
  for (const id of ids) {
    const service = await getServiceById(id);
    if (service) return service;
  }
  
  return null;
}

export async function getAllServices(): Promise<Service[]> {
  const services: Service[] = [];
  const entries = servicesDB.getRange();
  
  for (const { value } of entries) {
    services.push(value);
  }
  
  return services;
}

export async function updateService(id: string, updates: Partial<Service>): Promise<boolean> {
  const service = await getServiceById(id);
  if (!service) return false;
  
  const updatedService: Service = {
    ...service,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  await getDB().transaction(() => {
    servicesDB.put(id, updatedService);
    
    // If slug changed, update the index
    if (updates.slug && updates.slug !== service.slug) {
      serviceSlugIndexDB.remove(service.slug, id);
      serviceSlugIndexDB.put(updates.slug, id);
    }
  });
  
  return true;
}

export async function deleteService(id: string): Promise<boolean> {
  const service = await getServiceById(id);
  if (!service) return false;
  
  await getDB().transaction(() => {
    servicesDB.remove(id);
    serviceSlugIndexDB.remove(service.slug, id);
  });
  
  return true;
}

// Media operations
export async function createMedia(media: Omit<MediaAsset, 'id' | 'uploadedAt' | 'updatedAt'>): Promise<string> {
  const id = `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  
  const newMedia: MediaAsset = {
    ...media,
    id,
    uploadedAt: now,
    updatedAt: now
  };
  
  await mediaDB.put(id, newMedia);
  return id;
}

export async function getMediaById(id: string): Promise<MediaAsset | null> {
  return mediaDB.get(id);
}

export async function getAllMedia(): Promise<MediaAsset[]> {
  const media: MediaAsset[] = [];
  const entries = mediaDB.getRange();
  
  for (const { value } of entries) {
    media.push(value);
  }
  
  return media;
}

export async function updateMedia(id: string, updates: Partial<MediaAsset>): Promise<boolean> {
  const media = await getMediaById(id);
  if (!media) return false;
  
  const updatedMedia: MediaAsset = {
    ...media,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  await mediaDB.put(id, updatedMedia);
  return true;
}

export async function deleteMedia(id: string): Promise<boolean> {
  const media = await getMediaById(id);
  if (!media) return false;
  
  await mediaDB.remove(id);
  return true;
}

// Site settings operations
export async function getSiteSettings(): Promise<SiteSettings | null> {
  return settingsDB.get('site_settings');
}

export async function saveSiteSettings(settings: Omit<SiteSettings, 'updatedAt'>): Promise<boolean> {
  const updatedSettings: SiteSettings = {
    ...settings,
    updatedAt: new Date().toISOString()
  };
  
  await settingsDB.put('site_settings', updatedSettings);
  return true;
}

// Admin user operations
export async function createAdminUser(userId: string, role: 'admin' | 'editor' | 'viewer', permissions: string[] = []): Promise<boolean> {
  const now = new Date().toISOString();
  
  const adminUser: AdminUser = {
    userId,
    role,
    permissions,
    createdAt: now,
    updatedAt: now
  };
  
  await adminUsersDB.put(userId, adminUser);
  return true;
}

export async function getAdminUser(userId: string): Promise<AdminUser | null> {
  return adminUsersDB.get(userId);
}

export async function updateAdminUser(userId: string, updates: Partial<AdminUser>): Promise<boolean> {
  const adminUser = await getAdminUser(userId);
  if (!adminUser) return false;
  
  const updatedUser: AdminUser = {
    ...adminUser,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  await adminUsersDB.put(userId, updatedUser);
  return true;
}

export async function deleteAdminUser(userId: string): Promise<boolean> {
  const adminUser = await getAdminUser(userId);
  if (!adminUser) return false;
  
  await adminUsersDB.remove(userId);
  return true;
}

export async function getAllAdminUsers(): Promise<AdminUser[]> {
  const users: AdminUser[] = [];
  const entries = adminUsersDB.getRange();
  
  for (const { value } of entries) {
    users.push(value);
  }
  
  return users;
}

// Contact submission operations
export async function createContactSubmission(submission: Omit<ContactSubmission, 'id' | 'submittedAt' | 'updatedAt'>): Promise<string> {
  const id = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  
  const newSubmission: ContactSubmission = {
    ...submission,
    id,
    submittedAt: now,
    updatedAt: now
  };
  
  await contactSubmissionsDB.put(id, newSubmission);
  return id;
}

export async function getContactSubmissionById(id: string): Promise<ContactSubmission | null> {
  return contactSubmissionsDB.get(id);
}

export async function getAllContactSubmissions(): Promise<ContactSubmission[]> {
  const submissions: ContactSubmission[] = [];
  const entries = contactSubmissionsDB.getRange();
  
  for (const { value } of entries) {
    submissions.push(value);
  }
  
  return submissions;
}

export async function updateContactSubmission(id: string, updates: Partial<ContactSubmission>): Promise<boolean> {
  const submission = await getContactSubmissionById(id);
  if (!submission) return false;
  
  const updatedSubmission: ContactSubmission = {
    ...submission,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  await contactSubmissionsDB.put(id, updatedSubmission);
  return true;
}

export async function deleteContactSubmission(id: string): Promise<boolean> {
  const submission = await getContactSubmissionById(id);
  if (!submission) return false;
  
  await contactSubmissionsDB.remove(id);
  return true;
}

// Get database statistics
export async function getCMSStats(): Promise<{ 
  pages: number; 
  services: number; 
  team: number; 
  blogPosts: number; 
  media: number; 
  contactSubmissions: number; 
}> {
  try {
    let pages = 0, services = 0, team = 0, blogPosts = 0, media = 0, contactSubmissions = 0;

    // Count pages
    const pageEntries = pagesDB.getRange();
    for (const _ of pageEntries) pages++;

    // Count services
    const serviceEntries = servicesDB.getRange();
    for (const _ of serviceEntries) services++;

    // Count team members
    const teamEntries = teamDB.getRange();
    for (const _ of teamEntries) team++;

    // Count blog posts
    const blogEntries = blogPostsDB.getRange();
    for (const _ of blogEntries) blogPosts++;

    // Count media
    const mediaEntries = mediaDB.getRange();
    for (const _ of mediaEntries) media++;

    // Count contact submissions
    const contactEntries = contactSubmissionsDB.getRange();
    for (const _ of contactEntries) contactSubmissions++;

    return { pages, services, team, blogPosts, media, contactSubmissions };
  } catch (error) {
    console.error('Error getting CMS stats:', error);
    return { pages: 0, services: 0, team: 0, blogPosts: 0, media: 0, contactSubmissions: 0 };
  }
}

// Close CMS databases
export async function closeCMSDB(): Promise<void> {
  // No explicit close needed, will be closed with main DB
}
