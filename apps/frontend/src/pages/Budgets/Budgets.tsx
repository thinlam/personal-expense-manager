import { useEffect, useState } from "react";
import {
  createBudget,
  deleteBudget,
  getBudgets,
  getBudgetUsage,
  getBudgetHistory,
  type BudgetDTO,
  type PeriodType,
} from "../../services/budget.service";
import { formatMoney } from "../../utils/formatMoney"; // ✅ Import helper
import "./budgets.css";

const today = () => new Date().toISOString().slice(0, 10);

export default function Budgets() {
  const [items, setItems] = useState<BudgetDTO[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [usage, setUsage] = useState<Record<string, any>>({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [history, setHistory] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [form, setForm] = useState({
    periodType: "MONTH" as PeriodType,
    periodStart: today(),
    amount: "" as number | "",
    category: "",
    wallet: "",
    groupName: "",
    groupCategories: "",
    carryOverEnabled: true,
    warnAt80: true,
    warnAt90: true,
    warnOver: true,
  });

  const fetchList = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await getBudgets();
      setItems(res);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErr(
        `Không tải budgets. ${e?.response?.status ? `HTTP ${e.response.status}` : ""}`.trim()
      );
    } finally {
      setLoading(false);
    }
  };

  const refreshUsage = async (list: BudgetDTO[]) => {
    try {
      const pairs = await Promise.all(
        list.map(async (b) => [b._id, await getBudgetUsage(b._id)] as const)
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const next: Record<string, any> = {};
      pairs.forEach(([id, u]) => (next[id] = u));
      setUsage(next);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  useEffect(() => {
    if (!items.length) return;
    refreshUsage(items);
    const t = setInterval(() => refreshUsage(items), 8000); // 62 realtime
    return () => clearInterval(t);
  }, [items]);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    try {
      await createBudget({
        periodType: form.periodType,
        periodStart: form.periodStart,
        amount: Number(form.amount || 0),
        category: form.category || undefined,
        wallet: form.wallet || undefined,

        groupName: form.groupName || undefined,
        groupCategories: form.groupCategories
          ? form.groupCategories.split(",").map((x) => x.trim()).filter(Boolean)
          : undefined,

        carryOverEnabled: form.carryOverEnabled,
        warnAt80: form.warnAt80,
        warnAt90: form.warnAt90,
        warnOver: form.warnOver,
      });

      setForm({
        periodType: "MONTH",
        periodStart: today(),
        amount: "",
        category: "",
        wallet: "",
        groupName: "",
        groupCategories: "",
        carryOverEnabled: true,
        warnAt80: true,
        warnAt90: true,
        warnOver: true,
      });

      await fetchList();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErr(
        `Tạo budget thất bại. ${e?.response?.status ? `HTTP ${e.response.status}` : ""}`.trim()
      );
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Xóa ngân sách này?")) return;
    setLoading(true);
    try {
      await deleteBudget(id);
      setItems((p) => p.filter((x) => x._id !== id));
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (id: string) => {
    const h = await getBudgetHistory(id);
    setHistory((p) => ({ ...p, [id]: h }));
  };

  return (
    <div className="b-page">
      <div className="b-head">
        <div>
          <h1>Ngân sách (Budgets)</h1>
          <p>
            59–68: tạo theo kỳ, theo ví, % realtime, cảnh báo 80/90/vượt, carry-over, nhóm danh mục,
            so sánh, lịch sử.
          </p>
        </div>
      </div>

      {err && <div className="b-error">{err}</div>}

      <div className="b-card">
        <div className="b-card-head">
          <h3>Tạo ngân sách</h3>
          <div className="b-muted">{loading ? "Đang xử lý..." : ""}</div>
        </div>

        <form className="b-form" onSubmit={onCreate}>
          <label>
            Kỳ (60)
            <select
              value={form.periodType}
              onChange={(e) => setForm({ ...form, periodType: e.target.value as PeriodType })}
            >
              <option value="WEEK">Tuần</option>
              <option value="MONTH">Tháng</option>
              <option value="QUARTER">Quý</option>
              <option value="YEAR">Năm</option>
            </select>
          </label>

          <label>
            Bắt đầu kỳ
            <input
              type="date"
              value={form.periodStart}
              onChange={(e) => setForm({ ...form, periodStart: e.target.value })}
            />
          </label>

          <label>
            Số tiền ngân sách
            <input
              type="number"
              min={0}
              placeholder="Nhập số tiền..."
              value={form.amount}
              onChange={(e) =>
                setForm({
                  ...form,
                  amount: e.target.value === "" ? "" : Number(e.target.value),
                })
              }
              required
            />
          </label>

          <label>
            Danh mục (59)
            <input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="VD: ăn uống"
            />
          </label>

          <label>
            Ví (61)
            <input
              value={form.wallet}
              onChange={(e) => setForm({ ...form, wallet: e.target.value })}
              placeholder="VD: Ví chính"
            />
          </label>

          <label className="b-full">
            Nhóm danh mục (66) - danh mục (phân cách dấu phẩy)
            <input
              value={form.groupCategories}
              onChange={(e) => setForm({ ...form, groupCategories: e.target.value })}
              placeholder="VD: ăn uống, xăng, điện nước"
            />
          </label>

          <label>
            Carry-over (65)
            <select
              value={form.carryOverEnabled ? "YES" : "NO"}
              onChange={(e) => setForm({ ...form, carryOverEnabled: e.target.value === "YES" })}
            >
              <option value="YES">Bật</option>
              <option value="NO">Tắt</option>
            </select>
          </label>

          <label>
            Cảnh báo 80% (64)
            <select
              value={form.warnAt80 ? "YES" : "NO"}
              onChange={(e) => setForm({ ...form, warnAt80: e.target.value === "YES" })}
            >
              <option value="YES">Bật</option>
              <option value="NO">Tắt</option>
            </select>
          </label>

          <label>
            Cảnh báo 90% (64)
            <select
              value={form.warnAt90 ? "YES" : "NO"}
              onChange={(e) => setForm({ ...form, warnAt90: e.target.value === "YES" })}
            >
              <option value="YES">Bật</option>
              <option value="NO">Tắt</option>
            </select>
          </label>

          <label>
            Cảnh báo vượt (63)
            <select
              value={form.warnOver ? "YES" : "NO"}
              onChange={(e) => setForm({ ...form, warnOver: e.target.value === "YES" })}
            >
              <option value="YES">Bật</option>
              <option value="NO">Tắt</option>
            </select>
          </label>

          <div className="b-full b-submit">
            <button className="b-btn b-primary" disabled={loading} type="submit">
              Tạo ngân sách
            </button>
          </div>
        </form>
      </div>

      <div className="b-card">
        <div className="b-card-head">
          <h3>Danh sách ngân sách</h3>
          <div className="b-muted">Tổng: {items.length}</div>
        </div>

        <div className="b-list">
          {items.map((b) => {
            const u = usage[b._id];
            const percent = Number(u?.percent ?? 0);

            return (
              <div key={b._id} className="b-item">
                <div className="b-top">
                  <div className="b-title">
                    {b.groupName ? `Nhóm: ${b.groupName}` : b.category ? `DM: ${b.category}` : b.name}
                    <div className="b-sub">
                      {b.periodType} · {String(b.periodStart).slice(0, 10)} ·{" "}
                      {b.wallet ? `Ví: ${b.wallet}` : "All ví"}
                    </div>
                  </div>

                  <div className="b-actions">
                    <button className="b-btn" type="button" onClick={() => loadHistory(b._id)}>
                      Lịch sử (68)
                    </button>
                    <button className="b-btn b-danger" type="button" onClick={() => onDelete(b._id)}>
                      Xóa
                    </button>
                  </div>
                </div>

                <div className="b-bar">
                  <div className="b-bar-fill" style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} />
                </div>

                <div className="b-meta">
                  <span>% dùng (62): <b>{percent.toFixed(0)}%</b></span>
                  <span>Thực chi: <b>{formatMoney(u?.spent ?? 0)}</b></span>
                  <span>Ngân sách: <b>{formatMoney(u?.effectiveBudget ?? b.limit)}</b></span>
                  {u?.alerts?.includes("OVER") && <span className="b-badge over">Vượt (63)</span>}
                  {u?.alerts?.includes("NEAR_90") && <span className="b-badge near">~90% (64)</span>}
                  {u?.alerts?.includes("NEAR_80") && <span className="b-badge near2">~80% (64)</span>}
                </div>

                {history[b._id] && (
                  <div className="b-history">
                    <div className="b-history-head">Lịch sử thay đổi</div>
                    {history[b._id].length === 0 ? (
                      <div className="b-muted">Chưa có thay đổi.</div>
                    ) : (
                      history[b._id]
                        .slice()
                        .reverse()
                        .slice(0, 10)
                        .map((h, idx) => (
                          <div key={idx} className="b-history-row">
                            <span>{String(h.at).slice(0, 19).replace("T", " ")}</span>
                            <span>{h.note || "Update"}</span>
                          </div>
                        ))
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {items.length === 0 && <div className="b-muted">Chưa có ngân sách nào.</div>}
        </div>
      </div>
    </div>
  );
}