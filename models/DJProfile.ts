import mongoose from "mongoose";
const { Schema, model } = mongoose;
const models = mongoose.models as any;
import cuid from "cuid";

export interface IDJProfile {
  id: string;
  userId: string;
  bio?: string;
  genres?: string[];
  hourlyRate?: number;
  experience?: number;
  status?: "PENDING" | "VERIFIED" | "REJECTED" | "SUSPENDED";
  profileImage?: string;
  verifiedAt?: Date;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
  website?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const DJProfileSchema = new Schema(
  {
    id: { type: String, default: () => cuid(), index: true, unique: true },
    userId: { type: String, required: true, unique: true, index: true, ref: 'User' },
    bio: { type: String },
    genres: { type: [String], default: [] },
    hourlyRate: { type: Number, default: 0 },
    experience: { type: Number, default: 0 },
    status: { type: String, enum: ["PENDING", "VERIFIED", "REJECTED", "SUSPENDED"], default: "PENDING" },
    profileImage: { type: String },
    verifiedAt: { type: Date },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    phone: { type: String },
    instagram: { type: String },
    facebook: { type: String },
    youtube: { type: String },
    tiktok: { type: String },
    website: { type: String },
  },
  { timestamps: true }
);

export const DJProfile = models.DJProfile || model<IDJProfile>("DJProfile", DJProfileSchema);

export default DJProfile;
