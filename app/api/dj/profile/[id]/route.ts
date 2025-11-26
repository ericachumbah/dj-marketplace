import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const djProfile = await prisma.dJProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!djProfile) {
      return NextResponse.json(
        { error: "DJ profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(djProfile, { status: 200 });
  } catch (error) {
    console.error("Get DJ Profile Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch DJ profile" },
      { status: 500 }
    );
  }
}
