import type { TransactionDTO } from "../types/transaction";

export default function TxTable(props: {
  items: TransactionDTO[];
  loading: boolean;
  onDelete: (id: string) => void;
  onDetail: (tx: TransactionDTO) => void;
  onEdit: (tx: TransactionDTO) => void;
}) {
  const { items, loading, onDelete, onDetail, onEdit } = props;

  return (
    <div className="tx-card">
      <div className="tx-card-head">
        <h3>Danh sách giao dịch</h3>
        <div className="tx-muted">Tổng: {items.length}</div>
      </div>

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
            {items.map((t) => (
              <tr key={t._id}>
                <td>{(t.date ?? "").slice(0, 10)}</td>
                <td>{t.type === "INCOME" ? "Thu" : "Chi"}</td>
                <td>{t.title}</td>
                <td>{t.category}</td>
                <td>{t.wallet}</td>
                <td className="right">{(t.amount ?? 0).toLocaleString("vi-VN")}</td>
                <td>{(t.tags ?? []).join(", ")}</td>
                <td className="actions">
                  <button className="btn" type="button" onClick={() => onDetail(t)}>
                    Xem (45)
                  </button>
                  <button className="btn" type="button" onClick={() => onEdit(t)}>
                    Sửa (43)
                  </button>
                  <button className="btn btn-danger" type="button" onClick={() => onDelete(t._id)}>
                    Xóa (44)
                  </button>
                </td>
              </tr>
            ))}

            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={8} className="empty">
                  Không có giao dịch nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {loading && <div className="tx-muted" style={{ marginTop: 10 }}>Đang tải...</div>}
    </div>
  );
}
