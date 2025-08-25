const express = require('express');
const router = express.Router();
const {
  saveChart,
  trackChartGeneration,
  trackChartDownload,
  createDownloadedChart,
  getUserCharts,
  getChart,
  updateChart,
  deleteChart,
  getAllCharts,
  getPublicCharts,
  downloadChart,
  downloadAllCharts
} = require('../controllers/chartController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

// User routes (require authentication)
router.post('/save', authMiddleware, saveChart);
router.post('/track-generation', authMiddleware, trackChartGeneration);
router.post('/track-download/:chartId', authMiddleware, trackChartDownload);
router.post('/create-downloaded', authMiddleware, createDownloadedChart);
router.get('/user', authMiddleware, getUserCharts);
router.get('/user/:id', authMiddleware, getChart);
router.put('/user/:id', authMiddleware, updateChart);
router.delete('/user/:id', authMiddleware, deleteChart);
router.get('/:id/download', authMiddleware, downloadChart);
router.get('/download-all', authMiddleware, downloadAllCharts);

// Public routes
router.get('/public', getPublicCharts);

// Admin routes (require admin authentication)
router.get('/admin/all', authMiddleware, adminMiddleware, getAllCharts);
router.get('/admin/charts', authMiddleware, adminMiddleware, getAllCharts);
router.delete('/admin/:id', authMiddleware, adminMiddleware, deleteChart);

module.exports = router; 