import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./settings.css";
import {
  changeMyPassword,
  getCurrentUser,
  logoutAllMyDevices,
  upsertMyPin,
  updateCurrentUser,
  type DateFormat,
  type CurrentUser,
  type NotificationChannel,
  type PrivacyMode,
  type SecurityDevice,
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

type TimeFormat = "24h" | "12h";

type NotificationState = {
  transaction: boolean;
  budgetAlert: boolean;
  weeklyReport: boolean;
  emailReminder: boolean;
  pushNotification: boolean;
  channel: NotificationChannel;
};

type SecurityState = {
  twoFactorEnabled: boolean;
  loginAlert: boolean;
  newDeviceAlert: boolean;
  transactionPin: boolean;
  hasPin: boolean;
  profileVisibility: PrivacyMode;
};

const DEFAULT_NOTIFICATION_STATE: NotificationState = {
  transaction: true,
  budgetAlert: true,
  weeklyReport: false,
  emailReminder: true,
  pushNotification: true,
  channel: "important",
};

const DEFAULT_SECURITY_STATE: SecurityState = {
  twoFactorEnabled: false,
  loginAlert: true,
  newDeviceAlert: true,
  transactionPin: false,
  hasPin: false,
  profileVisibility: "private",
};

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
  const [dateFormat, setDateFormat] = useState<DateFormat>("DD/MM/YYYY");
  const [timeFormat, setTimeFormat] = useState<TimeFormat>("24h");
  const [avatar, setAvatar] = useState("");
  const [avatarDirty, setAvatarDirty] = useState(false);
  const [notifications, setNotifications] = useState<NotificationState>(
    DEFAULT_NOTIFICATION_STATE
  );
  const [security, setSecurity] = useState<SecurityState>(DEFAULT_SECURITY_STATE);
  const [securityDevices, setSecurityDevices] = useState<SecurityDevice[]>([]);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pinInput, setPinInput] = useState("");

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
        setAvatar(data.avatar || "");
        setAvatarDirty(false);
        setNotifications({
          transaction: data.notifications?.transaction ?? true,
          budgetAlert: data.notifications?.budgetAlert ?? true,
          weeklyReport: data.notifications?.weeklyReport ?? false,
          emailReminder: data.notifications?.emailReminder ?? true,
          pushNotification: data.notifications?.pushNotification ?? true,
          channel: data.notifications?.channel ?? "important",
        });
        setSecurity({
          twoFactorEnabled: data.security?.twoFactorEnabled ?? false,
          loginAlert: data.security?.loginAlert ?? true,
          newDeviceAlert: data.security?.newDeviceAlert ?? true,
          transactionPin: data.security?.transactionPin ?? false,
          hasPin: data.security?.hasPin ?? false,
          profileVisibility: data.security?.profileVisibility ?? "private",
        });
        setSecurityDevices(data.securityDevices || []);
      } catch (err: any) {
        setError(
          err?.response?.data?.message || "Không lấy được thông tin người dùng"
        );
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

      const payload: Parameters<typeof updateCurrentUser>[0] = {
        name,
        language,
        currency,
        dateFormat,
        timeFormat,
        weekStart,
      };

      if (avatarDirty) {
        payload.avatar = avatar || undefined;
      }

      const res = await updateCurrentUser(payload);

      setUser(res.user);
      setName(res.user.name || name);
      setEmail(res.user.email || email);
      setLanguage(res.user.language || language);
      setCurrency(res.user.currency || currency);
      setDateFormat(res.user.dateFormat || dateFormat);
      setTimeFormat(res.user.timeFormat || timeFormat);
      setWeekStart(res.user.weekStart || weekStart);
      setAvatar(res.user.avatar || avatar);
      setAvatarDirty(false);

      const raw = localStorage.getItem("user");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...parsed,
              ...res.user,
            })
          );
        } catch {
          localStorage.setItem("user", JSON.stringify(res.user));
        }
      } else {
        localStorage.setItem("user", JSON.stringify(res.user));
      }

      setSuccess(res.message || "Lưu thay đổi thành công");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Không thể cập nhật hồ sơ");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveNotifications() {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const res = await updateCurrentUser({
        notifications,
      });

      setUser(res.user);
      setNotifications({
        transaction: res.user.notifications?.transaction ?? notifications.transaction,
        budgetAlert: res.user.notifications?.budgetAlert ?? notifications.budgetAlert,
        weeklyReport: res.user.notifications?.weeklyReport ?? notifications.weeklyReport,
        emailReminder: res.user.notifications?.emailReminder ?? notifications.emailReminder,
        pushNotification: res.user.notifications?.pushNotification ?? notifications.pushNotification,
        channel: res.user.notifications?.channel ?? notifications.channel,
      });

      const raw = localStorage.getItem("user");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...parsed,
              ...res.user,
            })
          );
        } catch {
          localStorage.setItem("user", JSON.stringify(res.user));
        }
      } else {
        localStorage.setItem("user", JSON.stringify(res.user));
      }

      setSuccess(res.message || "Cập nhật thông báo thành công");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Không thể cập nhật thông báo");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveSecurity() {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const res = await updateCurrentUser({
        security,
      });

      setUser(res.user);
      setSecurity({
        twoFactorEnabled: res.user.security?.twoFactorEnabled ?? security.twoFactorEnabled,
        loginAlert: res.user.security?.loginAlert ?? security.loginAlert,
        newDeviceAlert: res.user.security?.newDeviceAlert ?? security.newDeviceAlert,
        transactionPin: res.user.security?.transactionPin ?? security.transactionPin,
        hasPin: res.user.security?.hasPin ?? security.hasPin,
        profileVisibility: res.user.security?.profileVisibility ?? security.profileVisibility,
      });
      setSecurityDevices(res.user.securityDevices || securityDevices);

      const raw = localStorage.getItem("user");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...parsed,
              ...res.user,
            })
          );
        } catch {
          localStorage.setItem("user", JSON.stringify(res.user));
        }
      } else {
        localStorage.setItem("user", JSON.stringify(res.user));
      }

      setSuccess(res.message || "Cập nhật bảo mật thành công");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Không thể cập nhật bảo mật");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ thông tin mật khẩu.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      const res = await changeMyPassword({
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess(res.message || "Đổi mật khẩu thành công");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Không thể đổi mật khẩu");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpsertPin() {
    if (!/^\d{4,6}$/.test(pinInput)) {
      setError("Mã PIN phải gồm 4 đến 6 chữ số.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      const res = await upsertMyPin({ pin: pinInput });
      setUser(res.user);
      setPinInput("");
      setSecurity({
        twoFactorEnabled: res.user.security?.twoFactorEnabled ?? security.twoFactorEnabled,
        loginAlert: res.user.security?.loginAlert ?? security.loginAlert,
        newDeviceAlert: res.user.security?.newDeviceAlert ?? security.newDeviceAlert,
        transactionPin: res.user.security?.transactionPin ?? security.transactionPin,
        hasPin: res.user.security?.hasPin ?? true,
        profileVisibility: res.user.security?.profileVisibility ?? security.profileVisibility,
      });
      setSecurityDevices(res.user.securityDevices || securityDevices);
      setSuccess(res.message || "Cập nhật mã PIN thành công");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Không thể cập nhật mã PIN");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogoutAllDevices() {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const res = await logoutAllMyDevices();
      setSuccess(res.message || "Đã đăng xuất tất cả thiết bị");

      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Không thể đăng xuất tất cả thiết bị"
      );
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

  async function handleAvatarSelect(file: File | null) {
    if (!file) {
      return;
    }

    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      setError("Vui lòng chọn đúng định dạng ảnh JPG, PNG hoặc GIF.");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("Ảnh vượt quá dung lượng 5MB.");
      return;
    }

    try {
      const originalDataUrl = await fileToDataUrl(file);
      const compressedAvatar = await compressAvatarDataUrl(originalDataUrl);
      const payloadBytes = getDataUrlBytes(compressedAvatar);
      const maxPayloadBytes = 90 * 1024;

      if (payloadBytes > maxPayloadBytes) {
        setError("Ảnh sau nén vẫn quá lớn. Vui lòng chọn ảnh nhỏ hơn.");
        return;
      }

      setAvatar(compressedAvatar);
      setAvatarDirty(true);
      setError("");
    } catch {
      setError("Không thể xử lý ảnh. Vui lòng thử ảnh khác.");
    }
  }

  function handleRemoveAvatar() {
    setAvatar("");
    setAvatarDirty(true);
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
            avatar={avatar}
            avatarText={avatarText}
            saving={saving}
            onNameChange={setName}
            onLanguageChange={setLanguage}
            onWeekStartChange={setWeekStart}
            onCurrencyChange={setCurrency}
            onDateFormatChange={setDateFormat}
            onTimeFormatChange={setTimeFormat}
            onAvatarSelect={handleAvatarSelect}
            onRemoveAvatar={handleRemoveAvatar}
            onSave={handleSaveProfile}
          />
        );

      case "notifications":
        return (
          <NotificationsSection
            transaction={notifications.transaction}
            budgetAlert={notifications.budgetAlert}
            weeklyReport={notifications.weeklyReport}
            emailReminder={notifications.emailReminder}
            pushNotification={notifications.pushNotification}
            channel={notifications.channel}
            saving={saving}
            onTransactionChange={(value) =>
              setNotifications((prev) => ({ ...prev, transaction: value }))
            }
            onBudgetAlertChange={(value) =>
              setNotifications((prev) => ({ ...prev, budgetAlert: value }))
            }
            onWeeklyReportChange={(value) =>
              setNotifications((prev) => ({ ...prev, weeklyReport: value }))
            }
            onEmailReminderChange={(value) =>
              setNotifications((prev) => ({ ...prev, emailReminder: value }))
            }
            onPushNotificationChange={(value) =>
              setNotifications((prev) => ({ ...prev, pushNotification: value }))
            }
            onChannelChange={(value) =>
              setNotifications((prev) => ({ ...prev, channel: value }))
            }
            onSave={handleSaveNotifications}
          />
        );

      case "security":
        return (
          <SecuritySection
            twoFactorEnabled={security.twoFactorEnabled}
            loginAlert={security.loginAlert}
            newDeviceAlert={security.newDeviceAlert}
            transactionPin={security.transactionPin}
            hasPin={security.hasPin}
            profileVisibility={security.profileVisibility}
            devices={securityDevices}
            saving={saving}
            currentPassword={currentPassword}
            newPassword={newPassword}
            confirmPassword={confirmPassword}
            pinInput={pinInput}
            onTwoFactorChange={(value) =>
              setSecurity((prev) => ({ ...prev, twoFactorEnabled: value }))
            }
            onLoginAlertChange={(value) =>
              setSecurity((prev) => ({ ...prev, loginAlert: value }))
            }
            onNewDeviceAlertChange={(value) =>
              setSecurity((prev) => ({ ...prev, newDeviceAlert: value }))
            }
            onTransactionPinChange={(value) =>
              setSecurity((prev) => ({ ...prev, transactionPin: value }))
            }
            onProfileVisibilityChange={(value) =>
              setSecurity((prev) => ({ ...prev, profileVisibility: value }))
            }
            onCurrentPasswordChange={setCurrentPassword}
            onNewPasswordChange={setNewPassword}
            onConfirmPasswordChange={setConfirmPassword}
            onSubmitPassword={handleChangePassword}
            onPinInputChange={setPinInput}
            onSubmitPin={handleUpsertPin}
            onLogoutAllDevices={handleLogoutAllDevices}
            onSave={handleSaveSecurity}
          />
        );

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
            <div className="settingsHeroTop">
              <button
                type="button"
                className="settingsBackBtn"
                onClick={() => navigate("/dashboard")}
              >
                ← Về Dashboard
              </button>
            </div>
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

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("invalid_data_url"));
    };
    reader.onerror = () => reject(new Error("read_failed"));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("load_image_failed"));
    img.src = src;
  });
}

async function compressAvatarDataUrl(dataUrl: string) {
  const img = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return dataUrl;
  }

  const maxPayloadBytes = 90 * 1024;
  const maxSides = [512, 420, 360, 320, 280, 240];
  const qualities = [0.82, 0.74, 0.66, 0.58, 0.5, 0.42];

  let bestDataUrl = dataUrl;
  let bestSize = getDataUrlBytes(dataUrl);

  for (const maxSide of maxSides) {
    const ratio = Math.min(maxSide / img.width, maxSide / img.height, 1);
    const targetWidth = Math.max(1, Math.round(img.width * ratio));
    const targetHeight = Math.max(1, Math.round(img.height * ratio));

    canvas.width = targetWidth;
    canvas.height = targetHeight;
    ctx.clearRect(0, 0, targetWidth, targetHeight);
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    for (const quality of qualities) {
      const candidate = canvas.toDataURL("image/jpeg", quality);
      const candidateSize = getDataUrlBytes(candidate);

      if (candidateSize < bestSize) {
        bestDataUrl = candidate;
        bestSize = candidateSize;
      }

      if (candidateSize <= maxPayloadBytes) {
        return candidate;
      }
    }
  }

  return bestDataUrl;
}

function getDataUrlBytes(dataUrl: string) {
  const commaIndex = dataUrl.indexOf(",");
  if (commaIndex === -1) {
    return 0;
  }

  const base64 = dataUrl.slice(commaIndex + 1);
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}
