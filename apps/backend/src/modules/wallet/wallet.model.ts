import { Schema, model, type InferSchemaType } from "mongoose";

const walletSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["CASH", "BANK", "EWALLET"], default: "CASH" },
    currency: { type: String, default: "VND" },
    balance: { type: Number, default: 0 },
    isDefault: { type: Boolean, default: false },
    isHidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

walletSchema.set("toJSON", {
  transform(_doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export type WalletDoc = InferSchemaType<typeof walletSchema>;
export const WalletModel = model("Wallet", walletSchema);
