import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Generate a mock URL with a proper image (in production, upload to S3)
    const timestamp = Date.now();
    const initials = (session.user.name || "DJ").split(" ").map(n => n[0]).join("").toUpperCase();
    const mockUrl = `https://ui-avatars.com/api/?name=${initials}&size=400&background=2563eb&color=fff`;

    return NextResponse.json(
      {
        url: mockUrl,
        key: `dj-files/${session.user.id}/${type}/${timestamp}`,
        size: file.size,
        type,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("File Upload Error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
