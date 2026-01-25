const ANDROID_EMULATOR = "http://10.0.2.2:4000/api";
const IOS_SIMULATOR = "http://localhost:4000/api";

// Bạn chọn 1 cái phù hợp môi trường đang chạy.
// Nếu bạn run Android emulator -> dùng ANDROID_EMULATOR
// Nếu iOS simulator -> dùng IOS_SIMULATOR
export const BASE_URL = ANDROID_EMULATOR;

export type ApiError = { message?: string; issues?: any };

export async function postJSON<T>(path: string, body: any, token?: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json().catch(() => ({}))) as any;
  if (!res.ok) {
    const msg = data?.message ?? `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}
