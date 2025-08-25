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
  // Debug: Log the received logs to see what we're working with
  console.log('DashboardCharts received logs:', logs);
  console.log('Log actions found:', logs.map(log => log.action).filter(Boolean));

  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    return {
      start: startDate.toLocaleDateString(),
      end: endDate.toLocaleDateString()
    };
  };

  const getLoginData = () => {
    // Get date 1 month ago
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    oneMonthAgo.setHours(0, 0, 0, 0);

    // Filter logs for last month and all login-related actions
    const recentLogs = logs.filter(log => {
      const logDate = new Date(log.timestamp || log.createdAt);
      const action = log.action || '';
      const isLoginAction = action.toLowerCase().includes('login') ||
                           action.toLowerCase().includes('signin') ||
                           action.toLowerCase().includes('auth') ||
                           action.toLowerCase().includes('logged');
      return logDate >= oneMonthAgo && isLoginAction;
    });

    console.log('Filtered login logs:', recentLogs);

    // Create a map for all days in the last month with 0 as default
    const loginCounts = {};
    const daysInMonth = 30; // Approximate days in a month
    for (let i = daysInMonth - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const dateString = date.toLocaleDateString();
      loginCounts[dateString] = 0;
    }

    // Count logins for each day
    recentLogs.forEach(log => {
      const date = new Date(log.timestamp || log.createdAt);
      date.setHours(0, 0, 0, 0);
      const dateString = date.toLocaleDateString();
      if (loginCounts.hasOwnProperty(dateString)) {
        loginCounts[dateString]++;
      }
    });

    const labels = Object.keys(loginCounts);
    const data = labels.map(label => loginCounts[label]);
    return { labels, data };
  };

  const getUserActionData = () => {
    // Get date 1 month ago
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    oneMonthAgo.setHours(0, 0, 0, 0);

    // Filter logs for last month
    const recentLogs = logs.filter(log => {
      const logDate = new Date(log.timestamp || log.createdAt);
      return logDate >= oneMonthAgo;
    });

    const userCounts = {};
    recentLogs.forEach(log => {
      const username = log.username || "Unknown";
      userCounts[username] = (userCounts[username] || 0) + 1;
    });
    const labels = Object.keys(userCounts);
    const data = labels.map(label => userCounts[label]);
    return { labels, data };
  };

  const loginData = getLoginData();
  const userActionData = getUserActionData();
  const dateRange = getDateRange();

  return (
    <div className="dashboard-graphs">
      <div className="graph-card">
        <h4>Login History (Last Month)</h4>
        <p className="date-range">
          {dateRange.start} to {dateRange.end}
        </p>
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
          options={{ 
            responsive: true, 
            plugins: { legend: { display: false } },
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Date'
                }
              },
              y: {
                title: {
                  display: true,
                  text: 'Number of Logins'
                },
                beginAtZero: true,
                ticks: {
                  stepSize: 1
                }
              }
            }
          }}
        />
      </div>

      <div className="graph-card">
        <h4>User Activity (Last Month)</h4>
        <p className="date-range">
          {dateRange.start} to {dateRange.end}
        </p>
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
          options={{ 
            responsive: true,
            scales: {
              y: {
                title: {
                  display: true,
                  text: 'Number of Actions'
                },
                beginAtZero: true,
                ticks: {
                  stepSize: 1
                }
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default DashboardCharts;
