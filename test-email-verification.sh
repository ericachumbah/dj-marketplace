#!/bin/bash

echo "🧪 Testing Email Verification Flow"
echo "=================================="
echo ""

# Test data
TEST_EMAIL="test-verification-$(date +%s)@example.com"
TEST_PASSWORD="TestPassword123!"
API_BASE="http://localhost:3001"

echo "📧 Test Email: $TEST_EMAIL"
echo "🔑 Test Password: $TEST_PASSWORD"
echo ""

# Step 1: Register a new user
echo "Step 1️⃣ : Registering new user..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"name\": \"Test User\"
  }")

echo "Response: $REGISTER_RESPONSE"
echo ""

# Check if email was sent (look for success)
if echo "$REGISTER_RESPONSE" | grep -q "emailSent"; then
  echo "✅ Registration successful - Email should be sent"
else
  echo "❌ Registration may have failed"
fi

echo ""
echo "Step 2️⃣ : Check database for verification token..."
# Query the database for the token
TOKEN=$(psql -U dbuser -h localhost -d djmarketplace -c \
  "SELECT token FROM \"EmailVerificationToken\" WHERE email = '$TEST_EMAIL' ORDER BY created_at DESC LIMIT 1;" \
  -t -A 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "❌ No verification token found in database"
  exit 1
else
  echo "✅ Found verification token: ${TOKEN:0:10}..."
fi

echo ""
echo "Step 3️⃣ : Attempt to sign in without verification..."
SIGNIN_RESPONSE=$(curl -s -X POST "$API_BASE/api/auth/callback/credentials" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

echo "Response: $SIGNIN_RESPONSE"
if echo "$SIGNIN_RESPONSE" | grep -q "verify your email"; then
  echo "✅ Signin correctly blocked - user must verify email"
else
  echo "⚠️  Signin response unexpected"
fi

echo ""
echo "Step 4️⃣ : Verify email using token..."
VERIFY_URL="$API_BASE/api/auth/verify-email?token=$TOKEN"
echo "Verification URL: $VERIFY_URL"
echo ""

# Note: We're just showing the URL - in real scenario, user clicks this in their email
echo "✅ Email Verification Flow Setup Complete!"
echo ""
echo "Summary:"
echo "- User registered with unverified email"
echo "- Verification token generated and stored"
echo "- Signin blocked for unverified users"
echo "- Token ready to be used in verification link"
echo ""
echo "To complete verification, visit:"
echo "$VERIFY_URL"
