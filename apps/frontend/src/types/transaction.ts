export type TxType = "INCOME" | "EXPENSE";

export type TransactionDTO = {
  _id: string;
  userId?: string;

  type: TxType;
  amount: number;
  title: string;
  category: string;
  wallet: string;
  date: string; // ISO string
  createdAt?: string;
  updatedAt?: string;

  // mở rộng dần sau (tags, note, payee, file...)
  tags?: string[];
  note?: string;
  payee?: string;
};

export type TransactionCreateDTO = Omit<TransactionDTO, "_id" | "createdAt" | "updatedAt">;
export type TransactionUpdateDTO = Partial<TransactionCreateDTO>;
