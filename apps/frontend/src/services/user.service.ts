import { api } from "./api";

export type DateFormat = "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";
export type TimeFormat = "12h" | "24h";

export type Language = "vi" | "en";
export type Currency = "VND" | "USD" | "EUR";
export type WeekStart = "mon" | "sun";

export type CurrentUser = {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  plan?: string;
  isPremium?: boolean;
  language?: Language;
  currency?: Currency;
  dateFormat?: DateFormat;
  timeFormat?: TimeFormat;
  weekStart?: WeekStart;
};

export type UpdateCurrentUserPayload = {
  name?: string;
  avatar?: string;
  language?: Language;
  currency?: Currency;
  dateFormat?: DateFormat;
  timeFormat?: TimeFormat;
  weekStart?: WeekStart;
};

export type UpdateCurrentUserResponse = {
  message: string;
  user: CurrentUser;
};

export async function getCurrentUser(): Promise<CurrentUser> {
  const res = await api.get<CurrentUser>("/users/me");
  return res.data;
}

export async function updateCurrentUser(
  payload: UpdateCurrentUserPayload
): Promise<UpdateCurrentUserResponse> {
  const res = await api.patch<UpdateCurrentUserResponse>("/users/me", payload);
  return res.data;
}