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
    authVersion: { type: Number, default: 0 },

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

    dateFormat: {
      type: String,
      enum: ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"],
      default: "DD/MM/YYYY",
    },

    timeFormat: {
      type: String,
      enum: ["24h", "12h"],
      default: "24h",
    },

    weekStart: {
      type: String,
      enum: ["mon", "sun"],
      default: "mon",
    },

    notifications: {
      transaction: { type: Boolean, default: true },
      budgetAlert: { type: Boolean, default: true },
      weeklyReport: { type: Boolean, default: false },
      emailReminder: { type: Boolean, default: true },
      pushNotification: { type: Boolean, default: true },
      channel: {
        type: String,
        enum: ["all", "important", "mute"],
        default: "important",
      },
    },

    security: {
      twoFactorEnabled: { type: Boolean, default: false },
      loginAlert: { type: Boolean, default: true },
      newDeviceAlert: { type: Boolean, default: true },
      transactionPin: { type: Boolean, default: false },
      hasPin: { type: Boolean, default: false },
      pinHash: { type: String, default: "", select: false },
      profileVisibility: {
        type: String,
        enum: ["private", "friends", "public"],
        default: "private",
      },
    },

    securityDevices: [
      {
        deviceId: { type: String, required: true },
        deviceName: { type: String, default: "Unknown Device" },
        platform: { type: String, default: "Unknown Platform" },
        browser: { type: String, default: "Unknown Browser" },
        lastActiveAt: { type: Date, default: Date.now },
        isCurrent: { type: Boolean, default: false },
      },
    ],

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
