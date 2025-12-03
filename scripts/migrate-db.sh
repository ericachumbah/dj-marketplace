#!/bin/bash

# Mix Factory - Database Migration Script
# This script helps you push your database schema to Supabase

echo "🚀 Mix Factory Database Migration"
echo "=================================="
echo ""

## Simple MongoDB seed helper script

# Check if MONGODB_URI is provided
if [ -z "$MONGODB_URI" ]; then
    echo "❌ Error: MONGODB_URI environment variable not set"
    echo ""
    echo "Please set your MongoDB connection string:" 
    echo "  export MONGODB_URI='mongodb+srv://user:pass@cluster0.mongodb.net/dbname?retryWrites=true&w=majority'"
    echo ""
    exit 1
fi

echo "✓ MONGODB_URI found"
echo ""

echo "📦 Seeding MongoDB (ts-node seed)..."
echo ""

if ! command -v npx &> /dev/null; then
    echo "❌ Error: npx not found. Please install Node.js"
    exit 1
fi

# Run the TypeScript seed script using ts-node
npx ts-node --esm scripts/seed.ts

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database seeded successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Update production environment variables with MONGODB_URI"
    echo "2. Deploy to Vercel or your host"
    echo ""
else
    echo ""
    echo "❌ Seeding failed. Check your MONGODB_URI and seed script"
    exit 1
fi
