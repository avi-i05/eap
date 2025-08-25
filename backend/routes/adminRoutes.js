const express = require("express");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middlewares/authMiddleware");
const {
  getAllUsers,
  getAllFiles,
  getAllCharts,
  getUserLogs,
  toggleBlockUser,
  deleteUserData,
  downloadAdminFile,
  createSampleCharts,
} = require("../controllers/adminController");
const { getFileById, deleteFile } = require("../controllers/fileController");

const router = express.Router();

router.get("/users", authMiddleware, adminMiddleware, getAllUsers);
router.get("/files", authMiddleware, adminMiddleware, getAllFiles);
router.get("/files/:id", authMiddleware, adminMiddleware, getFileById);
router.get("/files/:id/download", authMiddleware, adminMiddleware, downloadAdminFile);
router.delete("/files/:id", authMiddleware, adminMiddleware, deleteFile);
router.get("/charts", authMiddleware, adminMiddleware, getAllCharts);
router.post("/charts/sample", authMiddleware, adminMiddleware, createSampleCharts);
router.get("/logs", authMiddleware, adminMiddleware, getUserLogs);
router.patch(
  "/users/:id/block",
  authMiddleware,
  adminMiddleware,
  toggleBlockUser
);
router.delete("/users/:id", authMiddleware, adminMiddleware, deleteUserData);

module.exports = router;
