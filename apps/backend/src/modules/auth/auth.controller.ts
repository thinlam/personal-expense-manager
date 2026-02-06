import { Request, Response } from "express";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  // ✅ NEW: bạn cần thêm 2 schema này trong auth.schema.ts (mình để ở dưới)
  registerInitSchema,
  verifyEmailOtpSchema,
} from "./auth.schema";
import { AuthService } from "./auth.service";

export const AuthController = {
  // ✅ NEW: Register init (tạo user pending + gửi OTP verify email)
  async registerInit(req: Request, res: Response) {
    const parsed = registerInitSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data", issues: parsed.error.issues });

    const result = await AuthService.registerInit(parsed.data);
    if (!result.ok) return res.status((result as any).status || 400).json({ message: result.message });

    // thường chỉ trả message + email
    return res.status(200).json(result.data ?? { email: parsed.data.email });
  },

  // ✅ NEW: Verify email OTP (xác minh → trả token + user)
 async verifyEmailOtp(req: Request, res: Response) {
  const parsed = verifyEmailOtpSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid data", issues: parsed.error.issues });

  const result = await AuthService.verifyEmailOtp(parsed.data);
  if (!result.ok) return res.status((result as any).status || 400).json({ message: result.message });

  return res.status(200).json(result.data); // ✅ token + user
},

  // (Bạn có thể giữ register route cũ để FE không phải đổi nhiều)
  async register(req: Request, res: Response) {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data", issues: parsed.error.issues });

    const result = await AuthService.register(parsed.data);
    if (!result.ok) return res.status((result as any).status || 400).json({ message: result.message });

    // vì register() mình đã map sang registerInit() trong AuthService
    // nên result.data có thể chỉ là { email } thay vì token
    return res.status(201).json(result.data ?? { ok: true });
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
    // ✅ FIX: result.astatus -> result.status
    if (!result.ok) return res.status((result as any).status || 400).json({ message: result.message });

    return res.status(200).json({ message: result.message });
  },

  async resetPassword(req: Request, res: Response) {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data", issues: parsed.error.issues });

    const result = await AuthService.resetPassword(parsed.data);
    if (!result.ok) return res.status((result as any).status || 400).json({ message: result.message });

    return res.status(200).json({ message: result.message });
  },
};
