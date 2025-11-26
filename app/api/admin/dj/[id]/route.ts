import { NextRequest, NextResponse } from "next/server";
import { getServerSession, type Session } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Mock DJ data for development
const mockDJs: Record<string, any> = {
  "dj-1": {
    id: "dj-1",
    userId: "user-1",
    user: { id: "user-1", name: "John Doe", email: "john@example.com" },
    status: "PENDING",
    genres: ["House", "Techno"],
    hourlyRate: 150,
    experience: 5,
    city: "New York",
    bio: "Professional DJ with 5 years of experience",
    credentials: [],
    createdAt: new Date("2024-01-15"),
  },
  "dj-2": {
    id: "dj-2",
    userId: "user-2",
    user: { id: "user-2", name: "Jane Smith", email: "jane@example.com" },
    status: "PENDING",
    genres: ["Hip-Hop", "R&B"],
    hourlyRate: 200,
    experience: 8,
    city: "Los Angeles",
    bio: "Experienced hip-hop DJ",
    credentials: [],
    createdAt: new Date("2024-01-20"),
  },
  "dj-3": {
    id: "dj-3",
    userId: "user-3",
    user: { id: "user-3", name: "Mike Johnson", email: "mike@example.com" },
    status: "VERIFIED",
    genres: ["Afrobeats", "Makossa"],
    hourlyRate: 180,
    experience: 10,
    city: "Atlanta",
    bio: "Afrobeats specialist",
    credentials: [],
    createdAt: new Date("2024-01-10"),
  },
};

async function requireAdmin(session: Session | null): Promise<boolean> {
  if (!session?.user || session.user.role !== "ADMIN") {
    return false;
  }
  return true;
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

    const { id } = await params;
    const djProfile = mockDJs[id];

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

    const { id } = await params;
    const body = await req.json();
    const { status, verificationNotes } = body;

    if (!["VERIFIED", "REJECTED", "SUSPENDED", "PENDING"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Update mock DJ
    if (mockDJs[id]) {
      mockDJs[id].status = status;
      mockDJs[id].verificationNotes = verificationNotes;
      if (status === "VERIFIED") {
        mockDJs[id].verifiedAt = new Date();
      }
    }

    return NextResponse.json({
      ...mockDJs[id],
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
