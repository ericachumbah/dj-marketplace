import { prisma } from "@/lib/prisma";

async function main() {
  console.log("Seeding database...");

  // Create test users
  const user1 = await prisma.user.create({
    data: {
      email: "test@example.com",
      name: "Test User",
      role: "USER",
    },
  });

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "Admin User",
      role: "ADMIN",
    },
  });

  // Create sample DJ profiles
  const dj1 = await prisma.dJProfile.create({
    data: {
      userId: user1.id,
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
  console.log("Test user:", user1.email);
  console.log("Admin user:", adminUser.email);
  console.log("Sample DJ:", dj1.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
