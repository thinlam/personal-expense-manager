import { Schema, model, Types } from "mongoose";

export type WalletType = "CASH" | "BANK" | "EWALLET";
export type WalletLabel = "PERSONAL" | "FAMILY" | "WORK";

const walletSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    // 21. loại ví: tiền mặt / ngân hàng / ví điện tử
    type: {
      type: String,
      enum: ["CASH", "BANK", "EWALLET"],
      default: "CASH",
      required: true,
    },

    // 30. nhãn ví: cá nhân / gia đình / công việc
    label: {
      type: String,
      enum: ["PERSONAL", "FAMILY", "WORK"],
      default: "PERSONAL",
    },

    // 25. số dư ban đầu
    initialBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    // số dư hiện tại
    balance: {
      type: Number,
      default: 0,
    },

    currency: {
      type: String,
      default: "VND",
      trim: true,
      uppercase: true,
    },

    // thông tin hiển thị
    icon: {
      type: String,
      default: "",
      trim: true,
    },

    color: {
      type: String,
      default: "",
      trim: true,
    },

    // thêm metadata cho bank / ewallet nếu cần
    bankName: {
      type: String,
      default: "",
      trim: true,
      maxlength: 120,
    },

    accountNumber: {
      type: String,
      default: "",
      trim: true,
      maxlength: 50,
    },

    provider: {
      type: String,
      default: "",
      trim: true,
      maxlength: 120,
    },

    // 29. ví mặc định
    isDefault: {
      type: Boolean,
      default: false,
      index: true,
    },

    // 23. ẩn ví thay vì xóa cứng
    isHidden: {
      type: Boolean,
      default: false,
      index: true,
    },

    // 24. thứ tự ưu tiên
    sortOrder: {
      type: Number,
      default: 0,
      index: true,
    },

    note: {
      type: String,
      default: "",
      maxlength: 500,
    },
  },
  { timestamps: true }
);

// Index phục vụ list/filter theo user
walletSchema.index({ userId: 1, isHidden: 1, sortOrder: 1, createdAt: -1 });
walletSchema.index({ userId: 1, type: 1 });
walletSchema.index({ userId: 1, label: 1 });

// Không bắt unique name để user có thể tự đặt trùng nếu muốn
// Nếu muốn chặn trùng tên theo user thì thêm unique index sau này.

export const WalletModel = model("Wallet", walletSchema);

export type WalletDoc = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;

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

  createdAt: Date;
  updatedAt: Date;
};