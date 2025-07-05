import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import "./FileListPage.css";

const FileListPage = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/admin/files", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFiles(res.data.files);
      setLoading(false);
    } catch (error) {
      alert("Failed to fetch files.");
      setLoading(false);
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/api/admin/files/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert("Failed to download file.");
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/admin/files/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFiles(files.filter(file => file._id !== fileId));
      alert("File deleted successfully.");
    } catch (error) {
      alert("Failed to delete file.");
    }
  };

  const filteredFiles = files.filter(file =>
    file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (file.owner?.username && file.owner.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.07,
        duration: 0.4,
        ease: "easeOut"
      }
    })
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
    </div>
  );
};

const FileCard = ({ file, index, variants, onDownload, onDelete }) => {
  const fileType = file.fileName.split('.').pop().toLowerCase();
  const iconMap = {
    pdf: 'file-pdf',
    jpg: 'file-image',
    png: 'file-image',
    doc: 'file-word',
    docx: 'file-word',
    xls: 'file-excel',
    xlsx: 'file-excel',
    mp4: 'file-video',
    mp3: 'file-audio',
    zip: 'file-archive'
  };

  return (
    <motion.div 
      className="file-card"
      variants={variants}
      initial="hidden"
      animate="visible"
      custom={index}
      whileHover={{ y: -3 }}
    >
      <div className="file-icon">
        <i className={`fas fa-${iconMap[fileType] || 'file-alt'}`}></i>
      </div>
      <div className="file-info">
        <h3 className="file-name">{file.fileName}</h3>
        <div className="file-meta">
          <span><i className="fas fa-user"></i> {file.owner?.username || 'Unknown'}</span>
          <span><i className="fas fa-database"></i> {formatFileSize(file.size)}</span>
        </div>
      </div>
      <div className="file-actions">
        <button
          className="action-btn download-btn"
          title="Download"
          onClick={() => onDownload(file._id, file.fileName)}
        >
          <i className="fas fa-download"></i>
        </button>
        <button
          className="action-btn delete-btn"
          title="Delete"
          onClick={() => onDelete(file._id)}
        >
          <i className="fas fa-trash"></i>
        </button>
      </div>
    </motion.div>
  );
};

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default FileListPage;
