import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    console.log("Attempting MongoDB connection...");
    await connectToDatabase();
    console.log("Connected to MongoDB");
    
    const userCount = await User.countDocuments();
    console.log("User count:", userCount);
    
    const users = await User.find({}).limit(2).lean();
    
    return NextResponse.json({
      status: "ok",
      database: "connected",
      userCount,
      sample: users.map(u => ({ id: u.id, email: u.email, role: u.role }))
    });
  } catch (error) {
    console.error("Database debug error:", error);
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
