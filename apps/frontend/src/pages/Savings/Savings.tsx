import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./savings.css";
import { dashboardService, type RangeKey } from "../../services/dashboard.service";
import {
  getCurrentUser,
  type CurrentUser,
  type DateFormat,
} from "../../services/user.service";
import type { DashboardDTO } from "../../types/dashboard";
import { formatDateBySetting, formatMoneyByCurrency } from "../../utils/formatters";

type TimeFormat = "24h" | "12h";

export default function Savings() {
  const navigate = useNavigate();
  const [range, setRange] = useState<RangeKey>("THIS_MONTH");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardDTO | null>(null);
  const [currency, setCurrency] = useState<"VND" | "USD" | "EUR">("VND");
  const [dateFormat, setDateFormat] = useState<DateFormat>("DD/MM/YYYY");
  const [timeFormat, setTimeFormat] = useState<TimeFormat>("24h");
  const [profile, setProfile] = useState<CurrentUser | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const user = await getCurrentUser();
        if (!alive) return;
        setProfile(user);
        setCurrency(user.currency || "VND");
        setDateFormat(user.dateFormat || "DD/MM/YYYY");
        setTimeFormat(user.timeFormat || "24h");
      } catch {
        if (!alive) return;
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const dto = await dashboardService.getOverview(range);
        if (!alive) return;
        setData(dto);
      } catch {
        if (!alive) return;
        setError("Không tải được dữ liệu tiết kiệm.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [range]);

  const summary = data?.summary;
  const budgets = data?.budgets ?? [];
  const topTransactions = data?.topTransactions ?? [];
  const cashflow = data?.cashflow ?? [];

  const targetAmount = useMemo(() => {
    if (!summary) return 0;
    return Math.max(0, summary.income) * 0.3;
  }, [summary]);

  const savedAmount = useMemo(() => {
    if (!summary) return 0;
    return Math.max(0, summary.income - summary.expense);
  }, [summary]);

  const progress = targetAmount > 0 ? Math.min(100, (savedAmount / targetAmount) * 100) : 0;
  const hasGrowthData = Boolean(summary && (summary.income > 0 || summary.expense > 0));
  const growthText = hasGrowthData
    ? `↗ +${summary?.savingRatePct.toFixed(1)}% so với kỳ gần nhất`
    : "— Không có sự tăng trưởng";
  const trendSeries = useMemo(() => {
    if (cashflow.length === 0) {
      return [28, 36, 44, 58, 72];
    }
    const values = cashflow.map((point) => Math.max(0, point.income - point.expense));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const spread = Math.max(1, max - min);
    return values.map((value) => 20 + ((value - min) / spread) * 60);
  }, [cashflow]);

  const trendPath = useMemo(() => {
    const width = 560;
    const height = 180;
    return trendSeries
      .map((value, index) => {
        const x = (index / Math.max(1, trendSeries.length - 1)) * width;
        const y = height - (value / 100) * height;
        return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ");
  }, [trendSeries]);

  return (
    <div className="savingsPage">
      <aside className="savingsSidebar">
        <div className="savingsBrand">
          <div className="savingsBrand__logo">F</div>
          <div>
            <div className="savingsBrand__name">Fintech Premium</div>
            <div className="savingsBrand__sub">Quản lý tài chính cá nhân</div>
          </div>
        </div>

        <nav className="savingsNav">
          <Link className="savingsNav__item" to="/dashboard">
            <span className="savingsNav__ic">▦</span>
            Tổng quan
          </Link>
          <Link className="savingsNav__item" to="/transactions">
            <span className="savingsNav__ic">⇄</span>
            Giao dịch
          </Link>
          <Link className="savingsNav__item" to="/budgets">
            <span className="savingsNav__ic">◷</span>
            Ngân sách
          </Link>
          <Link className="savingsNav__item is-active" to="/savings">
            <span className="savingsNav__ic">⬒</span>
            Tiết kiệm
          </Link>
          <Link className="savingsNav__item" to="/reports">
            <span className="savingsNav__ic">▤</span>
            Báo cáo
          </Link>
          <Link className="savingsNav__item" to="/wallets">
            <span className="savingsNav__ic">💳</span>
            Ví
          </Link>
          <div className="savingsNav__sep" />
          <Link className="savingsNav__item" to="/settings">
            <span className="savingsNav__ic">⚙</span>
            Cài đặt
          </Link>
          <Link className="savingsNav__item" to="/support">
            <span className="savingsNav__ic">?</span>
            Hỗ trợ
          </Link>
        </nav>
      </aside>

      <main className="savingsMain">
        <header className="savingsHero">
          <div>
            <p className="savingsHero__eyebrow">SECUREFIN • Nền tảng quản lý tài chính tối ưu</p>
            <h1>Quản lý Tiết kiệm &amp; Mục tiêu</h1>
            <p className="savingsHero__desc">
              Theo dõi tăng trưởng quỹ, tối ưu danh mục mục tiêu và kích hoạt chiến lược AI.
            </p>
          </div>

          <div className="savingsHero__right">
            <button className="savingsIconBtn" type="button">
              🔔
            </button>
            <div className="savingsUserChip">
              <div className="savingsUserChip__ava">
                {profile?.avatar ? (
                  <img src={profile.avatar} alt={profile.name || "User"} />
                ) : (
                  (profile?.name?.charAt(0).toUpperCase() || "U")
                )}
              </div>
              <div>
                <b>{profile?.name || "Người dùng"}</b>
                <p>{profile?.isPremium ? "PREMIUM USER" : "FREE USER"}</p>
              </div>
            </div>
          </div>
        </header>

        {error ? <div className="savingsError">{error}</div> : null}

        <section className="savingsTopGrid">
          <article className="savingsCard savingsCard--money">
            <span>TỔNG SỐ DƯ TIẾT KIỆM</span>
            <h3>{loading ? "..." : formatMoneyByCurrency(savedAmount || 0, currency)}</h3>
            <p className={hasGrowthData ? "is-positive" : "is-neutral"}>
              {loading ? "..." : growthText}
            </p>
            <div className="savingsMiniMetric">
              <small>Lãi suất dự kiến (Y/Y)</small>
              <b>6.8%</b>
            </div>
            <div className="savingsMiniBar">
              <span style={{ width: `${Math.max(16, progress)}%` }} />
            </div>
          </article>

          <article className="savingsCard savingsCard--trend">
            <div>
              <h3>Tăng trưởng &amp; Tích lũy</h3>
              <p>Biểu đồ tăng trưởng trong chu kỳ đã chọn</p>
            </div>
            <div className="savingsRange">
              <button
                type="button"
                className={range === "THIS_MONTH" ? "is-active" : ""}
                onClick={() => setRange("THIS_MONTH")}
              >
                1 THÁNG
              </button>
              <button
                type="button"
                className={range === "LAST_MONTH" ? "is-active" : ""}
                onClick={() => setRange("LAST_MONTH")}
              >
                6 THÁNG
              </button>
              <button
                type="button"
                className={range === "THIS_YEAR" ? "is-active" : ""}
                onClick={() => setRange("THIS_YEAR")}
              >
                1 NĂM
              </button>
            </div>
            <div className="savingsChartBox">
              <svg viewBox="0 0 560 180" preserveAspectRatio="none" aria-hidden="true">
                <path d={trendPath} />
              </svg>
            </div>
          </article>
        </section>

        <section className="savingsActions">
          <button type="button" onClick={() => navigate("/savings/new")}>
            ✚ Thêm mục tiêu mới
          </button>
          <button type="button">↻ Chuyển tiền vào quỹ</button>
          <button type="button">✦ Tối ưu trích quỹ</button>
        </section>

        <section className="savingsGrid">
          <div className="savingsPanel savingsPanel--goals">
            <div className="savingsPanel__head">
              <h3>Mục tiêu tiết kiệm</h3>
              <span>ACTIVE</span>
            </div>
            <div className="savingsBudgetList">
              {loading ? (
                <div className="savingsMuted">Đang tải dữ liệu...</div>
              ) : budgets.length === 0 ? (
                <div className="savingsMuted">Chưa có ngân sách để phân tích.</div>
              ) : (
                budgets.slice(0, 3).map((item) => {
                  const remain = Math.max(0, item.limit - item.used);
                  const pct = Math.max(0, Math.min(100, item.usedPct));
                  return (
                    <div className="savingsBudgetItem savingsBudgetItem--goal" key={item.id}>
                      <div className="savingsBudgetItem__top">
                        <strong>{item.name}</strong>
                        <span>TIẾN ĐỘ {pct.toFixed(0)}%</span>
                      </div>
                      <div className="savingsBudgetBar">
                        <span style={{ width: `${pct}%` }} />
                      </div>
                      <p>
                        {formatMoneyByCurrency(item.used, currency)} /{" "}
                        {formatMoneyByCurrency(item.limit, currency)} · còn{" "}
                        {formatMoneyByCurrency(remain, currency)}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="savingsPanel savingsPanel--tx">
            <div className="savingsPanel__head">
              <h3>Giao dịch ảnh hưởng quỹ</h3>
              <span>XEM TẤT CẢ</span>
            </div>
            <div className="savingsTxList">
              {loading ? (
                <div className="savingsMuted">Đang tải dữ liệu...</div>
              ) : topTransactions.length === 0 ? (
                <div className="savingsMuted">Chưa có giao dịch nổi bật.</div>
              ) : (
                topTransactions.slice(0, 6).map((tx) => (
                  <div key={tx.id} className="savingsTxItem">
                    <div>
                      <strong>{tx.title}</strong>
                      <p>
                        {tx.category} · {formatDateBySetting(tx.date, dateFormat)}{" "}
                        {formatTimeBySetting(tx.date, timeFormat)}
                      </p>
                    </div>
                    <b className={tx.type === "INCOME" ? "is-income" : "is-expense"}>
                      {tx.type === "INCOME" ? "+" : "-"}
                      {formatMoneyByCurrency(tx.amount, currency)}
                    </b>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="savingsAIBanner">
          <div>
            <h3>Kích hoạt Chuyên gia Tài chính AI</h3>
            <p>
              Nâng cấp để nhận cảnh báo tối ưu mục tiêu tiết kiệm dựa trên hành vi chi tiêu thực tế.
            </p>
          </div>
          <button type="button">NÂNG CẤP NGAY</button>
        </section>
      </main>
    </div>
  );
}

function formatTimeBySetting(input: string, timeFormat: TimeFormat) {
  const d = new Date(input);
  const minute = String(d.getMinutes()).padStart(2, "0");
  const hour = d.getHours();
  if (timeFormat === "24h") {
    return `${String(hour).padStart(2, "0")}:${minute}`;
  }
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${String(hour12).padStart(2, "0")}:${minute} ${suffix}`;
}
