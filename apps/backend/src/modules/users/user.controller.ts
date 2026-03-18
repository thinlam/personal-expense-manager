import { Response } from "express";
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

    const { name, avatar, language, currency, weekStart } = req.body;

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        ...(name !== undefined ? { name } : {}),
        ...(avatar !== undefined ? { avatar } : {}),
        ...(language !== undefined ? { language } : {}),
        ...(currency !== undefined ? { currency } : {}),
        ...(weekStart !== undefined ? { weekStart } : {}),
      },
      { new: true, runValidators: true }
    ).select("-passwordHash");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      message: "Cập nhật hồ sơ thành công",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error,
    });
  }
}