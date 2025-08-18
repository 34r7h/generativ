// CMS Schema Definitions
// This file defines the data structures for the CMS content

// Common types
export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
}

export interface MediaAsset {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  filePath: string;
  altText?: string;
  caption?: string;
  width?: number;
  height?: number;
  uploadedAt: string;
  updatedAt: string;
}

// Content types
export interface Page {
  id: string;
  slug: string;
  title: string;
  content: string; // Can be Markdown or HTML
  template: 'default' | 'home' | 'contact' | 'services' | 'about' | 'blog';
  isPublished: boolean;
  publishedAt?: string;
  featuredImage?: MediaAsset;
  sections: PageSection[];
  seo: SEOMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface PageSection {
  id: string;
  type: 'hero' | 'content' | 'services' | 'team' | 'cta' | 'testimonials' | 'features' | 'contact';
  title: string;
  content: string;
  sortOrder: number;
  settings: Record<string, any>; // Flexible settings object for section-specific configs
}

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  bio: string;
  photo?: MediaAsset;
  expertise: string[];
  email?: string;
  linkedIn?: string;
  twitter?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  icon?: string; // Icon name or emoji
  featuredImage?: MediaAsset;
  benefits: string[];
  pricing?: string;
  isPublished: boolean;
  sortOrder: number;
  seo: SEOMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  client: string;
  industry: string;
  challenge: string;
  solution: string;
  results: string;
  testimonial?: string;
  testimonialAuthor?: string;
  testimonialPosition?: string;
  featuredImage?: MediaAsset;
  gallery?: MediaAsset[];
  isPublished: boolean;
  publishedAt?: string;
  seo: SEOMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  author: string; // Can be linked to TeamMember id
  categories: string[];
  tags: string[];
  featuredImage?: MediaAsset;
  isPublished: boolean;
  publishedAt?: string;
  seo: SEOMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  isVirtual: boolean;
  registrationUrl?: string;
  capacity?: number;
  price?: number;
  isPublished: boolean;
  featuredImage?: MediaAsset;
  createdAt: string;
  updatedAt: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  formType: 'contact' | 'assessment' | 'newsletter';
  status: 'new' | 'inProgress' | 'completed' | 'archived';
  submittedAt: string;
  updatedAt: string;
}

// Settings type for global website configuration
export interface SiteSettings {
  siteName: string;
  tagline: string;
  logo?: MediaAsset;
  favicon?: MediaAsset;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    youtube?: string;
  };
  footer: {
    copyrightText: string;
    showLogo: boolean;
    columns: Array<{
      title: string;
      links: Array<{ text: string; url: string }>;
    }>;
  };
  analytics: {
    googleAnalyticsId?: string;
    enableCookieBanner: boolean;
  };
  globalSEO: SEOMetadata;
  updatedAt: string;
}

// User role for CMS administration
export interface AdminUser {
  userId: string;
  role: 'admin' | 'editor' | 'viewer';
  permissions: string[];
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

// Audit log for tracking changes
export interface AuditLogEntry {
  id: string;
  userId: string;
  action: 'create' | 'update' | 'delete' | 'publish' | 'unpublish';
  resourceType: string;
  resourceId: string;
  details: Record<string, any>;
  timestamp: string;
}
