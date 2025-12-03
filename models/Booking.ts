import mongoose from "mongoose";
const { Schema, model } = mongoose;
const models = mongoose.models as any;
import cuid from "cuid";

export interface IBooking {
  id: string;
  userId: string;
  djId: string;
  eventDate: Date;
  eventDuration: number;
  eventLocation: string;
  eventType: string;
  eventNotes?: string;
  status?: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  confirmedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  quotedPrice?: number;
  finalPrice?: number;
  contactEmail?: string;
  contactPhone?: string;
}

const BookingSchema = new Schema<IBooking>(
  {
    id: { type: String, default: () => cuid(), index: true, unique: true },
    userId: { type: String, required: true, index: true, ref: 'User' },
    djId: { type: String, required: true, index: true, ref: 'DJProfile' },
    eventDate: { type: Date, required: true },
    eventDuration: { type: Number, required: true },
    eventLocation: { type: String, required: true },
    eventType: { type: String, required: true },
    eventNotes: { type: String },
    status: { type: String, enum: ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"], default: "PENDING" },
    confirmedAt: { type: Date },
    completedAt: { type: Date },
    cancelledAt: { type: Date },
    cancellationReason: { type: String },
    quotedPrice: { type: Number },
    finalPrice: { type: Number },
    contactEmail: { type: String },
    contactPhone: { type: String },
  },
  { timestamps: true }
);

export const Booking = models.Booking || model<IBooking>("Booking", BookingSchema);

export default Booking;
