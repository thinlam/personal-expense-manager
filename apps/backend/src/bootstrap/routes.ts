import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes";

export function buildRoutes() {
  const router = Router();
  router.get("/health", (_req, res) => res.json({ ok: true }));
  router.use("/auth", authRouter);
  return router;
}
