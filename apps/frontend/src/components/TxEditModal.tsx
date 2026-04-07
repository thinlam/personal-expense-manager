import { useEffect, useMemo, useState } from "react";
import type { TransactionDTO, TransactionUpdateDTO, TxType } from "../types/transaction";

export default function TxEditModal(props: {
  open: boolean;
  tx: TransactionDTO | null;
  loading: boolean;
  onClose: () => void;
  onSave: (id: string, payload: TransactionUpdateDTO) => Promise<boolean>;
}) {
  const { open, tx, loading, onClose, onSave } = props;

  const [form, setForm] = useState<TransactionUpdateDTO>({});

  useEffect(() => {
    if (tx) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        type: tx.type,
        amount: tx.amount,
        title: tx.title,
        category: tx.category,
        wallet: tx.wallet,
        date: (tx.date ?? "").slice(0, 10),
        note: tx.note ?? "",
        payee: tx.payee ?? "",
        tags: tx.tags ?? [],
      });
    }
  }, [tx]);

  const canSave = useMemo(() => {
    return !!(form.title?.toString().trim() && form.category?.toString().trim() && (form.amount ?? 0) > 0);
  }, [form]);

  if (!open || !tx) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    const ok = await onSave(tx._id, form);
    if (ok) onClose();
  };

  return (
    <div className="tx-modal-backdrop" onMouseDown={onClose}>
      <div className="tx-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="tx-modal-head">
          <h3>Sửa giao dịch (43)</h3>
          <button className="btn btn-ghost" type="button" onClick={onClose}>Đóng</button>
        </div>

        <form className="tx-form" onSubmit={submit}>
          <label>
            Loại
            <select value={form.type as string} onChange={(e) => setForm({ ...form, type: e.target.value as TxType })}>
              <option value="EXPENSE">Chi</option>
              <option value="INCOME">Thu</option>
            </select>
          </label>

          <label>
            Số tiền
            <input
              type="number"
              value={Number(form.amount ?? 0)}
              min={0}
              onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
            />
          </label>

          <label>
            Tiêu đề
            <input value={(form.title ?? "") as string} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </label>

          <label>
            Danh mục
            <input value={(form.category ?? "") as string} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </label>

          <label>
            Ví
            <input value={(form.wallet ?? "") as string} onChange={(e) => setForm({ ...form, wallet: e.target.value })} />
          </label>

          <label>
            Ngày
            <input type="date" value={(form.date ?? "") as string} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </label>

          <label className="tx-full">
            Ghi chú
            <input value={(form.note ?? "") as string} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </label>

          <label className="tx-full">
            Đối tác (payee)
            <input value={(form.payee ?? "") as string} onChange={(e) => setForm({ ...form, payee: e.target.value })} />
          </label>

          <label className="tx-full">
            Tags
            <input
              value={((form.tags ?? []) as string[]).join(", ")}
              onChange={(e) =>
                setForm({
                  ...form,
                  tags: e.target.value.split(",").map((x) => x.trim()).filter(Boolean),
                })
              }
            />
          </label>

          <div className="tx-full tx-submit">
            <button className="btn btn-primary" type="submit" disabled={loading || !canSave}>
              {loading ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
