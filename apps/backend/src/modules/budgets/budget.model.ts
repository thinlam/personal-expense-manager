import { Schema, model, Types } from "mongoose";

export type PeriodType = "WEEK" | "MONTH" | "QUARTER" | "YEAR";

const HistorySchema = new Schema(
  {
    at: { type: Date, default: Date.now },
    before: { type: Object, required: true },
    after: { type: Object, required: true },
    note: { type: String, default: "" },
  },
  { _id: false }
);

const budgetSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    /* ====== CŨ (dashboard đang dùng) ====== */
    name: { type: String, required: true },        // thường là tên danh mục (category)
    limit: { type: Number, required: true, min: 0 },
    periodKey: { type: String, required: true },   // "YYYY-MM" (tháng)

    /* ====== MỚI (59–68) ====== */
    periodType: { type: String, enum: ["WEEK", "MONTH", "QUARTER", "YEAR"], default: "MONTH", index: true },
    periodStart: { type: Date, required: true, index: true },

    // 59: theo danh mục (giữ category riêng cho rõ)
    category: { type: String, default: null, index: true },

    // 66: nhóm danh mục
    groupName: { type: String, default: null },
    groupCategories: { type: [String], default: [] },

    // 61: theo ví
    wallet: { type: String, default: null, index: true },

    // 65: carry-over
    carryOverEnabled: { type: Boolean, default: false },
    carryOverBalance: { type: Number, default: 0 }, // dư (+) hoặc thiếu (-) chuyển kỳ sau

    // 63/64: cảnh báo
    warnAt80: { type: Boolean, default: true },
    warnAt90: { type: Boolean, default: true },
    warnOver: { type: Boolean, default: true },

    // 68: lịch sử thay đổi
    history: { type: [HistorySchema], default: [] },
  },
  { timestamps: true }
);

budgetSchema.index({ userId: 1, periodKey: 1 });
budgetSchema.index({ userId: 1, periodType: 1, periodStart: 1 });

export const BudgetModel = model("Budget", budgetSchema);
export type BudgetDoc = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;

  name: string;
  limit: number;
  periodKey: string;

  periodType: PeriodType;
  periodStart: Date;

  category: string | null;
  groupName: string | null;
  groupCategories: string[];

  wallet: string | null;

  carryOverEnabled: boolean;
  carryOverBalance: number;

  warnAt80: boolean;
  warnAt90: boolean;
  warnOver: boolean;

  history: { at: Date; before: any; after: any; note: string }[];
};