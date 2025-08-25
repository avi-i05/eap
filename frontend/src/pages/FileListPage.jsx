import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import FileCard from "../components/FileCard";
import "../styles/pages/FileListPage.css";
import { toast } from "react-toastify";
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const FileListPage = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/admin/files`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFiles(res.data.files);
      setLoading(false);
    } catch {
      toast.error("Failed to fetch files");
      setLoading(false);
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/admin/files/${fileId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      if (error.response?.status === 403) {
        alert("You don't have permission to download this file");
      } else {
        alert("Failed to download file. Please try again.");
      }
    }
  };

  const handleDelete = async (fileId) => {
    toast.info("Deleting file...");
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE_URL}/api/admin/files/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFiles(files.filter((file) => file._id !== fileId));
      toast.success("File deleted successfully");
      if (selectedFile && selectedFile._id === fileId) setSelectedFile(null);
    } catch {
      toast.error("Failed to delete file");
    }
  };

  const handlePreview = (file) => {
    setSelectedFile(file);
  };

  const handleClosePreview = () => {
    setSelectedFile(null);
  };

  const filteredFiles = files.filter(
    (file) =>
      file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (file.owner?.username &&
        file.owner.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.07,
        duration: 0.4,
        ease: "easeOut",
      },
    }),
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="files-container">
      <motion.div
        className="files-header"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h2>File Management</h2>
        <div className="search-bar">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </motion.div>

      <div className="files-grid">
        {filteredFiles.length > 0 ? (
          filteredFiles.map((file, index) => (
            <FileCard
              key={file._id}
              file={file}
              index={index}
              variants={itemVariants}
              onDownload={handleDownload}
              onDelete={handleDelete}
              onClick={() => handlePreview(file)}
            />
          ))
        ) : (
          <motion.div
            className="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <i className="fas fa-folder-open"></i>
            <p>No files found</p>
          </motion.div>
        )}
      </div>

      {selectedFile && selectedFile.data?.length > 0 && (
        <motion.div
          className="file-preview-table"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="preview-header">
            <h4>Preview: {selectedFile.fileName}</h4>
            <button onClick={handleClosePreview} className="close-button">
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
              {selectedFile.data.slice(0, 10).map((row, idx) => (
                <tr key={idx}>
                  {Object.values(row).map((cell, cIdx) => (
                    <td key={cIdx}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
};

export default FileListPage;
