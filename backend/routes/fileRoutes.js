const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadFile, getFileById } = require("../controllers/fileController");
const { getHistory } = require("../controllers/historyController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    // Allow both .xls and .xlsx files
    if (file.mimetype === 'application/vnd.ms-excel' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.originalname.endsWith('.xls') ||
        file.originalname.endsWith('.xlsx')) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xls, .xlsx) are allowed'), false);
    }
  }
});

router.post("/upload", authMiddleware, upload.single("file"), (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: "File upload error" });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
}, uploadFile);

router.get("/history", authMiddleware, getHistory);

router.get("/:id", authMiddleware, getFileById);

module.exports = router;
