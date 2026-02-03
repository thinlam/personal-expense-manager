import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/auth.service";
import { storage } from "../../utils/storage";
import "./register.css";

export default function Register() {
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // ✅ NEW

  const [agree, setAgree] = useState(true);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false); // ✅ NEW

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pwdMismatch = useMemo(() => {
    // chỉ báo mismatch khi user đã nhập confirm (tránh hiện lỗi quá sớm)
    if (!confirmPassword) return false;
    return password !== confirmPassword;
  }, [password, confirmPassword]);

  const canSubmit = useMemo(() => {
    if (name.trim().length < 2) return false;
    if (!email.trim()) return false;
    if (password.length < 8) return false;
    if (confirmPassword.length < 8) return false; // ✅ NEW
    if (password !== confirmPassword) return false; // ✅ NEW
    if (!agree) return false;
    return true;
  }, [name, email, password, confirmPassword, agree]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setError(null);
    setLoading(true);
    try {
      const data = await authService.register({ name, email, password });
      storage.setToken(data.token);
      storage.setUser(data.user);

      nav("/login", { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="regPage2">
      {/* Topbar */}
      <header className="regTopbar2">
        <div className="brand2">
          <div className="brandLogo2" aria-hidden>
            <LockIcon />
          </div>
          <div className="brandName2">SECUREFIN</div>
        </div>

        <div className="topRight2">
          <span className="topHint2">Đã có tài khoản?</span>
          <Link className="topCta2" to="/login">
            Đăng nhập
          </Link>
        </div>
      </header>

      {/* Center */}
      <main className="regCenter2">
        <section className="regCard2">
          <div className="cardHeader2">
            <h1 className="cardTitle2">Đăng ký Tài khoản</h1>
            <p className="cardSub2">
              Bắt đầu hành trình quản lý tài chính thông minh với tiêu chuẩn <br />
              bảo mật cao cấp nhất.
            </p>
          </div>

          <form className="form2" onSubmit={onSubmit}>
            <div className="field2">
              <div className="label2">HỌ VÀ TÊN</div>
              <div className="inputWrap2">
                <span className="leftIcon2" aria-hidden>
                  <UserIcon />
                </span>
                <input
                  className="input2"
                  placeholder="Nguyễn Văn A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                />
              </div>
            </div>

            <div className="field2">
              <div className="label2">EMAIL</div>
              <div className="inputWrap2">
                <span className="leftIcon2" aria-hidden>
                  <MailIcon />
                </span>
                <input
                  className="input2"
                  placeholder="me@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="field2">
              <div className="label2">MẬT KHẨU</div>
              <div className="inputWrap2">
                <span className="leftIcon2" aria-hidden>
                  <KeyIcon />
                </span>
                <input
                  className="input2"
                  placeholder="tối thiểu 8 ký tự"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPwd ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="iconBtn2"
                  onClick={() => setShowPwd((v) => !v)}
                  aria-label={showPwd ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPwd ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* ✅ NEW: Confirm password */}
            <div className="field2">
              <div className="label2">NHẬP LẠI MẬT KHẨU</div>
              <div className="inputWrap2">
                <span className="leftIcon2" aria-hidden>
                  <KeyIcon />
                </span>
                <input
                  className="input2"
                  placeholder="nhập lại mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type={showConfirm ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="iconBtn2"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              {/* Hiện báo lỗi nhẹ ngay dưới field nếu không khớp */}
              {pwdMismatch && (
                <div className="errorBox2" style={{ marginTop: 10 }}>
                  Mật khẩu nhập lại không khớp.
                </div>
              )}
            </div>

            <label className="agreeRow2">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              <span>
                Tôi đồng ý với các{" "}
                <a href="#" onClick={(e) => e.preventDefault()}>
                  Điều khoản dịch vụ
                </a>{" "}
                và{" "}
                <a href="#" onClick={(e) => e.preventDefault()}>
                  Chính sách bảo mật
                </a>{" "}
                của hệ thống.
              </span>
            </label>

            {error && <div className="errorBox2">{error}</div>}

            <button className="primaryBtn2" type="submit" disabled={loading || !canSubmit}>
              {loading ? (
                <span className="btnLoading2">
                  <span className="spinner2" aria-hidden />
                  Đang tạo tài khoản...
                </span>
              ) : (
                <span className="btnRow2">
                  Tạo tài khoản &amp; Bắt đầu <span className="rocket"></span>
                </span>
              )}
            </button>

            <div className="divider2">
              <div className="line2" />
              <span>HOẶC TIẾP TỤC VỚI</span>
              <div className="line2" />
            </div>

            <button type="button" className="googleBtn2" onClick={() => alert("TODO: Google OAuth")}>
              <GoogleIcon />
              <span>Sign in with Google</span>
            </button>

            <div className="securityNote2">
              <span className="shield2" aria-hidden>
                <ShieldIcon />
              </span>
              <span>MÃ HÓA 256-BIT AES</span>
            </div>

            <div className="tinyNote2">HẠ TẦNG BẢO MẬT CẤP DOANH NGHIỆP</div>
          </form>
        </section>
      </main>

      {/* Footer */}
      <footer className="regFooter2">
        <div>© 2026 SecureFin Intelligence. Bảo mật tuyệt đối.</div>
        <div className="footerLinks2">
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

/* ===== Icons (no deps) ===== */
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
function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 12a4.2 4.2 0 1 0-4.2-4.2A4.2 4.2 0 0 0 12 12Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M4.5 20a7.5 7.5 0 0 1 15 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
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
