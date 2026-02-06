import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { UserModel } from "../users/user.model";
import { EmailOtpModel } from "./emailOtp.model";
import { generateOtp6, sha256, timingSafeEqualHex } from "../../utils/crypto";
import { sendForgotPasswordOtpEmail, sendVerifyEmailOtpEmail } from "../shared/mailer";

const signToken = (payload: { userId: string; email: string }) =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

const OTP_TTL_MS = 10 * 60 * 1000; // 10 phút
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000; // 60 giây

export const AuthService = {
  // =========================
  // ✅ REGISTER INIT: tạo user (emailVerified=false) + gửi OTP verify email
  // =========================
  async registerInit(input: { name: string; email: string; password: string }) {
    const email = input.email.toLowerCase().trim();
    const name = input.name.trim();

    const existed = await UserModel.findOne({ email });
    if (existed) {
      // Nếu đã verify rồi => email đã dùng
      if (existed.emailVerified) {
        return { ok: false as const, status: 409, message: "Email đã tồn tại" };
      }
      // Nếu chưa verify => cho resend OTP (không tạo user mới)
    } else {
      const passwordHash = await bcrypt.hash(input.password, 10);
      await UserModel.create({ name, email, passwordHash, emailVerified: false });
    }

    // cooldown resend
    const last = await EmailOtpModel.findOne({ email, purpose: "VERIFY_EMAIL" }).sort({ createdAt: -1 });
    const lastSentAt = last?.lastSentAt?.getTime?.() ?? 0;
    if (Date.now() - lastSentAt < OTP_RESEND_COOLDOWN_MS) {
      return {
        ok: true as const,
        message: "Nếu email hợp lệ, OTP đã được gửi. Vui lòng chờ một chút trước khi gửi lại.",
      };
    }

    // xoá OTP cũ
    await EmailOtpModel.deleteMany({ email, purpose: "VERIFY_EMAIL" });

    const otp = generateOtp6();
    await EmailOtpModel.create({
      email,
      purpose: "VERIFY_EMAIL",
      otpHash: sha256(otp),
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
      attempts: 0,
      lastSentAt: new Date(),
    });

    await sendVerifyEmailOtpEmail(email, otp);

    return {
      ok: true as const,
      message: "Đã gửi OTP xác minh email. Vui lòng kiểm tra hộp thư.",
      data: { email },
    };
  },

  // =========================
  // ✅ VERIFY EMAIL OTP: xác minh => emailVerified=true + trả token (auto login)
  // =========================
  async verifyEmailOtp(input: { email: string; otp: string }) {
    const email = input.email.toLowerCase().trim();
    const otp = input.otp.trim();

    const rec = await EmailOtpModel.findOne({ email, purpose: "VERIFY_EMAIL" });
    if (!rec) return { ok: false as const, status: 400, message: "OTP không hợp lệ hoặc đã hết hạn" };

    if (rec.expiresAt.getTime() < Date.now()) {
      await EmailOtpModel.deleteOne({ _id: rec._id });
      return { ok: false as const, status: 400, message: "OTP không hợp lệ hoặc đã hết hạn" };
    }

    if ((rec.attempts ?? 0) >= OTP_MAX_ATTEMPTS) {
      return { ok: false as const, status: 429, message: "Bạn đã nhập sai OTP quá nhiều lần. Vui lòng gửi lại OTP." };
    }

    const isValid = timingSafeEqualHex(rec.otpHash, sha256(otp));
    if (!isValid) {
      rec.attempts = (rec.attempts ?? 0) + 1;
      await rec.save();
      return { ok: false as const, status: 400, message: "OTP không hợp lệ hoặc đã hết hạn" };
    }

    const user = await UserModel.findOne({ email });
    if (!user) return { ok: false as const, status: 404, message: "Không tìm thấy tài khoản" };

    user.emailVerified = true;
    await user.save();

    // clear otp record
    await EmailOtpModel.deleteMany({ email, purpose: "VERIFY_EMAIL" });

    const token = signToken({ userId: user._id.toString(), email: user.email });

    return {
      ok: true as const,
      message: "Xác minh email thành công.",
      data: { token, user: { id: user._id.toString(), name: user.name, email: user.email, emailVerified: true } },
    };
  },

  // (optional) resend riêng — thực ra registerInit đã cover resend khi user tồn tại nhưng chưa verify
  async resendVerifyEmailOtp(input: { email: string }) {
    const email = input.email.toLowerCase().trim();

    const user = await UserModel.findOne({ email });
    if (!user || user.emailVerified) {
      // chống dò email: vẫn trả ok=true
      return { ok: true as const, message: "Nếu email hợp lệ, OTP đã được gửi." };
    }

    // reuse logic: gọi lại registerInit với dummy name/password không đẹp => nên viết như dưới
    const last = await EmailOtpModel.findOne({ email, purpose: "VERIFY_EMAIL" }).sort({ createdAt: -1 });
    const lastSentAt = last?.lastSentAt?.getTime?.() ?? 0;
    if (Date.now() - lastSentAt < OTP_RESEND_COOLDOWN_MS) {
      return { ok: true as const, message: "Nếu email hợp lệ, OTP đã được gửi. Vui lòng chờ trước khi gửi lại." };
    }

    await EmailOtpModel.deleteMany({ email, purpose: "VERIFY_EMAIL" });
    const otp = generateOtp6();
    await EmailOtpModel.create({
      email,
      purpose: "VERIFY_EMAIL",
      otpHash: sha256(otp),
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
      attempts: 0,
      lastSentAt: new Date(),
    });

    await sendVerifyEmailOtpEmail(email, otp);

    return { ok: true as const, message: "Nếu email hợp lệ, OTP đã được gửi." };
  },

  // =========================
  // ⚠️ REGISTER cũ: bạn có 2 lựa chọn
  // 1) Giữ register như cũ (đăng ký xong có token luôn) => không đúng flow verify email
  // 2) Đổi register thành gọi registerInit (khuyến nghị)
  // =========================
  async register(input: { name: string; email: string; password: string }) {
    // ✅ khuyến nghị: biến register thành registerInit để FE khỏi đổi nhiều
    return this.registerInit(input);
  },

  async login(input: { email: string; password: string }) {
    const email = input.email.toLowerCase().trim();
    const user = await UserModel.findOne({ email });
    if (!user) return { ok: false as const, status: 401, message: "Sai email hoặc mật khẩu" };

    // ✅ chặn login nếu chưa verify email
    if (!user.emailVerified) {
      return { ok: false as const, status: 403, message: "Email chưa được xác minh. Vui lòng kiểm tra OTP trong email." };
    }

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) return { ok: false as const, status: 401, message: "Sai email hoặc mật khẩu" };

    const token = signToken({ userId: user._id.toString(), email: user.email });
    return {
      ok: true as const,
      data: { token, user: { id: user._id.toString(), name: user.name, email: user.email, emailVerified: true } },
    };
  },

  // ====== QUÊN MẬT KHẨU: GỬI OTP ======
  async forgotPassword(input: { email: string }) {
    const email = input.email.toLowerCase().trim();
    const user = await UserModel.findOne({ email });

    if (!user) {
      return {
        ok: true as const,
        message: "Nếu email tồn tại trong hệ thống, mã OTP đã được gửi để khôi phục mật khẩu.",
      };
    }

    const now = Date.now();
    const lastSentAt = user.resetPasswordOtpLastSentAt?.getTime?.() ?? 0;

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

  // ====== ĐẶT LẠI MẬT KHẨU ======
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

    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;

    user.resetPasswordOtpHash = null;
    user.resetPasswordOtpExpiresAt = null;
    user.resetPasswordOtpAttempts = 0;
    user.resetPasswordOtpLastSentAt = null;

    await user.save();

    return { ok: true as const, message: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại." };
  },
};
