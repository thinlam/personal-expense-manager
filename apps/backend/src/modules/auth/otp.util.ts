import crypto from "crypto";

export function generateOtp6(): string {
  // 000000 - 999999
  const n = crypto.randomInt(0, 1000000);
  return String(n).padStart(6, "0");
}

export function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}
