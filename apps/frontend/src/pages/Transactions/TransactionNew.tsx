import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createTransaction } from "../../services/transaction.service";
import "./transactions.css";

type TxType = "INCOME" | "EXPENSE";

type Form = {
  type: TxType;
  amount: number | ""; // ✅ để "" để không hiện 0
  title: string;
  category: string;
  wallet: string;
  date: string;
  note: string;
  payee: string;
  tags: string[];
};

const today = () => new Date().toISOString().slice(0, 10);

export default function TransactionNew() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [form, setForm] = useState<Form>({
    type: "EXPENSE",
    amount: "", // ✅ mặc định trống
    title: "",
    category: "",
    wallet: "Ví chính",
    date: today(),
    note: "",
    payee: "",
    tags: [],
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      await createTransaction({
        ...form,
        amount: Number(form.amount || 0), // ✅ ép về number khi gửi
        tags: form.tags,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      nav("/transactions", { replace: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      const status = e?.response?.status;
      const msg = e?.response?.data?.message;
      setErr(
        `Tạo giao dịch thất bại. ${status ? `HTTP ${status}` : ""} ${
          msg ? `- ${msg}` : ""
        }`.trim()
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tx-page">
      <div className="tx-head">
        <div>
          <h1>Tạo giao dịch</h1>
          <p>Thêm giao dịch Thu/Chi.</p>
        </div>

        <div className="tx-actions">
          <Link className="btn btn-ghost" to="/transactions">
            ← Quay lại
          </Link>
        </div>
      </div>

      {err && <div className="tx-error">{err}</div>}

      <div className="tx-card">
        <div className="tx-card-head">
          <h3>Thông tin giao dịch</h3>
        </div>

        <form className="tx-form" onSubmit={submit}>
          <label>
            Loại
            <select
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value as TxType })
              }
            >
              <option value="EXPENSE">Chi</option>
              <option value="INCOME">Thu</option>
            </select>
          </label>

          <label>
            Số tiền
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
            Tiêu đề
            <input
              value={form.title}
              required
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </label>

          <label>
            Danh mục
            <input
              value={form.category}
              required
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </label>

          <label>
            Ví
            <input
              value={form.wallet}
              onChange={(e) => setForm({ ...form, wallet: e.target.value })}
            />
          </label>

          <label>
            Ngày
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </label>

          <label className="tx-full">
            Ghi chú
            <input
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </label>

          <label className="tx-full">
            Đối tác
            <input
              value={form.payee}
              onChange={(e) => setForm({ ...form, payee: e.target.value })}
            />
          </label>

          <label className="tx-full">
            Tags (cách nhau bằng dấu phẩy)
            <input
              value={form.tags.join(", ")}
              onChange={(e) =>
                setForm({
                  ...form,
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
              {loading ? "Đang tạo..." : "Tạo giao dịch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}