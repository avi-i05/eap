const FileUpload = require("../models/FileUpload");
const XLSX = require("xlsx");

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!jsonData.length)
      return res
        .status(400)
        .json({ message: "Uploaded file is empty or invalid" });

    const newFile = new FileUpload({
      owner: req.user._id,

      fileName: req.file.originalname,

      data: jsonData,
    });

    await newFile.save();

    res
      .status(201)
      .json({ message: "File uploaded successfully", file: newFile });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: "Error uploading file" });
  }
};

exports.getFileById = async (req, res) => {
  try {
    const file = await FileUpload.findById(req.params.id).populate(
      "owner",
      "username email"
    );

    if (!file) return res.status(404).json({ message: "File not found" });

    res.status(200).json(file);
  } catch (error) {
    console.error("Fetch File Error:", error.message);
    res.status(500).json({ message: "Error fetching file" });
  }
};
exports.deleteFile = async (req, res) => {
  try {
    const file = await FileUpload.findByIdAndDelete(req.params.id);
    if (!file) return res.status(404).json({ message: "File not found" });
    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete File Error:", error);
    res.status(500).json({ message: "File deletion failed" });
  }
};
