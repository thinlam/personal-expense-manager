import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { UserModel } from "../users/user.model";

export interface AuthRequest extends Request {
  userId?: string;
  user?: {
    userId: string;
    email?: string;
  };
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as {
      userId?: string;
      id?: string;
      _id?: string;
      email?: string;
      authVersion?: number;
    };

    const resolvedUserId = payload.userId || payload.id || payload._id;

    if (!resolvedUserId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const user = await UserModel.findById(resolvedUserId).select("authVersion");
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const tokenVersion = Number(payload.authVersion || 0);
    const currentVersion = Number((user as any).authVersion || 0);
    if (tokenVersion !== currentVersion) {
      return res.status(401).json({ message: "Phiên đăng nhập đã hết hiệu lực" });
    }

    req.userId = resolvedUserId;
    req.user = {
      userId: resolvedUserId,
      email: payload.email,
    };

    next();
  } catch {
    return res.status(401).json({ message: "Invalid/expired token" });
  }
}
