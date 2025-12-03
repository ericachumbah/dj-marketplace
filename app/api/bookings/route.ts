import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/mongoose";
import Booking from "@/models/Booking";
import DJProfile from "@/models/DJProfile";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    await connectToDatabase();

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
    const dj = await DJProfile.findOne({ id: djId }).lean();

    if (!dj || dj.status !== "VERIFIED") {
      return NextResponse.json(
        { error: "DJ not found or not verified" },
        { status: 404 }
      );
    }

    // Create booking
    const booking = await Booking.create({
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
    });

    // Populate dj and user for response
    const bookingPopulated = await Booking.findOne({ id: booking.id })
      .populate({ path: 'djId', populate: { path: 'userId', select: 'id name email image' } })
      .populate({ path: 'userId', select: 'id name email' })
      .lean();
    // TODO: Send email notification to DJ

    return NextResponse.json(bookingPopulated, { status: 201 });
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
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const q: any = { userId: session.user.id };
    if (status) q.status = status;

    const bookings = await Booking.find(q)
      .populate({ path: 'djId', populate: { path: 'userId', select: 'id name email image' } })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Get Bookings Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
