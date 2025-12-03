# Development Guide - Real User Registration & Login

## 🎉 Real User Registration Now Works!

Your application is now configured for seamless user testing with **real email registration and immediate sign-in** in development mode.

## 📝 How It Works in Development

### User Registration Flow:
1. User fills out registration form with:
   - Name
   - Email (any valid email)
   - Password (6+ characters)

2. System automatically:
   - ✅ Creates the user account
   - ✅ Hashes the password with bcrypt
   - ✅ Auto-verifies the email
   - ✅ Returns success message

3. User can **immediately sign in** with:
   - Email: (the email they registered with)
   - Password: (the password they set)

### Demo Accounts (Still Available):
```
Admin:     mbende2000@yahoo.com / Azerty123456
DJ:        dj@example.com / dj123
User:      demo@example.com / demo123
```

## 🧪 Testing User Features

### Test Real Registration:
1. Go to **http://localhost:3000/auth/signup**
2. Register with a real email (e.g., test@example.com)
3. Click Sign In button
4. Enter your registered email and password
5. ✅ You should be logged in immediately!

### Test User Roles:
- **Regular User**: Can browse DJs and make bookings
- **DJ**: Can register DJ profile and set availability
- **Admin**: Can verify DJ applications

### Test Complete User Journey:
1. Register as regular user
2. Browse DJ listings at `/dj/listing`
3. Register as a new DJ user
4. Create DJ profile at `/dj/register`
5. View admin dashboard at `/admin` (with admin account)

## 🔧 Environment Configuration

Your `.env.local` has:
```env
NODE_ENV=development
MONGODB_URI=mongodb+srv://...  # MongoDB Atlas
NEXTAUTH_SECRET=dev-secret-key-change-in-production-...
```

### What Changes Based on NODE_ENV:

#### Development (NODE_ENV=development):
✅ Email auto-verified on registration
✅ No email verification required to sign in
✅ Email tokens NOT stored (no email sending)
✅ Fast iteration and testing

#### Production (NODE_ENV=production):
✅ Email verification required
✅ Verification emails sent via SMTP
✅ Sign-in blocked until email verified
✅ Full security enforcement

## 📊 Testing Scenarios

### Scenario 1: New User Registration
```
1. Go to signup page
2. Register with: newuser@test.com / password123 / John Doe
3. Auto-redirected to login
4. Sign in with registered credentials
5. Access dashboard and user features
```

### Scenario 2: DJ Profile Creation
```
1. Register new user (role: USER)
2. Go to /dj/register
3. Fill DJ registration form:
   - Bio
   - Genres (House, Techno, etc.)
   - Hourly rate
   - Experience
4. DJ profile created with PENDING status
5. Admin can verify at /admin
```

### Scenario 3: Admin Approval Flow
```
1. Sign in as admin: mbende2000@yahoo.com / Azerty123456
2. Go to /admin dashboard
3. View pending DJ applications
4. Approve/Reject DJ profiles
5. Approved DJs appear in listing
```

## 🚀 Running the App

```bash
# Terminal 1: Start MongoDB (if using local instance)
mongod

# Terminal 2: Start dev server
npm run dev

# Terminal 3: (Optional) Monitor logs
npm run type-check  # Check TypeScript errors
npm test            # Run tests
```

## 🔐 Password Requirements

- Minimum 6 characters
- No other restrictions (for dev ease)
- In production: Enforce stronger requirements

## 📧 Email Verification in Production

When deploying to production:

1. **Set up SMTP provider** (Gmail, SendGrid, etc.)
2. **Add environment variables:**
   ```env
   NODE_ENV=production
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   EMAIL_FROM=noreply@mixfactory.com
   ```
3. **Update auth flow:**
   - Users must verify email before signing in
   - Verification tokens expire in 24 hours
   - Resend verification link option needed

## 💡 Common Issues & Solutions

### Issue: "Email already registered"
**Solution**: Use a different email address for testing

### Issue: "Can't sign in after registering"
**Solution**: 
- Check NODE_ENV is set to `development`
- Clear browser cookies
- Check MongoDB connection

### Issue: "Email verification link not working"
**Solution**: 
- This is normal in development (emails not sent)
- Change NODE_ENV to production to enable email verification
- Set up SMTP credentials for email sending

## 🎯 Feature Checklist

- [x] User registration with real emails
- [x] Automatic email verification (dev mode)
- [x] User sign-in after registration
- [x] Password hashing with bcrypt
- [x] Role-based access (USER, DJ, ADMIN)
- [x] DJ profile creation
- [x] Admin DJ verification
- [x] Booking system
- [x] Multiple language support (EN, FR)
- [x] PWA capabilities
- [x] S3 file uploads

## 📚 Related Files

- `/app/api/auth/register/route.ts` - Registration endpoint
- `/app/api/auth/[...nextauth]/route.ts` - Authentication config
- `/lib/email.ts` - Email sending
- `/models/User.ts` - User schema

## 🚢 Deployment Notes

Before deploying to production:

1. ✅ Set `NODE_ENV=production`
2. ✅ Configure SMTP email provider
3. ✅ Set `NEXTAUTH_SECRET` to secure random value
4. ✅ Enable email verification requirement
5. ✅ Set up error tracking (Sentry, etc.)
6. ✅ Configure MongoDB Atlas IP whitelist
7. ✅ Set up S3 bucket for file uploads

## 🆘 Need Help?

Check these files for detailed implementation:
- `README.md` - Project overview
- `IMPLEMENTATION_SUMMARY.md` - Technical details
- `MONGODB_SETUP.md` - Database setup
- `QUICK_START.md` - Quick reference

Happy testing! 🎉
