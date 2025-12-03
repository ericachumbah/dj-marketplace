import bcrypt from "bcryptjs";
import { connectToDatabase } from "../lib/mongoose";
import User from "../models/User";
import DJProfile from "../models/DJProfile";

async function main() {
  console.log("Seeding database (MongoDB)...");
  await connectToDatabase();

  // Hash demo passwords
  const demoPassword = await bcrypt.hash("demo123", 10);
  const djPassword = await bcrypt.hash("dj123", 10);
  const adminPassword = await bcrypt.hash("Azerty123456", 10);

  // Upsert demo user
  const user1 = await User.findOneAndUpdate(
    { email: "demo@example.com" },
    { email: "demo@example.com", name: "Demo User", password: demoPassword, role: "USER" },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Upsert DJ user
  const djUser = await User.findOneAndUpdate(
    { email: "dj@example.com" },
    { email: "dj@example.com", name: "Demo DJ", password: djPassword, role: "DJ" },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Upsert Admin user
  const adminUser = await User.findOneAndUpdate(
    { email: "mbende2000@yahoo.com" },
    {
      email: "mbende2000@yahoo.com",
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN",
      emailVerified: new Date(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Create sample DJ profile for DJ user
  if (djUser && djUser.id) {
    await DJProfile.findOneAndUpdate(
      { userId: djUser.id },
      {
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
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

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
    try {
      const mongoose = (await import("mongoose")).default;
      await mongoose.connection.close();
    } catch (e) {
      // ignore
    }
  });
