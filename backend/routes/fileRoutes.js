const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadFile, getFileById } = require("../controllers/fileController");
const { getHistory } = require("../controllers/historyController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload", authMiddleware, upload.single("file"), uploadFile);

router.get("/history", authMiddleware, getHistory);

router.get("/:id", authMiddleware, getFileById);

module.exports = router;
