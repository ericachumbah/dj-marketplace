#!/usr/bin/env node
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import cuid from 'cuid'

dotenv.config({ path: '.env.local' })

async function main() {
  let mongoUrl = process.env.MONGODB_URI || process.env.DATABASE_URL
  if (!mongoUrl) {
    console.error('MONGODB_URI not set. Set it in environment and retry.')
    process.exit(1)
  }

  // Remove quotes if present (dotenv sometimes includes them)
  mongoUrl = mongoUrl.replace(/^["']|["']$/g, '')

  console.log('Connecting to MongoDB...')
  console.log('Connection string length:', mongoUrl.length)
  await mongoose.connect(mongoUrl, {})

  const usersColl = mongoose.connection.collection('users')
  const djColl = mongoose.connection.collection('djprofiles')

  const now = new Date()

  // Hash passwords
  const demoPassword = await bcrypt.hash('demo123', 10)
  const djPassword = await bcrypt.hash('dj123', 10)
  const adminPassword = await bcrypt.hash('Azerty123456', 10)

  // Upsert demo user
  await usersColl.findOneAndUpdate(
    { email: 'demo@example.com' },
    {
      $set: {
        email: 'demo@example.com',
        name: 'Demo User',
        password: demoPassword,
        role: 'USER',
        updatedAt: now,
      },
      $setOnInsert: { id: cuid(), createdAt: now },
    },
    { upsert: true, returnDocument: 'after' }
  )

  // Upsert DJ user
  const djRes = await usersColl.findOneAndUpdate(
    { email: 'dj@example.com' },
    {
      $set: {
        email: 'dj@example.com',
        name: 'Demo DJ',
        password: djPassword,
        role: 'DJ',
        updatedAt: now,
      },
      $setOnInsert: { id: cuid(), createdAt: now },
    },
    { upsert: true, returnDocument: 'after' }
  )

  const djUser = djRes.value

  // Upsert Admin user
  await usersColl.findOneAndUpdate(
    { email: 'mbende2000@yahoo.com' },
    {
      $set: {
        email: 'mbende2000@yahoo.com',
        name: 'Admin User',
        password: adminPassword,
        role: 'ADMIN',
        emailVerified: now,
        updatedAt: now,
      },
      $setOnInsert: { id: cuid(), createdAt: now },
    },
    { upsert: true, returnDocument: 'after' }
  )

  // Create sample DJ profile for DJ user
  if (djUser && djUser.id) {
    await djColl.findOneAndUpdate(
      { userId: djUser.id },
      {
        $set: {
          userId: djUser.id,
          bio: 'Professional DJ with 10 years of experience',
          genres: ['House', 'Techno', 'Deep House'],
          hourlyRate: 150,
          experience: 10,
          status: 'VERIFIED',
          verifiedAt: now,
          profileImage: 'https://via.placeholder.com/400',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          phone: '+1-555-0100',
          instagram: '@djprofessional',
          website: 'https://djprofessional.com',
          updatedAt: now,
        },
        $setOnInsert: { id: cuid(), createdAt: now },
      },
      { upsert: true, returnDocument: 'after' }
    )
  }

  console.log('✅ Database seeded successfully!')
  console.log('Demo Credentials:')
  console.log('  - Email: demo@example.com | Password: demo123 (USER)')
  console.log('  - Email: dj@example.com | Password: dj123 (DJ)')
  console.log(
    '  - Email: mbende2000@yahoo.com | Password: Azerty123456 (ADMIN)'
  )

  try {
    await mongoose.connection.close()
  } catch {
    // ignore
  }
}

main().catch((e) => {
  console.error('Seeding failed:', e && e.message ? e.message : e)
  process.exit(1)
})
