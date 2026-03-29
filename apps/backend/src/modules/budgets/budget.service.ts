import { Types } from "mongoose";
import { BudgetModel, type PeriodType } from "./budget.model";
import { TransactionModel } from "../transactions/transaction.model";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toPeriodKeyMonth(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}
function endOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

export function calcPeriodEnd(periodType: PeriodType, periodStart: Date) {
  const s = startOfDay(periodStart);

  if (periodType === "WEEK") return endOfDay(new Date(s.getFullYear(), s.getMonth(), s.getDate() + 6));
  if (periodType === "MONTH") return endOfDay(new Date(s.getFullYear(), s.getMonth() + 1, 0));
  if (periodType === "QUARTER") {
    const q = Math.floor(s.getMonth() / 3);
    const endMonth = q * 3 + 2;
    return endOfDay(new Date(s.getFullYear(), endMonth + 1, 0));
  }
  // YEAR
  return endOfDay(new Date(s.getFullYear(), 12, 0));
}

async function sumExpense(userId: string, start: Date, end: Date, budget: any) {
  const query: any = {
    userId: new Types.ObjectId(userId),
    type: "EXPENSE",
    date: { $gte: start, $lte: end },
  };

  if (budget.wallet) query.wallet = budget.wallet;

  const group = Array.isArray(budget.groupCategories) ? budget.groupCategories : [];
  if (group.length > 0) query.category = { $in: group };
  else if (budget.category) query.category = budget.category;
  else if (budget.name) query.category = budget.name; // fallback tương thích dashboard

  const rows = await TransactionModel.find(query).select({ amount: 1 }).lean();
  return rows.reduce((s, r: any) => s + Number(r.amount || 0), 0);
}

async function autoCarryOverIfNeeded(userId: string, payload: any) {
  // 65: nếu bật carry-over và chưa truyền carryOverBalance -> tự tính từ kỳ trước (MONTH)
  if (!payload.carryOverEnabled) return 0;
  if (payload.carryOverBalance !== undefined && payload.carryOverBalance !== null) {
    return Number(payload.carryOverBalance || 0);
  }
  if (payload.periodType !== "MONTH") return 0;

  const start = new Date(payload.periodStart);
  const prevStart = new Date(start.getFullYear(), start.getMonth() - 1, 1);
  const prevKey = toPeriodKeyMonth(prevStart);

  // tìm budget kỳ trước cùng category/group/wallet
  const prev = await BudgetModel.findOne({
    userId: new Types.ObjectId(userId),
    periodKey: prevKey,
    wallet: payload.wallet ?? null,
    name: payload.name,
  }).lean();

  if (!prev) return 0;

  const prevPeriodStart = new Date(prev.periodStart || prevStart);
  const prevPeriodEnd = calcPeriodEnd(prev.periodType || "MONTH", prevPeriodStart);
  const spent = await sumExpense(userId, prevPeriodStart, prevPeriodEnd, prev);

  const effectivePrev = Number(prev.limit || 0) + Number(prev.carryOverBalance || 0);
  const remaining = effectivePrev - spent; // dư(+) / thiếu(-)

  return remaining;
}

export const budgetService = {
  // 59/60/61/66: tạo budget
  async create(userId: string, payload: any) {
    const periodStart = payload.periodStart ? new Date(payload.periodStart) : new Date();
    const periodType = (payload.periodType || "MONTH") as PeriodType;

    // dashboard compatibility: tháng -> periodKey "YYYY-MM"
    const periodKey = periodType === "MONTH" ? toPeriodKeyMonth(periodStart) : toPeriodKeyMonth(periodStart);

    const category = payload.category ? String(payload.category) : null;
    const groupCategories = Array.isArray(payload.groupCategories)
      ? payload.groupCategories.map((x: any) => String(x).trim()).filter(Boolean)
      : [];

    // name/limit: giữ cho dashboard
    const name =
      payload.name ||
      (payload.groupName ? String(payload.groupName) : category ? category : "Ngân sách");

    const limit = Number(payload.amount ?? payload.limit ?? 0);

    const carryOverBalance = await autoCarryOverIfNeeded(userId, {
      ...payload,
      periodStart,
      periodType,
      periodKey,
      name,
      limit,
      wallet: payload.wallet ?? null,
      carryOverEnabled: Boolean(payload.carryOverEnabled),
    });

    const doc = await BudgetModel.create({
      userId: new Types.ObjectId(userId),

      name,
      limit,
      periodKey,

      periodType,
      periodStart,

      category: category ?? null,
      groupName: payload.groupName ?? null,
      groupCategories,

      wallet: payload.wallet ?? null,

      carryOverEnabled: Boolean(payload.carryOverEnabled),
      carryOverBalance: Number(carryOverBalance || 0),

      warnAt80: payload.warnAt80 !== false,
      warnAt90: payload.warnAt90 !== false,
      warnOver: payload.warnOver !== false,

      history: [],
    });

    return doc.toObject();
  },

  async list(userId: string, params: any) {
    const q: any = { userId: new Types.ObjectId(userId) };
    if (params.periodType) q.periodType = params.periodType;
    if (params.periodKey) q.periodKey = params.periodKey;
    if (params.wallet) q.wallet = params.wallet;
    if (params.category) q.category = params.category;
    return BudgetModel.find(q).sort({ periodStart: -1, createdAt: -1 }).lean();
  },

  async get(userId: string, id: string) {
    if (!Types.ObjectId.isValid(id)) return null;
    return BudgetModel.findOne({ _id: id, userId: new Types.ObjectId(userId) }).lean();
  },

  // 68: update + lưu lịch sử
  async update(userId: string, id: string, payload: any) {
    if (!Types.ObjectId.isValid(id)) return null;

    const current = await BudgetModel.findOne({ _id: id, userId: new Types.ObjectId(userId) }).lean();
    if (!current) return null;

    const set: any = {};

    if (payload.name !== undefined) set.name = String(payload.name);
    if (payload.amount !== undefined) set.limit = Number(payload.amount);
    if (payload.limit !== undefined) set.limit = Number(payload.limit);

    if (payload.periodType !== undefined) set.periodType = payload.periodType;
    if (payload.periodStart !== undefined) {
      const ps = new Date(payload.periodStart);
      set.periodStart = ps;
      set.periodKey = toPeriodKeyMonth(ps);
    }

    if (payload.category !== undefined) set.category = payload.category ? String(payload.category) : null;
    if (payload.wallet !== undefined) set.wallet = payload.wallet ? String(payload.wallet) : null;

    if (payload.groupName !== undefined) set.groupName = payload.groupName ? String(payload.groupName) : null;
    if (payload.groupCategories !== undefined) {
      set.groupCategories = Array.isArray(payload.groupCategories)
        ? payload.groupCategories.map((x: any) => String(x).trim()).filter(Boolean)
        : [];
    }

    if (payload.carryOverEnabled !== undefined) set.carryOverEnabled = Boolean(payload.carryOverEnabled);
    if (payload.carryOverBalance !== undefined) set.carryOverBalance = Number(payload.carryOverBalance || 0);

    if (payload.warnAt80 !== undefined) set.warnAt80 = Boolean(payload.warnAt80);
    if (payload.warnAt90 !== undefined) set.warnAt90 = Boolean(payload.warnAt90);
    if (payload.warnOver !== undefined) set.warnOver = Boolean(payload.warnOver);

    const after = { ...current, ...set };

    return BudgetModel.findOneAndUpdate(
      { _id: id, userId: new Types.ObjectId(userId) },
      {
        $set: set,
        $push: { history: { at: new Date(), before: current, after, note: payload.note ?? "" } },
      },
      { new: true }
    ).lean();
  },

  async remove(userId: string, id: string) {
    if (!Types.ObjectId.isValid(id)) return { ok: false };
    await BudgetModel.deleteOne({ _id: id, userId: new Types.ObjectId(userId) });
    return { ok: true };
  },

  // 62/63/64: usage realtime + cảnh báo
  async usage(userId: string, id: string) {
    const b = await this.get(userId, id);
    if (!b) return null;

    const periodStart = new Date(b.periodStart);
    const periodEnd = calcPeriodEnd(b.periodType as PeriodType, periodStart);

    const spent = await sumExpense(userId, periodStart, periodEnd, b);

    const limit = Number((b as any).limit || 0);
    const carry = Number((b as any).carryOverBalance || 0);
    const effective = Math.max(0, limit + carry);
    const percent = effective > 0 ? (spent / effective) * 100 : 0;

    const alerts: string[] = [];
    if ((b as any).warnAt80 && percent >= 80 && percent < 90) alerts.push("NEAR_80");
    if ((b as any).warnAt90 && percent >= 90 && percent < 100) alerts.push("NEAR_90");
    if ((b as any).warnOver && percent >= 100) alerts.push("OVER");

    return {
      periodStart,
      periodEnd,
      limit,
      carryOverBalance: carry,
      effectiveBudget: effective,
      spent,
      remaining: effective - spent,
      percent,
      alerts,
    };
  },

  // 67: so sánh ngân sách vs thực chi (trả budget + usage)
  async compare(userId: string, id: string) {
    const b = await this.get(userId, id);
    if (!b) return null;
    const u = await this.usage(userId, id);
    return { budget: b, usage: u };
  },

  // 68: lịch sử thay đổi
  async history(userId: string, id: string) {
    const b = await this.get(userId, id);
    if (!b) return null;
    return (b as any).history ?? [];
  },
};