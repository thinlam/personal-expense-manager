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

export const authService = {
  async register(payload: RegisterPayload) {
    const res = await api.post<AuthSuccessDTO>("/auth/register", payload);
    return res.data;
  },

  async login(payload: LoginPayload) {
    const res = await api.post<AuthSuccessDTO>("/auth/login", payload);
    return res.data;
  },

  // ✅ thêm cái này
  async forgotPassword(payload: ForgotPasswordPayload) {
    const res = await api.post<ForgotPasswordDTO>("/auth/forgot-password", payload);
    return res.data;
  },

  // ✅ (tuỳ chọn, để làm bước OTP sau)
  async resetPassword(payload: ResetPasswordPayload) {
    const res = await api.post<ResetPasswordDTO>("/auth/reset-password", payload);
    return res.data;
  },
};
