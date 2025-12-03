# Email Verification Quick Start

## 🚀 Setup (5 minutes)

### 1. Configure Email Service
Copy to your `.env` file:
```env
# Choose your email provider
EMAIL_SERVICE=gmail                              # Use this for Gmail
EMAIL_USER=your-email@gmail.com                  
EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx               # App Password from Gmail

# Or for SendGrid:
# EMAIL_SERVICE=SendGrid
# EMAIL_USER=apikey
# EMAIL_PASSWORD=SG.xxxxxxxxxxxx

# Both require:
EMAIL_FROM="Mix Factory <noreply@mixfactory.com>"
NEXTAUTH_URL=http://localhost:3000               # Update for production!
```

### 2. Gmail Setup (Recommended)
1. Enable 2-factor authentication: https://myaccount.google.com/security
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Copy the 16-character password to `EMAIL_PASSWORD` in `.env`

### 3. Verify Database
```bash
# Ensure `MONGODB_URI` is set and run the seed (if needed):
npx ts-node --esm scripts/seed.ts
```

## 📝 User Registration Flow

### User sees:
```
1. Register form (name, email, password)
2. "Please check your email to verify your account" message
3. Email arrives with verification link
4. Click link → success page
5. Can now signin
```

### API endpoints:
```
POST   /api/auth/register         → Register & send email
GET    /api/auth/verify-email     → Verify token & mark user
POST   /api/auth/callback/credentials → Signin (requires verified email)
```

## 🧪 Test It

### Quick Test
```bash
npm run dev
# Open http://localhost:3001/auth/signin
# Click "Register"
# Fill form with test email
# Check console logs for verification link (since email won't send in dev)
```

### Full Test Script
```bash
bash test-email-verification.sh
```

## 🔍 Common Issues

| Issue | Solution |
|-------|----------|
| Email not sending | Check `EMAIL_USER` and `EMAIL_PASSWORD` in `.env` |
| Gmail authentication fails | Use App Password, not regular password |
| Verification link doesn't work | Ensure `NEXTAUTH_URL` matches your domain |
| Token expires immediately | Default is 24 hours - adjust in `lib/token.ts` if needed |

## 📚 Full Documentation
See `EMAIL_VERIFICATION.md` for:
- Complete architecture
- All configuration options
- Production deployment
- Troubleshooting guide

## ✅ Before Production

```bash
# 1. Generate new secret
openssl rand -base64 32

# 2. Set in Vercel environment variables:
# - EMAIL_SERVICE
# - EMAIL_USER
# - EMAIL_PASSWORD
# - EMAIL_FROM
# - NEXTAUTH_URL (production domain)
# - NEXTAUTH_SECRET (new one from above)

# 3. Deploy and test
git push origin main
# Vercel auto-deploys

# 4. Test registration on production
```

## 💡 Key Features

✅ 32-byte random tokens (cryptographically secure)
✅ 24-hour expiration
✅ One-time use (deleted after verification)
✅ Blocks signin for unverified users
✅ Error messages guide users
✅ Production-ready security

---
**Questions?** Check `EMAIL_VERIFICATION.md` for detailed documentation.
