# How to Find Supabase Connection String

## Method 1: Direct from Project (Best)
1. Go to your Supabase project dashboard
2. Click **"Settings"** (gear icon) in bottom left
3. Click **"Database"** in the left sidebar
4. Scroll down to **"Connection string"** section
5. Under **"Connection pooler"**, select **"URI"** format
6. You should see: `postgresql://postgres.xxxxx:password@db.supabase.co:6543/postgres`

## Method 2: If you only see Organization Slug
If you're on the wrong page:
1. Go to https://supabase.com/dashboard
2. Click your **project name** (not organization)
3. You should now see the project overview
4. Click **Settings** (bottom left, gear icon)
5. Click **Database** in the sidebar
6. Look for **Connection string** section

## What to Copy
You need the **"URI"** format that looks like:
```
postgresql://postgres.[PROJECT-ID]:[PASSWORD]@db.[REGION].supabase.co:6543/postgres
```

⚠️ **Important**: Replace `[PASSWORD]` with the password you saved during project creation. If you forgot it:
1. Go to **Settings → Database → Reset database password**
2. Use the new password

## Once You Have It
Replace in `.env.production`:
```
DATABASE_URL=postgresql://postgres.[PROJECT-ID]:[YOUR-PASSWORD]@db.[REGION].supabase.co:6543/postgres
```

Then deploy to Vercel with this URL.
