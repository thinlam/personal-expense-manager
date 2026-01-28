import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authService } from "../../services/auth.service";
import "./verifyOtp.css";

type LocationState = { email?: string };

function onlyDigits(s: string) {
  return s.replace(/\D/g, "");
}

export default function VerifyOtp() {
  const nav = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) || {};
  const email = state.email?.trim()?.toLowerCase() || "";

  const OTP_TTL = 120; // ✅ đổi 60/180 tuỳ backend
  const [secondsLeft, setSecondsLeft] = useState<number>(OTP_TTL);
  const [expired, setExpired] = useState(false);

  const [otpArr, setOtpArr] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    // Nếu vào thẳng URL không có email -> quay lại forgot
    if (!email) nav("/forgot-password", { replace: true });
  }, [email, nav]);

  // ✅ Timer OTP (chạy luôn vì trang này chỉ OTP)
  useEffect(() => {
    setExpired(false);

    const t = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(t);
          setExpired(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => window.clearInterval(t);
  }, []);

  const otp = useMemo(() => otpArr.join(""), [otpArr]);

  const canSubmitOtp = useMemo(() => otp.length === 6 && !loading && !expired, [otp, loading, expired]);

  const timeText = useMemo(() => {
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }, [secondsLeft]);

  function focusIndex(i: number) {
    inputsRef.current[i]?.focus();
    inputsRef.current[i]?.select();
  }

  function onChangeAt(i: number, value: string) {
    setErr(null);
    setMsg(null);

    const v = onlyDigits(value).slice(0, 1);
    setOtpArr((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });

    if (v && i < 5) focusIndex(i + 1);
  }

  function onKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (otpArr[i]) {
        setOtpArr((prev) => {
          const next = [...prev];
          next[i] = "";
          return next;
        });
        return;
      }
      if (i > 0) focusIndex(i - 1);
    }
    if (e.key === "ArrowLeft" && i > 0) focusIndex(i - 1);
    if (e.key === "ArrowRight" && i < 5) focusIndex(i + 1);
  }

  function onPaste(e: React.ClipboardEvent) {
    const text = onlyDigits(e.clipboardData.getData("text")).slice(0, 6);
    if (!text) return;

    e.preventDefault();
    const filled = text.split("").concat(Array(6).fill("")).slice(0, 6);

    setOtpArr(filled);
    const lastIndex = Math.min(text.length, 6) - 1;
    if (lastIndex >= 0) focusIndex(lastIndex);
  }

  async function resend() {
    try {
      setLoading(true);
      setErr(null);
      setMsg(null);

      const data = await authService.forgotPassword({ email });
      setMsg(data.message || "Đã gửi lại mã.");

      // ✅ reset timer + clear otp + focus ô đầu
      setOtpArr(Array(6).fill(""));
      setSecondsLeft(OTP_TTL);
      setExpired(false);
      focusIndex(0);
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Không gửi lại được. Thử lại.");
    } finally {
      setLoading(false);
    }
  }

  // ✅ Theo yêu cầu: xác nhận OTP xong -> chuyển trang reset password
  async function submitOtp(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length !== 6) return;

    if (expired) {
      setErr("Mã OTP đã hết hạn. Vui lòng bấm “Gửi lại mã”.");
      return;
    }

    nav("/reset-password", { state: { email, otp } });
  }

  return (
    <div className="otp-page">
      <header className="otp-topbar">
        <div className="otp-brand">
          <div className="otp-brandIcon">🔒</div>
          <div className="otp-brandText">SECUREFIN</div>
        </div>

        <button className="otp-helpBtn" type="button">
          Trợ giúp bảo mật
        </button>
      </header>

      <main className="otp-center">
        <section className="otp-card">
          <div className="otp-cardInner">
            <div className="otp-badge">🛡️</div>
            <h1 className="otp-title">Xác minh mã OTP</h1>

            <p className="otp-subtitle">Vui lòng nhập mã 6 chữ số đã được gửi đến email của bạn</p>

            {/* ✅ Timer */}
            <div className="otp-timerRow">
              <span className="otp-timerLabel">Mã hết hạn sau:</span>
              <span className={`otp-timerValue ${expired ? "otp-timerValue--expired" : ""}`}>{timeText}</span>
            </div>

            {expired && (
              <div className="otp-expiredHint">
                Mã đã hết hạn. Vui lòng bấm <b>Gửi lại mã</b>.
              </div>
            )}

            <form onSubmit={submitOtp} className="otp-form">
              <div className="otp-inputRow" onPaste={onPaste}>
                {otpArr.map((v, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      inputsRef.current[i] = el;
                    }}
                    className="otp-box"
                    value={v}
                    onChange={(e) => onChangeAt(i, e.target.value)}
                    onKeyDown={(e) => onKeyDown(i, e)}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    aria-label={`OTP ${i + 1}`}
                  />
                ))}
              </div>

              {err && <div className="otp-alert otp-alert--error">{err}</div>}
              {msg && <div className="otp-alert otp-alert--ok">{msg}</div>}

              <button className="otp-primaryBtn" type="submit" disabled={!canSubmitOtp}>
                Xác nhận mã <span className="otp-arrow">→</span>
              </button>

              <div className="otp-resend">
                <div className="otp-muted">Không nhận được mã?</div>
                <button className="otp-linkBtn" type="button" onClick={resend} disabled={loading}>
                  Gửi lại mã
                </button>
              </div>

              <div className="otp-back">
                <Link to="/forgot-password" className="otp-backLink">
                  ← Quay lại
                </Link>
              </div>
            </form>

            <div className="otp-divider" />

            <div className="otp-footNote">
              <div className="otp-secLine">
                <span className="otp-dot" /> MÃ HÓA ĐẦU CUỐI 256-BIT AES
              </div>
              <div className="otp-secSub">BẢO MẬT BỞI HẠ TẦNG AN NINH ĐA LỚP SECUREFIN</div>
            </div>
          </div>
        </section>
      </main>

      <footer className="otp-bottom">
        <div className="otp-bottomLeft">© 2024 SecureFin Intelligence. Bảo mật tuyệt đối.</div>
        <div className="otp-bottomRight">
          <span className="otp-bottomLink">Quyền riêng tư</span>
          <span className="otp-sep">•</span>
          <span className="otp-bottomLink">Điều khoản sử dụng</span>
          <span className="otp-sep">•</span>
          <span className="otp-bottomLink">Trung tâm trợ giúp</span>
        </div>
      </footer>
    </div>
  );
}
