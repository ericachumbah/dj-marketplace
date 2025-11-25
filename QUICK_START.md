# DJ Marketplace - Quick Start Guide

## 🚀 Start in 5 Minutes

### Step 1: Setup (1 min)
```bash
cd /Users/sampsonmbende/Documents/dj-marketplace
npm install
```

### Step 2: Database & Storage (2 min)
```bash
# Start PostgreSQL & MinIO
docker-compose up -d

# Run database migrations
npx prisma migrate dev --name init

# Seed sample data (optional)
npx prisma db seed
```

### Step 3: Start Development (1 min)
```bash
npm run dev
```

### Step 4: Access the App (1 min)
- **App**: http://localhost:3000
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)

## 📝 Default Test Accounts

After seeding:
- **Regular User**: test@example.com
- **Admin**: admin@example.com

## 🎯 Quick Navigation

| Page | URL | Purpose |
|------|-----|---------|
| Home | http://localhost:3000 | Landing page |
| Browse DJs | http://localhost:3000/dj/listing | Find DJs |
| Register DJ | http://localhost:3000/dj/register | Create DJ profile |
| Sign In | http://localhost:3000/auth/signin | Authentication |
| Admin Dashboard | http://localhost:3000/admin | Verify DJs |

## 📦 What's Pre-configured

✅ Next.js 15 with TypeScript
✅ PostgreSQL database (via docker-compose)
✅ MinIO S3 storage (via docker-compose)
✅ TailwindCSS styling
✅ NextAuth authentication
✅ Prisma ORM
✅ Jest testing setup
✅ ESLint & TypeScript checking
✅ PWA service worker
✅ All API routes ready

## 💻 Available Commands

```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm start               # Start prod server
npm test                # Run tests
npm run lint            # Check code quality
npm run type-check      # Check TypeScript
```

## �� Troubleshooting

**Port 3000 already in use?**
```bash
lsof -i :3000  # Find process
kill -9 <PID>   # Kill it
```

**Database connection failed?**
```bash
# Check if containers are running
docker-compose ps

# View logs
docker-compose logs postgres
```

**MinIO not working?**
```bash
# Restart MinIO
docker-compose restart minio

# Access console: http://localhost:9001
```

## 🚀 Next: Deploy to Production

See `DEPLOYMENT.md` for complete deployment guide for:
- Vercel
- Docker
- AWS
- DigitalOcean
- Self-hosted VPS

## 📚 Documentation

- **README.md** - Full project overview
- **IMPLEMENTATION_SUMMARY.md** - What's included
- **DEPLOYMENT.md** - Production deployment
- **QUICK_START.md** - This file

---

**You're all set! Happy coding! 🎉**
