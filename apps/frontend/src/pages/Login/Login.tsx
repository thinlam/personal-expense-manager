import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/auth.service";
import { storage } from "../../utils/storage";
import "./login.css";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPwd, setShowPwd] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => email.trim() && password.length >= 6, [email, password]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setError(null);
    setLoading(true);
    try {
      const data = await authService.login({ email, password });

      storage.setToken(data.token);
      storage.setUser(data.user);

     nav("/dashboard", { replace: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authPage">
      <header className="authTopbar">
        <div className="brand">
          <div className="brandLogo" aria-hidden>
            <LockIcon />
          </div>
          <div className="brandName">SECUREFIN</div>
        </div>

        <div className="topRight">
          <span className="topHint">Chưa có tài khoản?</span>
          <Link className="topCta" to="/register">
            Đăng ký ngay
          </Link>
        </div>
      </header>

      <main className="authCenter">
        <section className="authCard">
          <div className="cardHeader">
            <h1 className="cardTitle">Đăng nhập Hệ thống</h1>
            <p className="cardSub">
              Truy cập vào trung tâm quản lý tài chính an toàn của bạn <br />
              với bảo mật đa lớp.
            </p>
          </div>

          <form className="form" onSubmit={onSubmit}>
            <div className="field">
              <div className="label">EMAIL QUẢN TRỊ</div>
              <div className="inputWrap">
                <span className="leftIcon" aria-hidden>
                  <MailIcon />
                </span>
                <input
                  className="input"
                  placeholder="me@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="field">
              <div className="labelRow">
                <div className="label">MẬT KHẨU</div>
                <Link to="/forgot-password" className="login-forgot">
                     Quên mật khẩu?
                </Link>
              </div>

              <div className="inputWrap">
                <span className="leftIcon" aria-hidden>
                  <KeyIcon />
                </span>
                <input
                  className="input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  minLength={6}
                />
                
                <button
                  type="button"
                  className="iconBtn"
                  onClick={() => setShowPwd((v) => !v)}
                  aria-label={showPwd ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPwd ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <label className="rememberRow">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Duy trì đăng nhập an toàn</span>
            </label>

            {error && (
              <div className="errorBox" role="alert">
                {error}
              </div>
            )}

            <button className="primaryBtn" type="submit" disabled={loading || !canSubmit}>
              {loading ? (
                <span className="btnLoading">
                  <span className="spinner" aria-hidden />
                  Đang xác thực...
                </span>
              ) : (
                <span className="btnRow">
                  Xác thực &amp; Đăng nhập <span className="arrow">→</span>
                </span>
              )}
            </button>

            <div className="divider">
              <div className="line" />
              <span>HOẶC TIẾP TỤC VỚI</span>
              <div className="line" />
            </div>

            <button type="button" className="googleBtn" onClick={() => alert("TODO: Google OAuth")}>
              <GoogleIcon />
              <span>Sign in with Google</span>
            </button>

            <div className="securityNote">
              <span className="shield" aria-hidden>
                <ShieldIcon />
              </span>
              <span>MÃ HÓA ĐẦU CUỐI 256-BIT AES</span>
            </div>

            <div className="tinyNote">
              HỆ THỐNG ĐƯỢC BẢO VỆ BỞI HẠ TẦNG AN NINH CẤP <br />
              NGÂN HÀNG
            </div>
          </form>
        </section>
      </main>

      <footer className="authFooter">
        <div className="footerLeft">© 2026 SecureFin Intelligence. Bảo mật tuyệt đối.</div>
        <div className="footerRight">
          <a href="#" onClick={(e) => e.preventDefault()}>
            Quyền riêng tư
          </a>
          <a href="#" onClick={(e) => e.preventDefault()}>
            Điều khoản sử dụng
          </a>
          <a href="#" onClick={(e) => e.preventDefault()}>
            Trung tâm trợ giúp
          </a>
        </div>
      </footer>
    </div>
  );
}

/* ===== SVG Icons (no deps) ===== */
function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M7 10V8a5 5 0 0 1 10 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M6.5 10h11A2.5 2.5 0 0 1 20 12.5v6A2.5 2.5 0 0 1 17.5 21h-11A2.5 2.5 0 0 1 4 18.5v-6A2.5 2.5 0 0 1 6.5 10Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M5.5 7l6.5 5 6.5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function KeyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" stroke="currentColor" strokeWidth="2" />
      <path
        d="M14 10h8v3h-3v3h-3v3h-3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="2" />
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M3 5l18 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10.6 9.1A3 3 0 0 0 12 15c.3 0 .6 0 .9-.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M6.7 7.6C3.8 9.7 2 12 2 12s3.5 7 10 7c2.1 0 3.9-.6 5.4-1.4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M9.2 5.3C10.1 5.1 11 5 12 5c6.5 0 10 7 10 7a17.7 17.7 0 0 1-3.2 4.4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 2l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4Z" stroke="currentColor" strokeWidth="2" />
      <path d="M9 12l2 2 4-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.5 0 6.6 1.2 9 3.3l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.3l7.8 6.1C12.3 13.6 17.7 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.1 24.5c0-1.6-.1-2.7-.4-3.9H24v7.4h12.7c-.3 2-1.8 5-5.1 7l7.9 6.1c4.6-4.2 6.6-10.4 6.6-17.6z"
      />
      <path
        fill="#FBBC05"
        d="M10.4 28.4c-.5-1.5-.8-3.2-.8-4.9s.3-3.4.8-4.9l-7.8-6.1C1 15.8 0 19.7 0 23.5s1 7.7 2.6 10.9l7.8-6z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.9-6.1c-2.1 1.5-4.9 2.6-7.3 2.6-6.3 0-11.7-4.1-13.6-9.9l-7.8 6C6.5 42.6 14.6 48 24 48z"
      />
    </svg>
  );
}
