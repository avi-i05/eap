const FileUpload = require("../models/FileUpload");

exports.getHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const total = await FileUpload.countDocuments({ owner: req.user.id });
    const files = await FileUpload.find({ owner: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      files,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    });
  } catch (error) {
    console.error("Fetch History Error:", error);
    res.status(500).json({ message: "Error fetching upload history" });
  }
};
