#!/usr/bin/env node
/*
  Usage:
    # From project root, with DATABASE_URL set to your production DB:
    DATABASE_URL="postgresql://..." node scripts/upsert_admin.js --email=mbende2000@yahoo.com --password=Azerty123456

  This script upserts an admin user (creates or updates) with the provided email and password
  and marks the email as verified. It uses Mongoose and bcrypt to hash the password.
*/

import 'dotenv/config.js'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import minimist from 'minimist'
import readline from 'readline'

const argv = minimist(process.argv.slice(2))

async function confirmPrompt(message) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  return new Promise((resolve) => {
    rl.question(message, (answer) => {
      rl.close()
      resolve(/^y(es)?$/i.test(answer.trim()))
    })
  })
}

async function main() {
  const email = argv.email || argv.e
  const password = argv.password || argv.p
  const dbUrl = argv.url || process.env.DATABASE_URL
  const dryRun = argv['dry-run'] || argv.dry || false
  const yes = argv.yes || argv.y || false

  if (!email || !password) {
    console.error('Error: --email and --password are required')
    console.error(
      'Usage: node scripts/upsert_admin.js --email=you@example.com --password=YourPass123 [--url=DATABASE_URL] [--dry-run] [--yes]'
    )
    process.exit(1)
  }

  if (!dbUrl && !dryRun) {
    console.error(
      'Error: No DATABASE_URL provided. Set --url or the DATABASE_URL environment variable.'
    )
    process.exit(1)
  }

  const hashed = await bcrypt.hash(password, 10)

  // Show safe summary
  console.log('Preparing to upsert admin user:')
  console.log('  Email:', email)
  console.log('  Password: (hidden)')
  console.log('  Dry run:', dryRun)
  if (!dryRun) {
    console.log(
      '  Database URL:',
      dbUrl ? dbUrl.replace(/(postgresql:\/\/.*:).*@/, '$1****@') : 'N/A'
    )
  }

  if (!yes && !dryRun) {
    const ok = await confirmPrompt(
      'Are you sure you want to continue? Type yes to proceed: '
    )
    if (!ok) {
      console.log('Aborted by user')
      process.exit(0)
    }
  }

  if (dryRun) {
    console.log(
      'Dry run complete. Hashed password (first 10 chars):',
      hashed.slice(0, 10) + '...'
    )
    return
  }

  // Use Mongoose to upsert admin
  const mongoUrl = dbUrl || process.env.MONGODB_URI || process.env.DATABASE_URL
  if (!mongoUrl) {
    console.error('Error: No MongoDB URL provided via --url or MONGODB_URI env')
    process.exit(1)
  }

  try {
    // Connect to MongoDB
    await mongoose.connect(mongoUrl, {})

    // Upsert directly into the users collection to avoid requiring TS model files
    const { default: cuid } = await import('cuid')
    const usersColl = mongoose.connection.collection('users')

    const now = new Date()
    const update = {
      $set: {
        email,
        name: 'Admin User',
        password: hashed,
        role: 'ADMIN',
        emailVerified: now,
        updatedAt: now,
      },
      $setOnInsert: {
        id: cuid(),
        createdAt: now,
      },
    }

    const res = await usersColl.findOneAndUpdate({ email }, update, {
      upsert: true,
      returnDocument: 'after',
    })
    const doc = res.value || null
    console.log('Upserted admin user:', doc ? doc.email : email)
  } catch (err) {
    console.error(
      'Error upserting admin with Mongoose:',
      err && err.message ? err.message : err
    )
    process.exitCode = 1
  } finally {
    try {
      await mongoose.connection.close()
    } catch {
      // ignore
    }
  }
}

// Run main and handle uncaught errors
main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
