#!/bin/bash

# Mix Factory - Database Migration Script
# This script helps you push your database schema to Supabase

echo "🚀 Mix Factory Database Migration"
echo "=================================="
echo ""

# Check if DATABASE_URL is provided
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable not set"
    echo ""
    echo "Please set your Supabase connection string:"
    echo "  export DATABASE_URL='postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:5432/postgres'"
    echo ""
    exit 1
fi

echo "✓ DATABASE_URL found"
echo ""

# Check if Prisma is installed
if ! command -v npx &> /dev/null; then
    echo "❌ Error: npx not found. Please install Node.js"
    exit 1
fi

echo "📊 Running Prisma migrations..."
echo ""

# Run Prisma db push
npx prisma db push

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database schema pushed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Update .env.production with your DATABASE_URL"
    echo "2. Deploy to Vercel: https://vercel.com/new"
    echo "3. Add DATABASE_URL to Vercel environment variables"
    echo ""
else
    echo ""
    echo "❌ Migration failed. Check your DATABASE_URL"
    exit 1
fi
