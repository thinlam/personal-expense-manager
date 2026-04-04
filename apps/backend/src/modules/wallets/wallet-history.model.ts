import { Schema, model, Types } from "mongoose";

export type WalletHistoryType =
  | "OPENING_BALANCE"
  | "INCOME_TX"
  | "EXPENSE_TX"
  | "ADJUSTMENT"
  | "TRANSFER_OUT"
  | "TRANSFER_IN";

const walletHistorySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    walletId: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "OPENING_BALANCE",
        "INCOME_TX",
        "EXPENSE_TX",
        "ADJUSTMENT",
        "TRANSFER_OUT",
        "TRANSFER_IN",
      ],
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    signedAmount: {
      type: Number,
      required: true,
    },

    balanceBefore: {
      type: Number,
      required: true,
    },

    balanceAfter: {
      type: Number,
      required: true,
    },

    note: {
      type: String,
      default: "",
      maxlength: 500,
    },

    refTransactionId: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
      default: null,
      index: true,
    },

    refWalletId: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
      default: null,
    },
  },
  { timestamps: true }
);

walletHistorySchema.index({ userId: 1, walletId: 1, createdAt: -1 });
walletHistorySchema.index({ userId: 1, type: 1, createdAt: -1 });

export const WalletHistoryModel = model("WalletHistory", walletHistorySchema);

export type WalletHistoryDoc = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  walletId: Types.ObjectId;
  type: WalletHistoryType;
  amount: number;
  signedAmount: number;
  balanceBefore: number;
  balanceAfter: number;
  note: string;
  refTransactionId: Types.ObjectId | null;
  refWalletId: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
};