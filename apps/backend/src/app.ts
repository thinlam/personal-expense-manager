import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import path from "path";

import authRouter from "./modules/auth/auth.routes";
import dashboardRouter from "./modules/dashboard/dashboard.routes";
import transactionRouter from "./modules/transactions/transaction.routes";
import budgetRouter from "./modules/budgets/budget.routes";
// import walletRouter from "./modules/wallet/wallet.routes";

export function createApp() {
  const app = express();

  // ✅ CORS (FE gọi API + gửi Authorization)
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );

  // ✅ body json
  app.use(express.json({ limit: "2mb" }));

  // ✅ serve uploads (cho chức năng upload hoá đơn/ảnh)
  // URL: http://localhost:4000/uploads/<filename>
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // ✅ health
  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  // ✅ routes
  app.use("/api/auth", authRouter);
  app.use("/api/dashboard", dashboardRouter);
  app.use("/api/transactions", transactionRouter);

  // ✅ Budgets (F. 59–68)
  app.use("/api/budgets", budgetRouter);

  // app.use("/api/wallets", walletRouter);

  // ✅ 404 (không match route nào)
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ message: "Not found" });
  });

  // ✅ error handler (phải đủ 4 params)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error("❌ ERROR:", err);
    res.status(500).json({ message: "Internal server error" });
  });

  return app;
}