import { api } from "./api";
import type { AuthSuccessDTO, LoginPayload, RegisterPayload } from "../types/auth.type";

export const authService = {
  async register(payload: RegisterPayload) {
    const res = await api.post<AuthSuccessDTO>("/auth/register", payload);
    return res.data;
  },

  async login(payload: LoginPayload) {
    const res = await api.post<AuthSuccessDTO>("/auth/login", payload);
    return res.data;
  },
};
