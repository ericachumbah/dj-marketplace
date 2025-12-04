import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  await connectToDatabase();
  try {
    const allUsers = await User.find().lean();
    return NextResponse.json({
      totalUsers: allUsers.length,
      users: allUsers.map(u => ({ email: (u as any).email, role: (u as any).role }))
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
