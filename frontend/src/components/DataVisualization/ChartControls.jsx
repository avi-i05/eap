import React from "react";
import {
  FiBarChart2,
  FiPieChart,
  FiTrendingUp,
  FiRefreshCw,
  FiDownload,
} from "react-icons/fi";

const ChartControls = ({
  chartType,
  chartColor,
  showDropdown,
  loading,
  setChartType,
  setChartColor,
  setShowDropdown,
  refreshData,
  downloadChart,
}) => {
  return (
    <div className="viz-controls">
      <div className="chart-type-selector">
        <button
          className={`chart-type-btn ${chartType === "bar" ? "active" : ""}`}
          onClick={() => setChartType("bar")}
          aria-label="Bar chart"
        >
          <FiBarChart2 />
          <span>Bar</span>
        </button>

        <button
          className={`chart-type-btn ${chartType === "pie" ? "active" : ""}`}
          onClick={() => setChartType("pie")}
          aria-label="Pie chart"
        >
          <FiPieChart />
          <span>Pie</span>
        </button>

        <button
          className={`chart-type-btn ${chartType === "line" ? "active" : ""}`}
          onClick={() => setChartType("line")}
          aria-label="Line chart"
        >
          <FiTrendingUp />
          <span>Line</span>
        </button>

        <button
          className={`chart-type-btn ${
            chartType === "doughnut" ? "active" : ""
          }`}
          onClick={() => setChartType("doughnut")}
          aria-label="Doughnut chart"
        >
          <FiPieChart />
          <span>Doughnut</span>
        </button>

        <button
          className={`chart-type-btn ${chartType === "pie-3d" ? "active" : ""}`}
          onClick={() => setChartType("pie-3d")}
          aria-label="3D Pie chart"
        >
          <FiPieChart />
          <span>3D Pie</span>
        </button>
        <button
          className={`chart-type-btn ${
            chartType === "doughnut-3d" ? "active" : ""
          }`}
          onClick={() => setChartType("doughnut-3d")}
          aria-label="3D Doughnut chart"
        >
          <FiPieChart />
          <span>3D Donut</span>
        </button>
      </div>

      <div className="right-controls">
        <div className="color-picker">
          <label htmlFor="chart-color">Color:</label>
          <input
            id="chart-color"
            type="color"
            value={chartColor}
            onChange={(e) => setChartColor(e.target.value)}
            aria-label="Chart color picker"
          />
        </div>

        <button
          className="refresh-btn"
          onClick={refreshData}
          disabled={loading}
          aria-label="Refresh data"
        >
          <FiRefreshCw className={loading ? "spin" : ""} />
        </button>

        <div className="download-dropdown">
          <button
            className="download-btn"
            onClick={() => setShowDropdown(!showDropdown)}
            aria-label="Export options"
          >
            <FiDownload />
            <span>Export</span>
          </button>
          {showDropdown && (
            <div className="dropdown-menu">
              <button
                onClick={() => downloadChart("png")}
                className="dropdown-item"
              >
                PNG Image
              </button>
              <button
                onClick={() => downloadChart("pdf")}
                className="dropdown-item"
              >
                PDF Document
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartControls;
