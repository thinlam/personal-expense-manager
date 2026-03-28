import { Types } from "mongoose";
import { TransactionModel, type TxType } from "./transaction.model";

export type ListParams = {
  userId: string;
  q?: string;
  wallet?: string;
  category?: string;
  tag?: string;
  from?: Date;
  to?: Date;
  range?: "DAY" | "WEEK" | "MONTH" | "YEAR";
};

function num(v: unknown, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeTags(input: unknown): string[] {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.map((x) => String(x).trim()).filter(Boolean).slice(0, 30);
  }
  if (typeof input === "string") {
    return input
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean)
      .slice(0, 30);
  }
  return [];
}

function normalizeSplits(input: unknown) {
  if (!Array.isArray(input)) return [];
  return input
    .map((s: any) => ({
      category: String(s?.category || "").trim(),
      amount: num(s?.amount, 0),
      note: String(s?.note || ""),
    }))
    .filter((x) => x.category && x.amount >= 0);
}

function normalizeAttachments(input: unknown) {
  if (!Array.isArray(input)) return [];
  return input
    .map((a: any) => ({
      filename: String(a?.filename || ""),
      url: String(a?.url || ""),
      mimeType: String(a?.mimeType || ""),
      size: num(a?.size || 0),
    }))
    .filter((x) => x.filename && x.url);
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}
function endOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

function rangeToDates(range: ListParams["range"]) {
  const now = new Date();
  if (!range) return {};

  if (range === "DAY") {
    return { from: startOfDay(now), to: endOfDay(now) };
  }

  if (range === "WEEK") {
    const day = now.getDay(); // 0..6
    const diff = (day + 6) % 7; // monday start
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
    const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
    return { from: startOfDay(monday), to: endOfDay(sunday) };
  }

  if (range === "MONTH") {
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from: startOfDay(first), to: endOfDay(last) };
  }

  // YEAR
  const first = new Date(now.getFullYear(), 0, 1);
  const last = new Date(now.getFullYear(), 11, 31);
  return { from: startOfDay(first), to: endOfDay(last) };
}

function buildQuery(p: ListParams) {
  const q: any = { userId: new Types.ObjectId(p.userId) };

  const r = rangeToDates(p.range);
  const from = p.from ?? (r as any).from;
  const to = p.to ?? (r as any).to;

  if (from || to) {
    q.date = {};
    if (from) q.date.$gte = from;
    if (to) q.date.$lte = to;
  }

  if (p.wallet) q.wallet = p.wallet;
  if (p.category) q.category = p.category;

  // 50: filter tag
  if (p.tag) q.tags = { $in: [p.tag] };

  // 49: search
  if (p.q) {
    const rx = new RegExp(escapeRegex(p.q), "i");
    q.$or = [{ title: rx }, { note: rx }, { payee: rx }, { category: rx }, { wallet: rx }, { tags: rx }];
  }

  return q;
}

function toCsv(items: any[]) {
  const header = [
    "date",
    "type",
    "amount",
    "currency",
    "originalAmount",
    "exchangeRateToBase",
    "title",
    "category",
    "wallet",
    "payee",
    "note",
    "tags",
  ].join(",");

  const esc = (s: any) => `"${String(s ?? "").replace(/"/g, '""')}"`;

  const rows = items.map((t: any) =>
    [
      esc(String(t.date).slice(0, 10)),
      esc(t.type),
      esc(t.amount),
      esc(t.currency),
      esc(t.originalAmount),
      esc(t.exchangeRateToBase),
      esc(t.title),
      esc(t.category),
      esc(t.wallet),
      esc(t.payee),
      esc(t.note),
      esc((t.tags ?? []).join("|")),
    ].join(",")
  );

  return [header, ...rows].join("\n");
}

export const transactionService = {
  async list(p: ListParams) {
    const q = buildQuery(p);
    return TransactionModel.find(q).sort({ date: -1, createdAt: -1 }).lean();
  },

  // dùng cho export (nếu muốn khác sort/fields)
  async exportList(p: ListParams) {
    const q = buildQuery(p);
    return TransactionModel.find(q).sort({ date: -1, createdAt: -1 }).lean();
  },

  // 58: export CSV string
  async exportCsv(p: ListParams) {
    const items = await this.exportList(p);
    return toCsv(items as any[]);
  },

  // 45
  async get(userId: string, id: string) {
    if (!Types.ObjectId.isValid(id)) return null;
    return TransactionModel.findOne({ _id: id, userId: new Types.ObjectId(userId) }).lean();
  },

  // 41–42 + 50/56/57/52–54
  async create(userId: string, payload: any) {
    const doc = await TransactionModel.create({
      userId: new Types.ObjectId(userId),

      type: payload.type as TxType,
      amount: num(payload.amount, 0),

      // 57
      currency: String(payload.currency || "VND"),
      exchangeRateToBase: num(payload.exchangeRateToBase, 1),
      originalAmount:
        payload.originalAmount === null || payload.originalAmount === undefined ? null : num(payload.originalAmount, 0),

      title: String(payload.title ?? ""),
      category: String(payload.category ?? ""),
      wallet: String(payload.wallet ?? "Ví chính"),
      date: payload.date ? new Date(payload.date) : new Date(),

      note: String(payload.note ?? ""),
      payee: String(payload.payee ?? ""),
      tags: normalizeTags(payload.tags),

      // 51/56
      attachments: normalizeAttachments(payload.attachments),
      splits: normalizeSplits(payload.splits),

      // 55
      refundOfId: payload.refundOfId ?? null,

      // 54/52/53
      installmentPlan: payload.installmentPlan ?? { enabled: false },
      recurring: payload.recurring ?? { enabled: false },
      reminder: payload.reminder ?? { enabled: false },
    });

    return doc.toObject();
  },

  // 43
  async update(userId: string, id: string, payload: any) {
    if (!Types.ObjectId.isValid(id)) return null;

    const set: any = {};

    if (payload.type !== undefined) set.type = payload.type;
    if (payload.amount !== undefined) set.amount = num(payload.amount, 0);

    if (payload.currency !== undefined) set.currency = String(payload.currency);
    if (payload.exchangeRateToBase !== undefined) set.exchangeRateToBase = num(payload.exchangeRateToBase, 1);
    if (payload.originalAmount !== undefined) {
      set.originalAmount = payload.originalAmount === null ? null : num(payload.originalAmount, 0);
    }

    if (payload.title !== undefined) set.title = String(payload.title);
    if (payload.category !== undefined) set.category = String(payload.category);
    if (payload.wallet !== undefined) set.wallet = String(payload.wallet);
    if (payload.date !== undefined) set.date = new Date(payload.date);

    if (payload.note !== undefined) set.note = String(payload.note ?? "");
    if (payload.payee !== undefined) set.payee = String(payload.payee ?? "");

    if (payload.tags !== undefined) set.tags = normalizeTags(payload.tags);

    if (payload.attachments !== undefined) set.attachments = normalizeAttachments(payload.attachments);
    if (payload.splits !== undefined) set.splits = normalizeSplits(payload.splits);

    if (payload.refundOfId !== undefined) set.refundOfId = payload.refundOfId ?? null;

    if (payload.installmentPlan !== undefined) set.installmentPlan = payload.installmentPlan;
    if (payload.recurring !== undefined) set.recurring = payload.recurring;
    if (payload.reminder !== undefined) set.reminder = payload.reminder;

    return TransactionModel.findOneAndUpdate(
      { _id: id, userId: new Types.ObjectId(userId) },
      { $set: set },
      { new: true }
    ).lean();
  },

  // 44
  async remove(userId: string, id: string) {
    if (!Types.ObjectId.isValid(id)) return { ok: false };
    await TransactionModel.deleteOne({ _id: id, userId: new Types.ObjectId(userId) });
    return { ok: true };
  },

  // 51: add attachment
  async addAttachment(
    userId: string,
    id: string,
    att: { filename: string; url: string; mimeType: string; size: number }
  ) {
    if (!Types.ObjectId.isValid(id)) return null;
    return TransactionModel.findOneAndUpdate(
      { _id: id, userId: new Types.ObjectId(userId) },
      { $push: { attachments: att } },
      { new: true }
    ).lean();
  },

  // 55: refund
  async refund(userId: string, id: string) {
    const origin = await this.get(userId, id);
    if (!origin) return null;

    const doc = await TransactionModel.create({
      userId: new Types.ObjectId(userId),
      type: "INCOME",
      amount: (origin as any).amount,

      currency: (origin as any).currency ?? "VND",
      exchangeRateToBase: (origin as any).exchangeRateToBase ?? 1,
      originalAmount: (origin as any).originalAmount ?? null,

      title: `Hoàn tiền: ${(origin as any).title}`,
      category: (origin as any).category,
      wallet: (origin as any).wallet,
      date: new Date(),

      note: `Refund of ${(origin as any)._id}`,
      payee: (origin as any).payee ?? "",
      tags: ["refund", ...(((origin as any).tags ?? []) as string[])].slice(0, 30),

      refundOfId: (origin as any)._id,
    });

    return doc.toObject();
  },
};