import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import DataVisualizer from '../visualizations/DataVisualization';
import './History.css';
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const History = () => {
    const [files, setFiles] = useState([]);
    const [selectedFileId, setSelectedFileId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async (page = 1) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${BASE_URL}/api/files/history?page=${page}&limit=5`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setFiles(data.files);
            setCurrentPage(data.currentPage);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handlePageChange = (page) => {
        if (page !== currentPage) {
            fetchHistory(page);
        }
    };

    return (
        <div className="history-container">
            <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="history-title"
            >
                Upload History
            </motion.h2>

            {loading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                </div>
            ) : (
                <>
                    <motion.ul
                        className="history-list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        {files.length > 0 ? (
                            files.map((file, index) => (
                                <motion.li
                                    key={file._id}
                                    className="history-item"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <span className="file-name">{file.fileName}</span>
                                    <button
                                        className="visualize-btn"
                                        onClick={() => setSelectedFileId(file._id)}
                                    >
                                        Visualize
                                    </button>
                                </motion.li>
                            ))
                        ) : (
                            <li className="no-files">No upload history found.</li>
                        )}
                    </motion.ul>

                    {totalPages > 1 && (
                        <div className="pagination-container">
                            {Array.from({ length: totalPages }, (_, index) => (
                                <motion.button
                                    key={index + 1}
                                    onClick={() => handlePageChange(index + 1)}
                                    className={`pagination-btn ${currentPage === index + 1 ? 'active' : ''}`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {index + 1}
                                </motion.button>
                            ))}
                        </div>
                    )}

                    {selectedFileId && (
                        <div className="visualizer-container">
                            <DataVisualizer fileId={selectedFileId} />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default History;
