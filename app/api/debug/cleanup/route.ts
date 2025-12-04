import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import User from "@/models/User";
import DJProfile from "@/models/DJProfile";

// DELETE old profiles by email
export async function DELETE(request: NextRequest) {
  await connectToDatabase();
  try {
    const { emails } = await request.json();
    
    if (!emails || !Array.isArray(emails)) {
      return NextResponse.json({ error: "emails array required" }, { status: 400 });
    }

    // Delete DJ profiles and users
    const djResult = await DJProfile.deleteMany({ 
      userId: { $in: (await User.find({ email: { $in: emails } }).select('id')) }
    });
    
    const userResult = await User.deleteMany({ email: { $in: emails } });

    return NextResponse.json({
      deleted: {
        djProfiles: djResult.deletedCount,
        users: userResult.deletedCount
      }
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
