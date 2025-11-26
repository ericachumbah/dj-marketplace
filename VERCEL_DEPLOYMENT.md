# Vercel Deployment Guide

Your Supabase database is ready! ✅ Follow these steps to deploy to Vercel.

## Step 1: Go to Vercel
Visit: https://vercel.com/new

## Step 2: Import Your Repository
1. Click **"Import Project"**
2. Paste your GitHub repo URL: `https://github.com/ericachumbah/dj-marketplace`
3. Click **"Continue"**

## Step 3: Configure Environment Variables
Add these 3 environment variables before deploying:

| Variable | Value |
|----------|-------|
| `NEXTAUTH_URL` | `https://your-app-name.vercel.app` *(Vercel will give you the exact URL)* |
| `NEXTAUTH_SECRET` | `o6P5gujJtzL+syf0EXcUq5ABmCAfXhSM8R54TUXzvV8=` |
| `DATABASE_URL` | `postgresql://postgres:NjRmsLt46kcNsFjr@db.xrbjieeirxceixtvyepf.supabase.co:5432/postgres` |

**⚠️ IMPORTANT:** After deployment completes, Vercel will show your app URL (e.g., `dj-marketplace-xyz.vercel.app`). You'll need to update `NEXTAUTH_URL` to match.

## Step 4: Deploy
1. Click **"Deploy"**
2. Wait 3-5 minutes for deployment to complete
3. You'll get a URL like: `https://dj-marketplace-abc123.vercel.app`

## Step 5: Update NEXTAUTH_URL (if different from Vercel URL)
If your actual Vercel URL doesn't match what you put in Step 3:

1. Go to Vercel project Settings
2. Navigate to **Environment Variables**
3. Edit `NEXTAUTH_URL` to match your actual Vercel URL
4. Redeploy by going to **Deployments** → **Latest** → **Redeploy**

## Test Your Deployment

Visit your deployed app and test:

- ✅ Home page loads
- ✅ Sign in with demo credentials:
  - Email: `demo@example.com` | Password: `demo`
  - Email: `dj@example.com` | Password: `demo`
  - Email: `admin@example.com` | Password: `demo`
- ✅ DJ can create profile
- ✅ Admin can see dashboard
- ✅ Profile data saves to Supabase

## Troubleshooting

### "Invalid callback URL" Error
- Make sure `NEXTAUTH_URL` matches your actual Vercel domain exactly
- Redeploy after updating the environment variable

### Database Connection Error
- Check that `DATABASE_URL` is correct in Vercel environment variables
- Verify Supabase password hasn't changed
- Check Supabase network restrictions (if any)

### Environment Variables Not Loading
- Make sure variables are in **Environment Variables** section (not in `.env.production`)
- Redeploy after adding variables

## Next Steps (Optional)

After deployment is working:
- Set up custom domain in Vercel settings
- Configure email notifications (SendGrid, Mailgun, etc.)
- Set up payment processing (Stripe)
- Add CI/CD with GitHub Actions

---

**Your App is Production-Ready! 🎉**
