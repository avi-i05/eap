import React from "react";
import "../styles/components/LogList.css";

const LogList = ({ logs }) => {
  // Sort logs by timestamp in descending order (most recent first)
  // No need to limit here since backend already filters for auth logs from last month
  const sortedLogs = [...logs]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="log-list">
      <h4>Recent Authentication Activity (Last Month)</h4>
      <div className="log-entries">
        {sortedLogs.length === 0 ? (
          <p>No authentication activity in the last month.</p>
        ) : (
          sortedLogs.map((log, index) => (
            <div key={`${log._id || index}-${log.timestamp}`} className="log-entry">
              <div className="log-meta">
                <span className="log-username">{log.username}</span>
                <span className="log-timestamp">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="log-action">{log.action}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LogList;
