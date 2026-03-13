import { useState } from "react";
import "./settings.css";

type MenuKey =
  | "profile"
  | "notifications"
  | "security"
  | "account"
  | "premium"
  | "bank";

export default function Settings() {
  const [activeMenu, setActiveMenu] = useState<MenuKey>("profile");
  const [language, setLanguage] = useState<"vi" | "en">("vi");
  const [weekStart, setWeekStart] = useState<"mon" | "sun">("mon");

  return (
    <div className="settingsPage">
      <div className="settingsLayout">
        {/* SIDEBAR */}
        <aside className="settingsSidebar">
          <div>
            <div className="brandCard">
              <div className="brandLogo">🛡</div>
              <div>
                <h2 className="brandTitle">SECUREFIN</h2>
                <p className="brandSub">PREMIUM FINANCE</p>
              </div>
            </div>

            <div className="sidebarSection">
              <p className="sidebarLabel">CÀI ĐẶT TÀI KHOẢN</p>

              <button
                className={`sideMenuBtn ${
                  activeMenu === "profile" ? "sideMenuBtn--active" : ""
                }`}
                onClick={() => setActiveMenu("profile")}
              >
                <span className="sideMenuIcon">👤</span>
                Hồ sơ cá nhân
              </button>

              <button
                className={`sideMenuBtn ${
                  activeMenu === "notifications" ? "sideMenuBtn--active" : ""
                }`}
                onClick={() => setActiveMenu("notifications")}
              >
                <span className="sideMenuIcon">🔔</span>
                Thông báo
              </button>

              <button
                className={`sideMenuBtn ${
                  activeMenu === "security" ? "sideMenuBtn--active" : ""
                }`}
                onClick={() => setActiveMenu("security")}
              >
                <span className="sideMenuIcon">🛡️</span>
                Bảo mật & Riêng tư
              </button>

              <button
                className={`sideMenuBtn ${
                  activeMenu === "account" ? "sideMenuBtn--active" : ""
                }`}
                onClick={() => setActiveMenu("account")}
              >
                <span className="sideMenuIcon">⚙️</span>
                Tài khoản
              </button>
            </div>

            <div className="sidebarSection">
              <p className="sidebarLabel">DỊCH VỤ & KẾT NỐI</p>

              <button
                className={`sideMenuBtn premiumBtn ${
                  activeMenu === "premium" ? "sideMenuBtn--active" : ""
                }`}
                onClick={() => setActiveMenu("premium")}
              >
                <span className="sideMenuIcon">⭐</span>
                Gói dịch vụ Premium
                <span className="premiumDot"></span>
              </button>

              <button
                className={`sideMenuBtn ${
                  activeMenu === "bank" ? "sideMenuBtn--active" : ""
                }`}
                onClick={() => setActiveMenu("bank")}
              >
                <span className="sideMenuIcon">🏦</span>
                Liên kết ngân hàng
              </button>
            </div>
          </div>

          <div className="sidebarProfile">
            <div className="sidebarProfile__left">
              <div className="sidebarAvatar">👨‍💼</div>
              <div>
                <div className="sidebarName">Nguyễn Văn A</div>
                <div className="sidebarPlan">PREMIUM PLUS</div>
              </div>
            </div>
            <button className="sidebarLogout">↪</button>
          </div>
        </aside>

        {/* CONTENT */}
        <main className="settingsContent">
          <div className="settingsHero">
            <p className="settingsHero__eyebrow">CÀI ĐẶT HỆ THỐNG</p>
            <h1>Hồ sơ cá nhân</h1>
            <p className="settingsHero__desc">
              Cập nhật thông tin nhận diện và tùy chỉnh trải nghiệm cá nhân của
              bạn trên SECUREFIN.
            </p>
          </div>

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
                  <div className="avatarImage">👦</div>
                </div>
                <button className="avatarEdit">✎</button>
              </div>

              <div className="avatarInfo">
                <h4>Ảnh đại diện</h4>
                <p>
                  Hỗ trợ các định dạng JPG, PNG hoặc GIF. Dung lượng tối đa 5MB.
                </p>

                <div className="avatarActions">
                  <button className="btnPrimary">Tải ảnh mới</button>
                  <button className="btnGhost">Xóa ảnh</button>
                </div>
              </div>
            </div>

            <div className="formGrid">
              <div className="field">
                <label>HỌ VÀ TÊN</label>
                <div className="inputWrap">
                  <input type="text" defaultValue="Nguyễn Văn A" />
                  <span className="inputIcon">🪪</span>
                </div>
              </div>

              <div className="field">
                <label>ĐỊA CHỈ EMAIL</label>
                <div className="inputWrap">
                  <input type="email" defaultValue="vanna@securefin.vn" />
                  <span className="inputIcon">✉️</span>
                </div>
              </div>
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
                  <select defaultValue="VND">
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
                    onClick={() => setLanguage("vi")}
                    type="button"
                  >
                    <span className="badge badge--vn">VN</span>
                    Tiếng Việt
                  </button>
                  <button
                    className={language === "en" ? "segmented__item active" : "segmented__item"}
                    onClick={() => setLanguage("en")}
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
                    onClick={() => setWeekStart("mon")}
                    type="button"
                  >
                    Thứ Hai
                  </button>
                  <button
                    className={weekStart === "sun" ? "segmented__item active mutedActive" : "segmented__item"}
                    onClick={() => setWeekStart("sun")}
                    type="button"
                  >
                    Chủ Nhật
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}