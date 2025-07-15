import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiLogOut, FiUser, FiSettings, FiUpload } from "react-icons/fi";
import "../styles/components/UserDashboard.css";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);

  const handleLogout = () => {
    setIsExiting(true);
    setTimeout(() => {
      localStorage.removeItem("token");
      navigate("/auth");
    }, 500);
  };

  return (
    <AnimatePresence>
      {!isExiting ? (
        <motion.div
          className="dashboard-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="dashboard-card"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="user-header">
              <motion.div 
                className="user-avatar"
                whileHover={{ scale: 1.05 }}
              >
                <FiUser size={24} />
              </motion.div>
              <h1>Welcome to Your Dashboard</h1>
              <p>Manage your data visualizations and uploads</p>
            </div>

            <div className="dashboard-actions">
              <motion.button
                className="action-button primary"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/upload")}
              >
                <FiUpload size={18} />
                Upload Files
              </motion.button>
              
              <motion.button
                className="action-button secondary"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/visualizations")}
              >
                <FiSettings size={18} />
                View Visualizations
              </motion.button>
            </div>

            <motion.button
              className="logout-button"
              onClick={handleLogout}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiLogOut size={18} />
              Logout
            </motion.button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default UserDashboard;