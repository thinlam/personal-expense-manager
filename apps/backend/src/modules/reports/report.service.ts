import { Types } from "mongoose";
import { TransactionModel } from "../transactions/transaction.model";

export type ReportTypeFilter = "all" | "income" | "expense";

export type ReportFilters = {
  from?: string;
  to?: string;
  wallet?: string;
  category?: string;
  keyword?: string;
  type?: ReportTypeFilter;
};

type SummaryResponse = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
  savingsRate: number;
};

type CategoryExpenseResponse = {
  category: string;
  amount: number;
  percent: number;
};

type IncomeSourceResponse = {
  source: string;
  amount: number;
  percent: number;
};

type CashflowPointResponse = {
  label: string;
  income: number;
  expense: number;
  balance: number;
};

type LargestTransactionResponse = {
  id: string;
  title: string;
  category: string;
  wallet: string;
  amount: number;
  type: "income" | "expense";
  date: string;
};

type MonthComparisonResponse = {
  incomeCurrent: number;
  incomePrevious: number;
  expenseCurrent: number;
  expensePrevious: number;
  balanceCurrent: number;
  balancePrevious: number;
};

type CustomReportRowResponse = {
  id: string;
  date: string;
  type: "income" | "expense";
  title: string;
  category: string;
  wallet: string;
  amount: number;
  note?: string;
};

export type ReportsDashboardResponse = {
  summary: SummaryResponse;
  expenseByCategory: CategoryExpenseResponse[];
  incomeBySource: IncomeSourceResponse[];
  cashflowTrend: CashflowPointResponse[];
  topTransactions: LargestTransactionResponse[];
  monthComparison: MonthComparisonResponse;
  customReportRows: CustomReportRowResponse[];
  wallets: string[];
  categories: string[];
};

type TransactionDbType = "INCOME" | "EXPENSE";

type TransactionLean = {
  _id: Types.ObjectId;
  title?: string;
  note?: string;
  category?: string;
  wallet?: string;
  amount: number;
  type: TransactionDbType;
  date: Date;
};

type GroupedSummaryRow = {
  _id: TransactionDbType;
  total: number;
  count: number;
};

type GroupedAmountRow = {
  _id: string | null;
  amount: number;
};

type GroupedMonthRow = {
  _id: TransactionDbType;
  total: number;
};

function startOfDay(value: Date): Date {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(value: Date, days: number): Date {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date;
}

function parseDateRange(filters: ReportFilters): { from: Date; toExclusive: Date } {
  const now = new Date();

  const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1);
  const defaultTo = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const from = filters.from ? startOfDay(new Date(filters.from)) : defaultFrom;
  const toExclusive = filters.to
    ? addDays(startOfDay(new Date(filters.to)), 1)
    : defaultTo;

  return { from, toExclusive };
}

function mapFilterTypeToDbType(type?: ReportTypeFilter): TransactionDbType | undefined {
  if (type === "income") return "INCOME";
  if (type === "expense") return "EXPENSE";
  return undefined;
}

function mapDbTypeToClientType(type: TransactionDbType): "income" | "expense" {
  return type === "INCOME" ? "income" : "expense";
}

function buildBaseMatch(userId: string, filters: ReportFilters): Record<string, unknown> {
  const { from, toExclusive } = parseDateRange(filters);

  const match: Record<string, unknown> = {
    userId: new Types.ObjectId(userId),
    date: {
      $gte: from,
      $lt: toExclusive,
    },
  };

  const dbType = mapFilterTypeToDbType(filters.type);
  if (dbType) {
    match.type = dbType;
  }

  if (filters.wallet && filters.wallet !== "Tất cả") {
    match.wallet = filters.wallet;
  }

  if (filters.category && filters.category !== "Tất cả") {
    match.category = filters.category;
  }

  if (filters.keyword?.trim()) {
    const keywordRegex = new RegExp(filters.keyword.trim(), "i");
    match.$or = [
      { title: keywordRegex },
      { note: keywordRegex },
      { category: keywordRegex },
      { wallet: keywordRegex },
    ];
  }

  return match;
}

function getSafeTitle(transaction: TransactionLean): string {
  return transaction.title?.trim() || transaction.note?.trim() || "Giao dịch";
}

function getSafeCategory(transaction: TransactionLean): string {
  return transaction.category?.trim() || "Khác";
}

function getSafeWallet(transaction: TransactionLean): string {
  return transaction.wallet?.trim() || "Mặc định";
}

function toIsoDateString(value: Date): string {
  return new Date(value).toISOString().slice(0, 10);
}

function percentOf(amount: number, total: number): number {
  if (!total) return 0;
  return Number(((amount / total) * 100).toFixed(2));
}

async function getSummary(userId: string, filters: ReportFilters): Promise<SummaryResponse> {
  const match = buildBaseMatch(userId, filters);

  const grouped = await TransactionModel.aggregate<GroupedSummaryRow>([
    { $match: match },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  const incomeGroup = grouped.find((item) => item._id === "INCOME");
  const expenseGroup = grouped.find((item) => item._id === "EXPENSE");

  const totalIncome = incomeGroup?.total ?? 0;
  const totalExpense = expenseGroup?.total ?? 0;
  const transactionCount = grouped.reduce((sum, item) => sum + item.count, 0);
  const balance = totalIncome - totalExpense;
  const savingsRate =
    totalIncome > 0 ? Number(((balance / totalIncome) * 100).toFixed(2)) : 0;

  return {
    totalIncome,
    totalExpense,
    balance,
    transactionCount,
    savingsRate,
  };
}

async function getExpenseByCategory(
  userId: string,
  filters: ReportFilters
): Promise<CategoryExpenseResponse[]> {
  const match = {
    ...buildBaseMatch(userId, filters),
    type: "EXPENSE",
  };

  const rows = await TransactionModel.aggregate<GroupedAmountRow>([
    { $match: match },
    {
      $group: {
        _id: "$category",
        amount: { $sum: "$amount" },
      },
    },
    { $sort: { amount: -1 } },
  ]);

  const total = rows.reduce((sum, row) => sum + row.amount, 0);

  return rows.map((row) => ({
    category: row._id || "Khác",
    amount: row.amount,
    percent: percentOf(row.amount, total),
  }));
}

async function getIncomeBySource(
  userId: string,
  filters: ReportFilters
): Promise<IncomeSourceResponse[]> {
  const match = {
    ...buildBaseMatch(userId, filters),
    type: "INCOME",
  };

  const rows = await TransactionModel.aggregate<GroupedAmountRow>([
    { $match: match },
    {
      $group: {
        _id: "$category",
        amount: { $sum: "$amount" },
      },
    },
    { $sort: { amount: -1 } },
  ]);

  const total = rows.reduce((sum, row) => sum + row.amount, 0);

  return rows.map((row) => ({
    source: row._id || "Khác",
    amount: row.amount,
    percent: percentOf(row.amount, total),
  }));
}

function getBucketLabel(date: Date, from: Date, totalDays: number): string {
  const current = startOfDay(date);

  if (totalDays <= 14) {
    return `${current.getDate()}/${current.getMonth() + 1}`;
  }

  if (totalDays <= 90) {
    const diffDays = Math.floor(
      (current.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)
    );
    const weekIndex = Math.floor(diffDays / 7) + 1;
    return `W${weekIndex}`;
  }

  return `${current.getMonth() + 1}/${current.getFullYear()}`;
}

async function getCashflowTrend(
  userId: string,
  filters: ReportFilters
): Promise<CashflowPointResponse[]> {
  const match = buildBaseMatch(userId, filters);
  const { from, toExclusive } = parseDateRange(filters);

  const totalDays = Math.max(
    1,
    Math.ceil((toExclusive.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
  );

  const transactions = (await TransactionModel.find(match)
    .sort({ date: 1 })
    .select("date type amount")
    .lean()) as TransactionLean[];

  const bucketMap = new Map<string, { income: number; expense: number }>();

  for (const transaction of transactions) {
    const label = getBucketLabel(new Date(transaction.date), from, totalDays);
    const current = bucketMap.get(label) ?? { income: 0, expense: 0 };

    if (transaction.type === "INCOME") {
      current.income += transaction.amount;
    } else {
      current.expense += transaction.amount;
    }

    bucketMap.set(label, current);
  }

  let runningBalance = 0;

  return Array.from(bucketMap.entries()).map(([label, value]) => {
    runningBalance += value.income - value.expense;

    return {
      label,
      income: value.income,
      expense: value.expense,
      balance: runningBalance,
    };
  });
}

async function getTopTransactions(
  userId: string,
  filters: ReportFilters
): Promise<LargestTransactionResponse[]> {
  const match = buildBaseMatch(userId, filters);

  const transactions = (await TransactionModel.find(match)
    .sort({ amount: -1, date: -1 })
    .limit(5)
    .select("title note category wallet amount type date")
    .lean()) as TransactionLean[];

  return transactions.map((transaction) => ({
    id: String(transaction._id),
    title: getSafeTitle(transaction),
    category: getSafeCategory(transaction),
    wallet: getSafeWallet(transaction),
    amount: transaction.amount,
    type: mapDbTypeToClientType(transaction.type),
    date: toIsoDateString(transaction.date),
  }));
}

async function getMonthTotals(
  userId: string,
  from: Date,
  toExclusive: Date
): Promise<{ income: number; expense: number }> {
  const rows = await TransactionModel.aggregate<GroupedMonthRow>([
    {
      $match: {
        userId: new Types.ObjectId(userId),
        date: {
          $gte: from,
          $lt: toExclusive,
        },
      },
    },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
      },
    },
  ]);

  return {
    income: rows.find((item) => item._id === "INCOME")?.total ?? 0,
    expense: rows.find((item) => item._id === "EXPENSE")?.total ?? 0,
  };
}

async function getMonthComparison(userId: string): Promise<MonthComparisonResponse> {
  const now = new Date();

  const currentFrom = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentToExclusive = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const previousFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousToExclusive = new Date(now.getFullYear(), now.getMonth(), 1);

  const current = await getMonthTotals(userId, currentFrom, currentToExclusive);
  const previous = await getMonthTotals(userId, previousFrom, previousToExclusive);

  return {
    incomeCurrent: current.income,
    incomePrevious: previous.income,
    expenseCurrent: current.expense,
    expensePrevious: previous.expense,
    balanceCurrent: current.income - current.expense,
    balancePrevious: previous.income - previous.expense,
  };
}

async function getWalletOptions(userId: string): Promise<string[]> {
  const wallets = (await TransactionModel.distinct("wallet", {
    userId: new Types.ObjectId(userId),
  })) as Array<string | null | undefined>;

  const cleaned = wallets
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .sort((a, b) => a.localeCompare(b, "vi"));

  return ["Tất cả", ...cleaned];
}

async function getCategoryOptions(userId: string): Promise<string[]> {
  const categories = (await TransactionModel.distinct("category", {
    userId: new Types.ObjectId(userId),
  })) as Array<string | null | undefined>;

  const cleaned = categories
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .sort((a, b) => a.localeCompare(b, "vi"));

  return ["Tất cả", ...cleaned];
}

export async function getCustomReportRows(
  userId: string,
  filters: ReportFilters
): Promise<CustomReportRowResponse[]> {
  const match = buildBaseMatch(userId, filters);

  const transactions = (await TransactionModel.find(match)
    .sort({ date: -1, createdAt: -1 })
    .select("title note category wallet amount type date")
    .lean()) as TransactionLean[];

  return transactions.map((transaction) => ({
    id: String(transaction._id),
    date: toIsoDateString(transaction.date),
    type: mapDbTypeToClientType(transaction.type),
    title: getSafeTitle(transaction),
    category: getSafeCategory(transaction),
    wallet: getSafeWallet(transaction),
    amount: transaction.amount,
    note: transaction.note?.trim() || "",
  }));
}

export async function getReportsDashboard(
  userId: string,
  filters: ReportFilters
): Promise<ReportsDashboardResponse> {
  const [
    summary,
    expenseByCategory,
    incomeBySource,
    cashflowTrend,
    topTransactions,
    monthComparison,
    customReportRows,
    wallets,
    categories,
  ] = await Promise.all([
    getSummary(userId, filters),
    getExpenseByCategory(userId, filters),
    getIncomeBySource(userId, filters),
    getCashflowTrend(userId, filters),
    getTopTransactions(userId, filters),
    getMonthComparison(userId),
    getCustomReportRows(userId, filters),
    getWalletOptions(userId),
    getCategoryOptions(userId),
  ]);

  return {
    summary,
    expenseByCategory,
    incomeBySource,
    cashflowTrend,
    topTransactions,
    monthComparison,
    customReportRows,
    wallets,
    categories,
  };
}