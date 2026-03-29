import { api } from "./api";

export type TxType = "INCOME" | "EXPENSE";

export type TransactionDTO = {
  _id: string;
  type: TxType;
  amount: number;
  title: string;
  category: string;
  wallet: string;
  date: string; // ISO string

  note?: string;  
  payee?: string;
  tags?: string[];
};

export type TransactionCreateDTO = Omit<TransactionDTO, "_id">;
export type TransactionUpdateDTO = Partial<TransactionCreateDTO>;

// ✅ Thêm giao dịch
export async function createTransaction(payload: TransactionCreateDTO) {
  const res = await api.post<TransactionDTO>("/transactions", payload);
  return res.data;
}

// ✅ Lấy danh sách giao dịch
export async function getTransactions(params?: {
  q?: string;
  wallet?: string;
  category?: string;
  from?: string; // yyyy-mm-dd
  to?: string; // yyyy-mm-dd
  type?: TxType | "ALL";
  tag?: string;
}) {
  const res = await api.get<TransactionDTO[]>("/transactions", { params });
  return res.data;
}

// ✅ Xóa giao dịch
export async function deleteTransaction(id: string) {
  const res = await api.delete<{ ok?: boolean; message?: string }>(
    `/transactions/${id}`
  );
  return res.data;
}

// ✅ Sửa giao dịch
export async function updateTransaction(id: string, payload: TransactionUpdateDTO) {
  const res = await api.put<TransactionDTO>(`/transactions/${id}`, payload);
  return res.data;
}
// ✅ 45
export async function getTransaction(id: string) {
  const res = await api.get<TransactionDTO>(`/transactions/${id}`);
  return res.data;
}

// ✅ 51
export async function uploadTransactionAttachment(id: string, file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await api.post<TransactionDTO>(`/transactions/${id}/attachments`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// ✅ 55
export async function refundTransaction(id: string) {
  const res = await api.post<TransactionDTO>(`/transactions/${id}/refund`);
  return res.data;
}

// ✅ 58: Export Excel
export async function exportTransactionsXlsx(params?: {
  q?: string;
  wallet?: string;
  category?: string;
  tag?: string;
  from?: string;
  to?: string;
  range?: "DAY" | "WEEK" | "MONTH" | "YEAR";
}) {
  const res = await api.get(`/transactions/export/xlsx`, {
    params,
    responseType: "blob",
  });
  return res.data as Blob;
}

// ✅ 58: Export PDF
export async function exportTransactionsPdf(params?: {
  q?: string;
  wallet?: string;
  category?: string;
  tag?: string;
  from?: string;
  to?: string;
  range?: "DAY" | "WEEK" | "MONTH" | "YEAR";
}) {
  const res = await api.get(`/transactions/export/pdf`, {
    params,
    responseType: "blob",
  });
  return res.data as Blob;
}
// ✅ 58: Export CSV
export async function exportTransactionsCsv(params?: {
  q?: string;
  wallet?: string;
  category?: string;
  tag?: string;
  from?: string;
  to?: string;
  range?: "DAY" | "WEEK" | "MONTH" | "YEAR";
}) {
  const res = await api.get(`/transactions/export/csv`, {
    params,
    responseType: "blob",
  });
  return res.data as Blob;
}