import { postJSON } from "./api/client";

export type AuthResponse = {
  token: string;
  user: { id: string; name: string; email: string };
};

export function registerApi(payload: { name: string; email: string; password: string }) {
  return postJSON<AuthResponse>("/auth/register", payload);
}

export function loginApi(payload: { email: string; password: string }) {
  return postJSON<AuthResponse>("/auth/login", payload);
}
export function forgotPasswordApi(body: { email: string }) {
  return postJSON<{ message: string }>("/auth/forgot-password", body);
}

export function resetPasswordApi(body: { email: string; otp: string; newPassword: string }) {
  return postJSON<{ message: string }>("/auth/reset-password", body);
}