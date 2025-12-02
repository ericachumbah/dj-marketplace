#!/usr/bin/env node
/*
  Usage:
    # From project root, with DATABASE_URL set to your production DB:
    DATABASE_URL="postgresql://..." node scripts/upsert_admin.js --email=mbende2000@yahoo.com --password=Azerty123456

  This script upserts an admin user (creates or updates) with the provided email and password
  and marks the email as verified. It uses the Prisma client and bcrypt to hash the password.
*/

require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const argv = require('minimist')(process.argv.slice(2))

async function main() {
  const email = argv.email || argv.e
  const password = argv.password || argv.p

  if (!email || !password) {
    console.error('Error: --email and --password are required')
    process.exit(1)
  }

  const prisma = new PrismaClient()
  try {
    const hashed = await bcrypt.hash(password, 10)

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashed,
        emailVerified: new Date(),
        role: 'ADMIN',
      },
      create: {
        email,
        name: 'Admin User',
        password: hashed,
        role: 'ADMIN',
        emailVerified: new Date(),
      },
    })

    console.log('Upserted admin user:', user.email)
  } catch (err) {
    console.error('Error upserting admin:', err)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

main()
