# Public Website Implementation Instructions

This document outlines the plan for implementing the public-facing website for Generativ Consulting Company.

## Overview

The public website will showcase the company's services, team, and expertise to potential clients, following the business plan provided.

## Reference to Main Instructions

This task is part of step 7 in the main instructions.md file: "Implement public-facing website with company information".

## Pages to Develop

### 1. Homepage
- Hero section with main value proposition
- Services overview
- Value proposition section
- Team highlights
- Call to action

### 2. Services Pages
- Main services listing page
- Individual service detail pages:
  - AI Safety Testing
  - Parallelization Infrastructure
  - Critical Thinking in AI

### 3. About Page
- Company mission and vision
- Business approach
- Company history
- Team section with leadership

### 4. Team Page
- Complete team listing
- Individual team member profiles
- Expertise areas visualization

### 5. Blog
- Blog listing page with filters
- Individual blog post pages
- Category and tag archives
- Search functionality

### 6. Resources
- "Disruption Radar" reports section
- "Critical Thinking in AI" playbook
- Case studies
- Downloadable assets

### 7. Contact Page
- Contact form
- Office location(s)
- Request for services form
- "AI Vulnerability Scan" request form

## Implementation Plan

1. Create base layout and navigation
2. Implement homepage sections
3. Build services pages
4. Develop about and team pages
5. Create blog functionality
6. Build resources section
7. Implement contact forms
8. Add animations and transitions
9. Optimize for performance and SEO

## Technical Requirements

- Use Vue 3 Composition API
- Fetch content from CMS API
- Implement proper loading states
- Add error handling
- Ensure responsive design for all devices
- Follow accessibility standards
- Optimize images and assets

## API Integration

The website will fetch content from the server API using the following endpoints:

- Content: `/cms`

The API client is already set up in `client/src/api/client.ts` and provides methods for all required operations.

## Content Structure

### Services Content

Services should be structured according to the business plan:

1. **AI Safety Testing**
   - "Red Team" code testing
   - CI/CD integration for AI models
   - Vulnerability scanning

2. **Parallelization Infrastructure**
   - Batch processing systems
   - "10x Output Speed" methodology
   - Cloud GPUs orchestration

3. **Critical Thinking in AI**
   - Brand-safe content generation
   - Compliance-proof marketing
   - Decision-making frameworks

### Team Content

The team structure should showcase the domain leads mentioned in the business plan:

1. **Coding Domain** (AI testing frameworks)
2. **Literature Domain** (prompt engineering/content safety)
3. **Multimedia Domain** (multi-modal generation)
4. **Operations/Events Manager**

## Design Guidelines

- Use the established color palette and design system
- Follow modern web design principles
- Focus on clear communication of value proposition
- Use appropriate imagery for AI consulting services
- Ensure accessibility and readability
- Implement smooth animations and transitions
- Maintain consistent branding throughout the site
