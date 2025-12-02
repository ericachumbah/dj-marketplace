import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Hash demo passwords
  const demoPassword = await bcrypt.hash("demo123", 10);
  const djPassword = await bcrypt.hash("dj123", 10);
  const adminPassword = await bcrypt.hash("azerty123456", 10);

  // Create demo users with hashed passwords
  const user1 = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      name: "Demo User",
      password: demoPassword,
      role: "USER",
    },
  });

  const djUser = await prisma.user.upsert({
    where: { email: "dj@example.com" },
    update: {},
    create: {
      email: "dj@example.com",
      name: "Demo DJ",
      password: djPassword,
      role: "DJ",
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: "mbende2000@yahoo.com" },
    update: {},
    create: {
      email: "mbende2000@yahoo.com",
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  // Create sample DJ profile for DJ user
  await prisma.dJProfile.upsert({
    where: { userId: djUser.id },
    update: {},
    create: {
      userId: djUser.id,
      bio: "Professional DJ with 10 years of experience",
      genres: ["House", "Techno", "Deep House"],
      hourlyRate: 150,
      experience: 10,
      status: "VERIFIED",
      verifiedAt: new Date(),
      profileImage: "https://via.placeholder.com/400",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      phone: "+1-555-0100",
      instagram: "@djprofessional",
      website: "https://djprofessional.com",
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log("Demo Credentials:");
  console.log("  - Email: demo@example.com | Password: demo123 (USER)");
  console.log("  - Email: dj@example.com | Password: dj123 (DJ)");
  console.log("  - Email: mbende2000@yahoo.com | Password: Azerty123456 (ADMIN)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
