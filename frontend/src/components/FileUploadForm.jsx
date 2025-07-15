import React, { useState } from "react";
import axios from "axios";
import { FiUpload, FiX, FiCheckCircle } from "react-icons/fi";
import { motion } from "framer-motion";
import "../styles/components/FileUploadForm.css";

const FileUploadForm = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      if (!validTypes.includes(selectedFile.type)) {
        setErrorMessage("Please upload a valid Excel file (.xls or .xlsx)");
        return;
      }

      if (selectedFile.size > 5 * 1024 * 1024) {
        setErrorMessage("File size must be less than 5MB");
        return;
      }

      setFile(selectedFile);
      setErrorMessage("");
      setUploadStatus(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage("Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsUploading(true);
      setUploadStatus(null);
      setUploadProgress(0);

      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/files/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress);
          },
        }
      );

      setUploadStatus("success");
      if (onUploadSuccess) {
        onUploadSuccess(response.data);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("error");
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Upload failed. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadStatus(null);
    setErrorMessage("");
    setUploadProgress(0);
  };

  return (
    <div className="file-upload-container">
      <motion.div
        className="upload-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="upload-header">
          <FiUpload size={24} />
          <h2>Upload Excel File</h2>
          <p>Supported formats: .xls, .xlsx (max 5MB)</p>
        </div>

        <form onSubmit={handleUpload} className="upload-form">
          <div className="file-input-container">
            <label className="file-input-label">
              {file ? file.name : "Choose a file"}
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                disabled={isUploading}
                className="file-input"
              />
            </label>
            {file && (
              <button
                type="button"
                onClick={removeFile}
                className="remove-file-btn"
                disabled={isUploading}
              >
                <FiX />
              </button>
            )}
          </div>

          {errorMessage && <div className="error-message">{errorMessage}</div>}

          {isUploading && (
            <div className="upload-progress">
              <div
                className="progress-bar"
                style={{ width: `${uploadProgress}%` }}
              ></div>
              <span>{uploadProgress}%</span>
            </div>
          )}

          {uploadStatus === "success" && (
            <div className="success-message">
              <FiCheckCircle />
              <span>File uploaded successfully!</span>
            </div>
          )}

          <button
            type="submit"
            className="upload-button"
            disabled={!file || isUploading}
          >
            {isUploading ? "Uploading..." : "Upload File"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default FileUploadForm;
