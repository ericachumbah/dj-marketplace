import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import DJProfile from "@/models/DJProfile";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await connectToDatabase();
    const djProfile = await DJProfile.findOne({ id }).lean();

    if (!djProfile) {
      return NextResponse.json(
        { error: "DJ profile not found" },
        { status: 404 }
      );
    }

    // Manually fetch user data since we use custom string IDs (cuid)
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
      } else {
        djProfile.user = {
          id: djProfile.userId,
          name: "DJ",
          email: "contact@example.com",
          image: null,
        };
      }
    } catch (err) {
      console.error(`Failed to fetch user for DJ ${djProfile.id}:`, err);
      djProfile.user = {
        id: djProfile.userId,
        name: "DJ",
        email: "contact@example.com",
        image: null,
      };
    }

    // Add calculated fields
    djProfile.rating = djProfile.rating || 0;
    djProfile.totalReviews = djProfile.totalReviews || 0;
    djProfile.totalBookings = djProfile.totalBookings || 0;

    return NextResponse.json(djProfile, { status: 200 });
  } catch (error) {
    console.error("Get DJ Profile Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch DJ profile" },
      { status: 500 }
    );
  }
}
