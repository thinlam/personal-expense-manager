import type { DateFormat } from "../../services/user.service";
import { dict } from "../../utils/i18n";

type TimeFormat = "24h" | "12h";

type Props = {
  name: string;
  email: string;
  language: "vi" | "en";
  weekStart: "mon" | "sun";
  currency: "VND" | "USD" | "EUR";
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  avatarText: string;
  saving: boolean;
  onNameChange: (value: string) => void;
  onLanguageChange: (value: "vi" | "en") => void;
  onWeekStartChange: (value: "mon" | "sun") => void;
  onCurrencyChange: (value: "VND" | "USD" | "EUR") => void;
  onDateFormatChange: (value: DateFormat) => void;
  onTimeFormatChange: (value: TimeFormat) => void;
  onSave: () => void;
};

export default function ProfileSection({
  name,
  email,
  language,
  weekStart,
  currency,
  dateFormat,
  timeFormat,
  avatarText,
  saving,
  onNameChange,
  onLanguageChange,
  onWeekStartChange,
  onCurrencyChange,
  onDateFormatChange,
  onTimeFormatChange,
  onSave,
}: Props) {
  const t = dict[language];

  const previewText = formatDateTimePreview(dateFormat, timeFormat);

  const timeFormatLabel = language === "vi" ? "Định dạng giờ" : "Time format";
  const previewLabel = language === "vi" ? "Xem trước ngày giờ" : "Date & time preview";

  return (
    <>
      <section className="settingsCard">
        <div className="sectionHead">
          <div className="sectionIcon">👤</div>
          <div>
            <h3>{t.basicInfo}</h3>
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
            <h4>{t.avatar}</h4>
            <p>{t.avatarHelp}</p>

            <div className="avatarActions">
              <button className="btnPrimary" type="button">
                {t.uploadNew}
              </button>
              <button className="btnGhost" type="button">
                {t.removeImage}
              </button>
            </div>
          </div>
        </div>

        <div className="formGrid">
          <div className="field">
            <label>{t.fullName}</label>
            <div className="inputWrap">
              <input
                type="text"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder={language === "vi" ? "Nhập họ và tên" : "Enter full name"}
              />
              <span className="inputIcon">🪪</span>
            </div>
          </div>

          <div className="field">
            <label>{t.email}</label>
            <div className="inputWrap">
              <input type="email" value={email} readOnly />
              <span className="inputIcon">✉️</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <button className="btnPrimary" type="button" onClick={onSave} disabled={saving}>
            {saving ? (language === "vi" ? "Đang lưu..." : "Saving...") : t.saveChanges}
          </button>
        </div>
      </section>

      <section className="settingsCard settingsCard--glow">
        <div className="sectionHead">
          <div className="sectionIcon sectionIcon--cyan">⚙</div>
          <div>
            <h3>{t.displayOptions}</h3>
          </div>
        </div>

        <div className="formGrid">
          <div className="field">
            <label>{t.mainCurrency}</label>
            <div className="segmented segmented--triple">
              <button
                className={currency === "VND" ? "segmented__item active" : "segmented__item"}
                onClick={() => onCurrencyChange("VND")}
                type="button"
              >
                VND
              </button>
              <button
                className={currency === "USD" ? "segmented__item active" : "segmented__item"}
                onClick={() => onCurrencyChange("USD")}
                type="button"
              >
                USD
              </button>
              <button
                className={currency === "EUR" ? "segmented__item active" : "segmented__item"}
                onClick={() => onCurrencyChange("EUR")}
                type="button"
              >
                EUR
              </button>
            </div>
          </div>

          <div className="field">
            <label>{t.language}</label>
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
            <label>{t.dateFormat}</label>
            <div className="segmented segmented--triple">
              <button
                className={dateFormat === "DD/MM/YYYY" ? "segmented__item active" : "segmented__item"}
                onClick={() => onDateFormatChange("DD/MM/YYYY")}
                type="button"
              >
                DD/MM/YYYY
              </button>
              <button
                className={dateFormat === "MM/DD/YYYY" ? "segmented__item active" : "segmented__item"}
                onClick={() => onDateFormatChange("MM/DD/YYYY")}
                type="button"
              >
                MM/DD/YYYY
              </button>
              <button
                className={dateFormat === "YYYY-MM-DD" ? "segmented__item active" : "segmented__item"}
                onClick={() => onDateFormatChange("YYYY-MM-DD")}
                type="button"
              >
                YYYY-MM-DD
              </button>
            </div>
          </div>

          <div className="field">
            <label>{timeFormatLabel}</label>
            <div className="segmented segmented--double">
              <button
                className={timeFormat === "24h" ? "segmented__item active" : "segmented__item"}
                onClick={() => onTimeFormatChange("24h")}
                type="button"
              >
                24h
              </button>
              <button
                className={timeFormat === "12h" ? "segmented__item active" : "segmented__item"}
                onClick={() => onTimeFormatChange("12h")}
                type="button"
              >
                12h (AM/PM)
              </button>
            </div>
          </div>

          <div className="field">
            <label>{t.weekStart}</label>
            <div className="segmented">
              <button
                className={weekStart === "mon" ? "segmented__item active mutedActive" : "segmented__item"}
                onClick={() => onWeekStartChange("mon")}
                type="button"
              >
                {t.monday}
              </button>
              <button
                className={weekStart === "sun" ? "segmented__item active mutedActive" : "segmented__item"}
                onClick={() => onWeekStartChange("sun")}
                type="button"
              >
                {t.sunday}
              </button>
            </div>
          </div>
        </div>

        <div className="dateTimePreviewBox">
          <span className="dateTimePreviewBox__label">{previewLabel}</span>
          <strong className="dateTimePreviewBox__value">{previewText}</strong>
        </div>

        <div style={{ marginTop: 20 }}>
          <button className="btnPrimary" type="button" onClick={onSave} disabled={saving}>
            {saving ? (language === "vi" ? "Đang lưu..." : "Saving...") : t.saveSettings}
          </button>
        </div>
      </section>
    </>
  );
}

function formatDateTimePreview(dateFormat: DateFormat, timeFormat: TimeFormat) {
  const sampleDate = new Date(2026, 2, 19, 21, 8, 0);

  const dd = String(sampleDate.getDate()).padStart(2, "0");
  const mm = String(sampleDate.getMonth() + 1).padStart(2, "0");
  const yyyy = sampleDate.getFullYear();

  let datePart = "";

  switch (dateFormat) {
    case "DD/MM/YYYY":
      datePart = `${dd}/${mm}/${yyyy}`;
      break;
    case "MM/DD/YYYY":
      datePart = `${mm}/${dd}/${yyyy}`;
      break;
    case "YYYY-MM-DD":
      datePart = `${yyyy}-${mm}-${dd}`;
      break;
    default:
      datePart = `${dd}/${mm}/${yyyy}`;
      break;
  }

  const hour = sampleDate.getHours();
  const minute = String(sampleDate.getMinutes()).padStart(2, "0");

  let timePart = "";

  if (timeFormat === "24h") {
    timePart = `${String(hour).padStart(2, "0")}:${minute}`;
  } else {
    const suffix = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    timePart = `${String(hour12).padStart(2, "0")}:${minute} ${suffix}`;
  }

  return `${datePart} • ${timePart}`;
}