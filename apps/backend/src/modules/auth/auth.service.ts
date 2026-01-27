import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { UserModel } from "../users/user.model";
import { generateOtp6, sha256, timingSafeEqualHex } from "../../utils/crypto";
import { sendForgotPasswordOtpEmail } from "../shared/mailer";

const signToken = (payload: { userId: string; email: string }) =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

const OTP_TTL_MS = 10 * 60 * 1000; // 10 phút
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000; // 60 giây

export const AuthService = {
  async register(input: { name: string; email: string; password: string }) {
    const email = input.email.toLowerCase().trim();

    const existed = await UserModel.findOne({ email }).lean();
    if (existed) return { ok: false as const, status: 409, message: "Email đã tồn tại" };

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await UserModel.create({ name: input.name.trim(), email, passwordHash });

    const token = signToken({ userId: user._id.toString(), email: user.email });
    return {
      ok: true as const,
      data: { token, user: { id: user._id.toString(), name: user.name, email: user.email } },
    };
  },

  async login(input: { email: string; password: string }) {
    const email = input.email.toLowerCase().trim();
    const user = await UserModel.findOne({ email });
    if (!user) return { ok: false as const, status: 401, message: "Sai email hoặc mật khẩu" };

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) return { ok: false as const, status: 401, message: "Sai email hoặc mật khẩu" };

    const token = signToken({ userId: user._id.toString(), email: user.email });
    return {
      ok: true as const,
      data: { token, user: { id: user._id.toString(), name: user.name, email: user.email } },
    };
  },

  // ====== QUÊN MẬT KHẨU: GỬI OTP ======
  async forgotPassword(input: { email: string }) {
    const email = input.email.toLowerCase().trim();
    const user = await UserModel.findOne({ email });

    // chống dò email: luôn trả ok=true
    if (!user) {
      return {
        ok: true as const,
        message: "Nếu email tồn tại trong hệ thống, mã OTP đã được gửi để khôi phục mật khẩu.",
      };
    }

    const now = Date.now();
    const lastSentAt = user.resetPasswordOtpLastSentAt?.getTime?.() ?? 0;

    // rate limit gửi lại OTP
    if (now - lastSentAt < OTP_RESEND_COOLDOWN_MS) {
      return {
        ok: true as const,
        message: "Nếu email tồn tại trong hệ thống, mã OTP đã được gửi để khôi phục mật khẩu.",
      };
    }

    const otp = generateOtp6();
    user.resetPasswordOtpHash = sha256(otp);
    user.resetPasswordOtpExpiresAt = new Date(now + OTP_TTL_MS);
    user.resetPasswordOtpAttempts = 0;
    user.resetPasswordOtpLastSentAt = new Date(now);

    await user.save();
    await sendForgotPasswordOtpEmail(email, otp);

    return {
      ok: true as const,
      message: "Nếu email tồn tại trong hệ thống, mã OTP đã được gửi để khôi phục mật khẩu.",
    };
  },

  // ====== ĐẶT LẠI MẬT KHẨU: CHECK OTP + ĐỔI PASSWORDHASH ======
  async resetPassword(input: { email: string; otp: string; newPassword: string }) {
    const email = input.email.toLowerCase().trim();
    const otp = input.otp.trim();
    const newPassword = input.newPassword;

    const user = await UserModel.findOne({ email });
    if (!user || !user.resetPasswordOtpHash || !user.resetPasswordOtpExpiresAt) {
      return { ok: false as const, status: 400, message: "OTP không hợp lệ hoặc đã hết hạn" };
    }

    if (user.resetPasswordOtpExpiresAt.getTime() < Date.now()) {
      return { ok: false as const, status: 400, message: "OTP không hợp lệ hoặc đã hết hạn" };
    }

    if ((user.resetPasswordOtpAttempts ?? 0) >= OTP_MAX_ATTEMPTS) {
      return {
        ok: false as const,
        status: 429,
        message: "Bạn đã nhập sai OTP quá nhiều lần. Vui lòng gửi lại mã OTP.",
      };
    }

    const isValid = timingSafeEqualHex(user.resetPasswordOtpHash, sha256(otp));
    if (!isValid) {
      user.resetPasswordOtpAttempts = (user.resetPasswordOtpAttempts ?? 0) + 1;
      await user.save();
      return { ok: false as const, status: 400, message: "OTP không hợp lệ hoặc đã hết hạn" };
    }

    // đổi mật khẩu (đúng field bạn đang dùng)
    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;

    // clear OTP
    user.resetPasswordOtpHash = null;
    user.resetPasswordOtpExpiresAt = null;
    user.resetPasswordOtpAttempts = 0;
    user.resetPasswordOtpLastSentAt = null;

    await user.save();

    return { ok: true as const, message: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại." };
  },
};
