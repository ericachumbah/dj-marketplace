import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/mongoose";
import DJProfile from "@/models/DJProfile";

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const body = await req.json();
    const { djId, rating, totalReviews, totalBookings } = body;

    if (!djId) {
      return NextResponse.json(
        { error: "DJ ID is required" },
        { status: 400 }
      );
    }

    if (rating !== undefined && (rating < 0 || rating > 5)) {
      return NextResponse.json(
        { error: "Rating must be between 0 and 5" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (rating !== undefined) updateData.rating = rating;
    if (totalReviews !== undefined) updateData.totalReviews = Math.max(0, totalReviews);
    if (totalBookings !== undefined) updateData.totalBookings = Math.max(0, totalBookings);

    const djProfile = await DJProfile.findOneAndUpdate(
      { id: djId },
      updateData,
      { new: true }
    );

    if (!djProfile) {
      return NextResponse.json(
        { error: "DJ profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "DJ rating updated successfully",
        dj: {
          id: djProfile.id,
          userId: djProfile.userId,
          rating: djProfile.rating,
          totalReviews: djProfile.totalReviews,
          totalBookings: djProfile.totalBookings,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update DJ Rating Error:", error);
    return NextResponse.json(
      { error: "Failed to update DJ rating" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const djId = searchParams.get("djId");

    if (!djId) {
      return NextResponse.json(
        { error: "DJ ID is required" },
        { status: 400 }
      );
    }

    const djProfile = await DJProfile.findOne({ id: djId }).lean();

    if (!djProfile) {
      return NextResponse.json(
        { error: "DJ profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        id: djProfile.id,
        userId: djProfile.userId,
        rating: djProfile.rating || 0,
        totalReviews: djProfile.totalReviews || 0,
        totalBookings: djProfile.totalBookings || 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get DJ Rating Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch DJ rating" },
      { status: 500 }
    );
  }
}
