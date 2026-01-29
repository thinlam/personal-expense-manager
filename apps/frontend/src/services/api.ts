import axios from "axios";
import { storage } from "../utils/storage";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // vd: http://localhost:4000/api
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  // ✅ (Option) Không gắn token cho login/register
  const url = config.url || "";
  const skipAuth =
    url.includes("/auth/login") ||
    url.includes("/auth/register") ||
    url.includes("/auth/forgot-password") ||
    url.includes("/auth/reset-password");

  if (!skipAuth) {
    const token = storage.getToken?.();
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  }

  return config;
});
