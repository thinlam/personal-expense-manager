import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";

export type AuthRequest = Request & { userId?: string };

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as any;
    req.userId = payload.userId || payload.id || payload._id;
    if (!req.userId) return res.status(401).json({ message: "Invalid token payload" });
    next();
  } catch {
    return res.status(401).json({ message: "Invalid/expired token" });
  }
}
