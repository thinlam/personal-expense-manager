import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authService } from "../../services/auth.service";
import "./resetPassword.css";

type LocationState = { email?: string; otp?: string };

export default function ResetPassword() {
  const nav = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) || {};

  // ✅ nếu state mất (F5) thì lấy từ sessionStorage
  const email =
    state.email?.trim()?.toLowerCase() ||
    sessionStorage.getItem("rp_email") ||
    "";

  const otp =
    state.otp?.trim() ||
    sessionStorage.getItem("rp_otp") ||
    "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    // ✅ vẫn cần otp/email để submit cho backend (nhưng UI không hỏi)
    if (!email || otp.length !== 6) {
      nav("/forgot-password", { replace: true });
    }
  }, [email, otp, nav]);

  // clear lỗi khi gõ lại
  useEffect(() => {
    if (err) setErr(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newPassword, confirmPassword]);

  const canSubmit = useMemo(() => {
    const p1 = newPassword.trim();
    const p2 = confirmPassword.trim();
    return !loading && p1.length >= 6 && p2.length >= 6 && p1 === p2;
  }, [loading, newPassword, confirmPassword]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    const pass = newPassword.trim();
    const conf = confirmPassword.trim();

    if (pass.length < 6) {
      setErr("Mật khẩu tối thiểu 6 ký tự.");
      return;
    }
    if (pass !== conf) {
      setErr("Xác nhận mật khẩu không khớp.");
      return;
    }

    try {
      setLoading(true);

      const data = await authService.resetPassword({
        email,
        otp, // ✅ gửi ngầm cho backend, user không cần nhập lại
        newPassword: pass,
      });

      setMsg(data.message || "Cập nhật mật khẩu thành công.");

      // ✅ dọn session
      sessionStorage.removeItem("rp_email");
      sessionStorage.removeItem("rp_otp");

      setTimeout(() => nav("/login", { replace: true }), 700);
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Không cập nhật được mật khẩu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rp-page">
      <header className="rp-topbar">
        <div className="rp-brand">
          <div className="rp-brandIcon">🔒</div>
          <div className="rp-brandText">SECUREFIN</div>
        </div>

        <button className="rp-helpBtn" type="button">
          Trợ giúp bảo mật
        </button>
      </header>

      <main className="rp-center">
        <section className="rp-card">
          <div className="rp-cardInner">
            <h1 className="rp-title">Thiết lập mật khẩu mới</h1>
            <p className="rp-subtitle">Tạo mật khẩu mạnh để đảm bảo an toàn cho tài khoản của bạn</p>

            <form onSubmit={onSubmit} className="rp-form">
              <label className="rp-label">MẬT KHẨU MỚI</label>
              <div className="rp-inputWrap">
                <span className="rp-icon">🔒</span>
                <input
                  className="rp-input"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••"
                  autoComplete="new-password"
                />
                <button type="button" className="rp-eye" onClick={() => setShowNew((v) => !v)}>
                  {showNew ? "🙈" : "👁️"}
                </button>
              </div>

              <label className="rp-label" style={{ marginTop: 14 }}>
                XÁC NHẬN MẬT KHẨU
              </label>
              <div className="rp-inputWrap">
                <span className="rp-icon">🔁</span>
                <input
                  className="rp-input"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••"
                  autoComplete="new-password"
                />
                <button type="button" className="rp-eye" onClick={() => setShowConfirm((v) => !v)}>
                  {showConfirm ? "🙈" : "👁️"}
                </button>
              </div>

              {err && <div className="rp-alert rp-alert--error">{err}</div>}
              {msg && <div className="rp-alert rp-alert--ok">{msg}</div>}

              <button className="rp-primaryBtn" type="submit" disabled={!canSubmit}>
                {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"} <span className="rp-arrow">→</span>
              </button>

              <div className="rp-back">
                <Link to="/login" className="rp-backLink">
                  ← Quay lại Đăng nhập
                </Link>
              </div>
            </form>

            <div className="rp-footNote">
              <div className="rp-secLine">
                <span className="rp-dot" /> MÃ HÓA ĐẦU CUỐI 256-BIT AES
              </div>
              <div className="rp-secSub">HỆ THỐNG ĐƯỢC BẢO VỆ BỞI HẠ TẦNG AN NINH CẤP NGÂN HÀNG</div>
            </div>
          </div>
        </section>
      </main>

      <footer className="rp-bottom">
        <div className="rp-bottomLeft">© 2026 SecureFin Intelligence. Bảo mật tuyệt đối.</div>
        <div className="rp-bottomRight">
          <span className="rp-bottomLink">Quyền riêng tư</span>
          <span className="rp-sep">•</span>
          <span className="rp-bottomLink">Điều khoản sử dụng</span>
          <span className="rp-sep">•</span>
          <span className="rp-bottomLink">Trung tâm trợ giúp</span>
        </div>
      </footer>
    </div>
  );
}
