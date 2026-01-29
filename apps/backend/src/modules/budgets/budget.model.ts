import { Schema, model, Types } from "mongoose";

const budgetSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true }, // thường là tên danh mục
    limit: { type: Number, required: true },
    // periodKey dạng "YYYY-MM" (ngân sách theo tháng)
    periodKey: { type: String, required: true },
  },
  { timestamps: true }
);

export const BudgetModel = model("Budget", budgetSchema);
export type BudgetDoc = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  limit: number;
  periodKey: string;
};
