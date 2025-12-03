import mongoose from "mongoose";
const { Schema, model } = mongoose;
const models = mongoose.models as any;
import cuid from "cuid";

export interface IEmailVerificationToken {
  id: string;
  email: string;
  token: string;
  expires: Date;
}

const EmailVerificationTokenSchema = new Schema<IEmailVerificationToken>(
  {
    id: { type: String, default: () => cuid(), index: true, unique: true },
    email: { type: String, required: true, index: true },
    token: { type: String, required: true, unique: true, index: true },
    expires: { type: Date, required: true },
  },
  { timestamps: true }
);

export const EmailVerificationToken =
  models.EmailVerificationToken ||
  model<IEmailVerificationToken>("EmailVerificationToken", EmailVerificationTokenSchema);

export default EmailVerificationToken;

