import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/mongoose";
import User from "@/models/User";
import DJProfile from "@/models/DJProfile";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    await connectToDatabase();

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
      facebook,
      youtube,
      tiktok,
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
    let user = await User.findOne({ email: session.user.email }).lean();
    if (!user) {
      const created = await User.create({
        email: session.user.email,
        name: session.user.name || undefined,
        image: session.user.image || undefined,
        role: "DJ",
      });
      user = created.toObject();
    }

    // Check if DJ profile already exists
    const existingProfile = await DJProfile.findOne({ userId: user.id }).lean();

    if (existingProfile) {
      return NextResponse.json(
        { error: "DJ profile already exists" },
        { status: 400 }
      );
    }

    // Create DJ profile
    const djProfile = await DJProfile.create({
      userId: user.id,
      bio,
      genres: genres || [],
      hourlyRate: parseFloat(hourlyRate),
      experience: parseInt(experience),
      instagram,
      facebook,
      youtube,
      tiktok,
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

    await connectToDatabase();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const user = await User.findOne({ email: session.user.email }).lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const djProfile = await DJProfile.findOne({ userId: user.id }).lean();

    if (!djProfile) {
      return NextResponse.json({ error: "DJ profile not found" }, { status: 404 });
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

    await connectToDatabase();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const user = await User.findOne({ email: session.user.email }).lean();

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();

    // Build update data with only valid fields
    const updateData: any = {};

    // Text fields
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.instagram !== undefined) updateData.instagram = body.instagram;
    if (body.facebook !== undefined) updateData.facebook = body.facebook;
    if (body.youtube !== undefined) updateData.youtube = body.youtube;
    if (body.tiktok !== undefined) updateData.tiktok = body.tiktok;
    if (body.twitter !== undefined) updateData.twitter = body.twitter;
    if (body.website !== undefined) updateData.website = body.website;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.state !== undefined) updateData.state = body.state;
    if (body.zipCode !== undefined) updateData.zipCode = body.zipCode;
    if (body.profileImage !== undefined && body.profileImage !== "") updateData.profileImage = body.profileImage;
    if (body.credentials !== undefined && Array.isArray(body.credentials)) updateData.credentials = body.credentials;

    // Number fields
    if (body.hourlyRate !== undefined && body.hourlyRate !== "") {
      const rate = parseFloat(body.hourlyRate);
      if (!isNaN(rate)) updateData.hourlyRate = rate;
    }
    if (body.experience !== undefined && body.experience !== "") {
      const exp = parseInt(body.experience);
      if (!isNaN(exp)) updateData.experience = exp;
    }
    if (body.latitude !== undefined && body.latitude !== "") {
      const lat = parseFloat(body.latitude);
      if (!isNaN(lat)) updateData.latitude = lat;
    } else if (body.latitude === "") {
      updateData.latitude = null;
    }
    if (body.longitude !== undefined && body.longitude !== "") {
      const lng = parseFloat(body.longitude);
      if (!isNaN(lng)) updateData.longitude = lng;
    } else if (body.longitude === "") {
      updateData.longitude = null;
    }
    if (body.radius !== undefined && body.radius !== "") {
      const rad = parseInt(body.radius);
      if (!isNaN(rad)) updateData.radius = rad;
    } else if (body.radius === "") {
      updateData.radius = null;
    }

    // Array fields
    if (body.genres !== undefined) {
      updateData.genres = body.genres || [];
    }

    const djProfile = await DJProfile.findOneAndUpdate({ userId: user.id }, updateData, { new: true });

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
