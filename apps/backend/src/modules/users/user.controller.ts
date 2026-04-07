import { Response } from "express";
import bcrypt from "bcrypt";
import { AuthRequest } from "../auth/auth.middleware";
import { UserModel } from "./user.model";

export async function getMe(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId || req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await UserModel.findById(userId).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error,
    });
  }
}

export async function updateMe(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId || req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      name,
      avatar,
      language,
      currency,
      dateFormat,
      timeFormat,
      weekStart,
      notifications,
      security,
    } = req.body;

    const updatePayload: Record<string, unknown> = {
      ...(name !== undefined ? { name } : {}),
      ...(avatar !== undefined ? { avatar } : {}),
      ...(language !== undefined ? { language } : {}),
      ...(currency !== undefined ? { currency } : {}),
      ...(dateFormat !== undefined ? { dateFormat } : {}),
      ...(timeFormat !== undefined ? { timeFormat } : {}),
      ...(weekStart !== undefined ? { weekStart } : {}),
      ...(notifications !== undefined ? { notifications } : {}),
    };

    if (security !== undefined) {
      if (security?.twoFactorEnabled !== undefined) {
        updatePayload["security.twoFactorEnabled"] = Boolean(
          security.twoFactorEnabled
        );
      }
      if (security?.loginAlert !== undefined) {
        updatePayload["security.loginAlert"] = Boolean(security.loginAlert);
      }
      if (security?.newDeviceAlert !== undefined) {
        updatePayload["security.newDeviceAlert"] = Boolean(
          security.newDeviceAlert
        );
      }
      if (security?.transactionPin !== undefined) {
        updatePayload["security.transactionPin"] = Boolean(
          security.transactionPin
        );
      }
      if (security?.hasPin !== undefined) {
        updatePayload["security.hasPin"] = Boolean(security.hasPin);
      }
      if (security?.profileVisibility !== undefined) {
        updatePayload["security.profileVisibility"] = security.profileVisibility;
      }
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      updatePayload,
      { new: true, runValidators: true }
    ).select("-passwordHash");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      message: "Cập nhật thiết lập thành công",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error,
    });
  }
}

export async function changeMyPassword(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId || req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const currentPassword = String(req.body?.currentPassword || "");
    const newPassword = String(req.body?.newPassword || "");

    if (currentPassword.length < 6 || newPassword.length < 6) {
      return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự" });
    }

    const user = await UserModel.findById(userId).select("+passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error,
    });
  }
}

export async function upsertMyPin(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId || req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const pin = String(req.body?.pin || "").trim();
    if (!/^\d{4,6}$/.test(pin)) {
      return res.status(400).json({ message: "Mã PIN phải gồm 4 đến 6 chữ số" });
    }

    const user = await UserModel.findById(userId).select("+security.pinHash -passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const pinHash = await bcrypt.hash(pin, 10);
    const security = (user as any).security || {};
    security.pinHash = pinHash;
    security.hasPin = true;
    security.transactionPin = true;
    (user as any).security = security;
    await user.save();

    const refreshed = await UserModel.findById(userId).select("-passwordHash");

    return res.json({
      message: "Cập nhật mã PIN thành công",
      user: refreshed,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error,
    });
  }
}

export async function logoutAllMyDevices(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId || req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const current = Array.isArray((user as any).securityDevices)
      ? (user as any).securityDevices.find((d: any) => d.isCurrent)
      : null;

    (user as any).authVersion = Number((user as any).authVersion || 0) + 1;
    (user as any).securityDevices = current ? [{ ...current.toObject?.(), isCurrent: true }] : [];
    await user.save();

    return res.json({ message: "Đã đăng xuất tất cả thiết bị" });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error,
    });
  }
}
