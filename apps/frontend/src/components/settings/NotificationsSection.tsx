import type { NotificationChannel } from "../../services/user.service";

type Props = {
  transaction: boolean;
  budgetAlert: boolean;
  weeklyReport: boolean;
  emailReminder: boolean;
  pushNotification: boolean;
  channel: NotificationChannel;
  saving: boolean;
  onTransactionChange: (value: boolean) => void;
  onBudgetAlertChange: (value: boolean) => void;
  onWeeklyReportChange: (value: boolean) => void;
  onEmailReminderChange: (value: boolean) => void;
  onPushNotificationChange: (value: boolean) => void;
  onChannelChange: (value: NotificationChannel) => void;
  onSave: () => void;
};

export default function NotificationsSection({
  transaction,
  budgetAlert,
  weeklyReport,
  emailReminder,
  pushNotification,
  channel,
  saving,
  onTransactionChange,
  onBudgetAlertChange,
  onWeeklyReportChange,
  onEmailReminderChange,
  onPushNotificationChange,
  onChannelChange,
  onSave,
}: Props) {
  return (
    <>
      <section className="settingsCard">
        <div className="sectionHead">
          <div className="sectionIcon">🔔</div>
          <div>
            <h3>Cài đặt thông báo</h3>
          </div>
        </div>

        <div className="notifyList">
          <div className="notifyItem">
            <div className="notifyItem__content">
              <h4>Thông báo giao dịch</h4>
              <p>Nhận cảnh báo khi có thu chi bất thường hoặc phát sinh giao dịch mới.</p>
            </div>
            <div className="segmented notifyToggle">
              <button
                className={transaction ? "segmented__item active" : "segmented__item"}
                type="button"
                onClick={() => onTransactionChange(true)}
              >
                Bật
              </button>
              <button
                className={!transaction ? "segmented__item active" : "segmented__item"}
                type="button"
                onClick={() => onTransactionChange(false)}
              >
                Tắt
              </button>
            </div>
          </div>

          <div className="notifyItem">
            <div className="notifyItem__content">
              <h4>Cảnh báo ngân sách</h4>
              <p>Thông báo khi chi tiêu đạt ngưỡng 80% hoặc vượt ngân sách đã đặt.</p>
            </div>
            <div className="segmented notifyToggle">
              <button
                className={budgetAlert ? "segmented__item active" : "segmented__item"}
                type="button"
                onClick={() => onBudgetAlertChange(true)}
              >
                Bật
              </button>
              <button
                className={!budgetAlert ? "segmented__item active" : "segmented__item"}
                type="button"
                onClick={() => onBudgetAlertChange(false)}
              >
                Tắt
              </button>
            </div>
          </div>

          <div className="notifyItem">
            <div className="notifyItem__content">
              <h4>Báo cáo tuần</h4>
              <p>Gửi bản tổng hợp thu chi và xu hướng vào cuối mỗi tuần.</p>
            </div>
            <div className="segmented notifyToggle">
              <button
                className={weeklyReport ? "segmented__item active" : "segmented__item"}
                type="button"
                onClick={() => onWeeklyReportChange(true)}
              >
                Bật
              </button>
              <button
                className={!weeklyReport ? "segmented__item active" : "segmented__item"}
                type="button"
                onClick={() => onWeeklyReportChange(false)}
              >
                Tắt
              </button>
            </div>
          </div>

          <div className="notifyItem">
            <div className="notifyItem__content">
              <h4>Nhắc nhở qua Email</h4>
              <p>Nhận nhắc nhở quan trọng về hóa đơn, lịch thanh toán và mục tiêu tài chính.</p>
            </div>
            <div className="segmented notifyToggle">
              <button
                className={emailReminder ? "segmented__item active" : "segmented__item"}
                type="button"
                onClick={() => onEmailReminderChange(true)}
              >
                Bật
              </button>
              <button
                className={!emailReminder ? "segmented__item active" : "segmented__item"}
                type="button"
                onClick={() => onEmailReminderChange(false)}
              >
                Tắt
              </button>
            </div>
          </div>

          <div className="notifyItem">
            <div className="notifyItem__content">
              <h4>Push Notification</h4>
              <p>Hiển thị thông báo đẩy trực tiếp trên trình duyệt theo thời gian thực.</p>
            </div>
            <div className="segmented notifyToggle">
              <button
                className={pushNotification ? "segmented__item active" : "segmented__item"}
                type="button"
                onClick={() => onPushNotificationChange(true)}
              >
                Bật
              </button>
              <button
                className={!pushNotification ? "segmented__item active" : "segmented__item"}
                type="button"
                onClick={() => onPushNotificationChange(false)}
              >
                Tắt
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="settingsCard settingsCard--glow">
        <div className="sectionHead">
          <div className="sectionIcon sectionIcon--cyan">📡</div>
          <div>
            <h3>Kênh nhận thông báo</h3>
          </div>
        </div>

        <div className="field">
          <label>MỨC ĐỘ ƯU TIÊN</label>
          <div className="segmented segmented--triple">
            <button
              className={channel === "all" ? "segmented__item active" : "segmented__item"}
              type="button"
              onClick={() => onChannelChange("all")}
            >
              Tất cả
            </button>
            <button
              className={channel === "important" ? "segmented__item active" : "segmented__item"}
              type="button"
              onClick={() => onChannelChange("important")}
            >
              Quan trọng
            </button>
            <button
              className={channel === "mute" ? "segmented__item active" : "segmented__item"}
              type="button"
              onClick={() => onChannelChange("mute")}
            >
              Tạm tắt
            </button>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <button className="btnPrimary" type="button" onClick={onSave} disabled={saving}>
            {saving ? "Đang cập nhật..." : "Cập nhật thông báo"}
          </button>
        </div>
      </section>
    </>
  );
}
