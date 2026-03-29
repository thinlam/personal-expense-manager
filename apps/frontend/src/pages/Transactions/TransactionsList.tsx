import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  getTransactions,
  deleteTransaction,
  updateTransaction,
  exportTransactionsCsv,
  exportTransactionsXlsx,
  exportTransactionsPdf,
} from "../../services/transaction.service";
import { formatMoney } from "../../utils/formatMoney";
import "./transactions.css";

type TxType = "INCOME" | "EXPENSE";
type RangeKey = "DAY" | "WEEK" | "MONTH" | "YEAR";

type Transaction = {
  _id: string;
  type: TxType;
  amount: number;
  currency?: string;
  originalAmount?: number | null;
  exchangeRateToBase?: number;
  title: string;
  category: string;
  wallet: string;
  date: string; // ISO
  note?: string;
  payee?: string;
  tags?: string[];
};

function normalize(payload: unknown): Transaction[] {
  if (Array.isArray(payload)) return payload as Transaction[];
  if (payload && typeof payload === "object") {
    const o = payload as Record<string, unknown>;
    if (Array.isArray(o.items)) return o.items as Transaction[];
    if (Array.isArray(o.data)) return o.data as Transaction[];
    if (Array.isArray(o.transactions)) return o.transactions as Transaction[];
  }
  return [];
}

type DateInput = HTMLInputElement & { showPicker?: () => void };

function openDatePicker(ref: React.RefObject<HTMLInputElement | null>) {
  const el = ref.current as DateInput | null;
  if (!el) return;
  if (typeof el.showPicker === "function") el.showPicker();
  else el.focus();
}

function toYYYYMMDD(d: Date) {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function calcRange(range: RangeKey) {
  const now = new Date();

  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate(), 0, 0, 0, 0);
  const endOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate(), 23, 59, 59, 999);

  if (range === "DAY") {
    return { from: toYYYYMMDD(startOfDay(now)), to: toYYYYMMDD(endOfDay(now)) };
  }

  if (range === "WEEK") {
    const day = now.getDay(); // 0..6
    const diff = (day + 6) % 7; // monday start
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
    const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
    return { from: toYYYYMMDD(startOfDay(monday)), to: toYYYYMMDD(endOfDay(sunday)) };
  }

  if (range === "MONTH") {
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from: toYYYYMMDD(startOfDay(first)), to: toYYYYMMDD(endOfDay(last)) };
  }

  // YEAR
  const first = new Date(now.getFullYear(), 0, 1);
  const last = new Date(now.getFullYear(), 11, 31);
  return { from: toYYYYMMDD(startOfDay(first)), to: toYYYYMMDD(endOfDay(last)) };
}

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export default function TransactionsList() {
  const [rows, setRows] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Filters
  const [range, setRange] = useState<RangeKey>("MONTH");
  const [q, setQ] = useState("");
  const [wallet, setWallet] = useState("");
  const [category, setCategory] = useState("");
  const [tag, setTag] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const fromRef = useRef<HTMLInputElement | null>(null);
  const toRef = useRef<HTMLInputElement | null>(null);

  // Edit modal
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [draft, setDraft] = useState<Transaction | null>(null);

  const buildParams = () => ({
    q: q.trim() || undefined,
    wallet: wallet.trim() || undefined,
    category: category.trim() || undefined,
    tag: tag.trim() || undefined,
    from: from || undefined,
    to: to || undefined,
    // range: range, // nếu backend bạn có nhận range thì mở dòng này + service getTransactions nhận range
  });

  const fetchList = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await getTransactions(buildParams());
      setRows(normalize(res));
    } catch {
      setRows([]);
      setErr("Không tải được danh sách giao dịch. Kiểm tra API /transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const r = calcRange("MONTH");
    setFrom(r.from);
    setTo(r.to);
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    const tg = tag.trim().toLowerCase();
    if (!text && !tg) return rows;

    return rows.filter((t) => {
      if (tg) {
        const tags = (t.tags ?? []).join(" ").toLowerCase();
        if (!tags.includes(tg)) return false;
      }
      if (!text) return true;

      return [
        t.title,
        t.note ?? "",
        t.payee ?? "",
        t.category,
        t.wallet,
        (t.tags ?? []).join(" "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(text);
    });
  }, [rows, q, tag]);

  const totalIncome = useMemo(
    () => filtered.filter((x) => x.type === "INCOME").reduce((s, x) => s + (x.amount || 0), 0),
    [filtered]
  );
  const totalExpense = useMemo(
    () => filtered.filter((x) => x.type === "EXPENSE").reduce((s, x) => s + (x.amount || 0), 0),
    [filtered]
  );

  const applyRange = (rk: RangeKey) => {
    setRange(rk);
    const r = calcRange(rk);
    setFrom(r.from);
    setTo(r.to);
  };

  const onDelete = async (id: string) => {
    if (!confirm("Xóa giao dịch này?")) return;
    setLoading(true);
    setErr(null);
    try {
      await deleteTransaction(id);
      setRows((prev) => prev.filter((x) => x._id !== id));
    } catch {
      setErr("Xóa thất bại. Kiểm tra API.");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (t: Transaction) => {
    setEditing(t);
    setDraft({
      ...t,
      date: (t.date ?? "").slice(0, 10),
      tags: t.tags ?? [],
      note: t.note ?? "",
      payee: t.payee ?? "",
    });
  };

  const onSave = async () => {
    if (!editing || !draft) return;
    setLoading(true);
    setErr(null);
    try {
      await updateTransaction(editing._id, {
        type: draft.type,
        amount: Number(draft.amount || 0),
        title: draft.title,
        category: draft.category,
        wallet: draft.wallet,
        date: draft.date,
        note: draft.note ?? "",
        payee: draft.payee ?? "",
        tags: draft.tags ?? [],
      });

      setEditing(null);
      setDraft(null);
      await fetchList();
    } catch {
      setErr("Sửa thất bại. Kiểm tra API.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ (58) Export
  const onExportCsv = async () => {
    setLoading(true);
    setErr(null);
    try {
      const blob = await exportTransactionsCsv(buildParams());
      downloadBlob(blob, "transactions.csv");
    } catch {
      setErr("Export CSV thất bại. Kiểm tra API /transactions/export/csv");
    } finally {
      setLoading(false);
    }
  };

  const onExportXlsx = async () => {
    setLoading(true);
    setErr(null);
    try {
      const blob = await exportTransactionsXlsx(buildParams());
      downloadBlob(blob, "transactions.xlsx");
    } catch {
      setErr("Export Excel thất bại. Kiểm tra API /transactions/export/xlsx");
    } finally {
      setLoading(false);
    }
  };

  const onExportPdf = async () => {
    setLoading(true);
    setErr(null);
    try {
      const blob = await exportTransactionsPdf(buildParams());
      downloadBlob(blob, "transactions.pdf");
    } catch {
      setErr("Export PDF thất bại. Kiểm tra API /transactions/export/pdf");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tx-page">
      <div className="tx-head">
        <div>
          <h1>Giao dịch thu/chi</h1>
          <p>Danh sách + lọc + sửa/xóa + xuất file.</p>
        </div>

        <div className="tx-summary">
          <span className="pill income">Thu: {formatMoney(totalIncome)}</span>
          <span className="pill expense">Chi: {formatMoney(totalExpense)}</span>
          <span className="pill">Còn: {formatMoney(totalIncome - totalExpense)}</span>

          <Link className="btn btn-primary" to="/transactions/new">
            + Tạo giao dịch
          </Link>

          <button className="btn" type="button" onClick={onExportCsv} disabled={loading}>
            CSV
          </button>
          <button className="btn" type="button" onClick={onExportXlsx} disabled={loading}>
            Excel
          </button>
          <button className="btn" type="button" onClick={onExportPdf} disabled={loading}>
            PDF
          </button>

          <button className="btn btn-ghost" type="button" onClick={fetchList} disabled={loading}>
            Làm mới
          </button>
        </div>
      </div>

      {err && <div className="tx-error">{err}</div>}

      {/* Filters */}
      <div className="tx-card">
        <div className="tx-card-head">
          <h3>Bộ lọc</h3>
          <div className="tx-muted">{loading ? "Đang tải..." : `Tổng: ${filtered.length}`}</div>
        </div>

        <div className="tx-period">
          <button type="button" className={`chip ${range === "DAY" ? "active" : ""}`} onClick={() => applyRange("DAY")}>
            Ngày
          </button>
          <button type="button" className={`chip ${range === "WEEK" ? "active" : ""}`} onClick={() => applyRange("WEEK")}>
            Tuần
          </button>
          <button type="button" className={`chip ${range === "MONTH" ? "active" : ""}`} onClick={() => applyRange("MONTH")}>
            Tháng
          </button>
          <button type="button" className={`chip ${range === "YEAR" ? "active" : ""}`} onClick={() => applyRange("YEAR")}>
            Năm
          </button>
        </div>

        <div className="tx-row2">
          <label>
            Từ ngày
            <div className="tx-date">
              <input ref={fromRef} type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              <button type="button" className="tx-dateBtn" onClick={() => openDatePicker(fromRef)} title="Chọn ngày">
                📅
              </button>
            </div>
          </label>

          <label>
            Đến ngày
            <div className="tx-date">
              <input ref={toRef} type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              <button type="button" className="tx-dateBtn" onClick={() => openDatePicker(toRef)} title="Chọn ngày">
                📅
              </button>
            </div>
          </label>

          <label>
            Ví
            <input value={wallet} onChange={(e) => setWallet(e.target.value)} placeholder="VD: Ví chính" />
          </label>

          <label>
            Danh mục
            <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="VD: ăn uống" />
          </label>

          <label>
            Tag
            <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="VD: work" />
          </label>

          <label>
            Tìm kiếm
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="tiêu đề/ghi chú/đối tác" />
          </label>
        </div>

        <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn" type="button" onClick={fetchList} disabled={loading}>
            Áp dụng lọc
          </button>

          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => {
              setWallet("");
              setCategory("");
              setTag("");
              setQ("");
              const r = calcRange("MONTH");
              setRange("MONTH");
              setFrom(r.from);
              setTo(r.to);
            }}
            disabled={loading}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="tx-card">
        <div className="tx-table-wrap">
          <table className="tx-table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Loại</th>
                <th>Tiêu đề</th>
                <th>Danh mục</th>
                <th>Ví</th>
                <th className="right">Số tiền</th>
                <th>Tags</th>
                <th>Hành động</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((t) => (
                <tr key={t._id}>
                  <td>{(t.date ?? "").slice(0, 10)}</td>
                  <td>{t.type === "INCOME" ? "Thu" : "Chi"}</td>
                  <td>{t.title}</td>
                  <td>{t.category}</td>
                  <td>{t.wallet}</td>
                  <td className="right">{formatMoney(t.amount)}</td>
                  <td>{(t.tags ?? []).join(", ")}</td>
                  <td className="actions">
                    <button className="btn" type="button" onClick={() => openEdit(t)}>
                      Sửa
                    </button>
                    <button className="btn btn-danger" type="button" onClick={() => onDelete(t._id)}>
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td className="empty" colSpan={8}>
                    Không có giao dịch.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit modal */}
      {editing && draft && (
        <div className="tx-modal-backdrop" onMouseDown={() => setEditing(null)}>
          <div className="tx-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="tx-modal-head">
              <h3>Sửa giao dịch</h3>
              <button className="btn btn-ghost" type="button" onClick={() => setEditing(null)}>
                Đóng
              </button>
            </div>

            <form
              className="tx-form"
              onSubmit={(e) => {
                e.preventDefault();
                onSave();
              }}
            >
              <label>
                Loại
                <select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as TxType })}>
                  <option value="EXPENSE">Chi</option>
                  <option value="INCOME">Thu</option>
                </select>
              </label>

              <label>
                Số tiền
                <input
                  type="number"
                  min={0}
                  value={draft.amount}
                  onChange={(e) => setDraft({ ...draft, amount: Number(e.target.value) })}
                />
              </label>

              <label>
                Tiêu đề
                <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
              </label>

              <label>
                Danh mục
                <input value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
              </label>

              <label>
                Ví
                <input value={draft.wallet} onChange={(e) => setDraft({ ...draft, wallet: e.target.value })} />
              </label>

              <label>
                Ngày
                <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
              </label>

              <label className="tx-full">
                Ghi chú
                <input value={draft.note ?? ""} onChange={(e) => setDraft({ ...draft, note: e.target.value })} />
              </label>

              <label className="tx-full">
                Đối tác
                <input value={draft.payee ?? ""} onChange={(e) => setDraft({ ...draft, payee: e.target.value })} />
              </label>

              <label className="tx-full">
                Tags (cách nhau bằng dấu phẩy)
                <input
                  value={(draft.tags ?? []).join(", ")}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      tags: e.target.value
                        .split(",")
                        .map((x) => x.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </label>

              <div className="tx-full tx-submit">
                <button className="btn btn-primary" type="submit" disabled={loading}>
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}