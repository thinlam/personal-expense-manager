type Props = {
  name: string;
  email: string;
  language: "vi" | "en";
  weekStart: "mon" | "sun";
  currency: "VND" | "USD" | "EUR";
  avatarText: string;
  saving: boolean;
  onNameChange: (value: string) => void;
  onLanguageChange: (value: "vi" | "en") => void;
  onWeekStartChange: (value: "mon" | "sun") => void;
  onCurrencyChange: (value: "VND" | "USD" | "EUR") => void;
  onSave: () => void;
};

export default function ProfileSection({
  name,
  email,
  language,
  weekStart,
  currency,
  avatarText,
  saving,
  onNameChange,
  onLanguageChange,
  onWeekStartChange,
  onCurrencyChange,
  onSave,
}: Props) {
  return (
    <>
      <section className="settingsCard">
        <div className="sectionHead">
          <div className="sectionIcon">👤</div>
          <div>
            <h3>Thông tin cơ bản</h3>
          </div>
        </div>

        <div className="profileTop">
          <div className="avatarWrap">
            <div className="avatarRing">
              <div className="avatarImage">{avatarText}</div>
            </div>
            <button className="avatarEdit" type="button">
              ✎
            </button>
          </div>

          <div className="avatarInfo">
            <h4>Ảnh đại diện</h4>
            <p>Hỗ trợ các định dạng JPG, PNG hoặc GIF. Dung lượng tối đa 5MB.</p>

            <div className="avatarActions">
              <button className="btnPrimary" type="button">
                Tải ảnh mới
              </button>
              <button className="btnGhost" type="button">
                Xóa ảnh
              </button>
            </div>
          </div>
        </div>

        <div className="formGrid">
          <div className="field">
            <label>HỌ VÀ TÊN</label>
            <div className="inputWrap">
              <input
                type="text"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="Nhập họ và tên"
              />
              <span className="inputIcon">🪪</span>
            </div>
          </div>

          <div className="field">
            <label>ĐỊA CHỈ EMAIL</label>
            <div className="inputWrap">
              <input type="email" value={email} readOnly />
              <span className="inputIcon">✉️</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <button className="btnPrimary" type="button" onClick={onSave} disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </section>

      <section className="settingsCard settingsCard--glow">
        <div className="sectionHead">
          <div className="sectionIcon sectionIcon--cyan">⚙</div>
          <div>
            <h3>Tùy chọn hiển thị</h3>
          </div>
        </div>

        <div className="formGrid">
          <div className="field">
            <label>ĐƠN VỊ TIỀN TỆ CHÍNH</label>
            <div className="selectWrap">
              <select
                value={currency}
                onChange={(e) => onCurrencyChange(e.target.value as "VND" | "USD" | "EUR")}
              >
                <option value="VND">VND - Việt Nam Đồng (₫)</option>
                <option value="USD">USD - US Dollar ($)</option>
                <option value="EUR">EUR - Euro (€)</option>
              </select>
              <span className="inputIcon">⌄</span>
            </div>
          </div>

          <div className="field">
            <label>NGÔN NGỮ GIAO DIỆN</label>
            <div className="segmented">
              <button
                className={language === "vi" ? "segmented__item active" : "segmented__item"}
                onClick={() => onLanguageChange("vi")}
                type="button"
              >
                <span className="badge badge--vn">VN</span>
                Tiếng Việt
              </button>
              <button
                className={language === "en" ? "segmented__item active" : "segmented__item"}
                onClick={() => onLanguageChange("en")}
                type="button"
              >
                <span className="badge badge--us">US</span>
                English
              </button>
            </div>
          </div>

          <div className="field">
            <label>ĐỊNH DẠNG THỜI GIAN</label>
            <div className="inputWrap">
              <input type="text" defaultValue="DD/MM/YYYY (31/12/2023)" />
              <span className="inputIcon">📅</span>
            </div>
          </div>

          <div className="field">
            <label>NGÀY BẮT ĐẦU TUẦN</label>
            <div className="segmented">
              <button
                className={weekStart === "mon" ? "segmented__item active mutedActive" : "segmented__item"}
                onClick={() => onWeekStartChange("mon")}
                type="button"
              >
                Thứ Hai
              </button>
              <button
                className={weekStart === "sun" ? "segmented__item active mutedActive" : "segmented__item"}
                onClick={() => onWeekStartChange("sun")}
                type="button"
              >
                Chủ Nhật
              </button>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <button className="btnPrimary" type="button" onClick={onSave} disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu thiết lập"}
          </button>
        </div>
      </section>
    </>
  );
}