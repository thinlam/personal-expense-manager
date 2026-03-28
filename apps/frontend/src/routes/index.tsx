import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Forgot from "../pages/Forgot/Forgot"; // nếu đã tạo thì mở ra
import VerifyOtp from "../pages/VerifyOtp/VerifyOtp";
import ResetPassword from "../pages/ResetPassword/ResetPassword";
import Dashboard from "../pages/Dashboard";
import VerifyEmailOtp from "../pages/VerifyEmailOtp/VerifyEmailOtp";
// import Wallets from "../pages/Wallets";
import Settings from "../pages/Settings";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/forgot-password" element={<Forgot />} /> 
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/verify-email" element={<VerifyEmailOtp />} />
      <Route path="/settings" element={<Settings />} />

      {/* <Route path="/wallets" element={<Wallets />} /> */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
