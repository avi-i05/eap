import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import "../styles/pages/UserDashboardPage.css";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const UserDashboardPage = () => {
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalCharts: 0,
    recentUploads: 0
  });
  const [recentCharts, setRecentCharts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch user files
      const filesResponse = await axios.get(`${BASE_URL}/api/history`, { headers });
      const files = filesResponse.data.files || [];

      // Fetch user charts
      const chartsResponse = await axios.get(`${BASE_URL}/api/charts/user`, { headers });
      const charts = chartsResponse.data.charts || [];

      setStats({
        totalFiles: files.length,
        totalCharts: charts.length,
        recentUploads: files.filter(file => {
          const fileDate = new Date(file.createdAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return fileDate > weekAgo;
        }).length
      });

      setRecentCharts(charts.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="stat-icon" style={{ backgroundColor: color }}>
        <i className={`fas fa-${icon}`}></i>
      </div>
      <div className="stat-content">
        <h3>{value}</h3>
        <p>{title}</p>
      </div>
    </motion.div>
  );

  const ChartCard = ({ chart }) => (
    <motion.div
      className="chart-card"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="chart-header">
        <h4>{chart.title}</h4>
        <span className={`chart-type ${chart.chartType}`}>
          {chart.chartType.toUpperCase()}
        </span>
      </div>
      <p className="chart-description">
        {chart.description || "No description available"}
      </p>
      <div className="chart-meta">
        <span className="chart-date">
          <i className="fas fa-calendar"></i>
          {new Date(chart.createdAt).toLocaleDateString()}
        </span>
        {chart.isPublic && (
          <span className="public-badge">
            <i className="fas fa-globe"></i>
            Public
          </span>
        )}
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      <motion.div
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Welcome back!</h1>
        <p>Here's what's happening with your data</p>
      </motion.div>

      <div className="stats-grid">
        <StatCard
          title="Total Files"
          value={stats.totalFiles}
          icon="file-archive"
          color="#667eea"
        />
        <StatCard
          title="Saved Charts"
          value={stats.totalCharts}
          icon="chart-pie"
          color="#764ba2"
        />
        <StatCard
          title="Recent Uploads"
          value={stats.recentUploads}
          icon="upload"
          color="#f093fb"
        />
      </div>

      <div className="dashboard-content">
        <div className="recent-charts-section">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2>Recent Charts</h2>
            <p>Your latest visualizations</p>
          </motion.div>

          {recentCharts.length > 0 ? (
            <div className="charts-grid">
              {recentCharts.map((chart, index) => (
                <ChartCard key={chart._id} chart={chart} />
              ))}
            </div>
          ) : (
            <motion.div
              className="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <i className="fas fa-chart-bar"></i>
              <h3>No charts yet</h3>
              <p>Start creating visualizations to see them here</p>
            </motion.div>
          )}
        </div>

        <div className="quick-actions-section">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2>Quick Actions</h2>
            <p>Get started quickly</p>
          </motion.div>

          <div className="actions-grid">
            <motion.div
              className="action-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
            >
              <i className="fas fa-upload"></i>
              <h3>Upload Data</h3>
              <p>Upload your Excel files to get started</p>
            </motion.div>

            <motion.div
              className="action-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
            >
              <i className="fas fa-chart-line"></i>
              <h3>Create Charts</h3>
              <p>Visualize your data with interactive charts</p>
            </motion.div>

            <motion.div
              className="action-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
            >
              <i className="fas fa-share-alt"></i>
              <h3>Share Insights</h3>
              <p>Share your charts with others</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardPage; 