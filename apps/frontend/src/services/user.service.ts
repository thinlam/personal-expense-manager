import { api } from "./api";

export type DateFormat = "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";

export type CurrentUser = {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  plan?: string;
  isPremium?: boolean;
  language?: "vi" | "en";
  currency?: "VND" | "USD" | "EUR";
  dateFormat?: DateFormat;
  weekStart?: "mon" | "sun";
};

export async function getCurrentUser() {
  const res = await api.get<CurrentUser>("/users/me");
  return res.data;
}

export async function updateCurrentUser(payload: {
  name?: string;
  avatar?: string;
  language?: "vi" | "en";
  currency?: "VND" | "USD" | "EUR";
  dateFormat?: DateFormat;
  weekStart?: "mon" | "sun";
}) {
  const res = await api.patch<{
    message: string;
    user: CurrentUser;
  }>("/users/me", payload);

  return res.data;
}