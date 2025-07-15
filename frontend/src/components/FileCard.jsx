import React from "react";
import { motion } from "framer-motion";

const FileCard = ({ file, index, variants, onDownload, onDelete, onClick }) => {
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
    zip: 'file-archive',
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <motion.div
      className="file-card"
      variants={variants}
      initial="hidden"
      animate="visible"
      custom={index}
      whileHover={{ y: -3 }}
      onClick={() => onClick && onClick(file)}
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
          onClick={(e) => {
            e.stopPropagation();
            onDownload(file._id, file.fileName);
          }}
        >
          <i className="fas fa-download"></i>
        </button>
        <button
          className="action-btn delete-btn"
          title="Delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(file._id);
          }}
        >
          <i className="fas fa-trash"></i>
        </button>
      </div>
    </motion.div>
  );
};

export default FileCard;
