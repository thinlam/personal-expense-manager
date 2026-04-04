import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./wallets.css";
import {
  adjustWalletBalance,
  createWallet,
  getWalletHistory,
  getWallets,
  hideWallet,
  reorderWallets,
  setDefaultWallet,
  transferBetweenWallets,
  updateWallet,
} from "../../services/wallet.service";
import type {
  Wallet,
  WalletHistoryItem,
  WalletLabel,
  WalletType,
} from "../../types/wallet";

type WalletFormState = {
  name: string;
  type: WalletType;
  label: WalletLabel;
  initialBalance: string;
  currency: string;
  color: string;
  icon: string;
  bankName: string;
  accountNumber: string;
  provider: string;
  note: string;
  isDefault: boolean;
};

const defaultForm: WalletFormState = {
  name: "",
  type: "CASH",
  label: "PERSONAL",
  initialBalance: "0",
  currency: "VND",
  color: "",
  icon: "",
  bankName: "",
  accountNumber: "",
  provider: "",
  note: "",
  isDefault: false,
};

function formatMoney(value: number, currency = "VND") {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function getTypeLabel(type: WalletType) {
  switch (type) {
    case "CASH":
      return "Tiền mặt";
    case "BANK":
      return "Ngân hàng";
    case "EWALLET":
      return "Ví điện tử";
    default:
      return type;
  }
}

function getLabelText(label: WalletLabel) {
  switch (label) {
    case "PERSONAL":
      return "Cá nhân";
    case "FAMILY":
      return "Gia đình";
    case "WORK":
      return "Công việc";
    default:
      return label;
  }
}

function getHistoryTypeLabel(type: WalletHistoryItem["type"]) {
  switch (type) {
    case "OPENING_BALANCE":
      return "Số dư ban đầu";
    case "INCOME_TX":
      return "Giao dịch thu";
    case "EXPENSE_TX":
      return "Giao dịch chi";
    case "ADJUSTMENT":
      return "Điều chỉnh";
    case "TRANSFER_OUT":
      return "Chuyển ra";
    case "TRANSFER_IN":
      return "Nhận vào";
    default:
      return type;
  }
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export default function Wallets() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [form, setForm] = useState<WalletFormState>(defaultForm);

  const [showAdjust, setShowAdjust] = useState(false);
  const [adjustWalletId, setAdjustWalletId] = useState("");
  const [adjustBalance, setAdjustBalance] = useState("0");
  const [adjustNote, setAdjustNote] = useState("");

  const [showTransfer, setShowTransfer] = useState(false);
  const [fromWalletId, setFromWalletId] = useState("");
  const [toWalletId, setToWalletId] = useState("");
  const [transferAmount, setTransferAmount] = useState("0");
  const [transferNote, setTransferNote] = useState("");

  const [historyWallet, setHistoryWallet] = useState<Wallet | null>(null);
  const [historyItems, setHistoryItems] = useState<WalletHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  async function loadWallets() {
    try {
      setLoading(true);
      setError("");
      const data = await getWallets(false);
      setWallets(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Không thể tải danh sách ví"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadWallets();
  }, []);

  const totalBalance = useMemo(
    () => wallets.reduce((sum, item) => sum + item.balance, 0),
    [wallets]
  );

  function resetForm() {
    setForm(defaultForm);
    setEditingWallet(null);
    setShowForm(false);
  }

  function openCreateForm() {
    setError("");
    setSuccess("");
    setEditingWallet(null);
    setForm(defaultForm);
    setShowForm(true);
  }

  function openEditForm(wallet: Wallet) {
    setError("");
    setSuccess("");
    setEditingWallet(wallet);
    setForm({
      name: wallet.name,
      type: wallet.type,
      label: wallet.label,
      initialBalance: String(wallet.initialBalance),
      currency: wallet.currency,
      color: wallet.color || "",
      icon: wallet.icon || "",
      bankName: wallet.bankName || "",
      accountNumber: wallet.accountNumber || "",
      provider: wallet.provider || "",
      note: wallet.note || "",
      isDefault: wallet.isDefault,
    });
    setShowForm(true);
  }

  async function handleSubmitForm(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        name: form.name.trim(),
        type: form.type,
        label: form.label,
        initialBalance: Number(form.initialBalance || 0),
        currency: form.currency.trim() || "VND",
        color: form.color.trim(),
        icon: form.icon.trim(),
        bankName: form.bankName.trim(),
        accountNumber: form.accountNumber.trim(),
        provider: form.provider.trim(),
        note: form.note.trim(),
        isDefault: form.isDefault,
      };

      if (editingWallet) {
        await updateWallet(editingWallet._id, {
          name: payload.name,
          type: payload.type,
          label: payload.label,
          currency: payload.currency,
          color: payload.color,
          icon: payload.icon,
          bankName: payload.bankName,
          accountNumber: payload.accountNumber,
          provider: payload.provider,
          note: payload.note,
        });
        setSuccess("Cập nhật ví thành công");
      } else {
        await createWallet(payload);
        setSuccess("Tạo ví thành công");
      }

      resetForm();
      await loadWallets();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Không thể lưu ví"));
    } finally {
      setSaving(false);
    }
  }

  async function handleHideWallet(wallet: Wallet) {
    const ok = window.confirm(`Ẩn ví "${wallet.name}"?`);
    if (!ok) return;

    try {
      setError("");
      setSuccess("");
      await hideWallet(wallet._id);
      setSuccess("Ẩn ví thành công");
      await loadWallets();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Không thể ẩn ví"));
    }
  }

  async function handleSetDefault(wallet: Wallet) {
    try {
      setError("");
      setSuccess("");
      await setDefaultWallet(wallet._id);
      setSuccess(`Đã đặt "${wallet.name}" làm ví mặc định`);
      await loadWallets();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Không thể đặt ví mặc định"));
    }
  }

  function openAdjustModal(wallet: Wallet) {
    setAdjustWalletId(wallet._id);
    setAdjustBalance(String(wallet.balance));
    setAdjustNote("");
    setShowAdjust(true);
    setError("");
    setSuccess("");
  }

  async function handleAdjustBalance(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await adjustWalletBalance(adjustWalletId, {
        newBalance: Number(adjustBalance || 0),
        note: adjustNote.trim(),
      });

      setShowAdjust(false);
      setAdjustWalletId("");
      setAdjustBalance("0");
      setAdjustNote("");
      setSuccess("Điều chỉnh số dư thành công");
      await loadWallets();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Không thể điều chỉnh số dư"));
    } finally {
      setSaving(false);
    }
  }

  function openTransferModal() {
    const visible = wallets.filter((w) => !w.isHidden);
    setFromWalletId(visible[0]?._id || "");
    setToWalletId(visible[1]?._id || visible[0]?._id || "");
    setTransferAmount("0");
    setTransferNote("");
    setShowTransfer(true);
    setError("");
    setSuccess("");
  }

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await transferBetweenWallets({
        fromWalletId,
        toWalletId,
        amount: Number(transferAmount || 0),
        note: transferNote.trim(),
      });

      setShowTransfer(false);
      setSuccess("Chuyển tiền thành công");
      await loadWallets();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Không thể chuyển tiền giữa các ví"));
    } finally {
      setSaving(false);
    }
  }

  async function handleMove(walletId: string, direction: "up" | "down") {
    const sorted = [...wallets].sort((a, b) => a.sortOrder - b.sortOrder);
    const index = sorted.findIndex((item) => item._id === walletId);
    if (index < 0) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const current = sorted[index];
    const target = sorted[targetIndex];

    const updated = sorted.map((item) => {
      if (item._id === current._id) {
        return { ...item, sortOrder: target.sortOrder };
      }
      if (item._id === target._id) {
        return { ...item, sortOrder: current.sortOrder };
      }
      return item;
    });

    try {
      setError("");
      setSuccess("");

      await reorderWallets({
        items: updated.map((item, idx) => ({
          id: item._id,
          sortOrder: idx + 1,
        })),
      });

      setSuccess("Sắp xếp ví thành công");
      await loadWallets();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Không thể sắp xếp ví"));
    }
  }

  async function handleOpenHistory(wallet: Wallet) {
    try {
      setHistoryWallet(wallet);
      setHistoryLoading(true);
      setHistoryItems([]);
      setError("");
      const result = await getWalletHistory(wallet._id, 1, 30);
      setHistoryItems(result.items);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Không thể tải lịch sử ví"));
    } finally {
      setHistoryLoading(false);
    }
  }

  return (
    <div className="walletsPage">
      <div className="walletsHeader">
        <div>
          <h1>Ví / Tài khoản tiền</h1>
          <p>Quản lý ví tiền mặt, ngân hàng và ví điện tử.</p>
        </div>

        <div className="walletsHeader__actions">
          <button
            className="walletBtn walletBtn--ghost"
            onClick={openTransferModal}
          >
            Chuyển tiền
          </button>
          <button
            className="walletBtn walletBtn--primary"
            onClick={openCreateForm}
          >
            + Tạo ví
          </button>
        </div>
      </div>

      {error ? (
        <div className="walletAlert walletAlert--error">{error}</div>
      ) : null}
      {success ? (
        <div className="walletAlert walletAlert--success">{success}</div>
      ) : null}

      <div className="walletSummary">
        <div className="walletSummary__card">
          <span>Tổng số ví</span>
          <strong>{wallets.length}</strong>
        </div>
        <div className="walletSummary__card">
          <span>Tổng số dư</span>
          <strong>{formatMoney(totalBalance)}</strong>
        </div>
        <div className="walletSummary__card">
          <span>Ví mặc định</span>
          <strong>{wallets.find((w) => w.isDefault)?.name || "Chưa có"}</strong>
        </div>
      </div>

      <div className="walletListWrap">
        {loading ? (
          <div className="walletEmpty">Đang tải dữ liệu ví...</div>
        ) : wallets.length === 0 ? (
          <div className="walletEmpty">Chưa có ví nào. Hãy tạo ví đầu tiên.</div>
        ) : (
          <div className="walletGrid">
            {[...wallets]
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((wallet, index, arr) => (
                <div className="walletCard" key={wallet._id}>
                  <div className="walletCard__top">
                    <div>
                      <div className="walletCard__titleRow">
                        <h3>{wallet.name}</h3>
                        {wallet.isDefault ? (
                          <span className="walletBadge walletBadge--default">
                            Mặc định
                          </span>
                        ) : null}
                      </div>

                      <div className="walletCard__meta">
                        <span>{getTypeLabel(wallet.type)}</span>
                        <span>•</span>
                        <span>{getLabelText(wallet.label)}</span>
                      </div>
                    </div>

                    <div
                      className="walletColorDot"
                      style={{ background: wallet.color || "#3b82f6" }}
                    />
                  </div>

                  <div className="walletCard__balance">
                    {formatMoney(wallet.balance, wallet.currency)}
                  </div>

                  <div className="walletCard__sub">
                    Số dư ban đầu:{" "}
                    {formatMoney(wallet.initialBalance, wallet.currency)}
                  </div>

                  {(wallet.bankName ||
                    wallet.accountNumber ||
                    wallet.provider) && (
                    <div className="walletCard__info">
                      {wallet.bankName ? (
                        <div>Ngân hàng: {wallet.bankName}</div>
                      ) : null}
                      {wallet.accountNumber ? (
                        <div>STK: {wallet.accountNumber}</div>
                      ) : null}
                      {wallet.provider ? (
                        <div>Nhà cung cấp: {wallet.provider}</div>
                      ) : null}
                    </div>
                  )}

                  {wallet.note ? (
                    <div className="walletCard__note">{wallet.note}</div>
                  ) : null}

                  <div className="walletCard__actions">
                    <button onClick={() => openEditForm(wallet)}>Sửa</button>
                    <button onClick={() => openAdjustModal(wallet)}>
                      Điều chỉnh
                    </button>
                    <button onClick={() => void handleOpenHistory(wallet)}>
                      Lịch sử
                    </button>
                    {!wallet.isDefault ? (
                      <button onClick={() => void handleSetDefault(wallet)}>
                        Đặt mặc định
                      </button>
                    ) : null}
                    <button
                      onClick={() => void handleMove(wallet._id, "up")}
                      disabled={index === 0}
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => void handleMove(wallet._id, "down")}
                      disabled={index === arr.length - 1}
                    >
                      ↓
                    </button>
                    <button
                      className="walletDanger"
                      onClick={() => void handleHideWallet(wallet)}
                    >
                      Ẩn
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {showForm ? (
        <div className="walletModal">
          <div className="walletModal__content">
            <div className="walletModal__head">
              <h2>{editingWallet ? "Sửa ví" : "Tạo ví mới"}</h2>
              <button onClick={resetForm}>✕</button>
            </div>

            <form className="walletForm" onSubmit={handleSubmitForm}>
              <div className="walletForm__grid">
                <label>
                  <span>Tên ví</span>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </label>

                <label>
                  <span>Loại ví</span>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm({ ...form, type: e.target.value as WalletType })
                    }
                  >
                    <option value="CASH">Tiền mặt</option>
                    <option value="BANK">Ngân hàng</option>
                    <option value="EWALLET">Ví điện tử</option>
                  </select>
                </label>

                <label>
                  <span>Nhãn</span>
                  <select
                    value={form.label}
                    onChange={(e) =>
                      setForm({ ...form, label: e.target.value as WalletLabel })
                    }
                  >
                    <option value="PERSONAL">Cá nhân</option>
                    <option value="FAMILY">Gia đình</option>
                    <option value="WORK">Công việc</option>
                  </select>
                </label>

                <label>
                  <span>Số dư ban đầu</span>
                  <input
                    type="number"
                    value={form.initialBalance}
                    onChange={(e) =>
                      setForm({ ...form, initialBalance: e.target.value })
                    }
                    disabled={Boolean(editingWallet)}
                  />
                </label>

                <label>
                  <span>Tiền tệ</span>
                  <input
                    value={form.currency}
                    onChange={(e) =>
                      setForm({ ...form, currency: e.target.value })
                    }
                  />
                </label>

                <label>
                  <span>Màu</span>
                  <input
                    placeholder="#3b82f6"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                  />
                </label>

                <label>
                  <span>Icon</span>
                  <input
                    placeholder="wallet"
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  />
                </label>

                <label>
                  <span>Ngân hàng</span>
                  <input
                    value={form.bankName}
                    onChange={(e) =>
                      setForm({ ...form, bankName: e.target.value })
                    }
                  />
                </label>

                <label>
                  <span>Số tài khoản</span>
                  <input
                    value={form.accountNumber}
                    onChange={(e) =>
                      setForm({ ...form, accountNumber: e.target.value })
                    }
                  />
                </label>

                <label>
                  <span>Nhà cung cấp</span>
                  <input
                    value={form.provider}
                    onChange={(e) =>
                      setForm({ ...form, provider: e.target.value })
                    }
                  />
                </label>
              </div>

              <label className="walletForm__checkbox">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) =>
                    setForm({ ...form, isDefault: e.target.checked })
                  }
                  disabled={Boolean(editingWallet)}
                />
                <span>Đặt làm ví mặc định</span>
              </label>

              <label>
                <span>Ghi chú</span>
                <textarea
                  rows={3}
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                />
              </label>

              <div className="walletModal__foot">
                <button
                  type="button"
                  className="walletBtn walletBtn--ghost"
                  onClick={resetForm}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="walletBtn walletBtn--primary"
                  disabled={saving}
                >
                  {saving
                    ? "Đang lưu..."
                    : editingWallet
                    ? "Lưu thay đổi"
                    : "Tạo ví"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {showAdjust ? (
        <div className="walletModal">
          <div className="walletModal__content walletModal__content--small">
            <div className="walletModal__head">
              <h2>Điều chỉnh số dư</h2>
              <button onClick={() => setShowAdjust(false)}>✕</button>
            </div>

            <form className="walletForm" onSubmit={handleAdjustBalance}>
              <label>
                <span>Số dư mới</span>
                <input
                  type="number"
                  value={adjustBalance}
                  onChange={(e) => setAdjustBalance(e.target.value)}
                  required
                />
              </label>

              <label>
                <span>Ghi chú</span>
                <textarea
                  rows={3}
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                />
              </label>

              <div className="walletModal__foot">
                <button
                  type="button"
                  className="walletBtn walletBtn--ghost"
                  onClick={() => setShowAdjust(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="walletBtn walletBtn--primary"
                  disabled={saving}
                >
                  {saving ? "Đang xử lý..." : "Xác nhận"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {showTransfer ? (
        <div className="walletModal">
          <div className="walletModal__content walletModal__content--small">
            <div className="walletModal__head">
              <h2>Chuyển tiền giữa các ví</h2>
              <button onClick={() => setShowTransfer(false)}>✕</button>
            </div>

            <form className="walletForm" onSubmit={handleTransfer}>
              <label>
                <span>Từ ví</span>
                <select
                  value={fromWalletId}
                  onChange={(e) => setFromWalletId(e.target.value)}
                >
                  {wallets.map((wallet) => (
                    <option key={wallet._id} value={wallet._id}>
                      {wallet.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Đến ví</span>
                <select
                  value={toWalletId}
                  onChange={(e) => setToWalletId(e.target.value)}
                >
                  {wallets.map((wallet) => (
                    <option key={wallet._id} value={wallet._id}>
                      {wallet.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Số tiền</span>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  required
                />
              </label>

              <label>
                <span>Ghi chú</span>
                <textarea
                  rows={3}
                  value={transferNote}
                  onChange={(e) => setTransferNote(e.target.value)}
                />
              </label>

              <div className="walletModal__foot">
                <button
                  type="button"
                  className="walletBtn walletBtn--ghost"
                  onClick={() => setShowTransfer(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="walletBtn walletBtn--primary"
                  disabled={saving}
                >
                  {saving ? "Đang xử lý..." : "Chuyển tiền"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {historyWallet ? (
        <div className="walletModal">
          <div className="walletModal__content walletModal__content--large">
            <div className="walletModal__head">
              <h2>Lịch sử ví: {historyWallet.name}</h2>
              <button onClick={() => setHistoryWallet(null)}>✕</button>
            </div>

            {historyLoading ? (
              <div className="walletEmpty">Đang tải lịch sử...</div>
            ) : historyItems.length === 0 ? (
              <div className="walletEmpty">Chưa có lịch sử biến động.</div>
            ) : (
              <div className="walletHistory">
                {historyItems.map((item) => (
                  <div className="walletHistory__item" key={item._id}>
                    <div>
                      <strong>{getHistoryTypeLabel(item.type)}</strong>
                      <div>{new Date(item.createdAt).toLocaleString("vi-VN")}</div>
                      {item.note ? <p>{item.note}</p> : null}
                    </div>

                    <div className="walletHistory__right">
                      <div
                        className={
                          item.signedAmount >= 0
                            ? "walletHistory__amount walletHistory__amount--plus"
                            : "walletHistory__amount walletHistory__amount--minus"
                        }
                      >
                        {item.signedAmount >= 0 ? "+" : ""}
                        {formatMoney(item.signedAmount, historyWallet.currency)}
                      </div>
                      <small>
                        {formatMoney(item.balanceBefore, historyWallet.currency)}{" "}
                        → {formatMoney(item.balanceAfter, historyWallet.currency)}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}