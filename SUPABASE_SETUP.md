# Supabase / Postgres note

This project has been migrated to use MongoDB (Mongoose) instead of PostgreSQL/Prisma. If you were planning to use Supabase/Postgres, note that current application code now expects a MongoDB connection via `MONGODB_URI`.

Recommended next steps:
- Use MongoDB Atlas for managed hosting: https://www.mongodb.com/cloud/atlas
- Set `MONGODB_URI` in your environment or Vercel dashboard
- Seed the database: `npx ts-node --esm scripts/seed.ts`

If you still need a Postgres/Supabase variant, let me know and I can prepare a compatibility layer or keep Prisma-based code paths.
