import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/mongoose";
import Booking from "@/models/Booking";
import DJProfile from "@/models/DJProfile";
import mongoose from "mongoose";

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
      userId: (session.user as any).id,
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

    // Manually fetch related data since we use custom string IDs
    const userColl = mongoose.connection.collection('users');
    const djUser = await userColl.findOne({ id: dj.userId });

    return NextResponse.json({
      id: booking.id,
      userId: (session.user as any).id,
      djId,
      eventDate: booking.eventDate,
      eventDuration,
      eventLocation,
      eventType,
      eventNotes,
      contactEmail,
      contactPhone,
      status: booking.status,
      createdAt: booking.createdAt,
      dj: {
        id: dj.id,
        user: djUser ? {
          id: djUser.id,
          name: djUser.name,
          email: djUser.email,
          image: djUser.image,
        } : null,
      },
      user: {
        id: (session.user as any).id,
        name: (session.user as any).name,
        email: (session.user as any).email,
      },
    }, { status: 201 });
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

    const q: any = { userId: (session.user as any).id };
    if (status) q.status = status;

    const bookings = await Booking.find(q)
      .sort({ createdAt: -1 })
      .lean();

    // Manually fetch related data for each booking
    const userColl = mongoose.connection.collection('users');
    const bookingsWithData = await Promise.all(
      bookings.map(async (booking: any) => {
        try {
          const dj = await DJProfile.findOne({ id: booking.djId }).lean();
          const djUser = dj ? await userColl.findOne({ id: dj.userId }) : null;

          return {
            ...booking,
            dj: dj ? {
              id: dj.id,
              user: djUser ? {
                id: djUser.id,
                name: djUser.name,
                email: djUser.email,
              } : null,
            } : null,
          };
        } catch (err) {
          console.error(`Failed to fetch data for booking ${booking.id}:`, err);
          return booking;
        }
      })
    );

    return NextResponse.json(bookingsWithData);
  } catch (error) {
    console.error("Get Bookings Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
