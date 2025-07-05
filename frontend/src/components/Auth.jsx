import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Auth.css";
import { FiEye, FiEyeOff, FiUser, FiMail, FiLock } from "react-icons/fi";
import { FaGoogle, FaGithub } from "react-icons/fa";

const Auth = ({ setToken, setRole }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({ username: "", email: "", password: "" });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isLogin
  ? "http://localhost:5000/api/login"
  : "http://localhost:5000/api/register";

  
      const { data } = await axios.post(url, formData);
  
      console.log("Server Response:", data); // Log the response to inspect
  
      alert(data.message);
  
      if (data.token && data.user) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);
  
        setToken(data.token);
        setRole(data.user.role);
  
        if (data.user.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/user-home");
        }
  
        window.location.reload();
        return;
      }
  
      if (!isLogin) {
        setIsLogin(true);
        setFormData({ username: "", email: "", password: "" });
      }
  
    } catch (error) {
      console.error("Error response:", error.response);
      console.error("Error message:", error.message);
      alert(error.response?.data?.message || "Something went wrong");
    }
  };
  
  return (
    <div className="auth-container">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="auth-card"
      >
        <motion.div
          className="auth-header"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>
          <p>{isLogin ? "Login to continue" : "Join us to get started"}</p>
        </motion.div>

        <motion.form
          key={isLogin ? "login" : "register"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onSubmit={handleSubmit}
        >
          {!isLogin && (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="input-group"
            >
              <FiUser className="input-icon" />
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </motion.div>
          )}

          <div className="input-group">
            <FiMail className="input-icon" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <FiLock className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="show-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="auth-submit"
          >
            {isLogin ? "Login" : "Register"}
          </motion.button>
        </motion.form>
        <motion.div
  className="social-login"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.5 }}
>
  <p className="or-divider">or</p>

  <button
    className="social-btn google-btn"
    onClick={() => window.open("http://localhost:5000/api/google", "_self")}
  >
    Continue with Google
  </button>

  <button
    className="social-btn github-btn"
    onClick={() => window.open("http://localhost:5000/api/github", "_self")}
  >
    Continue with GitHub
  </button>
</motion.div>



        <motion.div
          className="auth-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <motion.span
              whileHover={{ color: "#4361ee" }}
              onClick={toggleForm}
              className="toggle-link"
            >
              {isLogin ? " Register" : " Login"}
            </motion.span>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Auth;