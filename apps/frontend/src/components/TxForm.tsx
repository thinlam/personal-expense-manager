import { useMemo, useState } from "react";
import type { TransactionCreateDTO, TxType } from "../types/transaction";

const today = () => new Date().toISOString().slice(0, 10);

const empty: TransactionCreateDTO = {
  type: "EXPENSE",
  amount: 0,
  title: "",
  category: "",
  wallet: "Ví chính",
  date: today(),
  note: "",
  payee: "",
  tags: [],
};

export default function TxForm(props: {
  loading: boolean;
  onCreate: (payload: TransactionCreateDTO) => Promise<boolean>;
}) {
  const { loading, onCreate } = props;
  const [form, setForm] = useState<TransactionCreateDTO>(empty);

  const canSubmit = useMemo(() => {
    return form.title.trim() && form.category.trim() && form.wallet.trim() && form.amount > 0;
  }, [form]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const ok = await onCreate(form);
    if (ok) setForm({ ...empty, date: today() });
  };

  const setTypeQuick = (t: TxType) => setForm((p) => ({ ...p, type: t }));

  return (
    <div className="tx-card">
      <div className="tx-card-head">
        <h3>Thêm giao dịch</h3>
        <div className="tx-actions">
          <button type="button" className="btn btn-income" onClick={() => setTypeQuick("INCOME")}>
            + Thu (42)
          </button>
          <button type="button" className="btn btn-expense" onClick={() => setTypeQuick("EXPENSE")}>
            - Chi (41)
          </button>
        </div>
      </div>

      <form className="tx-form" onSubmit={submit}>
        <label>
          Loại
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as TxType })}>
            <option value="EXPENSE">Chi</option>
            <option value="INCOME">Thu</option>
          </select>
        </label>

        <label>
          Số tiền
          <input
            type="number"
            value={form.amount}
            min={0}
            onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
            required
          />
        </label>

        <label>
          Tiêu đề
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </label>

        <label>
          Danh mục
          <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
        </label>

        <label>
          Ví
          <input value={form.wallet} onChange={(e) => setForm({ ...form, wallet: e.target.value })} />
        </label>

        <label>
          Ngày
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </label>

        <label className="tx-full">
          Ghi chú
          <input value={form.note ?? ""} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        </label>

        <label className="tx-full">
          Đối tác (payee)
          <input value={form.payee ?? ""} onChange={(e) => setForm({ ...form, payee: e.target.value })} />
        </label>

        <label className="tx-full">
          Tags (cách nhau bằng dấu phẩy) (50)
          <input
            value={(form.tags ?? []).join(", ")}
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
          <button className="btn btn-primary" type="submit" disabled={loading || !canSubmit}>
            {loading ? "Đang xử lý..." : "Tạo giao dịch"}
          </button>
        </div>
      </form>
    </div>
  );
}
