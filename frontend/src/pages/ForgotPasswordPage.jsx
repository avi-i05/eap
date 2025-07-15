import React, { useState } from "react";
import axios from "axios";
import "../styles/components/Auth.css";
import Squares from "../components/Squares"

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/forgot-password",
        { email }
      );
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error sending reset link");
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
    <div className="forgot-container">
      <div className="auth-container">
        <div className="auth-card">
          <h2>Forgot Password</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="email"
                value={email}
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="auth-submit">
              Send Reset Link
            </button>
          </form>
          {message && <p className="message">{message}</p>}
        </div>
      </div>
    </div>
    </>
  );
};

export default ForgotPassword;
