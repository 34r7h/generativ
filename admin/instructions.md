# Admin Interface Development Instructions

This document outlines the plan for developing the admin interface for the Generativ Consulting Company CMS.

## Overview

The admin interface will provide a secure area for authorized users to manage the website content, including pages, services, team members, blog posts, and media assets.

## Reference to Main Instructions

This task is part of step 6 in the main instructions.md file: "Create admin interface for content management".

## Components to Develop

### 1. Admin Layout
- Admin sidebar navigation
- Admin header with user info and logout
- Protected routes structure

### 2. Content Management Pages

#### Pages Management
- List of all pages with status, title, and update date
- Page editor with rich text editing
- Page section builder
- SEO metadata editor
- Page settings (template, status, etc.)

#### Services Management
- List of all services
- Service editor with:
  - Basic info (title, slug, icon)
  - Short and full descriptions
  - Benefits list manager
  - Pricing information
  - Featured image selection
  - SEO metadata

#### Team Management
- List of all team members
- Team member editor with:
  - Personal information
  - Bio editor
  - Photo upload
  - Social links
  - Expertise tags

#### Blog Management
- List of all blog posts
- Blog post editor with:
  - Rich text content editor
  - Category and tag management
  - Featured image selection
  - Author selection
  - Publishing controls
  - SEO metadata

#### Media Library
- Grid/list view of all media assets
- Upload functionality (single and bulk)
- Image editor with crop, resize options
- Media details editor (title, alt text, caption)
- Media organizer with folders or tags

#### Site Settings
- General settings (site name, tagline, etc.)
- SEO global settings
- Social media links
- Footer configuration
- Analytics settings

### 3. Shared Components

- Rich text editor component
- Media selector component
- Date picker
- Tag/category selector
- Form validation system
- Success/error notification system
- Confirmation dialogs
- Loading states

## Implementation Plan

1. Create base admin layout with navigation
2. Implement authentication guards
3. Build CRUD functionality for each content type
4. Develop shared components
5. Implement rich text editor integration
6. Build media upload and management system
7. Create form validation system
8. Implement notification system
9. Add sorting and filtering to list views
10. Create dashboard analytics

## Technical Requirements

- Use Vue 3 Composition API
- Implement state management with Pinia
- Use Vue Router for navigation
- Build reusable components
- Implement proper form validation
- Ensure responsive design for all screens
- Follow established design system

## API Integration

The admin interface will communicate with the server API using the following endpoints:

- Authentication: `/auth`
- CMS Operations: `/cms`

The API client is already set up in `client/src/api/client.ts` and provides methods for all required operations.

## Design Guidelines

- Use the existing color palette defined in CSS variables
- Follow the established component styling patterns
- Ensure consistent spacing and typography
- Implement responsive design for all screen sizes
- Follow accessibility best practices
