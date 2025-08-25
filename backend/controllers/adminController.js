const User = require("../models/User");
const FileUpload = require("../models/FileUpload");
const Log = require("../models/Log");
const Chart = require("../models/Chart");
const XLSX = require("xlsx");

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

const getAllCharts = async (req, res) => {
  try {
    console.log('Admin requesting all charts...');
    
    const charts = await Chart.find()
      .sort({ createdAt: -1 })
      .populate("owner", "username email")
      .populate("sourceFile", "fileName originalName createdAt");
    
    console.log(`Found ${charts.length} total charts`);
    
    // Get chart statistics
    const totalCharts = charts.length;
    const generatedCharts = charts.filter(chart => chart.chartSource === 'generated').length;
    const savedCharts = charts.filter(chart => chart.chartSource === 'saved').length;
    const downloadedCharts = charts.filter(chart => chart.chartSource === 'downloaded').length;
    const publicCharts = charts.filter(chart => chart.isPublic).length;
    const privateCharts = charts.filter(chart => !chart.isPublic).length;
    const uniqueUsers = new Set(charts.map(chart => chart.owner._id.toString())).size;
    
    // Get recent chart activities (last month)
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const recentCharts = charts.filter(chart => new Date(chart.createdAt) > oneMonthAgo).length;

    console.log('Chart statistics:', {
      totalCharts,
      generatedCharts,
      savedCharts,
      downloadedCharts,
      publicCharts,
      privateCharts,
      uniqueUsers,
      recentCharts
    });

    // Log some sample chart data for debugging
    if (charts.length > 0) {
      console.log('Sample chart data:', {
        firstChart: {
          id: charts[0]._id,
          title: charts[0].title,
          chartSource: charts[0].chartSource,
          owner: charts[0].owner?.username,
          createdAt: charts[0].createdAt
        }
      });
    }

    const statistics = {
      totalCharts,
      generatedCharts,
      savedCharts,
      downloadedCharts,
      publicCharts,
      privateCharts,
      uniqueUsers,
      recentCharts
    };

    res.status(200).json({ 
      charts,
      statistics
    });
  } catch (error) {
    console.error("Error fetching charts:", error);
    res.status(500).json({ message: "Error fetching charts" });
  }
};

const getUserLogs = async (req, res) => {
  try {
    // Calculate date for 1 month ago
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    console.log('Fetching logs from:', oneMonthAgo.toISOString());

    // Filter logs for all authentication actions (login, register, signup, etc.) from the last month
    const logs = await Log.find({
      action: { 
        $regex: /(login|register|signup|signin|signout|logout|auth|github|google|password|registration)/i 
      }, // Case-insensitive search for all auth-related actions
      timestamp: { $gte: oneMonthAgo }
    })
      .sort({ timestamp: -1 })
      .limit(500); // Increased limit for 1 month of data
    
    console.log('Found logs:', logs.length);
    console.log('Sample log actions:', logs.slice(0, 5).map(log => log.action));
    
    res.status(200).json({ logs });
  } catch (error) {
    console.error('Error fetching logs:', error);
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

const downloadAdminFile = async (req, res) => {
  try {
    const fileId = req.params.id;
    const file = await FileUpload.findById(fileId);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Determine the original file format from the filename
    const fileExtension = file.fileName.split('.').pop().toLowerCase();
    const isXLS = fileExtension === 'xls';
    
    const ws = XLSX.utils.json_to_sheet(file.data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    // Use the appropriate format based on original file extension
    const buffer = XLSX.write(wb, { 
      bookType: isXLS ? "xls" : "xlsx", 
      type: "buffer" 
    });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${encodeURIComponent(file.fileName)}`
    );
    const contentType = isXLS
      ? "application/vnd.ms-excel"
      : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    res.setHeader("Content-Type", contentType);
    res.send(buffer);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ message: "Error downloading file" });
  }
};

// Test function to create sample charts (for development/testing only)
const createSampleCharts = async (req, res) => {
  try {
    console.log('Creating sample charts for testing...');
    
    // Get a sample user
    const sampleUser = await User.findOne();
    if (!sampleUser) {
      return res.status(404).json({ message: "No users found" });
    }

    // Get a sample file
    const sampleFile = await FileUpload.findOne();
    
    const sampleCharts = [
      {
        owner: sampleUser._id,
        title: "Sample Generated Bar Chart",
        chartType: "bar",
        chartData: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May"],
          datasets: [{
            label: "Sales",
            data: [12, 19, 3, 5, 2],
            backgroundColor: "#4361ee"
          }]
        },
        chartOptions: { color: "#4361ee" },
        description: "Sample generated chart for testing",
        tags: ["generated", "bar", "sample"],
        isPublic: false,
        chartSource: "generated",
        sourceFile: sampleFile?._id || null,
        metadata: {
          originalFileName: sampleFile?.fileName || "sample.xlsx",
          dataPoints: 5,
          chartDimensions: { width: 800, height: 400 }
        }
      },
      {
        owner: sampleUser._id,
        title: "Sample Saved Line Chart",
        chartType: "line",
        chartData: {
          labels: ["Q1", "Q2", "Q3", "Q4"],
          datasets: [{
            label: "Revenue",
            data: [65, 59, 80, 81],
            backgroundColor: "#28a745"
          }]
        },
        chartOptions: { color: "#28a745" },
        description: "Sample saved chart for testing",
        tags: ["saved", "line", "sample"],
        isPublic: true,
        chartSource: "saved",
        sourceFile: sampleFile?._id || null,
        metadata: {
          originalFileName: sampleFile?.fileName || "sample.xlsx",
          dataPoints: 4,
          chartDimensions: { width: 800, height: 400 }
        }
      },
      {
        owner: sampleUser._id,
        title: "Sample Downloaded Pie Chart",
        chartType: "pie",
        chartData: {
          labels: ["Red", "Blue", "Yellow", "Green"],
          datasets: [{
            label: "Colors",
            data: [12, 19, 3, 5],
            backgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "#4bc0c0"]
          }]
        },
        chartOptions: { color: "#ffc107" },
        description: "Sample downloaded chart for testing",
        tags: ["downloaded", "pie", "sample"],
        isPublic: false,
        chartSource: "downloaded",
        sourceFile: sampleFile?._id || null,
        downloadCount: 3,
        metadata: {
          originalFileName: sampleFile?.fileName || "sample.xlsx",
          dataPoints: 4,
          chartDimensions: { width: 800, height: 400 }
        }
      }
    ];

    const createdCharts = [];
    for (const chartData of sampleCharts) {
      const newChart = new Chart(chartData);
      await newChart.save();
      createdCharts.push(newChart);
      console.log(`Created sample chart: ${newChart.title} (${newChart.chartSource})`);
    }

    res.status(201).json({
      message: "Sample charts created successfully",
      charts: createdCharts
    });
  } catch (error) {
    console.error("Error creating sample charts:", error);
    res.status(500).json({ message: "Error creating sample charts" });
  }
};

module.exports = {
  getAllUsers,
  getAllFiles,
  getAllCharts,
  getUserLogs,
  toggleBlockUser,
  deleteUserData,
  downloadAdminFile,
  createSampleCharts,
};
