import type { Period, TxQuery } from "../hooks/useTransactions";

export default function TxFilters(props: {
  query: TxQuery;
  onChange: (patch: Partial<TxQuery>) => void;
  onPeriod: (p: Period) => void;
  onRefresh: () => void;
}) {
  const { query, onChange, onPeriod, onRefresh } = props;

  return (
    <div className="tx-card tx-filters">
      <div className="tx-card-head">
        <h3>Bộ lọc</h3>
        <button className="btn btn-ghost" type="button" onClick={onRefresh}>
          Làm mới
        </button>
      </div>

      <div className="tx-period">
        <button type="button" className={`chip ${query.period === "DAY" ? "active" : ""}`} onClick={() => onPeriod("DAY")}>Ngày</button>
        <button type="button" className={`chip ${query.period === "WEEK" ? "active" : ""}`} onClick={() => onPeriod("WEEK")}>Tuần</button>
        <button type="button" className={`chip ${query.period === "MONTH" ? "active" : ""}`} onClick={() => onPeriod("MONTH")}>Tháng</button>
        <button type="button" className={`chip ${query.period === "YEAR" ? "active" : ""}`} onClick={() => onPeriod("YEAR")}>Năm</button>
        <button type="button" className={`chip ${query.period === "CUSTOM" ? "active" : ""}`} onClick={() => onPeriod("CUSTOM")}>Tuỳ chọn</button>
      </div>

      <div className="tx-row2">
        <label>
          Từ ngày
          <input
            type="date"
            value={query.from}
            onChange={(e) => onChange({ from: e.target.value, period: "CUSTOM" })}
          />
        </label>
        <label>
          Đến ngày
          <input
            type="date"
            value={query.to}
            onChange={(e) => onChange({ to: e.target.value, period: "CUSTOM" })}
          />
        </label>
      </div>

      <label style={{ marginTop: 10 }}>
        Loại giao dịch
        <select value={query.type} onChange={(e) => onChange({ type: e.target.value as TxQuery["type"] })}>
          <option value="">Tất cả</option>
          <option value="INCOME">Thu</option>
          <option value="EXPENSE">Chi</option>
        </select>
      </label>

      <label style={{ marginTop: 10 }}>
        Ví (lọc) (47)
        <input value={query.wallet} onChange={(e) => onChange({ wallet: e.target.value })} placeholder="VD: Ví chính / ngân hàng..." />
      </label>

      <label style={{ marginTop: 10 }}>
        Danh mục (lọc) (48)
        <input value={query.category} onChange={(e) => onChange({ category: e.target.value })} placeholder="VD: ăn uống, đi lại..." />
      </label>

      <label style={{ marginTop: 10 }}>
        Tag (lọc) (50)
        <input value={query.tag} onChange={(e) => onChange({ tag: e.target.value })} placeholder="VD: work, home..." />
      </label>

      <label style={{ marginTop: 10 }}>
        Tìm kiếm (49)
        <input
          value={query.q}
          onChange={(e) => onChange({ q: e.target.value })}
          placeholder="Tiêu đề / ghi chú / đối tác / tags..."
        />
      </label>

      <div className="tx-note">
        * Lọc ví/danh mục/ngày hiện gọi API. Loại + tag đang lọc thêm ở client để chạy ổn ngay.
      </div>
    </div>
  );
}
