import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { UserModel } from "../users/user.model";

const signToken = (payload: { userId: string; email: string }) =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

export const AuthService = {
  async register(input: { name: string; email: string; password: string }) {
    const email = input.email.toLowerCase().trim();

    const existed = await UserModel.findOne({ email }).lean();
    if (existed) return { ok: false as const, status: 409, message: "Email đã tồn tại" };

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await UserModel.create({ name: input.name.trim(), email, passwordHash });

    console.log("✅ Created user:", user._id.toString(), user.email);

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
};
