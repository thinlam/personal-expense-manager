import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Forgot from "../pages/Forgot/Forgot";
import VerifyOtp from "../pages/VerifyOtp/VerifyOtp";
import ResetPassword from "../pages/ResetPassword/ResetPassword";
import Dashboard from "../pages/Dashboard";

import TransactionsList from "../pages/Transactions/TransactionsList.tsx";
import TransactionNew from "../pages/Transactions/TransactionNew.tsx";

// ✅ Budgets page
import Budgets from "../pages/Budgets/Budgets.tsx";

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

      {/* ✅ Transactions 2 pages */}
      <Route path="/transactions" element={<TransactionsList />} />
      <Route path="/transactions/new" element={<TransactionNew />} />

      {/* ✅ Budgets */}
      <Route path="/budgets" element={<Budgets />} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}