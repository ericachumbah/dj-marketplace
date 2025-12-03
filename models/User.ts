import mongoose from "mongoose";
const { Schema, model } = mongoose;
const models = mongoose.models as any;
import cuid from "cuid";

export interface IUser {
  id: string;
  name?: string;
  email: string;
  emailVerified?: Date | null;
  password?: string | null;
  image?: string | null;
  role: "USER" | "DJ" | "ADMIN";
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    id: { type: String, default: () => cuid(), index: true, unique: true },
    name: { type: String },
    email: { type: String, required: true, unique: true, index: true },
    emailVerified: { type: Date, default: null },
    password: { type: String, default: null },
    image: { type: String, default: null },
    role: { type: String, enum: ["USER", "DJ", "ADMIN"], default: "USER" },
  },
  { timestamps: true }
);

// Ensure we don't overwrite existing model during HMR in dev
export const User = models.User || model<IUser>("User", UserSchema);

export default User;
