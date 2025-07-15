import React from "react";

const FileSidebar = ({ files, loading, error, selectedFile, onFileSelect }) => {
  return (
    <div className="file-sidebar">
      <h3>Your Datasets</h3>
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <span>Loading datasets...</span>
        </div>
      ) : error ? (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      ) : (
        <div className="file-list">
          {files.map((file) => (
            <div
              key={file._id}
              className={`file-item ${
                selectedFile?._id === file._id ? "active" : ""
              }`}
              onClick={() => onFileSelect(file)}
              aria-label={`Select dataset ${file.fileName}`}
            >
              <span className="file-icon">📊</span>
              <span className="file-name">{file.fileName}</span>
              <span className="file-records">{file.data.length} records</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileSidebar;
