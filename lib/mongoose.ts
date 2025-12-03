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

  globalAny._mongoosePromise = mongoose.connect(MONGODB_URI as string, {
    // useUnifiedTopology / useNewUrlParser are defaults in modern mongoose
  });

  await globalAny._mongoosePromise;
  return mongoose;
}

export default mongoose;
