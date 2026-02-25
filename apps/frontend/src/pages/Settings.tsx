import { useState } from "react";
import "./settings.css";

type TabKey = "profile" | "preferences" | "security";

export default function Settings() {
  const [tab, setTab] = useState<TabKey>("profile");

  return (
    <div className="settingsPage">
      <div className="settingsLayout">
        {/* LEFT MENU */}
        <aside className="settingsSidebar">
          <h2 className="settingsSidebar__title">Cài đặt</h2>

          <button
            className={`sideTab ${tab === "profile" ? "sideTab--active" : ""}`}
            onClick={() => setTab("profile")}
          >
            👤 Hồ sơ
          </button>

          <button
            className={`sideTab ${tab === "preferences" ? "sideTab--active" : ""}`}
            onClick={() => setTab("preferences")}
          >
            ⚙ Thiết lập
          </button>

          <button
            className={`sideTab ${tab === "security" ? "sideTab--active" : ""}`}
            onClick={() => setTab("security")}
          >
            🔐 Bảo mật
          </button>
        </aside>

        {/* RIGHT CONTENT */}
        <div className="settingsContent">
          {tab === "profile" && <ProfileTab />}
          {tab === "preferences" && <PreferencesTab />}
          {tab === "security" && <SecurityTab />}
        </div>
      </div>
    </div>
  );
}

/* ================= PROFILE ================= */

function ProfileTab() {
  return (
    <div className="cardPro">
      <div className="cardPro__header">
        <h3>Thông tin cá nhân</h3>
        <p>Cập nhật thông tin tài khoản của bạn</p>
      </div>

      <div className="formPro">
        <div className="formRow">
          <label>Tên hiển thị</label>
          <input placeholder="Nguyễn Văn A" />
        </div>

        <div className="formRow">
          <label>Email</label>
          <input disabled value="user@email.com" />
        </div>

        <button className="btnPrimary">Lưu thay đổi</button>
      </div>
    </div>
  );
}

/* ================= PREFERENCES ================= */

function PreferencesTab() {
  return (
    <div className="cardPro">
      <div className="cardPro__header">
        <h3>Thiết lập ứng dụng</h3>
        <p>Cấu hình giao diện và tùy chọn cá nhân</p>
      </div>

      <div className="formPro">
        <div className="formRow">
          <label>Tiền tệ mặc định</label>
          <select>
            <option>VND</option>
            <option>USD</option>
          </select>
        </div>

        <div className="formRow">
          <label>Ngôn ngữ</label>
          <select>
            <option>Tiếng Việt</option>
            <option>English</option>
          </select>
        </div>

        <div className="formRow toggleRow">
          <label>Chế độ Dark Mode</label>
          <label className="switch">
            <input type="checkbox" />
            <span className="slider"></span>
          </label>
        </div>

        <button className="btnPrimary">Lưu thiết lập</button>
      </div>
    </div>
  );
}

/* ================= SECURITY ================= */

function SecurityTab() {
  return (
    <div className="cardPro">
      <div className="cardPro__header">
        <h3>Bảo mật tài khoản</h3>
        <p>Quản lý mật khẩu và bảo mật đăng nhập</p>
      </div>

      <div className="securityActions">
        <button className="btnPrimary">Đổi mật khẩu</button>
        <button className="btnOutline">Bật xác thực 2 lớp (2FA)</button>
        <button className="btnDanger">Đăng xuất</button>
      </div>
    </div>
  );
}