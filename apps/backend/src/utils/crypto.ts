import crypto from "crypto";

export function generateOtp6(): string {
  // 000000 - 999999
  const n = crypto.randomInt(0, 1_000_000);
  return String(n).padStart(6, "0");
}

export function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function timingSafeEqualHex(aHex: string, bHex: string): boolean {
  const a = Buffer.from(aHex, "hex");
  const b = Buffer.from(bHex, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
