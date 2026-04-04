import type { TransactionDTO } from "../types/transaction";

export default function TxDetailModal(props: {
  open: boolean;
  tx: TransactionDTO | null;
  onClose: () => void;
}) {
  const { open, tx, onClose } = props;
  if (!open || !tx) return null;

  return (
    <div className="tx-modal-backdrop" onMouseDown={onClose}>
      <div className="tx-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="tx-modal-head">
          <h3>Chi tiết giao dịch (45)</h3>
          <button className="btn btn-ghost" type="button" onClick={onClose}>Đóng</button>
        </div>

        <div className="tx-kv">
          <div><span>Loại</span><b>{tx.type === "INCOME" ? "Thu" : "Chi"}</b></div>
          <div><span>Số tiền</span><b>{(tx.amount ?? 0).toLocaleString("vi-VN")}</b></div>
          <div><span>Ngày</span><b>{(tx.date ?? "").slice(0, 10)}</b></div>
          <div><span>Ví</span><b>{tx.wallet}</b></div>
          <div><span>Danh mục</span><b>{tx.category}</b></div>
          <div className="full"><span>Tiêu đề</span><b>{tx.title}</b></div>
          <div className="full"><span>Ghi chú</span><b>{tx.note ?? "-"}</b></div>
          <div className="full"><span>Đối tác</span><b>{tx.payee ?? "-"}</b></div>
          <div className="full"><span>Tags</span><b>{(tx.tags ?? []).join(", ") || "-"}</b></div>
        </div>

        <div className="tx-note">
          51/52/53/54/55/56/57 sẽ hiển thị thêm khi backend hỗ trợ field tương ứng.
        </div>
      </div>
    </div>
  );
}
