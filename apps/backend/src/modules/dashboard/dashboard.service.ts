import { Types } from "mongoose";
import { TransactionModel } from "../transactions/transaction.model";
import { BudgetModel } from "../budgets/budget.model";

type RangeKey = "THIS_MONTH" | "LAST_MONTH" | "THIS_YEAR";

function getRange(range: string) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  const key = (range || "THIS_MONTH") as RangeKey;

  let start: Date;
  let end: Date;

  if (key === "LAST_MONTH") {
    start = new Date(y, m - 1, 1, 0, 0, 0);
    end = new Date(y, m, 1, 0, 0, 0);
  } else if (key === "THIS_YEAR") {
    start = new Date(y, 0, 1, 0, 0, 0);
    end = new Date(y + 1, 0, 1, 0, 0, 0);
  } else {
    start = new Date(y, m, 1, 0, 0, 0);
    end = new Date(y, m + 1, 1, 0, 0, 0);
  }

  // key theo tháng để map budget
  const periodKey = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`;
  return { key, start, end, periodKey };
}

export const dashboardService = {
  async getOverview(userId: string, range: string) {
    const { key, start, end, periodKey } = getRange(range);
    const uid = new Types.ObjectId(userId);

    // 1) Summary (income/expense)
    const sumAgg = await TransactionModel.aggregate([
      { $match: { userId: uid, date: { $gte: start, $lt: end } } },
      { $group: { _id: "$type", total: { $sum: "$amount" } } },
    ]);

    const income = sumAgg.find((x) => x._id === "INCOME")?.total ?? 0;
    const expense = sumAgg.find((x) => x._id === "EXPENSE")?.total ?? 0;
    const balance = income - expense;
    const savingRatePct = income > 0 ? ((income - expense) / income) * 100 : 0;

    // 2) Cashflow: THIS_YEAR theo tháng, còn lại theo ngày
    const fmt = key === "THIS_YEAR" ? "%Y-%m" : "%Y-%m-%d";

    const cashAgg = await TransactionModel.aggregate([
      { $match: { userId: uid, date: { $gte: start, $lt: end } } },
      {
        $group: {
          _id: {
            bucket: { $dateToString: { format: fmt, date: "$date" } },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.bucket": 1 } },
    ]);

    // gom về points {x,index,income,expense}
    const buckets = Array.from(new Set(cashAgg.map((x) => x._id.bucket)));
    const cashflow = buckets.map((b, idx) => {
      const inc = cashAgg.find((x) => x._id.bucket === b && x._id.type === "INCOME")?.total ?? 0;
      const exp = cashAgg.find((x) => x._id.bucket === b && x._id.type === "EXPENSE")?.total ?? 0;
      return { x: idx + 1, income: inc, expense: exp };
    });

    // 3) Spend by category
    const catAgg = await TransactionModel.aggregate([
      { $match: { userId: uid, type: "EXPENSE", date: { $gte: start, $lt: end } } },
      { $group: { _id: "$category", amount: { $sum: "$amount" } } },
      { $sort: { amount: -1 } },
      { $limit: 8 },
    ]);

    const spendByCategory = catAgg.map((x) => ({ name: x._id, amount: x.amount }));

    // 4) Budgets
    const budgetsDb = await BudgetModel.find({ userId: uid, periodKey }).lean();
    const spentByCat = await TransactionModel.aggregate([
      { $match: { userId: uid, type: "EXPENSE", date: { $gte: start, $lt: end } } },
      { $group: { _id: "$category", used: { $sum: "$amount" } } },
    ]);

    const budgets = budgetsDb.map((b) => {
      const used = spentByCat.find((x) => x._id === b.name)?.used ?? 0;
      const usedPct = b.limit > 0 ? (used / b.limit) * 100 : 0;
      return { id: String(b._id), name: b.name, used, limit: b.limit, usedPct };
    });

    // 5) Recent + Top
    const recentDb = await TransactionModel.find({ userId: uid })
      .sort({ date: -1 })
      .limit(8)
      .lean();

    const topDb = await TransactionModel.find({ userId: uid })
      .sort({ amount: -1 })
      .limit(8)
      .lean();

    const mapTx = (t: any) => ({
      id: String(t._id),
      title: t.title,
      category: t.category,
      wallet: t.wallet,
      amount: t.amount,
      type: t.type,
      date: t.date,
    });

    return {
      summary: { balance, income, expense, savingRatePct },
      cashflow,
      spendByCategory,
      budgets,
      recentTransactions: recentDb.map(mapTx),
      topTransactions: topDb.map(mapTx),
    };
  },
};
