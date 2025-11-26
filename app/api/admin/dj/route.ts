import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Mock DJ data for development (in-memory)
const mockDJs = [
  {
    id: "dj-1",
    user: { id: "user-1", name: "John Doe", email: "john@example.com" },
    status: "PENDING",
    genres: ["House", "Techno"],
    hourlyRate: 150,
    city: "New York",
    rating: 4.5,
    totalBookings: 5,
    totalReviews: 3,
    createdAt: new Date("2024-01-15"),
    _count: { bookings: 5, reviews: 3 },
  },
  {
    id: "dj-2",
    user: { id: "user-2", name: "Jane Smith", email: "jane@example.com" },
    status: "PENDING",
    genres: ["Hip-Hop", "R&B"],
    hourlyRate: 200,
    city: "Los Angeles",
    rating: 4.8,
    totalBookings: 12,
    totalReviews: 10,
    createdAt: new Date("2024-01-20"),
    _count: { bookings: 12, reviews: 10 },
  },
  {
    id: "dj-3",
    user: { id: "user-3", name: "Mike Johnson", email: "mike@example.com" },
    status: "VERIFIED",
    genres: ["Afrobeats", "Makossa"],
    hourlyRate: 180,
    city: "Atlanta",
    rating: 4.6,
    totalBookings: 8,
    totalReviews: 7,
    createdAt: new Date("2024-01-10"),
    _count: { bookings: 8, reviews: 7 },
  },
];

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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "PENDING";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    // Filter mock data by status
    const filtered = mockDJs.filter(dj => dj.status === status);
    const total = filtered.length;
    const djs = filtered.slice(skip, skip + limit);

    return NextResponse.json({
      djs,
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
