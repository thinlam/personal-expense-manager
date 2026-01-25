import "dotenv/config";

const must = (k: string) => {
  const v = process.env[k];
  if (!v) throw new Error(`Missing env: ${k}`);
  return v;
};

export const env = {
  PORT: Number(process.env.PORT ?? 4000),
  MONGODB_URI: must("MONGODB_URI"),
  JWT_SECRET: must("JWT_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "7d",
};
