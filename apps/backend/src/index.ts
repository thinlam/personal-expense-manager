import "dotenv/config";
import type { IncomingMessage, ServerResponse } from "http";

import { createApp } from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";

const app = createApp();

let dbReadyPromise: Promise<void> | null = null;

function ensureDbConnection() {
  if (!dbReadyPromise) {
    dbReadyPromise = connectDB(env.MONGODB_URI)
      .then(() => undefined)
      .catch((error) => {
        dbReadyPromise = null;
        throw error;
      });
  }

  return dbReadyPromise;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  await ensureDbConnection();
  return app(req as any, res as any);
}