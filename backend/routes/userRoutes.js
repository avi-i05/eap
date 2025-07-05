const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const { getUserFiles, deleteUserFile, downloadUserFile } = require('../controllers/userController');

// Get all files for the logged-in user
router.get('/files', authMiddleware, getUserFiles);

// Delete user file
router.delete('/files/:id', authMiddleware, deleteUserFile);
router.get('/download/:id', authMiddleware, downloadUserFile);


module.exports = router;
