import type { Request, Response } from "express";
import {
  WalletServiceError,
  adjustWalletBalance,
  createWallet,
  getWalletById,
  getWalletHistory,
  hideWallet,
  listWallets,
  reorderWallets,
  setDefaultWallet,
  transferBetweenWallets,
  updateWallet,
} from "./wallet.service";

type AuthenticatedRequest = Request & {
  user?: {
    id?: string;
    _id?: string;
  };
  userId?: string;
};

function getUserId(req: AuthenticatedRequest): string | null {
  if (req.userId) return String(req.userId);
  if (req.user?.id) return String(req.user.id);
  if (req.user?._id) return String(req.user._id);
  return null;
}

function getStringParam(value: unknown, fieldName: string): string {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) {
    return value[0].trim();
  }

  throw new WalletServiceError(`${fieldName} không hợp lệ`, 400);
}

function getNumberQuery(value: unknown, defaultValue: number): number {
  if (typeof value === "string") {
    const num = Number(value);
    return Number.isFinite(num) ? num : defaultValue;
  }

  if (Array.isArray(value) && typeof value[0] === "string") {
    const num = Number(value[0]);
    return Number.isFinite(num) ? num : defaultValue;
  }

  return defaultValue;
}

function getBooleanQuery(value: unknown, defaultValue = false): boolean {
  if (typeof value === "string") {
    return value === "true";
  }

  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0] === "true";
  }

  return defaultValue;
}

function handleError(res: Response, error: unknown, fallbackMessage: string) {
  if (error instanceof WalletServiceError) {
    return res.status(error.status).json({ message: error.message });
  }

  console.error(fallbackMessage, error);
  return res.status(500).json({ message: fallbackMessage });
}

export async function listWalletsController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const includeHidden = getBooleanQuery(req.query.includeHidden, false);
    const wallets = await listWallets(userId, { includeHidden });

    return res.status(200).json(wallets);
  } catch (error) {
    return handleError(res, error, "Không thể lấy danh sách ví");
  }
}

export async function getWalletByIdController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const walletId = getStringParam(req.params.id, "walletId");
    const wallet = await getWalletById(userId, walletId);

    return res.status(200).json(wallet);
  } catch (error) {
    return handleError(res, error, "Không thể lấy thông tin ví");
  }
}

export async function createWalletController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const wallet = await createWallet(userId, req.body);

    return res.status(201).json(wallet);
  } catch (error) {
    return handleError(res, error, "Không thể tạo ví");
  }
}

export async function updateWalletController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const walletId = getStringParam(req.params.id, "walletId");
    const wallet = await updateWallet(userId, walletId, req.body);

    return res.status(200).json(wallet);
  } catch (error) {
    return handleError(res, error, "Không thể cập nhật ví");
  }
}

export async function hideWalletController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const walletId = getStringParam(req.params.id, "walletId");
    const wallet = await hideWallet(userId, walletId);

    return res.status(200).json(wallet);
  } catch (error) {
    return handleError(res, error, "Không thể ẩn ví");
  }
}

export async function reorderWalletsController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const wallets = await reorderWallets(userId, req.body);

    return res.status(200).json(wallets);
  } catch (error) {
    return handleError(res, error, "Không thể sắp xếp ví");
  }
}

export async function setDefaultWalletController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const walletId = getStringParam(req.params.id, "walletId");
    const wallet = await setDefaultWallet(userId, walletId);

    return res.status(200).json(wallet);
  } catch (error) {
    return handleError(res, error, "Không thể đặt ví mặc định");
  }
}

export async function adjustWalletBalanceController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const walletId = getStringParam(req.params.id, "walletId");
    const result = await adjustWalletBalance(userId, walletId, req.body);

    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error, "Không thể điều chỉnh số dư");
  }
}

export async function transferBetweenWalletsController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await transferBetweenWallets(userId, req.body);

    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error, "Không thể chuyển tiền giữa các ví");
  }
}

export async function getWalletHistoryController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const walletId = getStringParam(req.params.id, "walletId");
    const page = getNumberQuery(req.query.page, 1);
    const limit = getNumberQuery(req.query.limit, 20);

    const result = await getWalletHistory(userId, walletId, {
      page,
      limit,
    });

    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error, "Không thể lấy lịch sử ví");
  }
}