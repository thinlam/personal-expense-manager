/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/auth.service";
import AuthLayout from "../components/auth/AuthLayout";
import s from "../components/auth/AuthLayout.module.css";

export default function Login() {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);

  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const emailOk = useMemo(() => {
    if (!email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, [email]);

  const canSubmit = email.trim().length > 0 && password.trim().length > 0 && emailOk && !loading;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      await login({ email: email.trim(), password });
      localStorage.setItem("remember_me", remember ? "1" : "0");
      nav("/dashboard");
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Đăng nhập" subtitle="Chào mừng bạn quay lại. Vui lòng đăng nhập để tiếp tục.">
      {err && (
        <div className={s.alert}>
          <div className={s.alertIcon}>!</div>
          <div>
            <div className={s.alertTitle}>Không thể đăng nhập</div>
            <div className={s.alertText}>{err}</div>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className={s.form}>
        <div className={s.field}>
          <label className={s.label}>Email</label>
          <div className={`${s.inputWrap} ${emailOk ? "" : s.inputError}`}>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              autoComplete="email"
              inputMode="email"
              className={s.input}
            />
          </div>
          {!emailOk && <div className={s.helperError}>Email không hợp lệ.</div>}
        </div>

        <div className={s.field}>
          <label className={s.label}>Mật khẩu</label>
          <div className={s.inputWrap}>
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className={s.input}
            />
            <button type="button" onClick={() => setShowPw((x) => !x)} className={s.ghostBtn}>
              {showPw ? "Ẩn" : "Hiện"}
            </button>
          </div>
        </div>

        <div className={s.rowBetween}>
          <label className={s.check}>
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className={s.checkbox} />
            <span>Ghi nhớ đăng nhập</span>
          </label>

          <button type="button" className={s.linkBtn} onClick={() => alert("Màn quên mật khẩu làm sau.")}>
            Quên mật khẩu?
          </button>
        </div>

        <button type="submit" disabled={!canSubmit} className={`${s.primaryBtn} ${canSubmit ? "" : s.btnDisabled}`}>
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        <p className={s.footer}>
          Chưa có tài khoản?{" "}
          <Link to="/register" className={s.link}>
            Đăng ký
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
