import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AuthService.register(req.body);
      return res.status(201).json({ success: true, data });
    } catch (e) {
      return next(e);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AuthService.login(req.body);
      return res.status(200).json({ success: true, data });
    } catch (e) {
      return next(e);
    }
  }
}
