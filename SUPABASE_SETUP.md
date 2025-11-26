# Supabase Setup Guide for Mix Factory

## Step 1: Create Supabase Account
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub or email
4. Create a new organization

## Step 2: Create a Project
1. Click "New Project"
2. **Project name**: `dj-marketplace`
3. **Database password**: Save this securely
4. **Region**: Choose closest to you
5. Click "Create new project" (takes ~2 minutes)

## Step 3: Get Connection String
1. Go to **Settings → Database → Connection string**
2. Choose **URI** format
3. Copy the full connection string
4. Replace `[YOUR-PASSWORD]` with your database password
5. Should look like: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

## Step 4: Update Environment Variables
Replace in `.env.production`:
```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[SUPABASE-HOST]:5432/postgres
```

## Step 5: Run Migrations
```bash
# Set the DATABASE_URL
export DATABASE_URL="your-supabase-connection-string"

# Run migrations
npx prisma db push

# Verify schema created
npx prisma studio
```

## Step 6: Deploy to Vercel
1. Go to https://vercel.com/new
2. Import `dj-marketplace` repository
3. Add environment variables from Step 4
4. Deploy!

---
**Questions?** All env vars are in `.env.production`
