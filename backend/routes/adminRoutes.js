const express = require('express');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');
const { getAllUsers, getAllFiles } = require('../controllers/adminController');
const { getFileById } = require('../controllers/fileController');
const { deleteFile } = require('../controllers/fileController');


const router = express.Router();

router.get('/users', authMiddleware, adminMiddleware, getAllUsers);
router.get('/files', authMiddleware, adminMiddleware, getAllFiles);

router.get('/files/:id', authMiddleware, adminMiddleware, getFileById);
router.delete('/files/:id', authMiddleware, adminMiddleware, deleteFile);


module.exports = router;
