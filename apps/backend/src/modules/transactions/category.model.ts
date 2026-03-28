import { Schema, model, Types } from "mongoose";

const categorySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["INCOME", "EXPENSE"], default: "EXPENSE" },
    color: { type: String, default: "#16a085" },
  },
  { timestamps: true }
);

export const CategoryModel = model("Category", categorySchema);
export type CategoryDoc = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  type: "INCOME" | "EXPENSE";
  color: string;
};
