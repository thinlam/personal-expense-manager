import { Schema, model, Types } from "mongoose";

export type TxType = "INCOME" | "EXPENSE";

const transactionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["INCOME", "EXPENSE"], required: true },
    amount: { type: Number, required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    wallet: { type: String, default: "Ví chính" },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const TransactionModel = model("Transaction", transactionSchema);
export type TransactionDoc = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: TxType;
  amount: number;
  title: string;
  category: string;
  wallet: string;
  date: Date;
};
