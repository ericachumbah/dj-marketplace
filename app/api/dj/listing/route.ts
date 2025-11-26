import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    // Build filter
    const where: Record<string, unknown> = {
      status: "VERIFIED", // Only show verified DJs
    };

    if (genre) {
      where.genres = { has: genre };
    }

    if (city) {
      where.city = {
        contains: city,
        mode: "insensitive",
      };
    }

    if (minRate || maxRate) {
      const rateFilter: Record<string, number> = {};
      if (minRate) {
        rateFilter.gte = parseFloat(minRate);
      }
      if (maxRate) {
        rateFilter.lte = parseFloat(maxRate);
      }
      where.hourlyRate = rateFilter;
    }

    if (search) {
      where.OR = [
        {
          user: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          bio: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    // Get total count
    const total = await prisma.dJProfile.count({ where });

    // Get DJ profiles
    const djs = await prisma.dJProfile.findMany({
      where,
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
      orderBy: { rating: "desc" },
      skip,
      take: limit,
    });

    // Map to response format
    const djsWithStats = djs.map((dj) => ({
      ...dj,
      totalReviews: 0,
      totalBookings: 0,
    }));

    return NextResponse.json(
      {
        djs: djsWithStats,
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
      { error: "Failed to fetch DJs" },
      { status: 500 }
    );
  }
}
