import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Forgot from "../pages/Forgot/Forgot";
import VerifyOtp from "../pages/VerifyOtp/VerifyOtp";
import VerifyEmailOtp from "../pages/VerifyEmailOtp/VerifyEmailOtp";
import ResetPassword from "../pages/ResetPassword/ResetPassword";
import Dashboard from "../pages/Dashboard";

import TransactionsList from "../pages/Transactions/TransactionsList.tsx";
import TransactionNew from "../pages/Transactions/TransactionNew.tsx";
import Budgets from "../pages/Budgets/Budgets.tsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Quên mật khẩu */}
      <Route path="/forgot-password" element={<Forgot />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Xác minh email khi đăng ký */}
      <Route path="/verify-email-otp" element={<VerifyEmailOtp />} />

      <Route path="/dashboard" element={<Dashboard />} />

      <Route path="/transactions" element={<TransactionsList />} />
      <Route path="/transactions/new" element={<TransactionNew />} />

      <Route path="/budgets" element={<Budgets />} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}