import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import path from "path";

import authRouter from "./modules/auth/auth.routes";
import dashboardRouter from "./modules/dashboard/dashboard.routes";
import transactionRouter from "./modules/transactions/transaction.routes";
import budgetRouter from "./modules/budgets/budget.routes";
import reportRouter from "./modules/reports/report.routes";
import walletRouter from "./modules/wallets/wallet.routes";
import userRouter from "./modules/users/user.routes";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );

  app.use(express.json({ limit: "2mb" }));

  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRouter);
  app.use("/api/dashboard", dashboardRouter);
  app.use("/api/transactions", transactionRouter);
  app.use("/api/budgets", budgetRouter);
  app.use("/api/reports", reportRouter);
  app.use("/api/wallets", walletRouter);
  app.use("/api/users", userRouter);

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ message: "Not found" });
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error("❌ ERROR:", err);
    res.status(500).json({ message: "Internal server error" });
  });

  return app;
}