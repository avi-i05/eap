const User = require("../models/User");
const FileUpload = require("../models/FileUpload");
const Log = require("../models/Log");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

const getAllFiles = async (req, res) => {
  try {
    const files = await FileUpload.find()
      .sort({ createdAt: -1 })
      .populate("owner", "username email");
    res.status(200).json({ files });
  } catch (error) {
    res.status(500).json({ message: "Error fetching files" });
  }
};

const getUserLogs = async (req, res) => {
  try {
    const logs = await Log.find().sort({ createdAt: -1 }).limit(100);
    res.status(200).json({ logs });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch logs" });
  }
};

const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBlocked = !user.isBlocked;
    await user.save();

    res
      .status(200)
      .json({
        message: `User ${user.isBlocked ? "blocked" : "unblocked"}`,
        user,
      });
  } catch (err) {
    res.status(500).json({ message: "Failed to toggle block", error: err });
  }
};

const deleteUserData = async (req, res) => {
  try {
    const userId = req.params.id;

    await FileUpload.deleteMany({ owner: userId });
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "User and their data deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user", error: err });
  }
};

module.exports = {
  getAllUsers,
  getAllFiles,
  getUserLogs,
  toggleBlockUser,
  deleteUserData,
};
