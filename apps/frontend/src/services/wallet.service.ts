import { api } from "./api";

export type WalletType = "CASH" | "BANK" | "EWALLET";

export type WalletDTO = {
  id: string;
  name: string;
  type: WalletType;
  currency: string;
  balance: number;
  isDefault: boolean;
  isHidden: boolean;
};

export const walletService = {
  async list() {
    const res = await api.get<WalletDTO[]>("/wallets");
    return res.data;
  },

  async create(payload: { name: string; type: WalletType; currency: string; balance: number }) {
    const res = await api.post<WalletDTO>("/wallets", payload);
    return res.data;
  },

  async update(
    id: string,
    payload: { name: string; type: WalletType; currency: string; balance: number }
  ) {
    const res = await api.patch<WalletDTO>(`/wallets/${id}`, payload);
    return res.data;
  },

  async remove(id: string) {
    const res = await api.delete<{ ok: boolean }>(`/wallets/${id}`);
    return res.data;
  },

  async setDefault(id: string) {
    const res = await api.post<{ ok: boolean }>(`/wallets/${id}/set-default`);
    return res.data;
  },
};
