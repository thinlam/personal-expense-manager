import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Forgot from "../pages/Forgot/Forgot";
import VerifyOtp from "../pages/VerifyOtp/VerifyOtp";
import ResetPassword from "../pages/ResetPassword/ResetPassword";

import Dashboard from "../pages/Dashboard";
import Categories from "../pages/Categories/Categories";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Default root */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<Forgot />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Main app routes */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/categories" element={<Categories />} />

      {/* Fallback (không về login nữa) */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
