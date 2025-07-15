import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/components/Auth.css";
import Squares from "../components/Squares"
const BASE_URL = import.meta.env.VITE_BACKEND_URL;



const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    try {
      const res = await axios.post(
        `${BASE_URL}/api/reset-password/${token}`,
        {
          newPassword,
        }
      );
      setMessage(res.data.message);
      setTimeout(() => navigate("/auth"), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error resetting password");
    }
  };

  return (
    <>
    <Squares
        speed={0.5}
        squareSize={40}
        direction="diagonal"
        borderColor="#caf0f8"
        hoverFillColor="#0077b6" 
      />
    <div>
      <div className="auth-container">
        <div className="auth-card">
          <h2>Reset Password</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="password"
                value={newPassword}
                placeholder="Enter new password"
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                value={confirmPassword}
                placeholder="Confirm new password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="auth-submit">
              Reset Password
            </button>
          </form>
          {message && <p className="message">{message}</p>}
        </div>
      </div>
    </div>
    </>
  );
};

export default ResetPassword;
