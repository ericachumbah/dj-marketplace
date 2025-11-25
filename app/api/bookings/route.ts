import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      djId,
      eventDate,
      eventDuration,
      eventLocation,
      eventType,
      eventNotes,
      contactEmail,
      contactPhone,
    } = body;

    // Validate DJ exists and is verified
    const dj = await prisma.dJProfile.findUnique({
      where: { id: djId },
    });

    if (!dj || dj.status !== "VERIFIED") {
      return NextResponse.json(
        { error: "DJ not found or not verified" },
        { status: 404 }
      );
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        djId,
        eventDate: new Date(eventDate),
        eventDuration,
        eventLocation,
        eventType,
        eventNotes,
        contactEmail,
        contactPhone,
        status: "PENDING",
      },
      include: {
        dj: { include: { user: true } },
        user: true,
      },
    });

    // TODO: Send email notification to DJ

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Create Booking Error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {
      userId: session.user.id,
    };

    if (status) {
      where.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        dj: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Get Bookings Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
