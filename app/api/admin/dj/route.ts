import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/mongoose";
import DJProfile from "@/models/DJProfile";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const userRole = (session.user as any).role;
    if (userRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "PENDING";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    const query = { status };
    const total = await DJProfile.countDocuments(query);

    const djs = await DJProfile.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Manually fetch user data since we use custom string IDs (cuid)
    const djsWithUsers = await Promise.all(
      djs.map(async (dj: any) => {
        try {
          const userColl = mongoose.connection.collection('users');
          const user = await userColl.findOne({ id: dj.userId });
          return {
            ...dj,
            user: user ? {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
            } : null,
            userId: dj.userId, // Keep original for internal use
            _count: {
              bookings: 0,
              reviews: 0,
            },
          };
        } catch (err) {
          console.error(`Failed to fetch user for DJ ${dj.id}:`, err);
          return {
            ...dj,
            user: null,
            userId: dj.userId,
            _count: {
              bookings: 0,
              reviews: 0,
            },
          };
        }
      })
    );

    return NextResponse.json({
      djs: djsWithUsers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get Pending DJs Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch DJs" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userRole = (session.user as any).role;
    if (userRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const djId = searchParams.get("djId");
    const body = await req.json();
    const { status, notes } = body;

    if (!djId || !status) {
      return NextResponse.json(
        { error: "DJ ID and status are required" },
        { status: 400 }
      );
    }

    if (!["VERIFIED", "REJECTED", "SUSPENDED", "PENDING"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const updateData: any = {
      status,
    };

    if (status === "VERIFIED") {
      updateData.verifiedAt = new Date();
    }

    const updatedDJ = await DJProfile.findOneAndUpdate(
      { id: djId },
      updateData,
      { new: true, lean: true }
    );

    if (!updatedDJ) {
      return NextResponse.json(
        { error: "DJ profile not found" },
        { status: 404 }
      );
    }

    // Fetch user data
    try {
      const userColl = mongoose.connection.collection('users');
      const user = await userColl.findOne({ id: updatedDJ.userId });
      if (user) {
        updatedDJ.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      }
    } catch (err) {
      console.error(`Failed to fetch user for DJ ${updatedDJ.id}:`, err);
    }

    return NextResponse.json(updatedDJ, { status: 200 });
  } catch (error) {
    console.error("Update DJ Status Error:", error);
    return NextResponse.json(
      { error: "Failed to update DJ status" },
      { status: 500 }
    );
  }
}
