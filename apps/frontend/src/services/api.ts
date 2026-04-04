import axios from "axios";
import { storage } from "../utils/storage";

const API_URL = import.meta.env.VITE_API_URL?.trim();

if (!API_URL) {
  console.error("Missing VITE_API_URL");
}

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
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
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
  }

  return config;
});