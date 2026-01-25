/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { register } from "../services/auth.service";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await register({ name, email, password });
      nav("/dashboard");
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "48px auto" }}>
      <h2>Đăng ký</h2>

      <form onSubmit={onSubmit}>
        <div style={{ marginTop: 12 }}>
          <label>Họ tên</label>
          <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%" }} />
        </div>

        <div style={{ marginTop: 12 }}>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%" }} />
        </div>

        <div style={{ marginTop: 12 }}>
          <label>Mật khẩu ({">"}= 8 ký tự)</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>

        {err && <p style={{ marginTop: 12 }}>{err}</p>}

        <button disabled={loading} style={{ marginTop: 16, width: "100%" }}>
          {loading ? "Đang tạo..." : "Tạo tài khoản"}
        </button>
      </form>

      <p style={{ marginTop: 12 }}>
        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
      </p>
    </div>
  );
}
