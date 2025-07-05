const express = require('express');
const router = express.Router();

const { getHistory } = require('../controllers/historyController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// ✅ Get upload/download history for the authenticated user
router.get('/', authMiddleware, getHistory);

module.exports = router;
