import { useEffect, useMemo, useState } from "react";
import "./reports.css";
import {
  exportCustomReportCsv,
  getCustomReport,
  getReportsDashboard,
} from "../../services/report.service";
import type {
  CashflowPoint,
  CustomReportRow,
  MonthComparison,
  ReportFilters,
  ReportsDashboardData,
} from "../../types/report";

const DEFAULT_FILTERS: ReportFilters = {
  preset: "month",
  from: "2026-03-01",
  to: "2026-03-31",
  wallet: "Tất cả",
  category: "Tất cả",
  keyword: "",
  type: "all",
};

function formatMoney(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function deltaPercent(current: number, previous: number): number {
  if (!previous) return 100;
  return ((current - previous) / previous) * 100;
}

function getPointY(
  value: number,
  min: number,
  max: number,
  height = 220
): number {
  const range = max - min || 1;
  return height - ((value - min) / range) * (height - 40) - 20;
}

function getTrendPath(
  points: CashflowPoint[],
  width = 560,
  height = 220
): string {
  if (!points.length) return "";

  const values = points.map((item) => item.balance);
  const min = Math.min(...values);
  const max = Math.max(...values);

  return points
    .map((point, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * (width - 32) + 16;
      const y = getPointY(point.balance, min, max, height);
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
}

type ReportStatCardProps = {
  label: string;
  value: string;
  sub: string;
};

function ReportStatCard({ label, value, sub }: ReportStatCardProps) {
  return (
    <div className="reportCard statCard">
      <div className="statCard__label">{label}</div>
      <div className="statCard__value">{value}</div>
      <div className="statCard__sub">{sub}</div>
    </div>
  );
}

type ProgressItem = {
  label: string;
  amount: number;
  percent: number;
};

type ProgressListProps = {
  title: string;
  items: ProgressItem[];
};

function ProgressList({ title, items }: ProgressListProps) {
  return (
    <section className="reportCard reportSection">
      <div className="sectionHead">
        <h3>{title}</h3>
      </div>

      <div className="progressList">
        {items.map((item) => (
          <div className="progressRow" key={item.label}>
            <div className="progressRow__top">
              <span>{item.label}</span>
              <strong>{formatMoney(item.amount)}</strong>
            </div>

            <div className="progressTrack">
              <div
                className="progressTrack__fill"
                style={{ width: `${item.percent}%` }}
              />
            </div>

            <div className="progressRow__meta">
              {formatPercent(item.percent)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

type CashflowChartProps = {
  points: CashflowPoint[];
};

function CashflowChart({ points }: CashflowChartProps) {
  const width = 560;
  const height = 220;

  const values = useMemo(() => points.map((item) => item.balance), [points]);
  const min = useMemo(() => Math.min(...values), [values]);
  const max = useMemo(() => Math.max(...values), [values]);
  const path = useMemo(
    () => getTrendPath(points, width, height),
    [points, width, height]
  );

  const maxBalance = useMemo(() => {
    return Math.max(...points.map((item) => item.balance), 0);
  }, [points]);

  return (
    <section className="reportCard reportSection">
      <div className="sectionHead">
        <h3>Dòng tiền theo thời gian</h3>
        <span>Số dư cuối kỳ cao nhất: {formatMoney(maxBalance)}</span>
      </div>

      <div className="cashflowChartWrap">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="cashflowChart"
          role="img"
          aria-label="Cashflow trend"
        >
          <defs>
            <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(86, 166, 255, 0.35)" />
              <stop offset="100%" stopColor="rgba(86, 166, 255, 0.02)" />
            </linearGradient>
          </defs>

          <path d="M16 190 H544" className="axisLine" />
          <path d={`${path} L544,190 L16,190 Z`} fill="url(#balanceFill)" />
          <path d={path} className="linePath" />

          {points.map((point, index) => {
            const x =
              (index / Math.max(points.length - 1, 1)) * (width - 32) + 16;
            const y = getPointY(point.balance, min, max, height);

            return (
              <g key={point.label}>
                <circle cx={x} cy={y} r="5" className="lineDot" />
                <text x={x} y="208" textAnchor="middle" className="chartLabel">
                  {point.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="cashflowLegend">
        {points.map((point) => (
          <div className="legendCard" key={point.label}>
            <strong>{point.label}</strong>
            <span>Thu: {formatMoney(point.income)}</span>
            <span>Chi: {formatMoney(point.expense)}</span>
            <span>Số dư: {formatMoney(point.balance)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

type ComparisonCardProps = {
  comparison: MonthComparison;
};

function ComparisonCard({ comparison }: ComparisonCardProps) {
  const rows = [
    {
      label: "Thu nhập",
      current: comparison.incomeCurrent,
      previous: comparison.incomePrevious,
      delta: deltaPercent(
        comparison.incomeCurrent,
        comparison.incomePrevious
      ),
    },
    {
      label: "Chi tiêu",
      current: comparison.expenseCurrent,
      previous: comparison.expensePrevious,
      delta: deltaPercent(
        comparison.expenseCurrent,
        comparison.expensePrevious
      ),
    },
    {
      label: "Số dư",
      current: comparison.balanceCurrent,
      previous: comparison.balancePrevious,
      delta: deltaPercent(
        comparison.balanceCurrent,
        comparison.balancePrevious
      ),
    },
  ];

  return (
    <section className="reportCard reportSection">
      <div className="sectionHead">
        <h3>So sánh tháng này vs tháng trước</h3>
      </div>

      <div className="comparisonGrid">
        {rows.map((row) => {
          const isPositive = row.delta >= 0;

          return (
            <div className="comparisonItem" key={row.label}>
              <div className="comparisonItem__label">{row.label}</div>
              <div className="comparisonItem__current">
                {formatMoney(row.current)}
              </div>
              <div className="comparisonItem__meta">
                <span>Tháng trước: {formatMoney(row.previous)}</span>
                <strong className={isPositive ? "isPositive" : "isNegative"}>
                  {isPositive ? "+" : ""}
                  {row.delta.toFixed(1)}%
                </strong>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function Reports() {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<ReportsDashboardData | null>(null);
  const [rows, setRows] = useState<CustomReportRow[]>([]);
  const [filters, setFilters] = useState<ReportFilters>(DEFAULT_FILTERS);

  async function fetchReportData(nextFilters: ReportFilters): Promise<void> {
    try {
      setLoading(true);

      const [dashboard, reportRows] = await Promise.all([
        getReportsDashboard(nextFilters),
        getCustomReport(nextFilters),
      ]);

      setData(dashboard);
      setRows(reportRows);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchReportData(DEFAULT_FILTERS);
  }, []);

  async function applyCustomReport(): Promise<void> {
    await fetchReportData(filters);
  }

  if (loading || !data) {
    return (
      <div className="reportsPage">
        <div className="reportsPage__loading">Đang tải báo cáo...</div>
      </div>
    );
  }

  const expenseItems: ProgressItem[] = data.expenseByCategory.map((item) => ({
    label: item.category,
    amount: item.amount,
    percent: item.percent,
  }));

  const incomeItems: ProgressItem[] = data.incomeBySource.map((item) => ({
    label: item.source,
    amount: item.amount,
    percent: item.percent,
  }));

  return (
    <div className="reportsPage">
      <div className="reportsHero">
        <div>
          <p className="reportsHero__eyebrow">Reports & Analytics</p>
          <h1>Báo cáo tài chính</h1>
          <p className="reportsHero__desc">
            Theo dõi thu chi, dòng tiền, giao dịch lớn và tạo báo cáo tùy biến.
          </p>
        </div>

        <div className="reportCard reportsHero__range">
          <label>
            <span>Từ ngày</span>
            <input
              type="date"
              value={filters.from ?? ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  from: e.target.value,
                }))
              }
            />
          </label>

          <label>
            <span>Đến ngày</span>
            <input
              type="date"
              value={filters.to ?? ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  to: e.target.value,
                }))
              }
            />
          </label>

          <button className="primaryBtn" onClick={applyCustomReport}>
            Làm mới báo cáo
          </button>
        </div>
      </div>

      <section className="statsGrid">
        <ReportStatCard
          label="Tổng thu"
          value={formatMoney(data.summary.totalIncome)}
          sub="Thu nhập trong kỳ"
        />
        <ReportStatCard
          label="Tổng chi"
          value={formatMoney(data.summary.totalExpense)}
          sub="Chi tiêu trong kỳ"
        />
        <ReportStatCard
          label="Số dư"
          value={formatMoney(data.summary.balance)}
          sub="Số dư hiện tại"
        />
        <ReportStatCard
          label="Tỷ lệ tiết kiệm"
          value={formatPercent(data.summary.savingsRate)}
          sub={`${data.summary.transactionCount} giao dịch`}
        />
      </section>

      <section className="doubleGrid">
        <ProgressList
          title="Biểu đồ chi theo danh mục"
          items={expenseItems}
        />
        <ProgressList
          title="Biểu đồ thu theo nguồn"
          items={incomeItems}
        />
      </section>

      <CashflowChart points={data.cashflowTrend} />

      <section className="reportCard reportSection">
        <div className="sectionHead">
          <h3>Top giao dịch lớn nhất</h3>
          <span>Top 5 theo giá trị</span>
        </div>

        <div className="tableWrap">
          <table className="reportTable">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Tiêu đề</th>
                <th>Danh mục</th>
                <th>Ví</th>
                <th>Loại</th>
                <th>Số tiền</th>
              </tr>
            </thead>
            <tbody>
              {data.topTransactions.map((item) => (
                <tr key={item.id}>
                  <td>{item.date}</td>
                  <td>{item.title}</td>
                  <td>{item.category}</td>
                  <td>{item.wallet}</td>
                  <td>
                    <span className={`pill pill--${item.type}`}>
                      {item.type === "income" ? "Thu" : "Chi"}
                    </span>
                  </td>
                  <td
                    className={
                      item.type === "income"
                        ? "amountIncome"
                        : "amountExpense"
                    }
                  >
                    {item.type === "income" ? "+" : "-"}
                    {formatMoney(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <ComparisonCard comparison={data.monthComparison} />

      <section className="reportCard reportSection">
        <div className="sectionHead sectionHead--stackMobile">
          <div>
            <h3>Báo cáo tùy biến</h3>
            <span>Chọn khoảng ngày, bộ lọc, rồi export CSV</span>
          </div>

          <button
            className="ghostBtn"
            onClick={() => exportCustomReportCsv(rows)}
          >
            Export CSV
          </button>
        </div>

        <div className="filtersGrid">
          <label>
            <span>Ví</span>
            <select
              value={filters.wallet ?? "Tất cả"}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  wallet: e.target.value,
                }))
              }
            >
              {data.wallets.map((wallet) => (
                <option key={wallet} value={wallet}>
                  {wallet}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Danh mục</span>
            <select
              value={filters.category ?? "Tất cả"}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  category: e.target.value,
                }))
              }
            >
              {data.categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Loại giao dịch</span>
            <select
              value={filters.type ?? "all"}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  type: e.target.value as "all" | "income" | "expense",
                }))
              }
            >
              <option value="all">Tất cả</option>
              <option value="income">Thu</option>
              <option value="expense">Chi</option>
            </select>
          </label>

          <label>
            <span>Từ khóa</span>
            <input
              type="text"
              placeholder="Tìm theo tiêu đề / ghi chú"
              value={filters.keyword ?? ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  keyword: e.target.value,
                }))
              }
            />
          </label>
        </div>

        <div className="actionsRow">
          <button className="primaryBtn" onClick={applyCustomReport}>
            Áp dụng bộ lọc
          </button>
          <span>{rows.length} dòng dữ liệu</span>
        </div>

        <div className="tableWrap">
          <table className="reportTable">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Loại</th>
                <th>Tiêu đề</th>
                <th>Danh mục</th>
                <th>Ví</th>
                <th>Số tiền</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.date}</td>
                  <td>
                    <span className={`pill pill--${row.type}`}>
                      {row.type === "income" ? "Thu" : "Chi"}
                    </span>
                  </td>
                  <td>{row.title}</td>
                  <td>{row.category}</td>
                  <td>{row.wallet}</td>
                  <td
                    className={
                      row.type === "income"
                        ? "amountIncome"
                        : "amountExpense"
                    }
                  >
                    {row.type === "income" ? "+" : "-"}
                    {formatMoney(row.amount)}
                  </td>
                  <td>{row.note ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}