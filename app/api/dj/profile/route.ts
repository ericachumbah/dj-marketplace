import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      bio,
      genres,
      hourlyRate,
      experience,
      instagram,
      twitter,
      website,
      phone,
      city,
      state,
      zipCode,
      latitude,
      longitude,
      radius,
      profileImage,
      credentials,
    } = body;

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || undefined,
          image: session.user.image || undefined,
          role: "DJ",
        },
      });
    }

    // Check if DJ profile already exists
    const existingProfile = await prisma.dJProfile.findUnique({
      where: { userId: user.id },
    });

    if (existingProfile) {
      return NextResponse.json(
        { error: "DJ profile already exists" },
        { status: 400 }
      );
    }

    // Create DJ profile
    const djProfile = await prisma.dJProfile.create({
      data: {
        userId: user.id,
        bio,
        genres: genres || [],
        hourlyRate: parseFloat(hourlyRate),
        experience: parseInt(experience),
        instagram,
        twitter,
        website,
        phone,
        city,
        state,
        zipCode,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        radius: radius ? parseInt(radius) : null,
        profileImage,
        credentials: credentials || [],
      },
    });

    return NextResponse.json(djProfile, { status: 201 });
  } catch (error) {
    console.error("Create DJ Profile Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create DJ profile";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const djProfile = await prisma.dJProfile.findUnique({
      where: { userId: user.id },
    });

    if (!djProfile) {
      return NextResponse.json(
        { error: "DJ profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(djProfile);
  } catch (error) {
    console.error("Get DJ Profile Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch DJ profile" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const body = await req.json();

    const djProfile = await prisma.dJProfile.update({
      where: { userId: user.id },
      data: {
        ...body,
        hourlyRate: body.hourlyRate ? parseFloat(body.hourlyRate) : undefined,
        experience: body.experience ? parseInt(body.experience) : undefined,
      },
    });

    return NextResponse.json(djProfile);
  } catch (error) {
    console.error("Update DJ Profile Error:", error);
    return NextResponse.json(
      { error: "Failed to update DJ profile" },
      { status: 500 }
    );
  }
}
