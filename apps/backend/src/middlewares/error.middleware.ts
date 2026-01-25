import { Request, Response, NextFunction } from "express";

export function errorMiddleware(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = err?.status ?? 500;
  const message = err?.message ?? "Internal Server Error";
  const details = err?.details;

  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error("[ERROR]", err);
  }

  return res.status(status).json({
    success: false,
    message,
    ...(details ? { details } : {}),
  });
}
