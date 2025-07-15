import React from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title
} from "chart.js";
import "../styles/components/DashboardCharts.css";

ChartJS.register(LineElement, BarElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Title);

const DashboardCharts = ({ logs }) => {
  const getLoginData = () => {
    const loginCounts = {};
    logs.forEach(log => {
      if (log.action === "Logged in") {
        const date = new Date(log.timestamp).toLocaleDateString();
        loginCounts[date] = (loginCounts[date] || 0) + 1;
      }
    });
    const labels = Object.keys(loginCounts).sort();
    const data = labels.map(label => loginCounts[label]);
    return { labels, data };
  };

  const getUserActionData = () => {
    const userCounts = {};
    logs.forEach(log => {
      const username = log.username || "Unknown";
      userCounts[username] = (userCounts[username] || 0) + 1;
    });
    const labels = Object.keys(userCounts);
    const data = labels.map(label => userCounts[label]);
    return { labels, data };
  };

  const loginData = getLoginData();
  const userActionData = getUserActionData();

  return (
    <div className="dashboard-graphs">
      <div className="graph-card">
        <h4>Login History</h4>
        <Line 
          data={{
            labels: loginData.labels,
            datasets: [
              {
                label: "Logins",
                data: loginData.data,
                backgroundColor: "#6366f1",
                borderColor: "#6366f1",
                fill: false,
                tension: 0.4
              }
            ]
          }}
          options={{ responsive: true, plugins: { legend: { display: false } } }}
        />
      </div>

      <div className="graph-card">
        <h4>User Activity</h4>
        <Bar 
          data={{
            labels: userActionData.labels,
            datasets: [
              {
                label: "Actions",
                data: userActionData.data,
                backgroundColor: "#10b981"
              }
            ]
          }}
          options={{ responsive: true }}
        />
      </div>
    </div>
  );
};

export default DashboardCharts;
