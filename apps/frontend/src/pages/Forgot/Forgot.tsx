import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/auth.service";

import "./forgot.css";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function Forgot() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverMsg, setServerMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => isValidEmail(email) && !loading, [email, loading]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setServerMsg(null);

    const value = email.trim().toLowerCase();
    if (!isValidEmail(value)) {
      setError("Email không hợp lệ.");
      return;
    }

    try {
      setLoading(true);

      const data = await authService.forgotPassword({ email: value });

      // ✅ thông báo + chuyển sang màn OTP
      setServerMsg(data.message || "Đã gửi OTP.");
      navigate("/verify-otp", { state: { email: value } });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="forgot-page">
      <header className="forgot-topbar">
        <div className="forgot-brand">
          <div className="forgot-brandIcon">🔒</div>
          <div className="forgot-brandText">SECUREFIN</div>
        </div>

        <button className="forgot-helpBtn" type="button">
          Trợ giúp bảo mật
        </button>
      </header>

      <main className="forgot-center">
        <section className="forgot-card">
          <div className="forgot-cardInner">
            <h1 className="forgot-title">Khôi phục mật khẩu</h1>
            <p className="forgot-subtitle">
              Nhập địa chỉ email của bạn để nhận hướng dẫn lấy lại mật khẩu.
            </p>

            <form onSubmit={onSubmit} className="forgot-form">
              <label className="forgot-label">EMAIL ĐĂNG KÝ</label>

              <div className="forgot-inputWrap">
                <span className="forgot-icon">✉️</span>
                <input
                  className="forgot-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  autoComplete="email"
                  inputMode="email"
                />
              </div>

              {error && <div className="forgot-alert forgot-alert--error">{error}</div>}
              {serverMsg && <div className="forgot-alert forgot-alert--ok">{serverMsg}</div>}

              <button className="forgot-primaryBtn" type="submit" disabled={!canSubmit}>
                {loading ? "Đang gửi..." : "Gửi yêu cầu khôi phục"} <span className="forgot-arrow">→</span>
              </button>

              <div className="forgot-back">
                <Link to="/login" className="forgot-backLink">
                  ← Quay lại Đăng nhập
                </Link>
              </div>
            </form>

            <div className="forgot-footNote">
              <div className="forgot-secLine">
                <span className="forgot-dot" /> MÃ HÓA ĐẦU CUỐI 256-BIT AES
              </div>
              <div className="forgot-secSub">
                HỆ THỐNG ĐƯỢC BẢO VỆ BỞI HẠ TẦNG AN NINH CẤP NGÂN HÀNG
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="forgot-bottom">
        <div className="forgot-bottomLeft">© 2024 SecureFin Intelligence. Bảo mật tuyệt đối.</div>
        <div className="forgot-bottomRight">
          <span className="forgot-bottomLink">Quyền riêng tư</span>
          <span className="forgot-sep">•</span>
          <span className="forgot-bottomLink">Điều khoản sử dụng</span>
          <span className="forgot-sep">•</span>
          <span className="forgot-bottomLink">Trung tâm trợ giúp</span>
        </div>
      </footer>
    </div>
  );
}
