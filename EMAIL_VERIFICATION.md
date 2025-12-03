# Email Verification System

This document describes the email verification system implemented for user registration and authentication.

## Overview

The email verification system ensures that users provide valid email addresses during registration and must verify their email before they can sign in. This prevents spam accounts and ensures legitimate user communication.

## Architecture

### Components

1. **Legacy Prisma Schema (removed; for reference only)**
   - The original Prisma schema used with the previous Postgres setup is no longer part of this repository.
   - The application now uses Mongoose models located in `models/` to represent `User` and `EmailVerificationToken`.

2. **Email Service** (`lib/email.ts`)
   - `sendVerificationEmail()`: Sends email with verification link
   - `sendPasswordResetEmail()`: Sends password reset emails
   - Uses Nodemailer with environment-based SMTP configuration

3. **Token Service** (`lib/token.ts`)
   - `generateVerificationToken()`: Creates 32-byte random hex tokens
   - `generateExpirationDate()`: Sets 24-hour expiration

4. **Registration API** (`app/api/auth/register/route.ts`)
   - Validates email format
   - Creates unverified user account
   - Generates and stores verification token
   - Sends verification email

5. **Email Verification Endpoint** (`app/api/auth/verify-email/route.ts`)
   - Validates token against database
   - Checks token expiration
   - Updates user `emailVerified` timestamp
   - Redirects to success page

6. **NextAuth Configuration** (`app/api/auth/[...nextauth]/route.ts`)
   - Enforces email verification before signin
   - Returns error: "Please verify your email before signing in"

7. **Success Page** (`app/auth/email-verified/page.tsx`)
   - Displays verification success message
   - Shows verified email address
   - Provides link to signin

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Email Provider Configuration
EMAIL_SERVICE=gmail                              # Service provider: gmail, sendgrid, etc.
EMAIL_USER=your-email@gmail.com                  # Sender email address
EMAIL_PASSWORD=your-app-password                 # App-specific password
EMAIL_FROM="Mix Factory <noreply@mixfactory.com>" # Display name

# NextAuth
NEXTAUTH_URL=http://localhost:3000              # Production: https://yourdomain.com
NEXTAUTH_SECRET=your-secret-key                 # Change in production!
```

### Email Provider Setup

#### Gmail
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the generated 16-character password as `EMAIL_PASSWORD`

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx
```

#### SendGrid
```env
EMAIL_SERVICE=SendGrid
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.xxxxxxxxxxxx
```

#### Other SMTP Services
```env
EMAIL_SERVICE=custom
EMAIL_USER=username@service.com
EMAIL_PASSWORD=your-password
```

## User Flow

### Registration
```
1. User fills registration form
2. POST /api/auth/register with email & password
3. API validates email format
4. API creates user with emailVerified: null
5. API generates 32-byte verification token
6. API stores token in EmailVerificationToken table (24hr expiry)
7. API sends verification email with link:
   https://yourdomain.com/api/auth/verify-email?token=xxxxx
8. User sees: "Please check your email to verify your account"
```

### Email Verification
```
1. User clicks link in email
2. GET /api/auth/verify-email?token=xxxxx
3. API validates token exists
4. API checks token not expired
5. API updates user.emailVerified = NOW()
6. API deletes verification token
7. User redirected to /auth/email-verified?email=user@example.com
8. User sees success message
```

### Sign In
```
1. User fills signin form with email & password
2. POST /api/auth/callback/credentials
3. Credential provider checks:
   - Email exists
   - Password matches
   - emailVerified is NOT null ✓ (NEW)
4. If emailVerified is null:
   - Return error: "Please verify your email before signing in"
5. If all checks pass:
   - Create session
   - Redirect to dashboard
```

## Testing

### Manual Test

1. **Register a new account:**
   ```bash
   curl -X POST http://localhost:3001/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "TestPassword123!",
       "name": "Test User"
     }'
   ```

2. **Get verification token from database:**
   ```bash
   psql -U dbuser -h localhost -d djmarketplace \
     -c "SELECT token FROM \"EmailVerificationToken\" WHERE email = 'test@example.com';"
   ```

3. **Click verification link:**
   ```
   http://localhost:3001/api/auth/verify-email?token=<token-from-db>
   ```

4. **Attempt signin:**
   - Without verification: Should see error "Please verify your email before signing in"
   - After verification: Should successfully signin

### Automated Test

Run the test script:
```bash
bash test-email-verification.sh
```

## Database

### EmailVerificationToken Model
```prisma
model EmailVerificationToken {
  id        String   @id @default(cuid())
  email     String
  token     String   @unique
  expires   DateTime
  createdAt DateTime @default(now())
}
```

### User Model (Updated)
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  name          String
  emailVerified DateTime?  // New: Null = unverified, timestamp = verified
  // ... other fields
}
```

## Token Security

- **Length**: 32-byte random hex string (64 characters)
- **Uniqueness**: Enforced at database level (`@unique`)
- **Expiration**: 24 hours from creation
- **Cleanup**: Expired tokens automatically deleted on verification attempt
- **One-time use**: Deleted after successful verification

## Email Template

The verification email includes:
- User greeting
- Verification action button/link
- 24-hour expiration notice
- Link to resend verification (if needed)
- Support contact information

Email is sent from: `noreply@mixfactory.com`

## Production Deployment

Before deploying to Vercel:

1. **Set environment variables in Vercel Dashboard:**
   - Add `EMAIL_SERVICE`, `EMAIL_USER`, `EMAIL_PASSWORD`, `EMAIL_FROM`
   - Set `NEXTAUTH_URL` to your production domain
   - Generate new `NEXTAUTH_SECRET` using: `openssl rand -base64 32`

2. **Database/Seed:**
Ensure `MONGODB_URI` is set in production and run the seed script once to populate required data (or run locally against production DB with care):

```bash
# Ensure MONGODB_URI is set
npx ts-node --esm scripts/seed.ts
```

3. **Test verification flow:**
- Register test account on production
- Verify you receive email
- Confirm email verification works
- Confirm unverified users cannot signin

4. **Monitor emails:**
   - Check email delivery logs
   - Monitor email bounce rates
   - Set up alerts for failed sends

## Troubleshooting

### Email not sending
- Check `EMAIL_SERVICE`, `EMAIL_USER`, `EMAIL_PASSWORD` in `.env`
- Verify SMTP credentials are correct
- Check application logs for Nodemailer errors
- For Gmail: Ensure App Password is used, not regular password

### Token expires too quickly
- Default expiration is 24 hours (adjust in `lib/token.ts` if needed)
- Users can re-register if token expires

### Verification link not working
- Ensure `NEXTAUTH_URL` matches your domain
- Check that `verify-email` endpoint is accessible
- Verify token exists in database

### User locked out
- Implement "Resend verification email" button if needed
- Allow user to re-register with same email

## Future Enhancements

1. **Resend verification email**: Add endpoint to resend verification
2. **Password reset**: Implement forgot password flow
3. **Email templates**: HTML email templates with branding
4. **Localization**: Support EN/FR email templates
5. **Admin controls**: Allow admins to manually verify users
6. **Notification emails**: DJ listing updates, booking confirmations
