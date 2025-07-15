import React, { useEffect } from "react";
import { Bar, Pie, Line, Doughnut } from "react-chartjs-2";
import { toast } from "react-toastify";
import ThreePieDonutChart from "./ThreeDChart";

const ChartPanel = ({
  chartType,
  chartData,
  chartOptions,
  chartReady,
  generating,
  chartRef,
}) => {
  useEffect(() => {
    if (chartReady && !chartData) {
      toast.error("Chart cannot be generated due to invalid field selection.");
    }
  }, [chartReady, chartData]);

  if (!chartReady) {
    return generating ? (
      <div className="loading-overlay">
        <div className="spinner"></div>
        <p>Generating chart...</p>
      </div>
    ) : (
      <div className="no-chart-message">
        <div className="placeholder-animation"></div>
        <p>Click "Generate Chart" to view visualization</p>
      </div>
    );
  }

  if (chartReady && !chartData) {
    return (
      <div className="chart-error-message">
        <p>
          Chart could not be generated due to invalid or incompatible fields.
        </p>
      </div>
    );
  }

  return (
    <div className="chart-wrapper">
      {chartType === "bar" && (
        <Bar ref={chartRef} data={chartData} options={chartOptions} />
      )}
      {chartType === "pie" && (
        <Pie ref={chartRef} data={chartData} options={chartOptions} />
      )}
      {chartType === "doughnut" && (
        <Doughnut ref={chartRef} data={chartData} options={chartOptions} />
      )}
      {chartType === "line" && (
        <Line ref={chartRef} data={chartData} options={chartOptions} />
      )}
      {chartType === "pie-3d" && (
        <ThreePieDonutChart data={chartData} chartType="3d-pie" />
      )}
      {chartType === "doughnut-3d" && (
        <ThreePieDonutChart data={chartData} chartType="3d-donut" />
      )}
    </div>
  );
};

export default ChartPanel;
