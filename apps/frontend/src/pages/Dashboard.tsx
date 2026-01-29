import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./dashboard.css";
import { dashboardService } from "../services/dashboard.service";
import type {
  DashboardDTO,
  CashflowPoint,
  CategorySlice,
  BudgetCard,
  TxRow,
} from "../types/dashboard";
import { formatMoney } from "../utils/formatMoney";

type RangeKey = "THIS_MONTH" | "LAST_MONTH" | "THIS_YEAR";

const RANGE_LABEL: Record<RangeKey, string> = {
  THIS_MONTH: "Tháng này",
  LAST_MONTH: "Tháng trước",
  THIS_YEAR: "Năm nay",
};

/* ================== USER (from localStorage) ================== */
type Me = { id?: string; name?: string; email?: string; isPremium?: boolean };

function getMeFromStorage(): Me | null {
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

export default function Dashboard() {
  const [range, setRange] = useState<RangeKey>("THIS_MONTH");
  const [reloadKey, setReloadKey] = useState(0);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<DashboardDTO | null>(null);

  const [search, setSearch] = useState("");

  // ✅ Lấy user đã login từ localStorage
  const [me, setMe] = useState<Me | null>(() => getMeFromStorage());

  // ✅ Nếu user thay đổi (login/logout ở tab khác), UI cập nhật
  useEffect(() => {
    const onStorage = () => setMe(getMeFromStorage());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // ✅ Nếu user login xong rồi vào thẳng dashboard (cùng tab), đôi khi storage event không bắn
  // nên mình sync 1 lần khi mount
  useEffect(() => {
    setMe(getMeFromStorage());
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const dto = await dashboardService.getOverview(range);
        if (!alive) return;
        setData(dto);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Không tải được Dashboard. Thử lại nhé.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [range, reloadKey]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 11) return "Chào buổi sáng";
    if (h < 14) return "Chào buổi trưa";
    if (h < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  }, []);

  const summary = data?.summary;
  const cashflow = data?.cashflow ?? [];
  const categories = data?.spendByCategory ?? [];
  const budgets = data?.budgets ?? [];
  const recent = data?.recentTransactions ?? [];

  const displayName = me?.name?.trim() || "Người dùng";
  const badge = me?.isPremium ? "PREMIUM USER" : "FREE USER";
  const ava = initialsFromName(displayName);

  return (
    <div className="dash">
      {/* SIDEBAR */}
      <aside className="side">
        <div className="side__brand">
          <div className="brand__logo">F</div>
          <div className="brand__text">
            <div className="brand__name">Fintech Premium</div>
            <div className="brand__sub">Quản lý tài chính cá nhân</div>
          </div>
        </div>

        <nav className="side__nav">
          <Link className="side__item is-active" to="/dashboard">
            <span className="side__ic">▦</span>
            <span>Tổng quan</span>
          </Link>
          <Link className="side__item" to="/transactions">
            <span className="side__ic">⇄</span>
            <span>Giao dịch</span>
          </Link>
          <Link className="side__item" to="/budgets">
            <span className="side__ic">◷</span>
            <span>Ngân sách</span>
          </Link>
          <Link className="side__item" to="/savings">
            <span className="side__ic">⬒</span>
            <span>Tiết kiệm</span>
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
          <Link className="side__item" to="/support">
            <span className="side__ic">?</span>
            <span>Hỗ trợ</span>
          </Link>
        </nav>

        <div className="side__upgrade">
          <div className="upgrade__title">Gói HỘI VIÊN</div>
          <div className="upgrade__desc">
            Nâng cấp lên Pro để nhận thêm đặc quyền.
          </div>
          <button className="btn btn--primary w-full" type="button">
            NÂNG CẤP NGAY
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main">
        {/* TOPBAR */}
        <header className="top">
          <div className="top__left">
            <div className="top__kicker">{greeting} 👋</div>
            <div className="top__title">Tổng quan Chi tiêu</div>
          </div>

          <div className="top__mid">
            <div className="search">
              <span className="search__ic">⌕</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm giao dịch, báo cáo..."
                aria-label="Tìm kiếm"
              />
              {search.trim() && (
                <Link
                  className="search__go"
                  to={`/transactions?q=${encodeURIComponent(search)}`}
                >
                  Đi
                </Link>
              )}
            </div>
          </div>

          {/* ✅ USER FROM STORAGE */}
          <div className="top__right">
            <button className="iconbtn" type="button" aria-label="Thông báo">
              🔔
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

        {/* ERROR */}
        {err && (
          <div className="alert">
            <div>
              <b>Lỗi:</b> {err}
            </div>
            <button
              className="btn btn--ghost"
              onClick={() => setReloadKey((x) => x + 1)}
            >
              Tải lại
            </button>
          </div>
        )}

        {/* KPI */}
        <section className="kpis">
          <Kpi
            loading={loading}
            icon="🏛"
            title="Tổng số dư"
            value={summary ? formatMoney(summary.balance) : "—"}
            chip="+ 2.4% tháng này"
            tone="neutral"
          />
          <Kpi
            loading={loading}
            icon="🔒"
            title="Chi tiêu tháng này"
            value={summary ? formatMoney(summary.expense) : "—"}
            chip="- 1.2% so với tháng trước"
            tone="bad"
          />
          <Kpi
            loading={loading}
            icon="💾"
            title="Tiết kiệm tích lũy"
            value={
              summary
                ? formatMoney(Math.max(0, summary.income - summary.expense))
                : "—"
            }
            chip="+ 5.0% tháng này"
            tone="good"
          />
        </section>

        {/* GRID */}
        <section className="grid">
          {/* TREND */}
          <div className="card card--trend">
            <div className="card__head">
              <div>
                <div className="card__title">Xu hướng chi tiêu</div>
                <div className="card__sub">Phân tích chi tiêu theo thời gian</div>
              </div>

              <div className="seg">
                <button
                  className={range === "THIS_MONTH" ? "is-active" : ""}
                  onClick={() => setRange("THIS_MONTH")}
                  type="button"
                >
                  Tháng
                </button>
                <button
                  className={range === "LAST_MONTH" ? "is-active" : ""}
                  onClick={() => setRange("LAST_MONTH")}
                  type="button"
                >
                  So sánh
                </button>
                <button
                  className={range === "THIS_YEAR" ? "is-active" : ""}
                  onClick={() => setRange("THIS_YEAR")}
                  type="button"
                >
                  Năm
                </button>
              </div>
            </div>

            {loading ? <SkeletonChart /> : <CashflowChart points={cashflow} />}
          </div>

          {/* DONUT */}
          <div className="card card--donut">
            <div className="card__head">
              <div>
                <div className="card__title">Cơ cấu chi tiêu</div>
                <div className="card__sub">Phân loại theo hạng mục</div>
              </div>
              <Link className="card__link" to="/reports">
                Xem →
              </Link>
            </div>

            {loading ? (
              <SkeletonDonut />
            ) : (
              <DonutBreakdown slices={categories} />
            )}
          </div>

          {/* RECENT TABLE */}
          <div className="card card--wide">
            <div className="card__head">
              <div>
                <div className="card__title">Giao dịch gần đây</div>
                <div className="card__sub">
                  {summary
                    ? `Theo ${RANGE_LABEL[range]}`
                    : "Mới nhất theo thời gian"}
                </div>
              </div>
              <Link className="card__link" to="/transactions">
                Xem tất cả
              </Link>
            </div>

            {loading ? (
              <SkeletonTable />
            ) : recent.length === 0 ? (
              <Empty
                title="Chưa có giao dịch"
                desc="Hãy thêm thu/chi để bắt đầu theo dõi."
                ctaText="Thêm giao dịch"
                to="/transactions?create=expense"
              />
            ) : (
              <TxTable rows={recent} />
            )}
          </div>

          {/* BUDGETS */}
          <div className="card card--wide">
            <div className="card__head">
              <div>
                <div className="card__title">Ngân sách</div>
                <div className="card__sub">Theo dõi % đã dùng + cảnh báo</div>
              </div>
              <Link className="card__link" to="/budgets">
                Quản lý
              </Link>
            </div>

            {loading ? (
              <SkeletonBudgets />
            ) : budgets.length === 0 ? (
              <Empty
                title="Chưa có ngân sách"
                desc="Tạo ngân sách để kiểm soát chi tiêu theo danh mục."
                ctaText="Tạo ngân sách"
                to="/budgets"
              />
            ) : (
              <BudgetList items={budgets} />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

/* ================== UI Parts ================== */

function Kpi({
  title,
  value,
  chip,
  tone,
  loading,
  icon,
}: {
  title: string;
  value: string;
  chip: string;
  tone: "good" | "bad" | "neutral";
  loading: boolean;
  icon: string;
}) {
  return (
    <div className={`kpi kpi--${tone}`}>
      <div className="kpi__top">
        <div className="kpi__ic">{icon}</div>
        <div className={`kpi__chip kpi__chip--${tone}`}>{chip}</div>
      </div>

      <div className="kpi__label">{title}</div>
      {loading ? (
        <div className="sk sk--line" />
      ) : (
        <div className="kpi__value">{value}</div>
      )}
    </div>
  );
}

function Empty({
  title,
  desc,
  to,
  ctaText,
  ctaTone = "primary",
}: {
  title: string;
  desc: string;
  to: string;
  ctaText: string;
  ctaTone?: "primary" | "ghost";
}) {
  return (
    <div className="empty">
      <div className="empty__left">
        <div className="empty__ic">＋</div>
        <div>
          <div className="empty__title">{title}</div>
          <div className="empty__desc">{desc}</div>
        </div>
      </div>

      <Link className={`btn btn--${ctaTone} btn--sm`} to={to}>
        {ctaText}
      </Link>
    </div>
  );
}

function TxTable({ rows }: { rows: TxRow[] }) {
  return (
    <div className="tx">
      <div className="tx__head">
        <div>Danh mục & Tên</div>
        <div>Thời gian</div>
        <div>Ví</div>
        <div>Số tiền</div>
      </div>

      {rows.map((t) => (
        <div className="tx__row" key={t.id}>
          <div className="tx__name">
            <div className="tx__title">{t.title}</div>
            <div className="tx__sub">
              <span className="tag">{t.category}</span>
            </div>
          </div>

          <div className="tx__muted">{new Date(t.date).toLocaleString()}</div>

          <div className="tx__muted">{t.wallet}</div>

          <div className={`tx__amt ${t.type === "EXPENSE" ? "is-bad" : "is-good"}`}>
            {t.type === "EXPENSE" ? "-" : "+"}
            {formatMoney(t.amount)}
          </div>
        </div>
      ))}
    </div>
  );
}

function BudgetList({ items }: { items: BudgetCard[] }) {
  return (
    <div className="budgets">
      {items.map((b) => {
        const pct = Math.max(0, Math.min(100, b.usedPct));
        const level =
          pct >= 100 ? "danger" : pct >= 90 ? "warn" : pct >= 75 ? "soft" : "ok";
        return (
          <div className="budget" key={b.id}>
            <div className="budget__top">
              <div className="budget__name">{b.name}</div>
              <div className="budget__meta">
                <span className={`pill pill--${level}`}>{pct.toFixed(0)}%</span>
                <span className="muted">
                  {formatMoney(b.used)} / {formatMoney(b.limit)}
                </span>
              </div>
            </div>
            <div className="bar">
              <div
                className={`bar__fill bar__fill--${level}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="budget__foot muted">
              Còn lại: <b>{formatMoney(Math.max(0, b.limit - b.used))}</b>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============== Minimal SVG charts ============== */

function CashflowChart({ points }: { points: CashflowPoint[] }) {
  if (!points.length) return <div className="muted">Chưa có dữ liệu dòng tiền.</div>;

  const w = 820;
  const h = 300;
  const pad = 22;

  const xs = points.map((p) => p.x);
  const allY = points.flatMap((p) => [p.income, p.expense]);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = 0;
  const maxY = Math.max(1, ...allY);

  const sx = (x: number) =>
    pad + ((x - minX) / Math.max(1, maxX - minX)) * (w - pad * 2);
  const sy = (y: number) =>
    h - pad - ((y - minY) / Math.max(1, maxY - minY)) * (h - pad * 2);

  const path = (key: "income" | "expense") =>
    points
      .map(
        (p, i) =>
          `${i === 0 ? "M" : "L"} ${sx(p.x).toFixed(1)} ${sy(p[key]).toFixed(1)}`
      )
      .join(" ");

  return (
    <div className="chart">
      <div className="chart__legend">
        <span className="lg">
          <i className="lg__dot lg__dot--income" /> Thu
        </span>
        <span className="lg">
          <i className="lg__dot lg__dot--expense" /> Chi
        </span>
      </div>

      <svg viewBox={`0 0 ${w} ${h}`} className="chart__svg" role="img" aria-label="Cashflow chart">
        {[0.25, 0.5, 0.75].map((t) => (
          <line
            key={t}
            x1={pad}
            y1={pad + t * (h - pad * 2)}
            x2={w - pad}
            y2={pad + t * (h - pad * 2)}
            className="chart__grid"
          />
        ))}

        <path d={path("income")} className="chart__line chart__line--income" />
        <path d={path("expense")} className="chart__line chart__line--expense" />

        {points.slice(-1).map((p) => (
          <g key={p.x}>
            <circle cx={sx(p.x)} cy={sy(p.income)} r="5" className="chart__pt chart__pt--income" />
            <circle cx={sx(p.x)} cy={sy(p.expense)} r="5" className="chart__pt chart__pt--expense" />
          </g>
        ))}
      </svg>
    </div>
  );
}

function DonutBreakdown({ slices }: { slices: CategorySlice[] }) {
  const total = slices.reduce((s, x) => s + x.amount, 0) || 1;

  let acc = 0;
  const stops = slices
    .slice(0, 6)
    .map((s, idx) => {
      const start = (acc / total) * 360;
      acc += s.amount;
      const end = (acc / total) * 360;
      return `var(--c${idx + 1}) ${start.toFixed(1)}deg ${end.toFixed(1)}deg`;
    })
    .join(", ");

  return (
    <div className="donut">
      <div className="donut__ring" style={{ background: `conic-gradient(${stops})` }}>
        <div className="donut__hole">
          <div className="donut__pct">
            {Math.round(((slices[0]?.amount ?? 0) / total) * 100) || 0}%
          </div>
          <div className="muted">Hạng mục #1</div>
        </div>
      </div>

      <div className="donut__list">
        {slices.slice(0, 6).map((s, idx) => {
          const pct = (s.amount / total) * 100;
          return (
            <div className="donut__item" key={s.name}>
              <span className={`sw sw--${idx + 1}`} />
              <div className="donut__name">{s.name}</div>
              <div className="donut__meta">
                <b>{pct.toFixed(0)}%</b> · {formatMoney(s.amount)}
              </div>
            </div>
          );
        })}
        {slices.length > 6 && <div className="muted">+ {slices.length - 6} danh mục khác</div>}
      </div>
    </div>
  );
}

/* ================== Skeletons ================== */

function SkeletonChart() {
  return (
    <div className="skbox">
      <div className="sk sk--title" />
      <div className="sk sk--chart" />
    </div>
  );
}
function SkeletonDonut() {
  return (
    <div className="skbox">
      <div className="sk sk--donut" />
      <div className="sk sk--line" />
      <div className="sk sk--line" />
      <div className="sk sk--line" />
    </div>
  );
}
function SkeletonBudgets() {
  return (
    <div className="skbox">
      <div className="sk sk--line" />
      <div className="sk sk--line" />
      <div className="sk sk--line" />
      <div className="sk sk--line" />
    </div>
  );
}
function SkeletonTable() {
  return (
    <div className="skbox">
      <div className="sk sk--row" />
      <div className="sk sk--row" />
      <div className="sk sk--row" />
      <div className="sk sk--row" />
    </div>
  );
}
