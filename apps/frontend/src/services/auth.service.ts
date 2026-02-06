import { api } from "./api";
import type { AuthSuccessDTO, LoginPayload, RegisterPayload } from "../types/auth.type";

export type ForgotPasswordDTO = { message: string };
export type ForgotPasswordPayload = { email: string };

export type ResetPasswordDTO = { message: string };
export type ResetPasswordPayload = {
  email: string;
  otp: string;
  newPassword: string;
};

// ✅ NEW: Register init (gửi OTP verify email)
export type RegisterInitPayload = RegisterPayload; // { name, email, password }
export type RegisterInitDTO = { email?: string; message?: string } | any;

// ✅ NEW: Verify email OTP
export type VerifyEmailOtpPayload = { email: string; otp: string };
export type VerifyEmailOtpDTO = AuthSuccessDTO; // backend trả { token, user }

export const authService = {
  // ⚠️ Nếu bạn chuyển flow sang verify email thì register() có thể không trả token nữa.
  // Tạm giữ để không gãy chỗ khác.
  async register(payload: RegisterPayload) {
    const res = await api.post<AuthSuccessDTO>("/auth/register", payload);
    return res.data;
  },

  // ✅ NEW: gửi OTP xác minh email
  async registerInit(payload: RegisterInitPayload) {
    const res = await api.post<RegisterInitDTO>("/auth/register-init", payload);
    return res.data;
  },

  // ✅ NEW: xác minh OTP email => trả token + user
  async verifyEmailOtp(payload: VerifyEmailOtpPayload) {
    const res = await api.post<VerifyEmailOtpDTO>("/auth/verify-email-otp", payload);
    return res.data;
  },

  async login(payload: LoginPayload) {
    const res = await api.post<AuthSuccessDTO>("/auth/login", payload);
    return res.data;
  },

  async forgotPassword(payload: ForgotPasswordPayload) {
    const res = await api.post<ForgotPasswordDTO>("/auth/forgot-password", payload);
    return res.data;
  },

  async resetPassword(payload: ResetPasswordPayload) {
    const res = await api.post<ResetPasswordDTO>("/auth/reset-password", payload);
    return res.data;
  },
};
