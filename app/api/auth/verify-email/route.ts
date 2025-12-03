import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import EmailVerificationToken from "@/models/EmailVerificationToken";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  await connectToDatabase();
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    // Find the verification token
    const verificationToken = await EmailVerificationToken.findOne({ token }).lean();

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid verification token" },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (new Date() > verificationToken.expires) {
      // Delete expired token
      await EmailVerificationToken.deleteOne({ token });

      return NextResponse.json(
        { error: "Verification link has expired. Please register again." },
        { status: 400 }
      );
    }

    // Find the user by email
    const user = await User.findOne({ email: verificationToken.email }).lean();

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update user as verified
    await User.findOneAndUpdate({ id: user.id }, { emailVerified: new Date() });

    // Delete the verification token
    await EmailVerificationToken.deleteOne({ token });

    // Redirect to success page or signin
    return NextResponse.redirect(
      new URL(
        "/auth/email-verified?email=" + encodeURIComponent(user.email),
        request.url
      )
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Email verification failed" },
      { status: 500 }
    );
  }
}
