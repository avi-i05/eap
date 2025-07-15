import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import AdminLayout from "./components/AdminLayout";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import UserListPage from "./pages/UserListPage";
import FileListPage from "./pages/FileListPage";
import AuthPage from "./pages/AuthPage";
import PublicHomePage from "./pages/PublicHomePage";
import UserHomePage from "./pages/UserHomePage";
import ForgotPassword from "./pages/ForgotPasswordPage";
import ResetPassword from "./pages/ResetPasswordPage";
import SocialLoginHandler from "./components/SocialLoginHandler";
import Spinner from "./components/Spinner";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    if (storedToken !== token) setToken(storedToken);
    if (storedRole !== role) setRole(storedRole);
  }, []);

  return (
    <Router>
      {loading && <Spinner />}
      <Navbar token={token} role={role} setToken={setToken} setRole={setRole} />
      <Routes>
        <Route path="/" element={<PublicHomePage />} />
        <Route path="/public/user" element={<PublicHomePage />} />
        <Route path="/user/home" element={<UserHomePage />} />
        <Route path="/auth" element={<AuthPage setToken={setToken} setRole={setRole} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/social-login" element={
          <SocialLoginHandler setToken={setToken} setRole={setRole} setLoading={setLoading} />
        } />
        {token && role === "admin" ? (
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="users" element={<UserListPage />} />
            <Route path="files" element={<FileListPage />} />
            <Route path="" element={<Navigate to="/admin/dashboard" />} />
          </Route>
        ) : (
          <Route path="/admin/*" element={<Navigate to="/auth" />} />
        )}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

export default App;
