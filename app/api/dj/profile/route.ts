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

    // Build update data with only valid fields
    const updateData: any = {};

    // Text fields
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.instagram !== undefined) updateData.instagram = body.instagram;
    if (body.twitter !== undefined) updateData.twitter = body.twitter;
    if (body.website !== undefined) updateData.website = body.website;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.state !== undefined) updateData.state = body.state;
    if (body.zipCode !== undefined) updateData.zipCode = body.zipCode;
    if (body.profileImage !== undefined) updateData.profileImage = body.profileImage;
    if (body.credentials !== undefined) updateData.credentials = body.credentials;

    // Number fields
    if (body.hourlyRate !== undefined) {
      updateData.hourlyRate = parseFloat(body.hourlyRate);
    }
    if (body.experience !== undefined) {
      updateData.experience = parseInt(body.experience);
    }
    if (body.latitude !== undefined) {
      updateData.latitude = body.latitude ? parseFloat(body.latitude) : null;
    }
    if (body.longitude !== undefined) {
      updateData.longitude = body.longitude ? parseFloat(body.longitude) : null;
    }
    if (body.radius !== undefined) {
      updateData.radius = body.radius ? parseInt(body.radius) : null;
    }

    // Array fields
    if (body.genres !== undefined) {
      updateData.genres = body.genres || [];
    }

    const djProfile = await prisma.dJProfile.update({
      where: { userId: user.id },
      data: updateData,
    });

    return NextResponse.json(djProfile);
  } catch (error) {
    console.error("Update DJ Profile Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update DJ profile";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
