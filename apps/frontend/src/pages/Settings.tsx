import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import "./settings.css";
import {
  getCurrentUser,
  updateCurrentUser,
  type CurrentUser,
} from "../services/user.service";

import {
  ProfileSection,
  NotificationsSection,
  SecuritySection,
  AccountSection,
  PremiumSection,
  BankSection,
} from "../components/settings";

type MenuKey =
  | "profile"
  | "notifications"
  | "security"
  | "account"
  | "premium"
  | "bank";

type ApiErrorResponse = {
  message?: string;
};

function getErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  return axiosError.response?.data?.message || fallback;
}

export default function Settings() {
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState<MenuKey>("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [language, setLanguage] = useState<"vi" | "en">("vi");
  const [weekStart, setWeekStart] = useState<"mon" | "sun">("mon");
  const [currency, setCurrency] = useState<"VND" | "USD" | "EUR">("VND");
  const [dateFormat, setDateFormat] = useState<
    "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD"
  >("DD/MM/YYYY");
  const [timeFormat, setTimeFormat] = useState<"12h" | "24h">("24h");

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        setError("");

        const data = await getCurrentUser();

        setUser(data);
        setName(data.name || "");
        setEmail(data.email || "");
        setLanguage(data.language || "vi");
        setWeekStart(data.weekStart || "mon");
        setCurrency(data.currency || "VND");
        setDateFormat(data.dateFormat || "DD/MM/YYYY");
        setTimeFormat(data.timeFormat || "24h");
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Không lấy được thông tin người dùng"));
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setShowLogoutModal(false);
      }
    }

    if (showLogoutModal) {
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [showLogoutModal]);

  async function handleSaveProfile() {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const res = await updateCurrentUser({
        name,
        language,
        currency,
        weekStart,
        dateFormat,
        timeFormat,
      });

      setUser(res.user);
      setSuccess(res.message || "Lưu thay đổi thành công");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Không thể cập nhật hồ sơ"));
    } finally {
      setSaving(false);
    }
  }

  function openLogoutModal() {
    setShowLogoutModal(true);
  }

  function closeLogoutModal() {
    setShowLogoutModal(false);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  }

  const displayName = user?.name || "Người dùng";
  const displayPlan = user?.plan || "FREE";
  const avatarText = displayName.charAt(0).toUpperCase();

  function getPageTitle() {
    switch (activeMenu) {
      case "profile":
        return "Hồ sơ cá nhân";
      case "notifications":
        return "Thông báo";
      case "security":
        return "Bảo mật & Riêng tư";
      case "account":
        return "Tài khoản";
      case "premium":
        return "Gói dịch vụ Premium";
      case "bank":
        return "Liên kết ngân hàng";
      default:
        return "Cài đặt";
    }
  }

  function getPageDesc() {
    switch (activeMenu) {
      case "profile":
        return "Cập nhật thông tin nhận diện và tùy chỉnh trải nghiệm cá nhân của bạn.";
      case "notifications":
        return "Thiết lập cách bạn nhận thông báo từ hệ thống.";
      case "security":
        return "Quản lý mật khẩu, đăng nhập và bảo mật tài khoản.";
      case "account":
        return "Quản lý tùy chọn tài khoản và thông tin hệ thống.";
      case "premium":
        return "Theo dõi trạng thái gói và nâng cấp tài khoản của bạn.";
      case "bank":
        return "Kết nối và quản lý tài khoản ngân hàng liên kết.";
      default:
        return "";
    }
  }

  function renderSection() {
    switch (activeMenu) {
      case "profile":
        return (
          <ProfileSection
            name={name}
            email={email}
            language={language}
            weekStart={weekStart}
            currency={currency}
            dateFormat={dateFormat}
            timeFormat={timeFormat}
            avatarText={avatarText}
            saving={saving}
            onNameChange={setName}
            onLanguageChange={setLanguage}
            onWeekStartChange={setWeekStart}
            onCurrencyChange={setCurrency}
            onDateFormatChange={setDateFormat}
            onTimeFormatChange={setTimeFormat}
            onSave={handleSaveProfile}
          />
        );

      case "notifications":
        return <NotificationsSection />;

      case "security":
        return <SecuritySection />;

      case "account":
        return (
          <AccountSection
            name={displayName}
            email={email}
            plan={displayPlan}
          />
        );

      case "premium":
        return <PremiumSection plan={displayPlan} />;

      case "bank":
        return <BankSection />;

      default:
        return null;
    }
  }

  if (loading) {
    return (
      <div className="settingsPage">
        <div className="settingsLoading">Đang tải hồ sơ cá nhân...</div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="settingsPage">
        <div className="settingsError">{error}</div>
      </div>
    );
  }

  return (
    <div className="settingsPage">
      <div className="settingsLayout">
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
                type="button"
                className={`sideMenuBtn ${
                  activeMenu === "profile" ? "sideMenuBtn--active" : ""
                }`}
                onClick={() => setActiveMenu("profile")}
              >
                <span className="sideMenuIcon">👤</span>
                Hồ sơ cá nhân
              </button>

              <button
                type="button"
                className={`sideMenuBtn ${
                  activeMenu === "notifications" ? "sideMenuBtn--active" : ""
                }`}
                onClick={() => setActiveMenu("notifications")}
              >
                <span className="sideMenuIcon">🔔</span>
                Thông báo
              </button>

              <button
                type="button"
                className={`sideMenuBtn ${
                  activeMenu === "security" ? "sideMenuBtn--active" : ""
                }`}
                onClick={() => setActiveMenu("security")}
              >
                <span className="sideMenuIcon">🛡️</span>
                Bảo mật & Riêng tư
              </button>

              <button
                type="button"
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
                type="button"
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
                type="button"
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
              <div className="sidebarAvatar">{avatarText}</div>
              <div>
                <div className="sidebarName">{displayName}</div>
                <div className="sidebarPlan">{displayPlan}</div>
              </div>
            </div>

            <button
              type="button"
              className="sidebarLogout"
              onClick={openLogoutModal}
              title="Đăng xuất"
            >
              ↪
            </button>
          </div>
        </aside>

        <main className="settingsContent">
          <div className="settingsHero">
            <p className="settingsHero__eyebrow">CÀI ĐẶT HỆ THỐNG</p>
            <h1>{getPageTitle()}</h1>
            <p className="settingsHero__desc">{getPageDesc()}</p>
          </div>

          {error ? <div className="settingsInlineError">{error}</div> : null}
          {success ? <div className="settingsSuccess">{success}</div> : null}

          {renderSection()}
        </main>
      </div>

      {showLogoutModal && (
        <div className="logoutModalOverlay" onClick={closeLogoutModal}>
          <div
            className="logoutModal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
          >
            <div className="logoutModal__icon">↪</div>

            <div className="logoutModal__content">
              <h3 id="logout-modal-title" className="logoutModal__title">
                Xác nhận đăng xuất
              </h3>
              <p className="logoutModal__desc">
                Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này không?
              </p>
            </div>

            <div className="logoutModal__actions">
              <button
                type="button"
                className="logoutModalBtn logoutModalBtn--ghost"
                onClick={closeLogoutModal}
              >
                Ở lại
              </button>

              <button
                type="button"
                className="logoutModalBtn logoutModalBtn--danger"
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}