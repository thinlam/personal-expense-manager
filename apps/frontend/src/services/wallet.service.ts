import { api } from "./api";
import type {
  AdjustWalletPayload,
  CreateWalletPayload,
  ReorderWalletPayload,
  TransferWalletPayload,
  UpdateWalletPayload,
  Wallet,
  WalletHistoryResponse,
} from "../types/wallet";

export async function getWallets(includeHidden = false): Promise<Wallet[]> {
  const { data } = await api.get("/wallets", {
    params: { includeHidden },
  });
  return data;
}

export async function getWalletById(id: string): Promise<Wallet> {
  const { data } = await api.get(`/wallets/${id}`);
  return data;
}

export async function createWallet(payload: CreateWalletPayload): Promise<Wallet> {
  const { data } = await api.post("/wallets", payload);
  return data;
}

export async function updateWallet(
  id: string,
  payload: UpdateWalletPayload
): Promise<Wallet> {
  const { data } = await api.patch(`/wallets/${id}`, payload);
  return data;
}

export async function hideWallet(id: string): Promise<Wallet> {
  const { data } = await api.delete(`/wallets/${id}`);
  return data;
}

export async function reorderWallets(
  payload: ReorderWalletPayload
): Promise<Wallet[]> {
  const { data } = await api.patch("/wallets/reorder", payload);
  return data;
}

export async function setDefaultWallet(id: string): Promise<Wallet> {
  const { data } = await api.patch(`/wallets/${id}/default`);
  return data;
}

export async function adjustWalletBalance(
  id: string,
  payload: AdjustWalletPayload
): Promise<{
  wallet: Wallet;
  historyCreated: boolean;
  message: string;
}> {
  const { data } = await api.post(`/wallets/${id}/adjust`, payload);
  return data;
}

export async function transferBetweenWallets(
  payload: TransferWalletPayload
): Promise<{
  amount: number;
  fromWallet: Wallet;
  toWallet: Wallet;
  message: string;
}> {
  const { data } = await api.post("/wallets/transfer", payload);
  return data;
}

export async function getWalletHistory(
  id: string,
  page = 1,
  limit = 20
): Promise<WalletHistoryResponse> {
  const { data } = await api.get(`/wallets/${id}/history`, {
    params: { page, limit },
  });
  return data;
}