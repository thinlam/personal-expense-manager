import { Request, Response } from "express";
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "./auth.schema";
import { AuthService } from "./auth.service";

export const AuthController = {
  async register(req: Request, res: Response) {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data", issues: parsed.error.issues });

    const result = await AuthService.register(parsed.data);
    if (!result.ok) return res.status((result as any).status || 400).json({ message: result.message });

    return res.status(201).json(result.data);
  },

  async login(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data", issues: parsed.error.issues });

    const result = await AuthService.login(parsed.data);
    if (!result.ok) return res.status((result as any).status || 400).json({ message: result.message });

    return res.status(200).json(result.data);
  },

  async forgotPassword(req: Request, res: Response) {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data", issues: parsed.error.issues });

    const result = await AuthService.forgotPassword(parsed.data);
    // thường ok=true để chống dò email, nhưng vẫn xử lý cho chắc
    if (!result.ok) return res.status(result.astatus).json({ message: result.message });

    return res.status(200).json({ message: result.message });
  },

  async resetPassword(req: Request, res: Response) {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data", issues: parsed.error.issues });

    const result = await AuthService.resetPassword(parsed.data);
    if (!result.ok) return res.status(result.status).json({ message: result.message });

    return res.status(200).json({ message: result.message });
  },
};
