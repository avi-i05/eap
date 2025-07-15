const FileUpload = require("../models/FileUpload");
const XLSX = require("xlsx");

exports.downloadUserFile = async (req, res) => {
  try {
    const fileId = req.params.id;
    const userId = req.user.id;

    const file = await FileUpload.findById(fileId);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    if (file.owner.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to download this file" });
    }

    const ws = XLSX.utils.json_to_sheet(file.data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${file.fileName}`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  } catch (error) {
    console.error("Download Error:", error);
    res.status(500).json({ message: "Error downloading file" });
  }
};

exports.getUserFiles = async (req, res) => {
  try {
    const userId = req.user.id;
    const files = await FileUpload.find({ owner: userId }).sort({
      createdAt: -1,
    });
    res.status(200).json({ files });
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ message: "Error fetching files" });
  }
};

exports.deleteUserFile = async (req, res) => {
  try {
    const fileId = req.params.id;
    const userId = req.user.id;

    const file = await FileUpload.findById(fileId);
    if (!file) return res.status(404).json({ message: "File not found" });

    if (file.owner.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this file" });
    }

    await FileUpload.findByIdAndDelete(fileId);
    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ message: "Error deleting file" });
  }
};
