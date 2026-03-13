import mongoose, { InferSchemaType } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },

    // ========================= Profile / Settings =========================
    avatar: { type: String, default: "" },
    language: {
      type: String,
      enum: ["vi", "en"],
      default: "vi",
    },
    currency: {
      type: String,
      enum: ["VND", "USD", "EUR"],
      default: "VND",
    },
    weekStart: {
      type: String,
      enum: ["mon", "sun"],
      default: "mon",
    },

    // ========================= Forgot Password OTP =========================
    resetPasswordOtpHash: { type: String, default: null },
    resetPasswordOtpExpiresAt: { type: Date, default: null },
    resetPasswordOtpAttempts: { type: Number, default: 0 },
    resetPasswordOtpLastSentAt: { type: Date, default: null },

    // ========================= Account Status =========================
    isPremium: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof userSchema> & mongoose.Document;

userSchema.virtual("plan").get(function () {
  return this.isPremium ? "PREMIUM PLUS" : "FREE";
});

userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

export const UserModel = mongoose.model("User", userSchema);