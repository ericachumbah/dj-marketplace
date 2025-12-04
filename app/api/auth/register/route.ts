import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { generateVerificationToken, generateExpirationDate } from "@/lib/token";
import { sendVerificationEmail } from "@/lib/email";
import { connectToDatabase } from "@/lib/mongoose";
import User from "@/models/User";
import EmailVerificationToken from "@/models/EmailVerificationToken";

export async function POST(request: NextRequest) {
  await connectToDatabase();
  try {
    const body = await request.json();
    const { email, password, name, role = "USER" } = body;

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await User.findOne({ email }).lean();
    console.log(`[Register] Checking email ${email}: ${existingUser ? 'EXISTS' : 'NOT FOUND'}`);

    if (existingUser) {
      console.log(`[Register] Existing user found:`, existingUser);
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    // In development: auto-verify email for easier testing
    // In production: require email verification
    const emailVerified = process.env.NODE_ENV === "development" ? new Date() : null;

    const userDoc = new User({
      email,
      name,
      password: hashedPassword,
      role: role as "USER" | "DJ" | "ADMIN",
      emailVerified,
    });
    const user = await userDoc.save();

    // Generate verification token
    const token = generateVerificationToken();
    const expiresAt = generateExpirationDate(24); // 24 hours

    // Store verification token (only in production)
    if (process.env.NODE_ENV === "production") {
      await EmailVerificationToken.create({
        email,
        token,
        expires: expiresAt,
      });
    }

    // Send verification email (only in production)
    let emailSent = false;
    if (process.env.NODE_ENV === "production") {
      const baseUrl =
        process.env.NEXTAUTH_URL ||
        (request.headers.get("x-forwarded-proto") === "https"
          ? "https"
          : "http") +
          "://" +
          (request.headers.get("x-forwarded-host") || request.headers.get("host"));

      emailSent = await sendVerificationEmail(email, token, baseUrl);
    }

    return NextResponse.json(
      {
        message: 
          process.env.NODE_ENV === "development"
            ? "Registration successful! You can now sign in."
            : emailSent
              ? "Registration successful! Please check your email to verify your account."
              : "Registration successful! Email verification failed to send. Please contact support.",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: user.emailVerified,
        },
        emailSent: process.env.NODE_ENV === "production" ? emailSent : false,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
