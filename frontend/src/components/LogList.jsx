import React from "react";
import "../styles/components/LogList.css";

const LogList = ({ logs }) => {
  return (
    <div className="log-list">
      <h4>Recent Activity Logs</h4>
      <div className="log-entries">
        {logs.length === 0 ? (
          <p>No logs available.</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="log-entry">
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
