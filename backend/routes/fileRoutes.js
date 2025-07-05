const express = require('express');
const router = express.Router();
const multer = require('multer');

const { uploadFile, getFileById } = require('../controllers/fileController');
const { getHistory } = require('../controllers/historyController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Multer setup to read file buffer directly
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Routes

// Upload a file (User must be authenticated)
router.post('/upload', authMiddleware, upload.single('file'), uploadFile);

// Get file upload/download history for the authenticated user
router.get('/history', authMiddleware, getHistory);

// Get a specific file by ID
router.get('/:id', authMiddleware, getFileById);

module.exports = router;
