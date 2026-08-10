// CMS Schema Definitions
// This file defines the data structures for the CMS content

// Common types
export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
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
  userId?: string; // Optional link to admin user account
  createdAt: string;
  updatedAt: string;
}

// How a service is sold. `quote` means there is no self-serve price.
export type PricingModel = 'quote' | 'one_time' | 'subscription';

export interface ServicePricing {
  model: PricingModel;
  // Minor units (cents), matching Stripe. Absent for `quote`.
  amount?: number;
  currency?: string;
  // Subscription only.
  interval?: 'month' | 'year';
  intervalCount?: number;
  // Optional: bill against a Price already defined in the Stripe dashboard
  // instead of an inline price built from `amount`.
  stripePriceId?: string;
  // Whether the public site offers a checkout button for this service.
  purchasable: boolean;
  // Shown under the price, e.g. what the fee is credited against.
  note?: string;
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
  // Free-text price line, kept for services that are quoted rather than sold.
  pricing?: string;
  // Structured price, used for display and for creating a Stripe checkout.
  pricingDetail?: ServicePricing;
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

/**
 * Payment provider configuration.
 *
 * `secretKey` and `webhookSecret` are written by an admin and read only by the
 * server. No API operation returns either value — the admin screen is served
 * `hasSecretKey` and a last-four fingerprint instead, so a compromised admin
 * session cannot exfiltrate the key.
 */
export interface PaymentSettings {
  provider: 'stripe';
  enabled: boolean;
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
  currency: string;
  successUrl: string;
  cancelUrl: string;
  updatedAt: string;
}

// What the public site is allowed to know about payment configuration.
export interface PublicPaymentConfig {
  enabled: boolean;
  publishableKey: string;
  currency: string;
}

export type OrderStatus = 'created' | 'paid' | 'failed' | 'canceled';

export interface Order {
  id: string;
  serviceId: string;
  serviceSlug: string;
  serviceTitle: string;
  mode: 'payment' | 'subscription';
  amount: number;
  currency: string;
  status: OrderStatus;
  stripeSessionId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePaymentIntentId?: string;
  customerEmail?: string;
  createdAt: string;
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
