import React from "react";
import s from "./AuthLayout.module.css";

type Props = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export default function AuthLayout({ title, subtitle, children }: Props) {
  return (
    <div className={s.page}>
      <div className={s.shell}>
        <aside className={s.brandPane}>
          <div className={s.brandTop}>
            <div className={s.logo}>₫</div>
            <div>
              <div className={s.brandName}>Personal Expense Manager</div>
              <div className={s.brandTag}>Kiểm soát chi tiêu, tối ưu ngân sách, đạt mục tiêu tài chính.</div>
            </div>
          </div>

          <div className={s.brandCard}>
            <div className={s.metricRow}>
              <div className={s.metric}>
                <div className={s.metricValue}>Tự động</div>
                <div className={s.metricLabel}>Phân loại giao dịch</div>
              </div>
              <div className={s.metric}>
                <div className={s.metricValue}>Realtime</div>
                <div className={s.metricLabel}>Theo dõi ngân sách</div>
              </div>
            </div>

            <div className={s.featureList}>
              <FeatureItem title="Ngân sách theo danh mục" desc="Cảnh báo khi chạm ngưỡng chi tiêu." />
              <FeatureItem title="Báo cáo & biểu đồ" desc="Nắm nhanh dòng tiền theo tuần/tháng." />
              <FeatureItem title="Mục tiêu tài chính" desc="Theo dõi tiến độ tiết kiệm theo mục tiêu." />
            </div>
          </div>

          <div className={s.brandFooter}>
            <span className={s.muted}>Bảo mật</span>
            <span className={s.dot} />
            <span className={s.muted}>JWT</span>
            <span className={s.dot} />
            <span className={s.muted}>MongoDB</span>
          </div>
        </aside>

        <main className={s.formPane}>
          <div className={s.formCard}>
            <div className={s.header}>
              <h1 className={s.h1}>{title}</h1>
              <p className={s.sub}>{subtitle}</p>
            </div>

            {children}
          </div>

          <div className={s.bottomNote}>
            <span className={s.muted}>© {new Date().getFullYear()} Personal Expense Manager.</span>
          </div>
        </main>
      </div>
    </div>
  );
}

function FeatureItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className={s.featureItem}>
      <div className={s.bullet} />
      <div>
        <div className={s.featureTitle}>{title}</div>
        <div className={s.featureDesc}>{desc}</div>
      </div>
    </div>
  );
}
