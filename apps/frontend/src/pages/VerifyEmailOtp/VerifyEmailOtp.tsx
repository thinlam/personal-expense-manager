import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { authService } from "../../services/auth.service";
import { storage } from "../../utils/storage";
import "./verifyEmailOtp.css";

type LocationState = {
  email?: string;
};

type VerifyPayload = {
  token?: string;
  user?: unknown;
};

type VerifyResponse = {
  ok?: boolean;
  message?: string;
  token?: string;
  user?: unknown;
  data?: VerifyPayload;
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? error.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export default function VerifyEmailOtp() {
  const nav = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) || {};
  const email = state.email?.trim().toLowerCase() || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return !!email && otp.trim().length === 6;
  }, [email, otp]);

  const onVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    setErr(null);
    setMsg(null);
    setLoading(true);

    try {
      const data = (await authService.verifyEmailOtp({
        email,
        otp,
      })) as VerifyResponse;

      const payload: VerifyPayload =
        data.token && data.user ? data : data.data ?? {};

      if (!payload.token) {
        throw new Error(data.message ?? "Xác minh thất bại");
      }

      storage.setToken(payload.token);

      if (payload.user) {
        storage.setUser(payload.user);
      }

      nav("/dashboard", { replace: true });
    } catch (error: unknown) {
      setErr(getErrorMessage(error, "Xác minh thất bại"));
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    setErr(null);
    setMsg(null);
    setLoading(true);

    try {
      const registerPayload: Parameters<typeof authService.registerInit>[0] = {
        name: "tmp",
        email,
        password: "tmp_tmp_tmp",
      };

      await authService.registerInit(registerPayload);
      setMsg("Đã gửi lại OTP. Vui lòng kiểm tra email.");
    } catch (error: unknown) {
      setErr(getErrorMessage(error, "Gửi lại OTP thất bại"));
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="veWrap">
        <div className="veCard">
          <h2>Thiếu email</h2>
          <p>Vui lòng quay lại trang đăng ký.</p>
          <Link className="veBtn" to="/register">
            Quay lại
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="veWrap">
      <div className="veCard">
        <h1>Xác minh email</h1>
        <p>
          Mình đã gửi OTP đến <b>{email}</b>. Nhập mã 6 số để hoàn tất đăng ký.
        </p>

        <form className="veForm" onSubmit={onVerify}>
          <input
            className="veInput"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="Nhập OTP (6 số)"
            inputMode="numeric"
          />

          {err && <div className="veErr">{err}</div>}
          {msg && <div className="veMsg">{msg}</div>}

          <button className="veBtn" disabled={loading || !canSubmit}>
            {loading ? "Đang xử lý..." : "Xác minh"}
          </button>

          <button
            type="button"
            className="veLink"
            onClick={onResend}
            disabled={loading}
          >
            Gửi lại OTP
          </button>

          <div className="veBack">
            <Link to="/register">← Đổi email</Link>
          </div>
        </form>
      </div>
    </div>
  );
}