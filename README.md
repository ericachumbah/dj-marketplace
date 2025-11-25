# DJ Marketplace - Modern PWA

A modern, fully-featured Progressive Web App (PWA) for connecting DJs with event organizers. Built with Next.js, React, TailwindCSS, PostgreSQL, and NextAuth.

## Features

### Core Features
- **DJ Discovery**: Browse and filter verified DJs by genre, location, and hourly rate
- **DJ Registration**: Secure DJ registration with profile creation and credential uploads
- **Admin Dashboard**: Verify and manage DJ applications
- **Booking System**: Request and manage bookings with DJs
- **User Authentication**: Email magic links, Google OAuth, and GitHub OAuth
- **File Uploads**: S3-compatible storage for DJ profiles, credentials, and portfolios
- **Progressive Web App**: Offline capability, installable, and service worker caching

### Technical Features
- Type-safe with TypeScript
- API routes with authentication
- Database ORM with Prisma
- Responsive design with TailwindCSS
- Automated tests with Jest
- Production-ready deployment

## Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth v5
- **Storage**: S3-compatible (MinIO, AWS S3)
- **Testing**: Jest, React Testing Library
- **Icons**: Lucide React
- **PWA**: Service Worker, Web App Manifest

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- S3-compatible storage (MinIO for development)

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Setup environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

3. **Setup database**
```bash
npx prisma migrate dev --name init
```

4. **Start development server**
```bash
npm run dev
```

Visit http://localhost:3000

## Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm start         # Start production server
npm test          # Run tests
npm run lint      # Run ESLint
```

## Project Structure

```
dj-marketplace/
├── app/
│   ├── api/              # API routes
│   ├── components/       # React components
│   ├── dj/              # DJ pages
│   ├── admin/           # Admin pages
│   ├── auth/            # Auth pages
│   └── page.tsx         # Home page
├── lib/
│   ├── prisma.ts        # Prisma client
│   ├── storage.ts       # S3 service
│   └── utils/           # Utilities
├── prisma/
│   └── schema.prisma    # Database schema
├── public/
│   ├── manifest.json    # PWA manifest
│   └── sw.js           # Service worker
├── __tests__/           # Test files
└── package.json         # Dependencies
```

## API Routes

### DJ Management
- `POST /api/dj/profile` - Create DJ profile
- `GET /api/dj/profile` - Get current DJ profile
- `PUT /api/dj/profile` - Update DJ profile
- `POST /api/dj/upload` - Upload DJ files
- `GET /api/dj/listing` - List verified DJs

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user bookings

### Admin
- `GET /api/admin/dj` - List DJs for verification
- `PUT /api/admin/dj/[id]` - Verify/reject DJ

## Database Schema

Key models:
- **User** - Authentication
- **DJProfile** - DJ information
- **Booking** - Booking requests
- **Review** - DJ ratings
- **AdminLog** - Admin actions

## PWA Features

- Installable on Android, iOS, and Desktop
- Offline support via Service Worker
- App shortcuts for quick access
- Custom manifest with app icons

## Testing

```bash
npm test                  # Run all tests
npm test -- --coverage   # Generate coverage report
```

## Deployment

### Vercel (Recommended)
```bash
vercel
```

### Environment Variables for Production
- `DATABASE_URL` - PostgreSQL connection
- `NEXTAUTH_SECRET` - Secure random string
- `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` - S3/MinIO
- `EMAIL_SERVER_*` - SMTP configuration
- `GOOGLE_CLIENT_*`, `GITHUB_*` - OAuth credentials

## Security

✅ Secure authentication with NextAuth
✅ Password hashing with bcrypt
✅ Environment variables for secrets
✅ SQL injection protection via Prisma
✅ CSRF protection
✅ Rate limiting ready

## Performance

- Optimized images with Next.js Image
- Code splitting and lazy loading
- Service worker caching strategies
- Database query optimization
- CSS optimization with TailwindCSS

## Contributing

Contributions are welcome! Please feel free to open issues and pull requests.

## License

MIT License - See LICENSE file for details

---

**Built with ❤️ for the DJ community**
