import { api } from "./api";

export type PeriodType = "WEEK" | "MONTH" | "QUARTER" | "YEAR";

export type BudgetDTO = {
  _id: string;
  name: string;
  limit: number;
  periodKey: string;

  periodType: PeriodType;
  periodStart: string;

  category?: string | null;
  groupName?: string | null;
  groupCategories?: string[];

  wallet?: string | null;

  carryOverEnabled?: boolean;
  carryOverBalance?: number;

  warnAt80?: boolean;
  warnAt90?: boolean;
  warnOver?: boolean;
};

export type BudgetCreateDTO = {
  name?: string;
  amount: number; // bạn nhập
  periodType: PeriodType;
  periodStart: string; // yyyy-mm-dd
  category?: string;
  wallet?: string;
  groupName?: string;
  groupCategories?: string[];
  carryOverEnabled?: boolean;
  carryOverBalance?: number;
  warnAt80?: boolean;
  warnAt90?: boolean;
  warnOver?: boolean;
};

export type BudgetUsageDTO = {
  periodStart: string;
  periodEnd: string;
  limit: number;
  carryOverBalance: number;
  effectiveBudget: number;
  spent: number;
  remaining: number;
  percent: number;
  alerts: string[];
};

export async function createBudget(payload: BudgetCreateDTO) {
  const res = await api.post<BudgetDTO>("/budgets", payload);
  return res.data;
}

export async function getBudgets(params?: { periodType?: PeriodType; periodKey?: string; wallet?: string; category?: string }) {
  const res = await api.get<BudgetDTO[]>("/budgets", { params });
  return res.data;
}

export async function updateBudget(id: string, payload: Partial<BudgetCreateDTO> & { note?: string }) {
  const res = await api.put<BudgetDTO>(`/budgets/${id}`, payload);
  return res.data;
}

export async function deleteBudget(id: string) {
  const res = await api.delete<{ ok: boolean }>(`/budgets/${id}`);
  return res.data;
}

export async function getBudgetUsage(id: string) {
  const res = await api.get<BudgetUsageDTO>(`/budgets/${id}/usage`);
  return res.data;
}

export async function getBudgetCompare(id: string) {
  const res = await api.get<{ budget: BudgetDTO; usage: BudgetUsageDTO }>(`/budgets/${id}/compare`);
  return res.data;
}

export async function getBudgetHistory(id: string) {
  const res = await api.get<unknown[]>(`/budgets/${id}/history`);
  return res.data;
}