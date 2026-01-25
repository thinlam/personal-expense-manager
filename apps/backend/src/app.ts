import express from "express";
import cors from "cors";
import { authRouter } from "./modules/auth/auth.routes";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  app.use("/api/auth", authRouter);

  app.use((err: any, _req: any, res: any, _next: any) => {
    console.error("❌ ERROR:", err);
    res.status(500).json({ message: "Internal server error" });
  });

  return app;
}
