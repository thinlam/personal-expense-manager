import { api } from "./api";

export type AuthUser = { id: string; name: string; email: string };
export type AuthResponse = { user: AuthUser; token: string };

export async function register(payload: { name: string; email: string; password: string }) {
  const res = await api.post<{ success: boolean; data: AuthResponse }>("/api/auth/register", payload);
  const { token, user } = res.data.data;
  localStorage.setItem("access_token", token);
  localStorage.setItem("auth_user", JSON.stringify(user));
  return user;
}

export async function login(payload: { email: string; password: string }) {
  const res = await api.post<{ success: boolean; data: AuthResponse }>("/api/auth/login", payload);
  const { token, user } = res.data.data;
  localStorage.setItem("access_token", token);
  localStorage.setItem("auth_user", JSON.stringify(user));
  return user;
}

export function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("auth_user");
}

export function getCurrentUser(): AuthUser | null {
  const raw = localStorage.getItem("auth_user");
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}
