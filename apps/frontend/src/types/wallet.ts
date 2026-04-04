export type WalletType = "CASH" | "BANK" | "EWALLET";
export type WalletLabel = "PERSONAL" | "FAMILY" | "WORK";

export type Wallet = {
  _id: string;
  userId: string;

  name: string;
  type: WalletType;
  label: WalletLabel;

  initialBalance: number;
  balance: number;
  currency: string;

  icon: string;
  color: string;

  bankName: string;
  accountNumber: string;
  provider: string;

  isDefault: boolean;
  isHidden: boolean;
  sortOrder: number;

  note: string;

  createdAt: string;
  updatedAt: string;
};

export type WalletHistoryType =
  | "OPENING_BALANCE"
  | "INCOME_TX"
  | "EXPENSE_TX"
  | "ADJUSTMENT"
  | "TRANSFER_OUT"
  | "TRANSFER_IN";

export type WalletHistoryItem = {
  _id: string;
  userId: string;
  walletId: string;
  type: WalletHistoryType;
  amount: number;
  signedAmount: number;
  balanceBefore: number;
  balanceAfter: number;
  note: string;
  refTransactionId: string | null;
  refWalletId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type WalletHistoryResponse = {
  wallet: Wallet;
  items: WalletHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type CreateWalletPayload = {
  name: string;
  type: WalletType;
  label: WalletLabel;
  initialBalance: number;
  currency?: string;
  icon?: string;
  color?: string;
  bankName?: string;
  accountNumber?: string;
  provider?: string;
  isDefault?: boolean;
  sortOrder?: number;
  note?: string;
};

export type UpdateWalletPayload = {
  name?: string;
  type?: WalletType;
  label?: WalletLabel;
  currency?: string;
  icon?: string;
  color?: string;
  bankName?: string;
  accountNumber?: string;
  provider?: string;
  note?: string;
  isHidden?: boolean;
  sortOrder?: number;
};

export type ReorderWalletPayload = {
  items: Array<{
    id: string;
    sortOrder: number;
  }>;
};

export type AdjustWalletPayload = {
  newBalance: number;
  note?: string;
};

export type TransferWalletPayload = {
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  note?: string;
};