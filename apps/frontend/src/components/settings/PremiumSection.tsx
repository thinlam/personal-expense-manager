type Props = {
  plan: string;
};

export default function PremiumSection({ plan }: Props) {
  return (
    <section className="settingsCard settingsCard--glow">
      <div className="sectionHead">
        <div className="sectionIcon sectionIcon--cyan">⭐</div>
        <div>
          <h3>Gói Premium</h3>
        </div>
      </div>

      <div className="premiumBox">
        <h4>Gói hiện tại: {plan}</h4>
        <p>
          Nâng cấp để mở khóa thêm báo cáo thông minh, kết nối ngân hàng và phân tích nâng cao.
        </p>
        <button className="btnPrimary" type="button">
          Nâng cấp ngay
        </button>
      </div>
    </section>
  );
}