import { UserModel } from "../users/user.model";
import { RegisterDto, LoginDto } from "./auth.dto";
import { hashPassword, comparePassword } from "../../utils/hash";
import { signAccessToken } from "../../utils/jwt";

export class AuthService {
  static async register(dto: RegisterDto) {
    const exists = await UserModel.findOne({ email: dto.email }).lean();
    if (exists) throw { status: 409, message: "Email already exists" };

    const passwordHash = await hashPassword(dto.password);

    const user = await UserModel.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
    });

    const token = signAccessToken({ sub: user._id.toString(), email: user.email });

    return {
      user: { id: user._id.toString(), name: user.name, email: user.email },
      token,
    };
  }

  static async login(dto: LoginDto) {
    const user = await UserModel.findOne({ email: dto.email });
    if (!user) throw { status: 401, message: "Invalid email or password" };

    const ok = await comparePassword(dto.password, user.passwordHash);
    if (!ok) throw { status: 401, message: "Invalid email or password" };

    const token = signAccessToken({ sub: user._id.toString(), email: user.email });

    return {
      user: { id: user._id.toString(), name: user.name, email: user.email },
      token,
    };
  }
}
