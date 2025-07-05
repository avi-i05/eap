import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import "./AdminDashboard.css";

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    users: 0,
    files: 0,
    storage: "0 MB"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
    
        const [usersRes, filesRes] = await Promise.all([
          axios.get("http://localhost:5000/api/admin/users", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/admin/files", {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);
    
        // ✅ Extract the arrays correctly
        const usersArray = usersRes.data.users;  // Make sure your backend is returning { users: [...] }
        const filesArray = filesRes.data.files;  // Make sure your backend is returning { files: [...] }
    
        // ✅ Calculate total storage
        const totalSize = filesArray.reduce((sum, file) => sum + (file.size || 0), 0);
        const formattedSize = formatFileSize(totalSize);
    
        setStats({
          users: usersArray.length,
          files: filesArray.length,
          storage: formattedSize
        });
    
        setLoading(false);
    
      } catch (error) {
        console.error("Dashboard fetch error:", error); // Please check the exact backend response here
        alert("Error fetching dashboard data.");
        setLoading(false);
      }
    };
    

    fetchData();
  }, []);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: (i) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.15,
        duration: 0.6,
        type: "spring",
        stiffness: 120
      }
    })
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <motion.div 
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2>Admin Dashboard</h2>
        <p className="dashboard-subtitle">Overview and statistics</p>
      </motion.div>
      
      <div className="dashboard-cards">
        <StatCard 
          icon="users"
          title="Total Users"
          value={stats.users}
          color="#6366F1"
          index={0}
          variants={cardVariants}
        />
        <StatCard 
          icon="file-alt"
          title="Total Files"
          value={stats.files}
          color="#10B981"
          index={1}
          variants={cardVariants}
        />
        <StatCard 
          icon="database"
          title="Storage Used"
          value={stats.storage}
          color="#3B82F6"
          index={2}
          variants={cardVariants}
        />
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, color, index, variants }) => (
  <motion.div 
    className="dashboard-card"
    variants={variants}
    initial="hidden"
    animate="visible"
    custom={index}
    whileHover={{ y: -5 }}
    style={{ '--card-accent': color }}
  >
    <div className="card-icon">
      <i className={`fas fa-${icon}`}></i>
    </div>
    <div className="card-content">
      <h3>{title}</h3>
      <p className="count">{value}</p>
    </div>
    <div className="card-wave"></div>
  </motion.div>
);

export default AdminDashboardPage;