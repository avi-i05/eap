import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import "../styles/pages/UserChartsPage.css";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const UserChartsPage = () => {
  const [charts, setCharts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCharts();
  }, []);

  const fetchCharts = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${BASE_URL}/api/charts/user`, { headers });
      setCharts(response.data.charts || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching charts:", error);
      toast.error("Failed to load charts");
      setLoading(false);
    }
  };

  const handleDeleteChart = async (chartId) => {
    if (window.confirm("Are you sure you want to delete this chart?")) {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        await axios.delete(`${BASE_URL}/api/charts/user/${chartId}`, { headers });
        toast.success("Chart deleted successfully");
        fetchCharts();
      } catch (error) {
        console.error("Error deleting chart:", error);
        toast.error("Failed to delete chart");
      }
    }
  };

  const filteredCharts = charts.filter(chart =>
    chart.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (chart.description && chart.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="charts-loading">
        <div className="loading-spinner"></div>
        <p>Loading your saved charts...</p>
      </div>
    );
  }

  return (
    <div className="user-charts-page">
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>My Saved Charts</h1>
        <p>View and manage your saved visualizations</p>
      </motion.div>

      <div className="charts-controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search your saved charts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {filteredCharts.length > 0 ? (
        <div className="charts-grid">
          {filteredCharts.map((chart) => (
            <motion.div
              key={chart._id}
              className="chart-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="chart-header">
                <h3>{chart.title}</h3>
                <div className="chart-actions">
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteChart(chart._id)}
                    title="Delete Chart"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              
              {chart.description && (
                <p className="chart-description">
                  {chart.description}
                </p>
              )}
              
              <div className="chart-meta">
                <span className={`chart-type ${chart.chartType}`}>
                  {chart.chartType.toUpperCase()}
                </span>
                <span className="chart-date">
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
          ))}
        </div>
      ) : (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <i className="fas fa-chart-bar"></i>
          <h3>No saved charts found</h3>
          <p>
            {searchTerm ? "No saved charts match your search." : "You haven't saved any charts yet. Create and save charts to see them here."}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default UserChartsPage; 