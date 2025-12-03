import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import DJProfile from "@/models/DJProfile";

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
      query.$or = [{ bio: r }, { /* user.name will be filtered after populate */ }];
    }

    const total = await DJProfile.countDocuments(query);

    const djs = await DJProfile.find(query)
      .populate({ path: "userId", select: "id name email image" })
      .sort({ rating: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // If search also targets user.name, filter the populated results
    let filtered = djs;
    if (search) {
      const r = new RegExp(search, "i");
      filtered = djs.filter((dj: any) => {
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
