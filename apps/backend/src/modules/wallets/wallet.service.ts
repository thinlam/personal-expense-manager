import {
  ClientSession,
  Types,
  isValidObjectId,
  startSession,
} from "mongoose";
import { WalletModel, type WalletLabel, type WalletType } from "./wallet.model";
import {
  WalletHistoryModel,
  type WalletHistoryType,
} from "./wallet-history.model";

export class WalletServiceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "WalletServiceError";
    this.status = status;
  }
}

type CreateWalletInput = {
  name?: string;
  type?: WalletType;
  label?: WalletLabel;
  initialBalance?: number;
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

type UpdateWalletInput = {
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

type ReorderWalletInput = {
  items?: Array<{
    id: string;
    sortOrder: number;
  }>;
};

type AdjustWalletInput = {
  newBalance?: number;
  note?: string;
};

type TransferWalletInput = {
  fromWalletId?: string;
  toWalletId?: string;
  amount?: number;
  note?: string;
};

type ListWalletOptions = {
  includeHidden?: boolean;
};

type HistoryOptions = {
  page?: number;
  limit?: number;
};

function toObjectId(id: string, fieldName = "id"): Types.ObjectId {
  if (!isValidObjectId(id)) {
    throw new WalletServiceError(`${fieldName} không hợp lệ`, 400);
  }
  return new Types.ObjectId(id);
}

function normalizeMoney(value: unknown, fieldName: string): number {
  const num = Number(value);

  if (!Number.isFinite(num)) {
    throw new WalletServiceError(`${fieldName} không hợp lệ`, 400);
  }

  return Math.round(num * 100) / 100;
}

function validateWalletType(type?: string): WalletType {
  if (type === "CASH" || type === "BANK" || type === "EWALLET") return type;
  throw new WalletServiceError("Loại ví không hợp lệ", 400);
}

function validateWalletLabel(label?: string): WalletLabel {
  if (label === "PERSONAL" || label === "FAMILY" || label === "WORK") {
    return label;
  }
  throw new WalletServiceError("Nhãn ví không hợp lệ", 400);
}

async function createWalletHistory(
  params: {
    userId: Types.ObjectId;
    walletId: Types.ObjectId;
    type: WalletHistoryType;
    amount: number;
    signedAmount: number;
    balanceBefore: number;
    balanceAfter: number;
    note?: string;
    refTransactionId?: Types.ObjectId | null;
    refWalletId?: Types.ObjectId | null;
  },
  session?: ClientSession
) {
  await WalletHistoryModel.create(
    [
      {
        userId: params.userId,
        walletId: params.walletId,
        type: params.type,
        amount: params.amount,
        signedAmount: params.signedAmount,
        balanceBefore: params.balanceBefore,
        balanceAfter: params.balanceAfter,
        note: params.note ?? "",
        refTransactionId: params.refTransactionId ?? null,
        refWalletId: params.refWalletId ?? null,
      },
    ],
    session ? { session } : undefined
  );
}

export async function listWallets(
  userId: string,
  options: ListWalletOptions = {}
) {
  const userObjectId = toObjectId(userId, "userId");
  const includeHidden = options.includeHidden === true;

  return WalletModel.find({
    userId: userObjectId,
    ...(includeHidden ? {} : { isHidden: false }),
  })
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean();
}

export async function getWalletById(userId: string, walletId: string) {
  const userObjectId = toObjectId(userId, "userId");
  const walletObjectId = toObjectId(walletId, "walletId");

  const wallet = await WalletModel.findOne({
    _id: walletObjectId,
    userId: userObjectId,
  }).lean();

  if (!wallet) {
    throw new WalletServiceError("Không tìm thấy ví", 404);
  }

  return wallet;
}

export async function createWallet(userId: string, payload: CreateWalletInput) {
  const userObjectId = toObjectId(userId, "userId");

  const name = String(payload.name ?? "").trim();
  if (!name) {
    throw new WalletServiceError("Tên ví là bắt buộc", 400);
  }

  const type = payload.type ? validateWalletType(payload.type) : "CASH";
  const label = payload.label ? validateWalletLabel(payload.label) : "PERSONAL";
  const initialBalance = normalizeMoney(payload.initialBalance ?? 0, "Số dư ban đầu");
  const currency = String(payload.currency ?? "VND").trim().toUpperCase() || "VND";
  const sortOrder =
    payload.sortOrder != null ? Number(payload.sortOrder) : Date.now();

  if (!Number.isFinite(sortOrder)) {
    throw new WalletServiceError("sortOrder không hợp lệ", 400);
  }

  const visibleCount = await WalletModel.countDocuments({
    userId: userObjectId,
    isHidden: false,
  });

  const shouldBeDefault = payload.isDefault === true || visibleCount === 0;

  const session = await startSession();

  try {
    session.startTransaction();

    if (shouldBeDefault) {
      await WalletModel.updateMany(
        { userId: userObjectId, isDefault: true },
        { $set: { isDefault: false } },
        { session }
      );
    }

    const [wallet] = await WalletModel.create(
      [
        {
          userId: userObjectId,
          name,
          type,
          label,
          initialBalance,
          balance: initialBalance,
          currency,
          icon: String(payload.icon ?? "").trim(),
          color: String(payload.color ?? "").trim(),
          bankName: String(payload.bankName ?? "").trim(),
          accountNumber: String(payload.accountNumber ?? "").trim(),
          provider: String(payload.provider ?? "").trim(),
          isDefault: shouldBeDefault,
          isHidden: false,
          sortOrder,
          note: String(payload.note ?? "").trim(),
        },
      ],
      { session }
    );

    if (initialBalance !== 0) {
      await createWalletHistory(
        {
          userId: userObjectId,
          walletId: wallet._id,
          type: "OPENING_BALANCE",
          amount: Math.abs(initialBalance),
          signedAmount: initialBalance,
          balanceBefore: 0,
          balanceAfter: initialBalance,
          note: "Số dư ban đầu",
        },
        session
      );
    }

    await session.commitTransaction();

    return wallet.toObject();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}

export async function updateWallet(
  userId: string,
  walletId: string,
  payload: UpdateWalletInput
) {
  const userObjectId = toObjectId(userId, "userId");
  const walletObjectId = toObjectId(walletId, "walletId");

  const wallet = await WalletModel.findOne({
    _id: walletObjectId,
    userId: userObjectId,
  });

  if (!wallet) {
    throw new WalletServiceError("Không tìm thấy ví", 404);
  }

  if (payload.name !== undefined) {
    const name = String(payload.name).trim();
    if (!name) {
      throw new WalletServiceError("Tên ví không được để trống", 400);
    }
    wallet.name = name;
  }

  if (payload.type !== undefined) {
    wallet.type = validateWalletType(payload.type);
  }

  if (payload.label !== undefined) {
    wallet.label = validateWalletLabel(payload.label);
  }

  if (payload.currency !== undefined) {
    const currency = String(payload.currency).trim().toUpperCase();
    if (!currency) {
      throw new WalletServiceError("Tiền tệ không hợp lệ", 400);
    }
    wallet.currency = currency;
  }

  if (payload.icon !== undefined) wallet.icon = String(payload.icon).trim();
  if (payload.color !== undefined) wallet.color = String(payload.color).trim();
  if (payload.bankName !== undefined) wallet.bankName = String(payload.bankName).trim();
  if (payload.accountNumber !== undefined) {
    wallet.accountNumber = String(payload.accountNumber).trim();
  }
  if (payload.provider !== undefined) wallet.provider = String(payload.provider).trim();
  if (payload.note !== undefined) wallet.note = String(payload.note).trim();

  if (payload.sortOrder !== undefined) {
    const sortOrder = Number(payload.sortOrder);
    if (!Number.isFinite(sortOrder)) {
      throw new WalletServiceError("sortOrder không hợp lệ", 400);
    }
    wallet.sortOrder = sortOrder;
  }

  if (payload.isHidden !== undefined) {
    wallet.isHidden = Boolean(payload.isHidden);
  }

  await wallet.save();

  if (wallet.isHidden && wallet.isDefault) {
    const replacement = await WalletModel.findOne({
      userId: userObjectId,
      _id: { $ne: wallet._id },
      isHidden: false,
    }).sort({ sortOrder: 1, createdAt: -1 });

    if (replacement) {
      replacement.isDefault = true;
      await replacement.save();

      wallet.isDefault = false;
      await wallet.save();
    }
  }

  return wallet.toObject();
}

export async function hideWallet(userId: string, walletId: string) {
  const userObjectId = toObjectId(userId, "userId");
  const walletObjectId = toObjectId(walletId, "walletId");

  const wallet = await WalletModel.findOne({
    _id: walletObjectId,
    userId: userObjectId,
  });

  if (!wallet) {
    throw new WalletServiceError("Không tìm thấy ví", 404);
  }

  if (wallet.isHidden) {
    return wallet.toObject();
  }

  wallet.isHidden = true;
  wallet.isDefault = false;
  await wallet.save();

  const replacement = await WalletModel.findOne({
    userId: userObjectId,
    _id: { $ne: wallet._id },
    isHidden: false,
  }).sort({ sortOrder: 1, createdAt: -1 });

  if (replacement) {
    replacement.isDefault = true;
    await replacement.save();
  }

  return wallet.toObject();
}

export async function reorderWallets(
  userId: string,
  payload: ReorderWalletInput
) {
  const userObjectId = toObjectId(userId, "userId");
  const items = Array.isArray(payload.items) ? payload.items : [];

  if (items.length === 0) {
    throw new WalletServiceError("Danh sách sắp xếp trống", 400);
  }

  const session = await startSession();

  try {
    session.startTransaction();

    for (const item of items) {
      const walletObjectId = toObjectId(item.id, "walletId");
      const sortOrder = Number(item.sortOrder);

      if (!Number.isFinite(sortOrder)) {
        throw new WalletServiceError("sortOrder không hợp lệ", 400);
      }

      await WalletModel.updateOne(
        {
          _id: walletObjectId,
          userId: userObjectId,
        },
        {
          $set: { sortOrder },
        },
        { session }
      );
    }

    await session.commitTransaction();

    return WalletModel.find({ userId: userObjectId })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}

export async function setDefaultWallet(userId: string, walletId: string) {
  const userObjectId = toObjectId(userId, "userId");
  const walletObjectId = toObjectId(walletId, "walletId");

  const wallet = await WalletModel.findOne({
    _id: walletObjectId,
    userId: userObjectId,
  });

  if (!wallet) {
    throw new WalletServiceError("Không tìm thấy ví", 404);
  }

  if (wallet.isHidden) {
    throw new WalletServiceError("Không thể đặt ví ẩn làm mặc định", 400);
  }

  const session = await startSession();

  try {
    session.startTransaction();

    await WalletModel.updateMany(
      { userId: userObjectId, isDefault: true },
      { $set: { isDefault: false } },
      { session }
    );

    wallet.isDefault = true;
    await wallet.save({ session });

    await session.commitTransaction();

    return wallet.toObject();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}

export async function adjustWalletBalance(
  userId: string,
  walletId: string,
  payload: AdjustWalletInput
) {
  const userObjectId = toObjectId(userId, "userId");
  const walletObjectId = toObjectId(walletId, "walletId");

  const newBalance = normalizeMoney(payload.newBalance, "Số dư mới");

  const wallet = await WalletModel.findOne({
    _id: walletObjectId,
    userId: userObjectId,
  });

  if (!wallet) {
    throw new WalletServiceError("Không tìm thấy ví", 404);
  }

  if (wallet.isHidden) {
    throw new WalletServiceError("Không thể điều chỉnh ví đang ẩn", 400);
  }

  const balanceBefore = wallet.balance;
  const signedAmount = Math.round((newBalance - balanceBefore) * 100) / 100;

  if (signedAmount === 0) {
    return {
      wallet: wallet.toObject(),
      historyCreated: false,
      message: "Số dư không thay đổi",
    };
  }

  const session = await startSession();

  try {
    session.startTransaction();

    wallet.balance = newBalance;
    await wallet.save({ session });

    await createWalletHistory(
      {
        userId: userObjectId,
        walletId: wallet._id,
        type: "ADJUSTMENT",
        amount: Math.abs(signedAmount),
        signedAmount,
        balanceBefore,
        balanceAfter: newBalance,
        note: String(payload.note ?? "").trim() || "Điều chỉnh số dư",
      },
      session
    );

    await session.commitTransaction();

    return {
      wallet: wallet.toObject(),
      historyCreated: true,
      message: "Điều chỉnh số dư thành công",
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}

export async function transferBetweenWallets(
  userId: string,
  payload: TransferWalletInput
) {
  const userObjectId = toObjectId(userId, "userId");
  const fromWalletId = toObjectId(String(payload.fromWalletId ?? ""), "fromWalletId");
  const toWalletId = toObjectId(String(payload.toWalletId ?? ""), "toWalletId");

  if (String(fromWalletId) === String(toWalletId)) {
    throw new WalletServiceError("Hai ví không được trùng nhau", 400);
  }

  const amount = normalizeMoney(payload.amount, "Số tiền chuyển");
  if (amount <= 0) {
    throw new WalletServiceError("Số tiền chuyển phải lớn hơn 0", 400);
  }

  const note = String(payload.note ?? "").trim();

  const [fromWallet, toWallet] = await Promise.all([
    WalletModel.findOne({
      _id: fromWalletId,
      userId: userObjectId,
      isHidden: false,
    }),
    WalletModel.findOne({
      _id: toWalletId,
      userId: userObjectId,
      isHidden: false,
    }),
  ]);

  if (!fromWallet) {
    throw new WalletServiceError("Không tìm thấy ví nguồn", 404);
  }

  if (!toWallet) {
    throw new WalletServiceError("Không tìm thấy ví đích", 404);
  }

  if (fromWallet.balance < amount) {
    throw new WalletServiceError("Số dư ví nguồn không đủ", 400);
  }

  const fromBefore = fromWallet.balance;
  const toBefore = toWallet.balance;
  const fromAfter = Math.round((fromBefore - amount) * 100) / 100;
  const toAfter = Math.round((toBefore + amount) * 100) / 100;

  const session = await startSession();

  try {
    session.startTransaction();

    fromWallet.balance = fromAfter;
    toWallet.balance = toAfter;

    await fromWallet.save({ session });
    await toWallet.save({ session });

    await createWalletHistory(
      {
        userId: userObjectId,
        walletId: fromWallet._id,
        type: "TRANSFER_OUT",
        amount,
        signedAmount: -amount,
        balanceBefore: fromBefore,
        balanceAfter: fromAfter,
        note: note || `Chuyển sang ví ${toWallet.name}`,
        refWalletId: toWallet._id,
      },
      session
    );

    await createWalletHistory(
      {
        userId: userObjectId,
        walletId: toWallet._id,
        type: "TRANSFER_IN",
        amount,
        signedAmount: amount,
        balanceBefore: toBefore,
        balanceAfter: toAfter,
        note: note || `Nhận từ ví ${fromWallet.name}`,
        refWalletId: fromWallet._id,
      },
      session
    );

    await session.commitTransaction();

    return {
      amount,
      fromWallet: fromWallet.toObject(),
      toWallet: toWallet.toObject(),
      message: "Chuyển tiền thành công",
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}

export async function getWalletHistory(
  userId: string,
  walletId: string,
  options: HistoryOptions = {}
) {
  const userObjectId = toObjectId(userId, "userId");
  const walletObjectId = toObjectId(walletId, "walletId");

  const wallet = await WalletModel.findOne({
    _id: walletObjectId,
    userId: userObjectId,
  }).lean();

  if (!wallet) {
    throw new WalletServiceError("Không tìm thấy ví", 404);
  }

  const page = Math.max(1, Number(options.page ?? 1));
  const limit = Math.min(100, Math.max(1, Number(options.limit ?? 20)));
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    WalletHistoryModel.find({
      userId: userObjectId,
      walletId: walletObjectId,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    WalletHistoryModel.countDocuments({
      userId: userObjectId,
      walletId: walletObjectId,
    }),
  ]);

  return {
    wallet,
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}