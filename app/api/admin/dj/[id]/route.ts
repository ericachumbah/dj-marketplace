import { NextRequest, NextResponse } from "next/server";
import { getServerSession, type Session } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/mongoose";
import DJProfile from "@/models/DJProfile";
import mongoose from "mongoose";

async function requireAdmin(session: Session | null): Promise<boolean> {
  if (!session?.user) {
    return false;
  }
  const userRole = (session.user as any).role;
  return userRole === "ADMIN";
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!await requireAdmin(session)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const { id } = await params;
    const djProfile = await DJProfile.findOne({ id }).lean();

    if (!djProfile) {
      return NextResponse.json(
        { error: "DJ profile not found" },
        { status: 404 }
      );
    }

    // Fetch user data
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

    return NextResponse.json(djProfile);
  } catch (error) {
    console.error("Get DJ for Admin Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch DJ profile" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!await requireAdmin(session)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const { id } = await params;
    const body = await req.json();
    const { status, verificationNotes } = body;

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
      { id },
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

    return NextResponse.json({
      ...updatedDJ,
      message: "DJ status updated successfully",
    });
  } catch (error) {
    console.error("Update DJ Status Error:", error);
    return NextResponse.json(
      { error: "Failed to update DJ profile" },
      { status: 500 }
    );
  }
}
