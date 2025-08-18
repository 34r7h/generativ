# Generativ Consulting Company Website Project

This document outlines the plan for developing the Generativ Consulting Company website and CMS.

## Project Overview

We are building a Content Management System (CMS) and public-facing website for Generativ Consulting Company (generativ.cc), an AI consulting firm specializing in AI safety and performance. The website will showcase the company's services, team, and resources while providing an admin interface for content management.

## System Architecture

### Server
- **Runtime**: Bun
- **Database**: LMDB (lightweight embedded database)
- **Authentication**: JWT-based with secure session management
- **API**: RESTful endpoints for CMS operations

### Client
- **Framework**: Vue 3
- **Build Tool**: Vite
- **Router**: Vue Router
- **State Management**: Vue's Composition API with reactive state

## Content Types

The CMS supports the following content types:

1. **Pages**: Static pages like Home, About, Contact
2. **Services**: Consulting services offered by the company
3. **Team Members**: Staff profiles with roles and expertise
4. **Blog Posts**: Articles and thought leadership content
5. **Resources**: Downloadable assets like whitepapers and playbooks
6. **Case Studies**: Success stories and client testimonials
7. **Media Assets**: Images and other files used throughout the site

## Development Steps

### 1. Foundation Setup (COMPLETED)
- ✅ Set up project structure
- ✅ Configure build tools and dependencies
- ✅ Create basic server with authentication endpoints
- ✅ Set up database schema and operations
- ✅ Create client application shell with routing

### 2. CMS Backend (COMPLETED)
- ✅ Design database schema for content types
- ✅ Implement CRUD operations for all content types
- ✅ Create API endpoints for content management
- ✅ Add authentication and authorization
- ✅ Implement database seeding for initial content

### 3. Admin Interface (IN PROGRESS)
- ✅ Create login and authentication UI
- ✅ Build dashboard with content overview
- ✅ Implement content editors for each type
- ⏳ Add media upload and management
- ⏳ Create user management interface

### 4. Public Website (IN PROGRESS)
- ✅ Design and implement homepage
- ✅ Create services listing and detail pages
- ✅ Build team page with member profiles
- ✅ Implement blog with article pages
- ⏳ Add resources section
- ⏳ Create contact form with submission handling

### 5. Deployment and Testing
- ⏳ Set up production build process
- ⏳ Configure hosting and domain
- ⏳ Implement automated testing
- ⏳ Perform security audit
- ⏳ Conduct performance optimization

## Running the Project

### Development Mode

To start the development environment:

```bash
# Start both client and server with database seeding (first time)
npm run dev:seed

# Start both client and server without seeding
npm run dev
```

### Accessing the Application

- **Client**: http://localhost:5173 (or next available port)
- **Server**: http://localhost:3001
- **Admin Interface**: http://localhost:5173/admin

## Project Structure

```
generativ.c/
├── client/                # Vue frontend
│   ├── public/            # Static assets
│   └── src/
│       ├── api/           # API client
│       ├── assets/        # Processed assets
│       ├── components/    # Vue components
│       │   ├── shared/    # Reusable components
│       │   └── views/     # Page components
│       ├── router/        # Vue Router config
│       └── stores/        # State management
├── server/                # Bun backend
│   ├── actions/           # Core server logic
│   ├── cms/               # CMS-specific code
│   │   ├── api.ts         # CMS API handlers
│   │   ├── db.ts          # Database operations
│   │   ├── schema.ts      # Type definitions
│   │   └── seed.ts        # Data seeding script
│   └── data/              # LMDB database files
├── admin/                 # Admin interface docs
├── website/               # Public website docs
└── instructions.md        # This file
```

## Business Plan Alignment

The website is designed to align with the company's business plan:

1. **Foundation Phase**: Showcase proprietary methodologies
2. **Client Acquisition**: Highlight modular services and case studies
3. **Industry Dominance**: Position as thought leaders through blog and resources
4. **Target Audience**: Focus on "Disruption Edge" sectors (Finance, Media, Coding)
5. **Monetization Streams**: Support consulting, workshops, and literature/tools

## Next Steps

1. Complete the admin interface functionality
2. Finish implementing the public website sections
3. Add proper media handling and storage
4. Implement contact form submission handling
5. Prepare for production deployment