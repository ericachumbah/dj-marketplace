import { NextRequest, NextResponse } from "next/server";
import { getServerSession, type Session } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

async function requireAdmin(session: Session | null): Promise<boolean> {
  if (!session?.user || session.user.role !== "ADMIN") {
    return false;
  }
  return true;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!await requireAdmin(session)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const djProfile = await prisma.dJProfile.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        bookings: true,
        reviews: true,
      },
    });

    if (!djProfile) {
      return NextResponse.json(
        { error: "DJ profile not found" },
        { status: 404 }
      );
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!await requireAdmin(session)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { status, verificationNotes } = body;

    if (!["VERIFIED", "REJECTED", "SUSPENDED", "PENDING"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const djProfile = await prisma.dJProfile.update({
      where: { id: params.id },
      data: {
        status,
        verificationNotes,
        verifiedAt: status === "VERIFIED" ? new Date() : null,
      },
    });

    // Log admin action
    if (session?.user?.id) {
      await prisma.adminLog.create({
        data: {
          action: status === "VERIFIED" ? "VERIFY" : "REJECT",
          targetDJId: params.id,
          notes: verificationNotes,
          adminId: session.user.id,
        },
      });
    }

    return NextResponse.json(djProfile);
  } catch (error) {
    console.error("Update DJ Status Error:", error);
    return NextResponse.json(
      { error: "Failed to update DJ profile" },
      { status: 500 }
    );
  }
}
