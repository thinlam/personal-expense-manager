import express from "express";
import cors from "cors";
import authRouter from "./modules/auth/auth.routes";
import dashboardRouter from "./modules/dashboard/dashboard.routes";
import userRouter from "./modules/users/user.routes";
// import walletRouter from "./modules/wallet/wallet.routes";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/dashboard", dashboardRouter);
  app.use("/api/users", userRouter);
  // app.use("/api/wallets", walletRouter);

  app.use((err: any, _req: any, res: any, _next: any) => {
    console.error("❌ ERROR:", err);
    res.status(500).json({ message: "Internal server error" });
  });

  return app;
}