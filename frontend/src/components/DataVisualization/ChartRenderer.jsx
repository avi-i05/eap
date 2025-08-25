import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut, Scatter } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ChartRenderer = ({ chart }) => {
  const { chartData, chartType, title } = chart;

  if (!chartData) return <div>No data available</div>;

  // Common chart options
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
  };

  // Render Bar Chart
  if (chartType === "bar") {
    return (
      <div style={{ height: '400px', padding: '1rem' }}>
        <Bar data={chartData} options={commonOptions} />
      </div>
    );
  }

  // Render Line Chart
  if (chartType === "line") {
    return (
      <div style={{ height: '400px', padding: '1rem' }}>
        <Line data={chartData} options={commonOptions} />
      </div>
    );
  }

  // Render Pie Chart
  if (chartType === "pie") {
    return (
      <div style={{ height: '400px', padding: '1rem' }}>
        <Pie data={chartData} options={commonOptions} />
      </div>
    );
  }

  // Render Doughnut Chart
  if (chartType === "doughnut") {
    return (
      <div style={{ height: '400px', padding: '1rem' }}>
        <Doughnut data={chartData} options={commonOptions} />
      </div>
    );
  }

  // Render Scatter Plot
  if (chartType === "scatter") {
    return (
      <div style={{ height: '400px', padding: '1rem' }}>
        <Scatter data={chartData} options={commonOptions} />
      </div>
    );
  }

  return <div>Chart type not supported</div>;
};

export default ChartRenderer; 