import express from "express";
import cors from "cors";

import authRouter from "./modules/auth/auth.routes";
import dashboardRouter from "./modules/dashboard/dashboard.routes";
import categoryRouter from "./modules/category/category.routes";

export function createApp() {
  const app = express();

  /* ================= MIDDLEWARE ================= */

  app.use(cors());
  app.use(express.json());

  /* ================= HEALTH CHECK ================= */

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  /* ================= ROUTES ================= */

  app.use("/api/auth", authRouter);
  app.use("/api/dashboard", dashboardRouter);
  app.use("/api/categories", categoryRouter);

  /* ================= 404 HANDLER ================= */

  app.use((req, res) => {
    res.status(404).json({
      message: `Route ${req.originalUrl} not found`,
    });
  });

  /* ================= ERROR HANDLER ================= */

  app.use(
    (
      err: any,
      _req: any,
      res: any,
      _next: any
    ) => {
      console.error("❌ ERROR:", err);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  );

  return app;
}
