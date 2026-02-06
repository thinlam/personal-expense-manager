import { Router } from "express";
import { AuthController } from "./auth.controller";

const router = Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reset-password", AuthController.resetPassword);
router.post("/register-init", AuthController.registerInit);     // ✅ gửi OTP
router.post("/verify-email-otp", AuthController.verifyEmailOtp); // ✅ xác minh + trả token
export default router;
