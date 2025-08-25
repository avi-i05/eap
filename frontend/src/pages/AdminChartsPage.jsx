import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import SavedCharts from "../components/SavedCharts";
import "../styles/pages/AdminChartsPage.css";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const AdminChartsPage = () => {
  console.log('AdminChartsPage component rendering...');
  console.log('BASE_URL:', BASE_URL);
  
  const [stats, setStats] = useState({
    totalCharts: 0,
    generatedCharts: 0,
    savedCharts: 0,
    downloadedCharts: 0,
    publicCharts: 0,
    privateCharts: 0,
    uniqueUsers: 0,
    recentCharts: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [charts, setCharts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('AdminChartsPage useEffect triggered');
    fetchChartStats();
  }, []);

  const fetchChartStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }
      
      // Verify user is admin
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        
        if (tokenPayload.role !== 'admin') {
          setError('Access denied. Admin privileges required.');
          setLoading(false);
          return;
        }
      } catch (tokenError) {
        console.error('Error parsing token:', tokenError);
        setError('Invalid authentication token');
        setLoading(false);
        return;
      }

      // First test if the server is reachable
      try {
        const healthResponse = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
      } catch (healthError) {
        setError('Cannot connect to server. Please check if backend is running.');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${BASE_URL}/api/charts/admin/charts`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });

      const { charts: allCharts, statistics } = response.data;
      setStats(statistics);
      setCharts(allCharts);
    } catch (error) {
      console.error("Error fetching chart statistics:", error);
      
      if (error.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (error.code === 'ECONNREFUSED') {
        setError('Cannot connect to server. Please check if backend is running.');
      } else if (error.code === 'ENOTFOUND') {
        setError('Server not found. Please check the backend URL configuration.');
      } else {
        setError(`Failed to load chart statistics: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const getFilteredCharts = () => {
    if (selectedFilter === "all") return charts;
    return charts.filter(chart => chart.chartSource === selectedFilter);
  };

  const getChartTypeColor = (type) => {
    const colors = {
      generated: "#6366f1",
      saved: "#10b981", 
      downloaded: "#f59e0b"
    };
    return colors[type] || "#6b7280";
  };

  const getChartTypeIcon = (type) => {
    const icons = {
      generated: "fas fa-magic",
      saved: "fas fa-save",
      downloaded: "fas fa-download"
    };
    return icons[type] || "fas fa-chart-bar";
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
    >
      <div className="stat-icon" style={{ backgroundColor: color }}>
        <i className={icon}></i>
      </div>
      <div className="stat-content">
        <h3>{value}</h3>
        <p>{title}</p>
        {subtitle && <small>{subtitle}</small>}
      </div>
    </motion.div>
  );

  const FilterButton = ({ filter, label, count, isActive }) => (
    <button
      className={`filter-btn ${isActive ? 'active' : ''}`}
      onClick={() => setSelectedFilter(filter)}
      style={{
        borderColor: isActive ? getChartTypeColor(filter) : '#e5e7eb'
      }}
    >
      <i className={getChartTypeIcon(filter)} style={{ color: getChartTypeColor(filter) }}></i>
      <span>{label}</span>
      <span className="filter-count">{count}</span>
    </button>
  );

  console.log('AdminChartsPage render state:', { loading, error, charts: charts.length });

  if (loading) {
    console.log('Rendering loading state');
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading chart statistics...</p>
      </div>
    );
  }

  if (error) {
    console.log('Rendering error state:', error);
    return (
      <div className="error-container">
        <div className="error-content">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Error Loading Charts</h3>
          <p>{error}</p>
          <button 
            onClick={fetchChartStats}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Fallback if no charts data
  if (!charts || charts.length === 0) {
    console.log('No charts data available');
    return (
      <div className="admin-charts-container">
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2>Admin Charts Dashboard</h2>
          <p>Comprehensive overview of all chart types and statistics</p>
        </motion.div>

        <div className="error-container">
          <div className="error-content">
            <i className="fas fa-chart-pie"></i>
            <h3>No Charts Available</h3>
            <p>No charts have been created yet. Charts will appear here once users start creating them.</p>
            <button 
              onClick={fetchChartStats}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  console.log('Rendering main content');
  return (
    <div className="admin-charts-container">
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2>Admin Charts Dashboard</h2>
        <p>Comprehensive overview of all chart types and statistics</p>
      </motion.div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Charts"
          value={stats.totalCharts}
          icon="fas fa-chart-pie"
          color="#3b82f6"
        />
        <StatCard
          title="Generated Charts"
          value={stats.generatedCharts}
          icon="fas fa-magic"
          color="#6366f1"
          subtitle="Auto-generated from data"
        />
        <StatCard
          title="Saved Charts"
          value={stats.savedCharts}
          icon="fas fa-save"
          color="#10b981"
          subtitle="Manually saved by users"
        />
        <StatCard
          title="Downloaded Charts"
          value={stats.downloadedCharts}
          icon="fas fa-download"
          color="#f59e0b"
          subtitle="Charts with downloads"
        />
        <StatCard
          title="Public Charts"
          value={stats.publicCharts}
          icon="fas fa-globe"
          color="#8b5cf6"
          subtitle="Publicly accessible"
        />
        <StatCard
          title="Unique Users"
          value={stats.uniqueUsers}
          icon="fas fa-users"
          color="#ec4899"
          subtitle="Users with charts"
        />
      </div>

      {/* Filter Buttons */}
      <div className="filter-section">
        <h3>Filter by Chart Type</h3>
        <div className="filter-buttons">
          <FilterButton
            filter="all"
            label="All Charts"
            count={stats.totalCharts}
            isActive={selectedFilter === "all"}
          />
          <FilterButton
            filter="generated"
            label="Generated"
            count={stats.generatedCharts}
            isActive={selectedFilter === "generated"}
          />
          <FilterButton
            filter="saved"
            label="Saved"
            count={stats.savedCharts}
            isActive={selectedFilter === "saved"}
          />
          <FilterButton
            filter="downloaded"
            label="Downloaded"
            count={stats.downloadedCharts}
            isActive={selectedFilter === "downloaded"}
          />
        </div>
      </div>

      {/* Charts Display */}
      <div className="charts-section">
        <div className="section-header">
          <h3>
            {selectedFilter === "all" ? "All Charts" : 
             selectedFilter === "generated" ? "Generated Charts" :
             selectedFilter === "saved" ? "Saved Charts" : "Downloaded Charts"}
          </h3>
          <span className="chart-count">
            {getFilteredCharts().length} charts
          </span>
        </div>
        
        <SavedCharts 
          isAdmin={true} 
          charts={getFilteredCharts()}
          showFilteredCharts={true}
        />
      </div>
    </div>
  );
};

export default AdminChartsPage; 