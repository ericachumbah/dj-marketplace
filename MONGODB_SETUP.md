# MongoDB Setup Guide

Your application has been migrated from PostgreSQL/Prisma to MongoDB/Mongoose. Here's how to set up your database:

## Quick Setup Options

### Option 1: Docker (Recommended for Local Development)

If you have Docker installed:

```bash
# Start MongoDB and MinIO
docker-compose up -d

# The MongoDB connection string is automatically set to:
# mongodb://localhost:27017/djmarketplace
```

The `.env.local` file is already configured with the correct MongoDB URI.

### Option 2: MongoDB Atlas (Cloud - Recommended for Production)

1. **Create a free MongoDB Atlas account:**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up (free tier available)
   - Create a new project

2. **Create a cluster:**
   - Choose the M0 Sandbox (free tier)
   - Select your preferred region (closest to you)
   - Wait for cluster to initialize

3. **Create a database user:**
   - Go to Database Access
   - Add a Database User
   - Choose Password authentication
   - Save the username and password

4. **Get connection string:**
   - Go to Database → Clusters
   - Click "Connect"
   - Choose "Connect to your application"
   - Copy the connection string

5. **Update `.env.local`:**
   ```
   MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/djmarketplace?retryWrites=true&w=majority"
   ```

### Option 3: Local MongoDB Installation

If you have MongoDB installed locally:

```bash
# macOS with Homebrew
brew install mongodb-community
brew services start mongodb-community

# The connection string is:
# MONGODB_URI="mongodb://localhost:27017/djmarketplace"
```

## Seed the Database

After setting up MongoDB, seed the database with demo users:

```bash
# Using ts-node (TypeScript)
npx ts-node --esm scripts/seed.ts

# Or using Node.js (JavaScript)
node scripts/seed.js
```

This creates:
- **Demo User**: demo@example.com / demo123
- **Demo DJ**: dj@example.com / dj123
- **Admin**: mbende2000@yahoo.com / Azerty123456

## Verify Setup

1. Check if MongoDB is running:
```bash
# Docker
docker-compose ps

# Local
mongosh
```

2. Start the app:
```bash
npm run dev
```

3. Try signing in:
   - Email: `mbende2000@yahoo.com`
   - Password: `Azerty123456`

## Troubleshooting

### "MONGODB_URI not set" error
- Make sure `.env.local` has `MONGODB_URI` set
- Run `cat .env.local | grep MONGODB_URI` to verify

### "Connection refused" error
- For Docker: Ensure `docker-compose up -d` is running
- For Atlas: Check your IP is whitelisted in Network Access
- For Local: Start MongoDB service

### Admin login still failing
1. Verify admin user exists:
   ```bash
   npx ts-node --esm -e "
   import { connectToDatabase } from './lib/mongoose';
   import User from './models/User';
   
   async function check() {
     await connectToDatabase();
     const admin = await User.findOne({ email: 'mbende2000@yahoo.com' });
     console.log('Admin user:', admin);
   }
   check();
   "
   ```

2. Verify password is hashed and `emailVerified` is set

3. Re-seed if needed:
   ```bash
   npx ts-node --esm scripts/seed.ts
   ```

## Environment Variables

Make sure your `.env.local` includes:

```env
# MongoDB Connection
MONGODB_URI="mongodb://localhost:27017/djmarketplace"

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-key-change-in-production-12345678901234567890

# S3/MinIO
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=djmarketplace
S3_REGION=us-east-1
```

## Next Steps

- ✅ Set up MongoDB (local, Docker, or Atlas)
- ✅ Update `.env.local` with connection string
- ✅ Run seed script
- ✅ Start development server
- ✅ Sign in with admin credentials

Questions? Check the README.md or IMPLEMENTATION_SUMMARY.md for more details.
