import "./settings.css";

export default function Settings() {
  return (
    <div className="page">
      <div className="page__head">
        <h1 className="page__title">⚙ Cài đặt</h1>
        <p className="page__desc">
          Quản lý thông tin cá nhân và thiết lập ứng dụng
        </p>
      </div>

      <div className="settings">
        {/* Hồ sơ */}
        <section className="card">
          <h3 className="card__title">👤 Hồ sơ cá nhân</h3>

          <div className="form">
            <label>
              Tên hiển thị
              <input placeholder="Nhập tên của bạn" />
            </label>

            <label>
              Email
              <input disabled value="user@email.com" />
            </label>

            <button className="btn">Lưu thay đổi</button>
          </div>
        </section>

        {/* Thiết lập */}
        <section className="card">
          <h3 className="card__title">⚙ Thiết lập chung</h3>

          <div className="form">
            <label>
              Tiền tệ mặc định
              <select>
                <option>VND</option>
                <option>USD</option>
              </select>
            </label>

            <label>
              Giao diện
              <select>
                <option>Dark</option>
                <option>Light</option>
              </select>
            </label>
          </div>
        </section>

        {/* Bảo mật */}
        <section className="card">
          <h3 className="card__title">🔐 Bảo mật</h3>

          <button className="btn btn--danger">
            Đổi mật khẩu
          </button>

          <button className="btn btn--ghost">
            Đăng xuất
          </button>
        </section>
      </div>
    </div>
  );
}
