import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

const s3Client = new S3Client({
  region: process.env.S3_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "",
    secretAccessKey: process.env.S3_SECRET_KEY || "",
  },
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true, // Important for MinIO
});

export interface UploadFileOptions {
  fileName: string;
  fileBuffer: Buffer;
  mimeType: string;
  folder?: string; // e.g., "dj-profiles", "credentials"
}

export interface UploadedFile {
  key: string;
  url: string;
  size: number;
}

/**
 * Upload a file to S3-compatible storage
 */
export async function uploadFile(
  options: UploadFileOptions
): Promise<UploadedFile> {
  const { fileName, fileBuffer, mimeType, folder = "uploads" } = options;

  // Generate unique key
  const fileExtension = fileName.split(".").pop();
  const uniqueKey = `${folder}/${uuidv4()}.${fileExtension}`;

  try {
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET || "djmarketplace",
      Key: uniqueKey,
      Body: fileBuffer,
      ContentType: mimeType,
      ACL: "public-read",
    });

    await s3Client.send(command);

    // Construct the public URL
    const endpoint = process.env.S3_ENDPOINT || "";
    const bucket = process.env.S3_BUCKET || "djmarketplace";
    const url = `${endpoint}/${bucket}/${uniqueKey}`;

    return {
      key: uniqueKey,
      url,
      size: fileBuffer.length,
    };
  } catch (error) {
    console.error("S3 Upload Error:", error);
    throw new Error("Failed to upload file");
  }
}

/**
 * Delete a file from S3
 */
export async function deleteFile(fileKey: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET || "djmarketplace",
      Key: fileKey,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error("S3 Delete Error:", error);
    throw new Error("Failed to delete file");
  }
}

/**
 * Get signed URL for temporary access
 */
export async function getSignedDownloadUrl(
  fileKey: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET || "djmarketplace",
      Key: fileKey,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error("Signed URL Error:", error);
    throw new Error("Failed to generate signed URL");
  }
}
