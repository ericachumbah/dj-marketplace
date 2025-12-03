import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import DJProfile from "@/models/DJProfile";
import mongoose from "mongoose";

// GET /api/dj/listing
// Returns paginated DJ profiles with populated user info

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const genre = searchParams.get("genre");
    const city = searchParams.get("city");
    const minRate = searchParams.get("minRate");
    const maxRate = searchParams.get("maxRate");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    await connectToDatabase();

    const query: any = {};

    if (genre) query.genres = genre;
    if (city) query.city = { $regex: city, $options: "i" };
    if (minRate || maxRate) {
      query.hourlyRate = {};
      if (minRate) query.hourlyRate.$gte = parseFloat(minRate);
      if (maxRate) query.hourlyRate.$lte = parseFloat(maxRate);
    }
    if (search) {
      const r = new RegExp(search, "i");
      query.$or = [{ bio: r }, { /* user.name will be filtered after lookup */ }];
    }

    const total = await DJProfile.countDocuments(query);

    const djs = await DJProfile.find(query)
      .sort({ rating: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Manually fetch user data since we use custom string IDs (cuid), not MongoDB ObjectIds
    const djsWithUsers = await Promise.all(
      djs.map(async (dj: any) => {
        try {
          const userColl = mongoose.connection.collection('users');
          const user = await userColl.findOne({ id: dj.userId });
          return {
            ...dj,
            userId: user ? {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
            } : null,
          };
        } catch (err) {
          console.error(`Failed to fetch user for DJ ${dj.id}:`, err);
          return {
            ...dj,
            userId: null,
          };
        }
      })
    );

    // If search also targets user.name, filter the results
    let filtered = djsWithUsers;
    if (search) {
      const r = new RegExp(search, "i");
      filtered = djsWithUsers.filter((dj: any) => {
        const user = (dj as any).userId as any;
        return r.test(dj.bio || "") || (user && r.test(user.name || ""));
      });
    }

    const djsWithStats = (filtered || []).map((dj: any) => ({
      ...dj,
      totalReviews: 0,
      totalBookings: 0,
      user: (dj as any).userId || null,
    }));

    return NextResponse.json(
      {
        djs: djsWithStats || [],
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get DJs Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch DJs",
        djs: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 }
      },
      { status: 500 }
    );
  }
}
