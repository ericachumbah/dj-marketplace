import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/storage";

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
    const type = formData.get("type") as string; // 'profile', 'portfolio', or 'credential'

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

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(buffer);

    // Upload to S3
    const uploaded = await uploadFile({
      fileName: file.name,
      fileBuffer,
      mimeType: file.type,
      folder: `dj-files/${session.user.id}/${type}`,
    });

    // Update DJ profile with file URL
    const djProfile = await prisma.dJProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!djProfile) {
      return NextResponse.json(
        { error: "DJ profile not found" },
        { status: 404 }
      );
    }

    if (type === "profile") {
      await prisma.dJProfile.update({
        where: { id: djProfile.id },
        data: { profileImage: uploaded.url },
      });
    } else if (type === "portfolio") {
      await prisma.dJProfile.update({
        where: { id: djProfile.id },
        data: { portfolioUrl: uploaded.url },
      });
    } else if (type === "credential") {
      // Add to credentials array
      const updatedCredentials = [...(djProfile.credentials || []), uploaded.url];
      await prisma.dJProfile.update({
        where: { id: djProfile.id },
        data: { credentials: updatedCredentials },
      });
    }

    return NextResponse.json(
      {
        url: uploaded.url,
        key: uploaded.key,
        size: uploaded.size,
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
