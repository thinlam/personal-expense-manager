import { Request, Response } from "express";
import { registerSchema, loginSchema } from "./auth.schema";
import { AuthService } from "./auth.service";

export const AuthController = {
  async register(req: Request, res: Response) {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data", issues: parsed.error.issues });

    const result = await AuthService.register(parsed.data);
    if (!result.ok) return res.status(result.status).json({ message: result.message });

    return res.status(201).json(result.data);
  },

  async login(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data", issues: parsed.error.issues });

    const result = await AuthService.login(parsed.data);
    if (!result.ok) return res.status(result.status).json({ message: result.message });

    return res.status(200).json(result.data);
  },
};
