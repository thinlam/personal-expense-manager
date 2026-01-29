import { Router } from "express";
import { WalletModel } from "./wallet.model";
import { requireAuth, type AuthRequest } from "../auth/auth.middleware";

const r = Router();

// GET /api/wallets
r.get("/", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const wallets = await WalletModel.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
  res.json(wallets.map((w) => w.toJSON()));
});

// POST /api/wallets
r.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { name, type = "CASH", currency = "VND", balance = 0 } = req.body ?? {};
    if (!name?.trim()) return res.status(400).json({ message: "Tên ví không được trống." });

    const hasAny = await WalletModel.exists({ userId, isHidden: false });
    const isDefault = !hasAny;

    const created = await WalletModel.create({
      userId,
      name: name.trim(),
      type,
      currency,
      balance: Number(balance || 0),
      isDefault,
    });

    res.json(created.toJSON());
  } catch (e: any) {
    res.status(400).json({ message: e?.message || "Create wallet failed" });
  }
});

// PATCH /api/wallets/:id
r.patch("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { name, type, currency, balance } = req.body ?? {};

    const w = await WalletModel.findOne({ _id: id, userId });
    if (!w) return res.status(404).json({ message: "Ví không tồn tại." });

    if (typeof name === "string") w.name = name.trim();
    if (type) w.type = type;
    if (currency) w.currency = currency;
    if (balance !== undefined) w.balance = Number(balance || 0);

    await w.save();
    res.json(w.toJSON());
  } catch (e: any) {
    res.status(400).json({ message: e?.message || "Update wallet failed" });
  }
});

// DELETE /api/wallets/:id (soft delete)
r.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const w = await WalletModel.findOne({ _id: id, userId });
    if (!w) return res.status(404).json({ message: "Ví không tồn tại." });

    w.isHidden = true;
    w.isDefault = false;
    await w.save();

    // nếu xóa ví default => set default mới
    const anyDefault = await WalletModel.exists({ userId, isHidden: false, isDefault: true });
    if (!anyDefault) {
      const next = await WalletModel.findOne({ userId, isHidden: false }).sort({ createdAt: -1 });
      if (next) {
        next.isDefault = true;
        await next.save();
      }
    }

    res.json({ ok: true });
  } catch (e: any) {
    res.status(400).json({ message: e?.message || "Delete wallet failed" });
  }
});

// POST /api/wallets/:id/set-default
r.post("/:id/set-default", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const w = await WalletModel.findOne({ _id: id, userId, isHidden: false });
    if (!w) return res.status(404).json({ message: "Ví không tồn tại." });

    await WalletModel.updateMany({ userId }, { $set: { isDefault: false } });
    w.isDefault = true;
    await w.save();

    res.json({ ok: true });
  } catch (e: any) {
    res.status(400).json({ message: e?.message || "Set default failed" });
  }
});

export default r;
