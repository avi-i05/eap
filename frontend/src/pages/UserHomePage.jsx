import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import Footer from "../components/Footer";
import FileUploadForm from "../components/FileUploadForm";
import DataVisualization from "../components/DataVisualization/DataVisualization";
import UserFileList from "../components/UserFileList";
import axios from "axios";
import "../styles/pages/UserHomePage.css";
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const UserHomePage = () => {
  const [activeTab, setActiveTab] = useState("visualize");
  const [fileUploaded, setFileUploaded] = useState(false);
  const [files, setFiles] = useState([]);

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFiles(res.data.files);
    } catch (err) {
      console.error("Failed to fetch files:", err);
    }
  };

  useEffect(() => {
    fetchFiles(); 
  }, []);


  const handleUploadSuccess = () => {
    setFileUploaded(true);
    fetchFiles();
    setActiveTab("visualize");
    setTimeout(() => setFileUploaded(false), 3000);
  };


  const handleFileDelete = () => {
    fetchFiles(); 
  };

  return (
    <div className="homepage-container">
      <motion.div
        className="content-wrapper"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-section">
          <motion.h1
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Data Visualization Portal
          </motion.h1>
          <p>Transform your data into actionable insights</p>
        </div>

        <div className="tab-controls">
          <button
            className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            Upload Data
          </button>
          <button
            className={`tab-button ${activeTab === 'visualize' ? 'active' : ''}`}
            onClick={() => setActiveTab('visualize')}
          >
            Visualize
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="tab-content"
          >
            {activeTab === 'upload' ? (
              <FileUploadForm onSuccess={handleUploadSuccess} />
            ) : (
              <DataVisualization />
            )}
          </motion.div>
        </AnimatePresence>

        <UserFileList files={files} onFileDelete={handleFileDelete} />

        <AnimatePresence>
          {fileUploaded && (
            <motion.div
              className="notification"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              File uploaded successfully! Visualizing now...
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <Footer />
    </div>
  );
};

export default UserHomePage;
