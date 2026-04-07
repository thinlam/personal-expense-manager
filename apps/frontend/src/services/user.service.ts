import { api } from "./api";

export type Language = "vi" | "en";
export type Currency = "VND" | "USD" | "EUR";
export type DateFormat = "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";
export type NotificationChannel = "all" | "important" | "mute";

export type NotificationSettings = {
  transaction: boolean;
  budgetAlert: boolean;
  weeklyReport: boolean;
  emailReminder: boolean;
  pushNotification: boolean;
  channel: NotificationChannel;
};

export type PrivacyMode = "private" | "friends" | "public";

export type SecurityDevice = {
  deviceId: string;
  deviceName: string;
  platform: string;
  browser: string;
  lastActiveAt: string | Date;
  isCurrent: boolean;
};

export type SecuritySettings = {
  twoFactorEnabled: boolean;
  loginAlert: boolean;
  newDeviceAlert: boolean;
  transactionPin: boolean;
  hasPin?: boolean;
  profileVisibility: PrivacyMode;
};

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
  timeFormat?: "24h" | "12h";
  weekStart?: "mon" | "sun";
  notifications?: NotificationSettings;
  security?: SecuritySettings;
  securityDevices?: SecurityDevice[];
};

export type UpdateCurrentUserPayload = {
  name?: string;
  avatar?: string;
  language?: Language;
  currency?: Currency;
  dateFormat?: DateFormat;
  timeFormat?: "24h" | "12h";
  weekStart?: "mon" | "sun";
  notifications?: NotificationSettings;
  security?: SecuritySettings;
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

export async function changeMyPassword(payload: {
  currentPassword: string;
  newPassword: string;
}) {
  const res = await api.patch<{ message: string }>("/users/me/password", payload);
  return res.data;
}

export async function upsertMyPin(payload: { pin: string }) {
  const res = await api.patch<{
    message: string;
    user: CurrentUser;
  }>("/users/me/pin", payload);
  return res.data;
}

export async function logoutAllMyDevices() {
  const res = await api.post<{ message: string }>("/users/me/logout-all-devices");
  return res.data;
}
