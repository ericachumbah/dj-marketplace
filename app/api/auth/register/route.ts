import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateVerificationToken, generateExpirationDate } from "@/lib/token";
import { sendVerificationEmail } from "@/lib/email";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
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
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (not verified yet)
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role as "USER" | "DJ" | "ADMIN",
        emailVerified: null, // Not verified until email is confirmed
      },
    });

    // Generate verification token
    const token = generateVerificationToken();
    const expiresAt = generateExpirationDate(24); // 24 hours

    // Store verification token
    await prisma.emailVerificationToken.create({
      data: {
        email,
        token,
        expires: expiresAt,
      },
    });

    // Send verification email
    const baseUrl =
      process.env.NEXTAUTH_URL ||
      (request.headers.get("x-forwarded-proto") === "https"
        ? "https"
        : "http") +
        "://" +
        (request.headers.get("x-forwarded-host") || request.headers.get("host"));

    const emailSent = await sendVerificationEmail(email, token, baseUrl);

    return NextResponse.json(
      {
        message: emailSent
          ? "Registration successful! Please check your email to verify your account."
          : "Registration successful! Email verification failed to send. Please contact support.",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: user.emailVerified,
        },
        emailSent,
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
