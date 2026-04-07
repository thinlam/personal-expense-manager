import { Schema, model, Types } from "mongoose";

export type TxType = "INCOME" | "EXPENSE";

const AttachmentSchema = new Schema(
  {
    filename: String,
    url: String,
    mimeType: String,
    size: Number,
  },
  { _id: false }
);

const SplitSchema = new Schema(
  {
    category: String,
    amount: Number,
    note: { type: String, default: "" },
  },
  { _id: false }
);

const InstallmentSchema = new Schema(
  {
    enabled: { type: Boolean, default: false },
    totalInstallments: { type: Number, default: 0 },
    currentInstallment: { type: Number, default: 0 },
    startDate: { type: Date, default: null },
    intervalMonths: { type: Number, default: 1 },
  },
  { _id: false }
);

const RecurringSchema = new Schema(
  {
    enabled: { type: Boolean, default: false },
    frequency: { type: String, enum: ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"], default: "MONTHLY" },
    interval: { type: Number, default: 1 },
    byWeekday: { type: Number, default: null }, // 0..6
    nextRunAt: { type: Date, default: null },
    endDate: { type: Date, default: null },
    remainingCount: { type: Number, default: null },
  },
  { _id: false }
);

const ReminderSchema = new Schema(
  {
    enabled: { type: Boolean, default: false },
    nextAt: { type: Date, default: null },
    method: { type: String, enum: ["NONE", "EMAIL"], default: "NONE" },
  },
  { _id: false }
);

const transactionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["INCOME", "EXPENSE"], required: true },

    // 57: tiền tệ
    amount: { type: Number, required: true },
    currency: { type: String, default: "VND" },
    exchangeRateToBase: { type: Number, default: 1 },
    originalAmount: { type: Number, default: null },

    title: { type: String, required: true },
    category: { type: String, required: true },
    wallet: { type: String, default: "Ví chính" },
    date: { type: Date, default: Date.now },

    note: { type: String, default: "" },
    payee: { type: String, default: "" },
    tags: { type: [String], default: [] },

    // 51: chứng từ
    attachments: { type: [AttachmentSchema], default: [] },

    // 56: split
    splits: { type: [SplitSchema], default: [] },

    // 55: refund
    refundOfId: { type: Schema.Types.ObjectId, ref: "Transaction", default: null },

    // 54: installment
    installmentPlan: { type: InstallmentSchema, default: () => ({ enabled: false }) },

    // 52: recurring
    recurring: { type: RecurringSchema, default: () => ({ enabled: false }) },

    // 53: reminder
    reminder: { type: ReminderSchema, default: () => ({ enabled: false }) },
  },
  { timestamps: true }
);

export const TransactionModel = model("Transaction", transactionSchema);

export type TransactionDoc = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: TxType;

  amount: number;
  currency: string;
  exchangeRateToBase: number;
  originalAmount: number | null;

  title: string;
  category: string;
  wallet: string;
  date: Date;

  note: string;
  payee: string;
  tags: string[];

  attachments: { filename: string; url: string; mimeType: string; size: number }[];
  splits: { category: string; amount: number; note?: string }[];

  refundOfId: Types.ObjectId | null;

  installmentPlan: {
    enabled: boolean;
    totalInstallments: number;
    currentInstallment: number;
    startDate: Date | null;
    intervalMonths: number;
  };

  recurring: {
    enabled: boolean;
    frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
    interval: number;
    byWeekday: number | null;
    nextRunAt: Date | null;
    endDate: Date | null;
    remainingCount: number | null;
  };

  reminder: {
    enabled: boolean;
    nextAt: Date | null;
    method: "NONE" | "EMAIL";
  };
};