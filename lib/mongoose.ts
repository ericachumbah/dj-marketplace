import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

if (!MONGODB_URI) {
  console.warn(
    "No MONGODB_URI or DATABASE_URL found in env. Mongoose will not connect automatically."
  );
}

const globalAny = global as any;

export async function connectToDatabase() {
  if (mongoose.connection.readyState >= 1) {
    return mongoose;
  }

  if (globalAny._mongoosePromise) {
    await globalAny._mongoosePromise;
    return mongoose;
  }

  try {
    globalAny._mongoosePromise = mongoose.connect(MONGODB_URI as string, {
      // useUnifiedTopology / useNewUrlParser are defaults in modern mongoose
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    const result = await globalAny._mongoosePromise;
    return result;
  } catch (error) {
    console.error("[MongoDB] Connection error:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}

export default mongoose;
