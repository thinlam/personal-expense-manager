export type ReportRangePreset =
  | "7d"
  | "30d"
  | "month"
  | "quarter"
  | "year"
  | "custom";

export type OverviewSummary = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
  savingsRate: number;
};

export type CategoryExpense = {
  category: string;
  amount: number;
  percent: number;
};

export type IncomeSource = {
  source: string;
  amount: number;
  percent: number;
};

export type CashflowPoint = {
  label: string;
  income: number;
  expense: number;
  balance: number;
};

export type LargestTransaction = {
  id: string;
  title: string;
  category: string;
  wallet: string;
  amount: number;
  type: "income" | "expense";
  date: string;
};

export type MonthComparison = {
  incomeCurrent: number;
  incomePrevious: number;
  expenseCurrent: number;
  expensePrevious: number;
  balanceCurrent: number;
  balancePrevious: number;
};

export type CustomReportRow = {
  id: string;
  date: string;
  type: "income" | "expense";
  title: string;
  category: string;
  wallet: string;
  amount: number;
  note?: string;
};

export type ReportFilters = {
  preset: ReportRangePreset;
  from?: string;
  to?: string;
  wallet?: string;
  category?: string;
  keyword?: string;
  type?: "all" | "income" | "expense";
};

export type ReportsDashboardData = {
  summary: OverviewSummary;
  expenseByCategory: CategoryExpense[];
  incomeBySource: IncomeSource[];
  cashflowTrend: CashflowPoint[];
  topTransactions: LargestTransaction[];
  monthComparison: MonthComparison;
  customReportRows: CustomReportRow[];
  wallets: string[];
  categories: string[];
};