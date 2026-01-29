export type DashboardSummary = {
  balance: number;
  income: number;
  expense: number;
  savingRatePct: number; // 0..100
};

export type CashflowPoint = {
  x: number;        // index/time bucket (VD: day number)
  income: number;
  expense: number;
};

export type CategorySlice = {
  name: string;
  amount: number;
};

export type BudgetCard = {
  id: string;
  name: string;
  used: number;
  limit: number;
  usedPct: number; // 0..100+
};

export type TxRow = {
  id: string;
  title: string;
  category: string;
  wallet: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  date: string; // ISO
};

export type DashboardDTO = {
  summary: DashboardSummary;
  cashflow: CashflowPoint[];
  spendByCategory: CategorySlice[];
  budgets: BudgetCard[];
  recentTransactions: TxRow[];
  topTransactions: TxRow[];
};
