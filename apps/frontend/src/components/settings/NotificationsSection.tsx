export default function NotificationsSection() {
  return (
    <section className="settingsCard">
      <div className="sectionHead">
        <div className="sectionIcon">🔔</div>
        <div>
          <h3>Cài đặt thông báo</h3>
        </div>
      </div>

      <div className="formGrid">
        <div className="field">
          <label>THÔNG BÁO GIAO DỊCH</label>
          <div className="segmented">
            <button className="segmented__item active" type="button">
              Bật
            </button>
            <button className="segmented__item" type="button">
              Tắt
            </button>
          </div>
        </div>

        <div className="field">
          <label>EMAIL NHẮC NHỞ</label>
          <div className="segmented">
            <button className="segmented__item active" type="button">
              Bật
            </button>
            <button className="segmented__item" type="button">
              Tắt
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}