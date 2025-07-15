import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/components/UserFileList.css";
const BASE_URL = import.meta.env.VITE_BACKEND_URL;


const UserFileList = ({ refreshFlag }) => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUserFiles = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFiles(res.data.files);
    } catch (err) {
      setError("Failed to fetch files.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserFiles();
  }, [refreshFlag]);

  const handleFileClick = (file) => {
    setSelectedFile(file);
  };

  const handleCloseTable = () => {
    setSelectedFile(null);
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/api/download/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert("Download failed. Please try again.");
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/files/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("File deleted successfully.");
      fetchUserFiles();
      if (selectedFile && selectedFile._id === fileId) setSelectedFile(null);
    } catch {
      alert("Failed to delete file.");
    }
  };

  return (
    <div className="user-file-list-container">
      <h3>Your Uploaded Files</h3>

      {loading ? (
        <div>Loading files...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : files.length === 0 ? (
        <div>No files uploaded yet.</div>
      ) : (
        <div className="file-list">
          {files.map((file) => (
            <div
              key={file._id}
              className={`file-item ${selectedFile?._id === file._id ? "active" : ""}`}
              onClick={() => handleFileClick(file)}
            >
              {file.fileName}
              <div className="file-actions">
                <button
                  className="file-action-btn download"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(file._id, file.fileName);
                  }}
                >
                  Download
                </button>
                <button
                  className="file-action-btn delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(file._id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedFile?.data?.length > 0 && (
        <div className="file-table">
          <div className="file-table-header">
            <h4>Data from: {selectedFile.fileName}</h4>
            <button className="close-button" onClick={handleCloseTable}>
              Close
            </button>
          </div>
          <table>
            <thead>
              <tr>
                {Object.keys(selectedFile.data[0]).map((header, idx) => (
                  <th key={idx}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {selectedFile.data.map((row, idx) => (
                <tr key={idx}>
                  {Object.values(row).map((cell, cIdx) => (
                    <td key={cIdx}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserFileList;
