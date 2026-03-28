import { Schema, model, type InferSchemaType } from "mongoose";

const emailOtpSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    otpHash: { type: String, required: true },
    purpose: { type: String, enum: ["VERIFY_EMAIL"], default: "VERIFY_EMAIL", index: true },

    expiresAt: { type: Date, required: true, index: true },
    attempts: { type: Number, default: 0 },
    lastSentAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

// ✅ TTL index: tự xoá record khi hết hạn
emailOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type EmailOtpDoc = InferSchemaType<typeof emailOtpSchema>;
export const EmailOtpModel = model("EmailOtp", emailOtpSchema);
