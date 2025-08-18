# Generativ Consulting Company CMS

A modern, cutting-edge CMS and website for Generativ Consulting Company, showcasing AI safety and performance consulting services.

## Features

### Modern Design
- Sleek, futuristic interface with glass morphism elements
- Responsive design for all devices
- Engaging animations and transitions
- Professional typography and color scheme

### Powerful CMS
- Full-featured content management system
- Role-based access control
- Real-time content updates
- Media management
- SEO optimization

### Technology Stack
- **Frontend**: Vue 3, Vue Router, Modern CSS
- **Backend**: Bun, LMDB
- **Authentication**: JWT-based secure authentication
- **Data Storage**: LMDB high-performance embedded database

## Getting Started

### Prerequisites
- Node.js 16+ or Bun runtime
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/generativ.c.git
cd generativ.c
```

2. Install dependencies:
```bash
npm install
```

3. Start the development environment with database seeding:
```bash
npm run dev:seed
```

4. Access the application:
   - Website: http://localhost:5173 (or next available port)
   - Admin: http://localhost:5173/admin

### Admin Login
Use these credentials to access the admin dashboard:
- **Email**: admin@generativ.cc
- **Password**: admin123

## Project Structure

```
generativ.c/
├── client/               # Vue frontend
│   ├── public/           # Static assets
│   └── src/
│       ├── api/          # API client
│       ├── assets/       # Processed assets
│       ├── components/   # Vue components
│       ├── router/       # Vue Router config
│       └── stores/       # State management
├── server/               # Bun backend
│   ├── actions/          # Core server logic
│   ├── cms/              # CMS-specific code
│   └── data/             # LMDB database files
├── admin/                # Admin interface docs
├── website/              # Public website docs
└── instructions.md       # Project instructions
```

## Available Scripts

- `npm run dev` - Start development environment
- `npm run dev:seed` - Start development environment with database seeding
- `npm run dev:client` - Start only the client
- `npm run dev:server` - Start only the server
- `npm run build` - Build for production

## License

This project is proprietary and confidential. All rights reserved.

## Contact

For any inquiries, please contact admin@generativ.cc