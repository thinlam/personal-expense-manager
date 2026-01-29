import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { walletService } from "../services/wallet.service";
import "./dashboard.css"; // ✅ reuse layout/btn/top/side của bạn
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
  CASH: "TIỀN MẶT",
  BANK: "NGÂN HÀNG",
  EWALLET: "VÍ ĐIỆN TỬ",
};

type Me = { name?: string; isPremium?: boolean };
function getMe(): Me | null {
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Me;
  } catch {
    return null;
  }
}
function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "";
  const b = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (a + b).toUpperCase();
}
function formatMoney(v: number) {
  return new Intl.NumberFormat("vi-VN").format(v || 0) + " đ";
}
function maskId(id: string) {
  const last4 = id?.slice(-4) || "0000";
  return `•••• ${last4}`;
}

export default function Wallets() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [items, setItems] = useState<WalletDTO[]>([]);
  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<WalletDTO | null>(null);

  const [transferOpen, setTransferOpen] = useState(false);

  const me = getMe();
  const displayName = me?.name?.trim() || "Người dùng";
  const badge = me?.isPremium ? "PREMIUM USER" : "FREE USER";
  const ava = initialsFromName(displayName);

  const visible = useMemo(() => items.filter((w) => !w.isHidden), [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return visible;
    return visible.filter((w) => (w.name || "").toLowerCase().includes(q));
  }, [visible, search]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
    return arr;
  }, [filtered]);

  const total = useMemo(
    () => visible.reduce((s, w) => s + (w.balance || 0), 0),
    [visible]
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
    if (!confirm("Ẩn ví này?")) return;
    await walletService.remove(id);
    await load();
  };

  const onSetDefault = async (id: string) => {
    await walletService.setDefault(id);
    await load();
  };

  return (
    <div className="dash">
      {/* SIDEBAR */}
      <aside className="side">
        <div className="side__brand">
          <div className="brand__logo">🛡</div>
          <div className="brand__text">
            <div className="brand__name">SECUREFIN</div>
            <div className="brand__sub">Quản lý tài chính cá nhân</div>
          </div>
        </div>

        <nav className="side__nav">
          <Link className="side__item" to="/dashboard">
            <span className="side__ic">▦</span>
            <span>Tổng quan</span>
          </Link>

          <Link className="side__item is-active" to="/wallets">
            <span className="side__ic">💳</span>
            <span>Ví của tôi</span>
          </Link>

          <Link className="side__item" to="/transactions">
            <span className="side__ic">⇄</span>
            <span>Giao dịch</span>
          </Link>

          <Link className="side__item" to="/budgets">
            <span className="side__ic">◷</span>
            <span>Ngân sách</span>
          </Link>

          <Link className="side__item" to="/reports">
            <span className="side__ic">▤</span>
            <span>Báo cáo</span>
          </Link>

          <div className="side__sep" />

          <Link className="side__item" to="/settings">
            <span className="side__ic">⚙</span>
            <span>Cài đặt</span>
          </Link>
        </nav>

        <div className="side__upgrade">
          <div className="upgrade__title">Nâng cấp tài khoản của bạn</div>
          <div className="upgrade__desc">SECUREFIN Pro</div>
          <button className="btn btn--primary w-full" type="button">
            Nâng cấp Premium
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main">
        {/* TOPBAR */}
        <header className="top">
          <div className="top__left">
            <div className="top__title">Quản lý Ví &amp; Tài khoản</div>
          </div>

          <div className="top__mid">
            <div className="search">
              <span className="search__ic">⌕</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm giao dịch..."
                aria-label="Tìm kiếm"
              />
            </div>
          </div>

          <div className="top__right">
            <button className="iconbtn" type="button" aria-label="Thông báo">
              🔔
            </button>
            <button className="iconbtn" type="button" aria-label="Cài đặt">
              ⚙️
            </button>

            <div className="user">
              <div className="user__meta">
                <div className="user__name">{displayName}</div>
                <div className="user__badge">{badge}</div>
              </div>
              <div className="user__ava">{ava}</div>
            </div>
          </div>
        </header>

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

        {/* HEADER BALANCE + ACTIONS */}
        <section className="ws__hero">
          <div>
            <div className="ws__kicker">Tổng số dư khả dụng</div>
            <div className="ws__big">{formatMoney(total)}</div>
          </div>

          <div className="ws__heroActions">
            <button className="btn btn--primary btn--sm ws__btnPlus" onClick={onCreate} type="button">
              ＋ Thêm ví mới
            </button>
            <button className="btn btn--ghost btn--sm ws__btnGhost" onClick={() => setTransferOpen(true)} type="button">
              ⇄ Chuyển tiền
            </button>
          </div>
        </section>

        {/* CARDS GRID */}
        <section className="ws__grid">
          {loading ? (
            <div className="card">
              <div className="muted">Đang tải...</div>
            </div>
          ) : (
            <>
              {sorted.map((w) => (
                <div
                  className={`wsCard ${w.isDefault ? "is-default" : ""}`}
                  key={w.id}
                >
                  <div className="wsCard__top">
                    <div className={`wsIcon wsIcon--${w.type}`}>
                      {w.type === "CASH" ? "💵" : w.type === "BANK" ? "🏦" : "📱"}
                    </div>

                    <div className="wsCard__rightTop">
                      <div className="wsCard__mask">{maskId(w.id)}</div>
                      <button
                        className="wsCard__menu"
                        type="button"
                        onClick={() => onEdit(w)}
                        aria-label="Menu"
                      >
                        ⋯
                      </button>
                    </div>
                  </div>

                  <div className="wsCard__mid">
                    <div className="wsCard__label">
                      {TYPE_LABEL[w.type]}
                      {w.isDefault && <span className="wsBadge">MẶC ĐỊNH</span>}
                    </div>
                    <div className="wsCard__bal">{formatMoney(w.balance)}</div>
                  </div>

                  <div className="wsCard__foot">
                    <div className="muted">
                      {w.createdAt ? `Cập nhật: ${new Date(w.createdAt).toLocaleDateString("vi-VN")}` : " "}
                    </div>

                    <div className="wsCard__actions">
                      {!w.isDefault && (
                        <button className="wsMini" onClick={() => onSetDefault(w.id)} type="button">
                          Đặt mặc định
                        </button>
                      )}
                      <button className="wsMini" onClick={() => onEdit(w)} type="button">
                        Sửa
                      </button>
                      <button className="wsMini wsMini--danger" onClick={() => onDelete(w.id)} type="button">
                        Ẩn
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* ADD CARD */}
              <button className="wsAdd" onClick={onCreate} type="button">
                <div className="wsAdd__ic">＋</div>
                <div className="wsAdd__txt">Thêm ví hoặc tài khoản</div>
              </button>
            </>
          )}
        </section>

        {/* QUICK ACTIONS */}
        <section className="wsQuick">
          <div className="wsQuick__title">Thao tác nhanh</div>

          <div className="wsQuick__grid">
            <Link className="wsQ" to="/wallets">
              <div className="wsQ__ic">🧾</div>
              <div className="wsQ__lb">Điều chỉnh số dư</div>
            </Link>

            <Link className="wsQ" to="/transactions?type=adjustment">
              <div className="wsQ__ic">🕘</div>
              <div className="wsQ__lb">Lịch sử điều chỉnh</div>
            </Link>

            <Link className="wsQ" to="/reports">
              <div className="wsQ__ic">📊</div>
              <div className="wsQ__lb">Phân bổ tài sản</div>
            </Link>

            <Link className="wsQ" to="/reports?export=1">
              <div className="wsQ__ic">📤</div>
              <div className="wsQ__lb">Xuất báo cáo</div>
            </Link>
          </div>
        </section>

        {/* MODALS */}
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

        {transferOpen && (
          <TransferModal
            wallets={visible}
            onClose={() => setTransferOpen(false)}
          />
        )}
      </main>
    </div>
  );
}

/* ================== MODALS ================== */

function WalletModal({
  initial,
  onClose,
  onSaved,
}: {
  initial: WalletDTO | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [type, setType] = useState<WalletType>(initial?.type ?? "CASH");
  const [name, setName] = useState(initial?.name ?? "");
  const [balance, setBalance] = useState<number>(initial?.balance ?? 0);
  const [label, setLabel] = useState<string>("Cá nhân");
  const [makeDefault, setMakeDefault] = useState<boolean>(initial?.isDefault ?? true);

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // ESC để đóng
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErr(null);

      const payload = {
        name: name.trim(),
        type,
        currency: "VND",
        balance: Number(balance || 0),
        // label, makeDefault // backend bạn chưa dùng cũng không sao
      };

      if (!payload.name) throw new Error("Tên ví không được trống.");

      if (initial) {
        await walletService.update(initial.id, payload);
        // nếu user bật “mặc định” mà ví này chưa default => set default
        if (makeDefault && !initial.isDefault) {
          await walletService.setDefault(initial.id);
        }
      } else {
        const created = await walletService.create(payload);
        // nếu user muốn default => set default sau khi tạo
        if (makeDefault && created?.id) {
          await walletService.setDefault(created.id);
        }
      }

      await onSaved();
    } catch (e: any) {
      setErr(e?.message || "Không lưu được ví.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="wmodal" role="dialog" aria-modal="true" onMouseDown={onClose}>
      <div className="wmodal__card" onMouseDown={(e) => e.stopPropagation()}>
        <div className="wmodal__head">
          <div>
            <div className="wmodal__title">{initial ? "Chỉnh sửa ví" : "Thêm ví mới"}</div>
            <div className="wmodal__sub">Thiết lập nguồn tiền để bắt đầu quản lý</div>
          </div>

          <button className="wmodal__x" onClick={onClose} type="button" aria-label="Đóng">
            ✕
          </button>
        </div>

        {err && <div className="wmodal__err">⚠ {err}</div>}

        <form onSubmit={submit} className="wform">
          <div className="wform__block">
            <div className="wform__label">Chọn loại ví</div>

            <div className="wtype">
              <button
                type="button"
                className={`wtype__item ${type === "CASH" ? "is-active" : ""}`}
                onClick={() => setType("CASH")}
              >
                <div className="wtype__ic">💵</div>
                <div className="wtype__txt">TIỀN MẶT</div>
              </button>

              <button
                type="button"
                className={`wtype__item ${type === "BANK" ? "is-active" : ""}`}
                onClick={() => setType("BANK")}
              >
                <div className="wtype__ic">🏦</div>
                <div className="wtype__txt">NGÂN HÀNG</div>
              </button>

              <button
                type="button"
                className={`wtype__item ${type === "EWALLET" ? "is-active" : ""}`}
                onClick={() => setType("EWALLET")}
              >
                <div className="wtype__ic">📱</div>
                <div className="wtype__txt">VÍ ĐIỆN TỬ</div>
              </button>
            </div>
          </div>

          <div className="wform__row2">
            <label className="wfield">
              <div className="wfield__lb">Tên ví</div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Ví tiêu dùng, VCB..."
                autoFocus
              />
            </label>

            <label className="wfield">
              <div className="wfield__lb">Số dư ban đầu</div>
              <div className="wfield__money">
                <input
                  type="number"
                  value={balance}
                  onChange={(e) => setBalance(Number(e.target.value))}
                  placeholder="0"
                />
                <span className="wfield__suffix">đ</span>
              </div>
            </label>
          </div>

          <div className="wform__row2">
            <label className="wfield">
              <div className="wfield__lb">Gắn nhãn ví</div>
              <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Cá nhân" />
            </label>

            <div className="wfield">
              <div className="wfield__lb">&nbsp;</div>
              <div className="wswitch">
                <span className="wswitch__txt">Đặt làm ví mặc định</span>
                <label className="wswitch__ctl">
                  <input
                    type="checkbox"
                    checked={makeDefault}
                    onChange={(e) => setMakeDefault(e.target.checked)}
                  />
                  <span className="wswitch__track" />
                </label>
              </div>
            </div>
          </div>

          <div className="wform__actions">
            <button className="wbtn wbtn--ghost" onClick={onClose} type="button">
              Hủy bỏ
            </button>

            <button className="wbtn wbtn--primary" type="submit" disabled={saving}>
              {saving ? "Đang xử lý..." : initial ? "Lưu thay đổi" : "Tạo ví ngay"}
            </button>
          </div>

          <div className="wform__note">
            <span className="wform__dot">●</span>
            Bạn có thể liên kết trực tiếp với ngân hàng ở bước sau để tự động theo dõi giao dịch.
          </div>
        </form>
      </div>
    </div>
  );
}


function TransferModal({
  wallets,
  onClose,
}: {
  wallets: WalletDTO[];
  onClose: () => void;
}) {
  const [fromId, setFromId] = useState(wallets[0]?.id || "");
  const [toId, setToId] = useState(wallets[1]?.id || "");
  const [amount, setAmount] = useState<number>(0);
  const [note, setNote] = useState("");

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal__card">
        <div className="modal__head">
          <div className="modal__title">Chuyển tiền</div>
          <button className="iconbtn" onClick={onClose} type="button" aria-label="Đóng">
            ✕
          </button>
        </div>

        <div className="alert">
          Chức năng chuyển tiền (transaction transfer) bạn có thể nối backend sau. UI đã sẵn.
        </div>

        <form className="form" onSubmit={(e) => e.preventDefault()}>
          <div className="form__row">
            <label className="f">
              <div className="f__lb">Từ ví</div>
              <select value={fromId} onChange={(e) => setFromId(e.target.value)}>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({formatMoney(w.balance)})
                  </option>
                ))}
              </select>
            </label>

            <label className="f">
              <div className="f__lb">Đến ví</div>
              <select value={toId} onChange={(e) => setToId(e.target.value)}>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="f">
            <div className="f__lb">Số tiền</div>
            <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
          </label>

          <label className="f">
            <div className="f__lb">Ghi chú</div>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="VD: Chuyển qua ví ngân hàng" />
          </label>

          <div className="form__actions">
            <button className="btn btn--ghost" onClick={onClose} type="button">
              Đóng
            </button>
            <button className="btn btn--primary" type="button" onClick={onClose}>
              OK
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
