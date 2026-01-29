
import mongoose, { Schema, InferSchemaType } from "mongoose";


const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    
    // ========================= Forgot Password OTP =========================
    resetPasswordOtpHash: { type: String, default: null },
    resetPasswordOtpExpiresAt: { type: Date, default: null },
    resetPasswordOtpAttempts: { type: Number, default: 0 }, // count wrong tries
    resetPasswordOtpLastSentAt: { type: Date, default: null }, // basic rate limit
     isPremium: { type: Boolean, default: false },
  },
  { timestamps: true }
);


export type UserDoc = InferSchemaType<typeof userSchema> & mongoose.Document;
// Quan trọng: model "User" -> collection mặc định "users"
export const UserModel = mongoose.model("User", userSchema);
