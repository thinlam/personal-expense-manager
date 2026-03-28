import { z } from "zod";
export const registerInitSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export const verifyEmailOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
});
export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export const forgotPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ").min(5).max(255),
});

export const resetPasswordSchema = z.object({
  email: z.string().email().min(5).max(255),
  otp: z.string().regex(/^\d{6}$/, "OTP phải gồm 6 chữ số"),
  newPassword: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự").max(72),
});