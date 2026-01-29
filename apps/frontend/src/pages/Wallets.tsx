import { useEffect, useMemo, useState } from "react";
import { walletService } from "../services/wallet.service";
import "./wallets.css";

type WalletType = "CASH" | "BANK" | "EWALLET";

export type WalletDTO = {
  id: string;
  name: string;
  type: WalletType;
  currency: string;
  balance: number;
  isDefault: boolean;
  isHidden: boolean;
  createdAt?: string;
};

const TYPE_LABEL: Record<WalletType, string> = {
  CASH: "Tiền mặt",
  BANK: "Ngân hàng",
  EWALLET: "Ví điện tử",
};

export default function Wallets() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [items, setItems] = useState<WalletDTO[]>([]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<WalletDTO | null>(null);

  const total = useMemo(
    () => items.filter((w) => !w.isHidden).reduce((s, w) => s + (w.balance || 0), 0),
    [items]
  );

  const load = async () => {
    try {
      setLoading(true);
      setErr(null);
      const data = await walletService.list();
      setItems(data);
    } catch (e: any) {
      setErr(e?.message || "Không tải được danh sách ví.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const onEdit = (w: WalletDTO) => {
    setEditing(w);
    setOpen(true);
  };

  const onDelete = async (id: string) => {
    if (!confirm("Ẩn/Xóa ví này?")) return;
    await walletService.remove(id);
    await load();
  };

  const onSetDefault = async (id: string) => {
    await walletService.setDefault(id);
    await load();
  };

  return (
    <div className="wl">
      <div className="wl__head">
        <div>
          <div className="wl__title">Ví của bạn</div>
          <div className="wl__sub">Quản lý tài khoản tiền (tiền mặt/ngân hàng/ ví điện tử)</div>
        </div>

        <div className="wl__actions">
          <div className="wl__sum">
            Tổng số dư: <b>{formatMoney(total)}</b>
          </div>
          <button className="btn btn--primary btn--sm" onClick={onCreate} type="button">
            + Tạo ví
          </button>
        </div>
      </div>

      {err && (
        <div className="alert">
          <div>
            <b>Lỗi:</b> {err}
          </div>
          <button className="btn btn--ghost btn--sm" onClick={load} type="button">
            Tải lại
          </button>
        </div>
      )}

      <div className="wl__grid">
        {loading ? (
          <div className="card">
            <div className="muted">Đang tải...</div>
          </div>
        ) : items.length === 0 ? (
          <div className="card">
            <div className="empty">
              <div className="empty__left">
                <div className="empty__ic">＋</div>
                <div>
                  <div className="empty__title">Chưa có ví</div>
                  <div className="empty__desc">Tạo ví để bắt đầu theo dõi số dư và giao dịch.</div>
                </div>
              </div>
              <button className="btn btn--primary btn--sm" onClick={onCreate} type="button">
                Tạo ví
              </button>
            </div>
          </div>
        ) : (
          items.map((w) => (
            <div className={`card wlcard ${w.isHidden ? "is-hidden" : ""}`} key={w.id}>
              <div className="wlcard__top">
                <div>
                  <div className="wlcard__name">
                    {w.name}{" "}
                    {w.isDefault && <span className="pill pill--ok">Mặc định</span>}
                    {w.isHidden && <span className="pill pill--soft">Ẩn</span>}
                  </div>
                  <div className="wlcard__meta muted">
                    {TYPE_LABEL[w.type]} · {w.currency}
                  </div>
                </div>

                <div className="wlcard__bal">{formatMoney(w.balance)}</div>
              </div>

              <div className="wlcard__actions">
                {!w.isDefault && !w.isHidden && (
                  <button className="btn btn--ghost btn--sm" onClick={() => onSetDefault(w.id)} type="button">
                    Đặt mặc định
                  </button>
                )}
                <button className="btn btn--ghost btn--sm" onClick={() => onEdit(w)} type="button">
                  Sửa
                </button>
                <button className="btn btn--ghost btn--sm" onClick={() => onDelete(w.id)} type="button">
                  Ẩn/Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {open && (
        <WalletModal
          initial={editing}
          onClose={() => setOpen(false)}
          onSaved={async () => {
            setOpen(false);
            await load();
          }}
        />
      )}
    </div>
  );
}

function WalletModal({
  initial,
  onClose,
  onSaved,
}: {
  initial: WalletDTO | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<WalletType>(initial?.type ?? "CASH");
  const [currency, setCurrency] = useState(initial?.currency ?? "VND");
  const [balance, setBalance] = useState<number>(initial?.balance ?? 0);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErr(null);

      const payload = { name: name.trim(), type, currency, balance: Number(balance || 0) };

      if (!payload.name) throw new Error("Tên ví không được trống.");

      if (initial) await walletService.update(initial.id, payload);
      else await walletService.create(payload);

      await onSaved();
    } catch (e: any) {
      setErr(e?.message || "Không lưu được ví.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal__card">
        <div className="modal__head">
          <div className="modal__title">{initial ? "Sửa ví" : "Tạo ví"}</div>
          <button className="iconbtn" onClick={onClose} type="button" aria-label="Đóng">
            ✕
          </button>
        </div>

        {err && <div className="alert">{err}</div>}

        <form onSubmit={submit} className="form">
          <label className="f">
            <div className="f__lb">Tên ví</div>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Ví tiền mặt" />
          </label>

          <div className="form__row">
            <label className="f">
              <div className="f__lb">Loại</div>
              <select value={type} onChange={(e) => setType(e.target.value as WalletType)}>
                <option value="CASH">Tiền mặt</option>
                <option value="BANK">Ngân hàng</option>
                <option value="EWALLET">Ví điện tử</option>
              </select>
            </label>

            <label className="f">
              <div className="f__lb">Tiền tệ</div>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option value="VND">VND</option>
                <option value="USD">USD</option>
              </select>
            </label>
          </div>

          <label className="f">
            <div className="f__lb">Số dư ban đầu</div>
            <input
              type="number"
              value={balance}
              onChange={(e) => setBalance(Number(e.target.value))}
              placeholder="0"
            />
          </label>

          <div className="form__actions">
            <button className="btn btn--ghost" onClick={onClose} type="button">
              Hủy
            </button>
            <button className="btn btn--primary" type="submit" disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function formatMoney(v: number) {
  return new Intl.NumberFormat("vi-VN").format(v || 0) + " đ";
}
