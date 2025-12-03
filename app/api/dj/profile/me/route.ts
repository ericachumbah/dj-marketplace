import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/mongoose";
import DJProfile from "@/models/DJProfile";
import mongoose from "mongoose";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Find DJ profile for current user
    const userId = (session.user as any).id as string;
    const djProfile = await DJProfile.findOne({ userId }).lean();

    if (!djProfile) {
      return NextResponse.json(
        { error: "DJ profile not found" },
        { status: 404 }
      );
    }

    // Manually fetch user data
    try {
      const userColl = mongoose.connection.collection('users');
      const user = await userColl.findOne({ id: djProfile.userId });
      if (user) {
        djProfile.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      }
    } catch (err) {
      console.error(`Failed to fetch user for DJ ${djProfile.id}:`, err);
    }

    // Add calculated fields
    djProfile.rating = 0;
    djProfile.totalReviews = 0;
    djProfile.totalBookings = 0;

    return NextResponse.json(djProfile, { status: 200 });
  } catch (error) {
    console.error("Get DJ Profile Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch DJ profile" },
      { status: 500 }
    );
  }
}
