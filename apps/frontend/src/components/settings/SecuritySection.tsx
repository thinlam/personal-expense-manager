import { useState } from "react";
import type { PrivacyMode, SecurityDevice } from "../../services/user.service";

type Props = {
  twoFactorEnabled: boolean;
  loginAlert: boolean;
  newDeviceAlert: boolean;
  transactionPin: boolean;
  hasPin: boolean;
  profileVisibility: PrivacyMode;
  devices: SecurityDevice[];
  saving: boolean;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  pinInput: string;
  onTwoFactorChange: (value: boolean) => void;
  onLoginAlertChange: (value: boolean) => void;
  onNewDeviceAlertChange: (value: boolean) => void;
  onTransactionPinChange: (value: boolean) => void;
  onProfileVisibilityChange: (value: PrivacyMode) => void;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmitPassword: () => void;
  onPinInputChange: (value: string) => void;
  onSubmitPin: () => void;
  onLogoutAllDevices: () => void;
  onSave: () => void;
};

export default function SecuritySection({
  twoFactorEnabled,
  loginAlert,
  newDeviceAlert,
  transactionPin,
  hasPin,
  profileVisibility,
  devices,
  saving,
  currentPassword,
  newPassword,
  confirmPassword,
  pinInput,
  onTwoFactorChange,
  onLoginAlertChange,
  onNewDeviceAlertChange,
  onTransactionPinChange,
  onProfileVisibilityChange,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSubmitPassword,
  onPinInputChange,
  onSubmitPin,
  onLogoutAllDevices,
  onSave,
}: Props) {
  const [selectedDevice, setSelectedDevice] = useState<SecurityDevice | null>(null);

  return (
    <>
      <section className="settingsCard securityTopCard">
        <div className="securityTopHeader">
          <div className="securityTopHeader__left">
            <span className="securityTopHeader__kicker">SECURITY & PRIVACY</span>
            <h3>An toàn tài khoản (Account Safety)</h3>
            <p>Hệ thống AI đang giám sát. Không phát hiện hoạt động đăng nhập bất thường.</p>
          </div>
          <div className="securityTopHeader__actions">
            <button className="btnGhost securityTopAction" type="button">
              Audit Logs
            </button>
            <button className="btnGhost securityTopAction" type="button">
              Vô hiệu hóa tài khoản
            </button>
          </div>
        </div>
      </section>

      <div className="securityFrameGrid">
        <div className="securityFrameGrid__left">
          <section className="settingsCard securityPanel">
            <div className="sectionHead">
              <div className="sectionIcon">👁️</div>
              <div>
                <h3>Quyền riêng tư (Privacy)</h3>
              </div>
            </div>

            <div className="securityLineItem">
              <div>
                <h4>Ẩn số dư khi mở ứng dụng</h4>
                <p>Số dư sẽ được làm mờ cho đến khi bạn chủ động hiển thị.</p>
              </div>
              <button
                className={loginAlert ? "securitySwitch securitySwitch--active" : "securitySwitch"}
                type="button"
                onClick={() => onLoginAlertChange(!loginAlert)}
              >
                <span />
              </button>
            </div>

            <div className="securityDivider" />

            <div className="securityLineItem">
              <div>
                <h4>Confidential Mode</h4>
                <p>Mã hóa thông tin nhạy cảm trước khi chia sẻ dữ liệu giao dịch.</p>
              </div>
              <button
                className={newDeviceAlert ? "securitySwitch securitySwitch--active" : "securitySwitch"}
                type="button"
                onClick={() => onNewDeviceAlertChange(!newDeviceAlert)}
              >
                <span />
              </button>
            </div>
          </section>

          <section className="settingsCard settingsCard--glow securityPanel">
            <div className="sectionHead">
              <div className="sectionIcon sectionIcon--cyan">🛡️</div>
              <div>
                <h3>Bảo mật hệ thống</h3>
              </div>
            </div>

            <div className="securityMethodGrid">
              <div className="securityMethodCard">
                <h4>{hasPin ? "Mã PIN giao dịch" : "Chưa có mã PIN"}</h4>
                <p className={hasPin ? "securityMethodStatus" : "securityMethodMuted"}>
                  {hasPin ? "ACTIVE" : "NOT SET"}
                </p>
                <div className="securityPinInline">
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={pinInput}
                    onChange={(e) => onPinInputChange(e.target.value)}
                    placeholder="Nhập mã PIN 4-6 số"
                  />
                  <button className="btnPrimary" type="button" onClick={onSubmitPin} disabled={saving}>
                    {saving ? "Đang lưu..." : hasPin ? "Đổi PIN" : "Tạo mã PIN"}
                  </button>
                </div>
                <button
                  className={transactionPin ? "btnPrimary" : "btnGhost"}
                  type="button"
                  onClick={() => onTransactionPinChange(!transactionPin)}
                >
                  {transactionPin ? "Tắt yêu cầu PIN" : "Bật yêu cầu PIN"}
                </button>
              </div>

              <div className="securityMethodCard">
                <h4>2FA (Two-Factor)</h4>
                <p>Tăng cường bảo mật bằng mã xác thực qua Email/SMS.</p>
                <div className="securityMethodFooter">
                  <span className={twoFactorEnabled ? "securityMethodStatus" : "securityMethodMuted"}>
                    {twoFactorEnabled ? "ENABLED" : "DISABLED"}
                  </span>
                  <button
                    className={twoFactorEnabled ? "securitySwitch securitySwitch--active" : "securitySwitch"}
                    type="button"
                    onClick={() => onTwoFactorChange(!twoFactorEnabled)}
                  >
                    <span />
                  </button>
                </div>
              </div>
            </div>

            <div className="securityPasswordBox">
              <h4>Đổi mật khẩu</h4>
              <div className="securityPasswordGrid">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => onCurrentPasswordChange(e.target.value)}
                  placeholder="Mật khẩu hiện tại"
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => onNewPasswordChange(e.target.value)}
                  placeholder="Mật khẩu mới"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => onConfirmPasswordChange(e.target.value)}
                  placeholder="Xác nhận mật khẩu mới"
                />
              </div>
              <button className="btnGhost" type="button" onClick={onSubmitPassword} disabled={saving}>
                {saving ? "Đang cập nhật..." : "Đổi mật khẩu"}
              </button>
            </div>

            <div className="field">
              <label>PHẠM VI HIỂN THỊ</label>
              <div className="segmented segmented--triple">
                <button
                  className={profileVisibility === "private" ? "segmented__item active" : "segmented__item"}
                  type="button"
                  onClick={() => onProfileVisibilityChange("private")}
                >
                  Riêng tư
                </button>
                <button
                  className={profileVisibility === "friends" ? "segmented__item active" : "segmented__item"}
                  type="button"
                  onClick={() => onProfileVisibilityChange("friends")}
                >
                  Bạn bè
                </button>
                <button
                  className={profileVisibility === "public" ? "segmented__item active" : "segmented__item"}
                  type="button"
                  onClick={() => onProfileVisibilityChange("public")}
                >
                  Công khai
                </button>
              </div>
            </div>

            <div className="securitySubmitRow">
              <button
                className={transactionPin ? "btnPrimary" : "btnGhost"}
                type="button"
                onClick={() => onTransactionPinChange(!transactionPin)}
              >
                {transactionPin ? "Mã PIN: Đang bật" : "Mã PIN: Đang tắt"}
              </button>
              <button className="btnPrimary" type="button" onClick={onSave} disabled={saving}>
                {saving ? "Đang cập nhật..." : "Cập nhật bảo mật"}
              </button>
            </div>
          </section>
        </div>

        <section className="settingsCard securityPanel securityDevicesPanel">
          <div className="sectionHead">
            <div className="sectionIcon">🖥️</div>
            <div>
              <h3>Quản lý thiết bị</h3>
            </div>
          </div>

          {devices.map((device) => (
            <div
              key={device.deviceId}
              className={device.isCurrent ? "deviceCard deviceCard--active" : "deviceCard"}
            >
              <div className="deviceCard__icon">{device.platform.toLowerCase().includes("mac") ? "💻" : "📱"}</div>
              <div className="deviceCard__content">
                <h4>{device.deviceName}</h4>
                <p>
                  {device.browser} · {device.platform}
                </p>
                <span className={device.isCurrent ? "devicePill" : "deviceMuted"}>
                  {device.isCurrent ? "CURRENT SESSION" : formatLastActive(device.lastActiveAt)}
                </span>
              </div>
              <button
                className="deviceAction"
                type="button"
                onClick={() => setSelectedDevice(device)}
              >
                {device.isCurrent ? "⋮" : "⇢"}
              </button>
            </div>
          ))}

          <button className="btnGhost securityDeviceLink" type="button">
            ⊕ Link new hardware key
          </button>

          <button
            className="btnGhost securityLogoutAll"
            type="button"
            onClick={onLogoutAllDevices}
          >
            Đăng xuất tất cả thiết bị khác
          </button>
        </section>
      </div>

      {selectedDevice ? (
        <div className="deviceInfoOverlay" onClick={() => setSelectedDevice(null)}>
          <div className="deviceInfoPanel" onClick={(e) => e.stopPropagation()}>
            <h4>Thông tin thiết bị</h4>
            <p>
              <b>Tên máy:</b> {selectedDevice.deviceName}
            </p>
            <p>
              <b>Trình duyệt:</b> {selectedDevice.browser}
            </p>
            <p>
              <b>Nền tảng:</b> {selectedDevice.platform}
            </p>
            <p>
              <b>Thiết bị ID:</b> {selectedDevice.deviceId}
            </p>
            <p>
              <b>Hoạt động:</b>{" "}
              {selectedDevice.isCurrent
                ? "CURRENT SESSION"
                : formatLastActive(selectedDevice.lastActiveAt)}
            </p>
            <button
              className="btnPrimary"
              type="button"
              onClick={() => setSelectedDevice(null)}
            >
              Đóng
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

function formatLastActive(input: string | Date) {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) {
    return "RECENTLY ACTIVE";
  }
  const diff = Date.now() - d.getTime();
  const hours = Math.max(1, Math.floor(diff / (1000 * 60 * 60)));
  return `ACTIVE ${hours}H AGO`;
}
