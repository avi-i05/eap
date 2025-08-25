const User = require("../models/User");
const Chart = require("../models/Chart");
const logAction = require("../utils/logAction");

// Save a new chart
exports.saveChart = async (req, res) => {
  try {
    const { title, chartType, chartData, chartOptions, description, tags, isPublic } = req.body;
    const userId = req.user.id;

    if (!title || !chartType || !chartData) {
      return res.status(400).json({ 
        message: 'Missing required fields: title, chartType, and chartData are required' 
      });
    }

    const newChart = new Chart({
      owner: userId,
      title,
      chartType,
      chartData,
      chartOptions,
      description: description || `Saved ${chartType} chart`,
      tags: tags || [chartType, 'saved'],
      isPublic: isPublic || false,
      chartSource: 'saved',
      sourceFile: null,
      metadata: {
        originalFileName: chartOptions?.fileName || '',
        dataPoints: chartData?.datasets?.[0]?.data?.length || 0,
        chartDimensions: {
          width: 800,
          height: 400
        }
      }
    });

    await newChart.save();
    
    try {
      await logAction(userId, req.user.username, `Saved chart: ${title}`);
    } catch (logError) {
      console.error('Log action failed, but chart was saved:', logError.message);
    }

    res.status(201).json({
      message: 'Chart saved successfully',
      chart: newChart
    });
  } catch (error) {
    console.error('Save Chart Error:', error.message);
    res.status(500).json({ 
      message: 'Error saving chart',
      error: error.message 
    });
  }
};

// Track chart generation
exports.trackChartGeneration = async (req, res) => {
  try {
    const { chartType, chartData, chartOptions, sourceFile } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!chartType || !chartData) {
      return res.status(400).json({ 
        message: 'Missing required fields: chartType and chartData are required' 
      });
    }

    // Handle sourceFile - since it's coming as a number from frontend, set to null
    const validSourceFile = null;

    // Create a default title for generated charts
    const title = `Generated ${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart - ${new Date().toLocaleDateString()}`;

    const newChart = new Chart({
      owner: userId,
      title,
      chartType,
      chartData,
      chartOptions,
      description: `Auto-generated ${chartType} chart from ${chartOptions?.fileName || 'data'}`,
      tags: ['generated', chartType],
      isPublic: false,
      chartSource: 'generated',
      sourceFile: validSourceFile,
      metadata: {
        originalFileName: chartOptions?.fileName || '',
        dataPoints: chartData?.datasets?.[0]?.data?.length || 0,
        chartDimensions: {
          width: 800,
          height: 400
        }
      }
    });

    await newChart.save();
    
    try {
      await logAction(userId, req.user.username, `Generated chart: ${title}`);
    } catch (logError) {
      console.error('Log action failed, but chart was saved:', logError.message);
    }

    res.status(201).json({
      message: 'Chart generation tracked successfully',
      chart: newChart
    });
  } catch (error) {
    console.error('Track Chart Generation Error:', error.message);
    res.status(500).json({ 
      message: 'Error tracking chart generation',
      error: error.message 
    });
  }
};

// Track chart download
exports.trackChartDownload = async (req, res) => {
  try {
    const { chartId } = req.params;
    const userId = req.user.id;

    const chart = await Chart.findById(chartId);
    if (!chart) {
      return res.status(404).json({ message: 'Chart not found' });
    }

    // Check if user owns the chart or is admin
    if (chart.owner.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Increment download count
    chart.downloadCount = (chart.downloadCount || 0) + 1;
    await chart.save();

    try {
      await logAction(userId, req.user.username, `Downloaded chart: ${chart.title}`);
    } catch (logError) {
      console.error('Log action failed, but download was tracked:', logError.message);
    }

    res.status(200).json({
      message: 'Download tracked successfully',
      downloadCount: chart.downloadCount
    });
  } catch (error) {
    console.error('Track Download Error:', error.message);
    res.status(500).json({ 
      message: 'Error tracking download',
      error: error.message 
    });
  }
};

// Create downloaded chart record
exports.createDownloadedChart = async (req, res) => {
  try {
    const { title, chartType, chartData, chartOptions, sourceFile } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!chartType || !chartData) {
      return res.status(400).json({ 
        message: 'Missing required fields: chartType and chartData are required' 
      });
    }

    // Handle sourceFile - since it's coming as a number from frontend, set to null
    const validSourceFile = null;

    const newChart = new Chart({
      owner: userId,
      title: title || `Downloaded ${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`,
      chartType,
      chartData,
      chartOptions,
      description: `Downloaded ${chartType} chart from ${chartOptions?.fileName || 'data'}`,
      tags: ['downloaded', chartType],
      isPublic: false,
      chartSource: 'downloaded',
      sourceFile: validSourceFile,
      downloadCount: 1,
      metadata: {
        originalFileName: chartOptions?.fileName || '',
        dataPoints: chartData?.datasets?.[0]?.data?.length || 0,
        chartDimensions: {
          width: 800,
          height: 400
        }
      }
    });

    await newChart.save();
    
    try {
      await logAction(userId, req.user.username, `Downloaded chart: ${newChart.title}`);
    } catch (logError) {
      console.error('Log action failed, but chart was saved:', logError.message);
    }

    res.status(201).json({
      message: 'Downloaded chart recorded successfully',
      chart: newChart
    });
  } catch (error) {
    console.error('Create Downloaded Chart Error:', error.message);
    res.status(500).json({ 
      message: 'Error recording downloaded chart',
      error: error.message 
    });
  }
};

// Get user's charts
exports.getUserCharts = async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    let charts;
    
    if (isAdmin) {
      // Admins get all charts with full details
      charts = await Chart.find({})
        .populate('owner', 'username email')
        .populate('sourceFile', 'fileName originalName createdAt')
        .sort({ createdAt: -1 });
    } else {
      // Regular users get only saved charts
      charts = await Chart.find({ 
        owner: userId,
        chartSource: 'saved'
      })
        .select('title chartType description isPublic createdAt chartData chartOptions chartSource')
        .sort({ createdAt: -1 });
    }

    console.log(`Found ${charts.length} charts for user ${userId} (admin: ${isAdmin})`);
    
    res.status(200).json({ charts });
  } catch (error) {
    console.error('Get User Charts Error:', error.message);
    res.status(500).json({ message: 'Error fetching charts' });
  }
};

// Get a specific chart
exports.getChart = async (req, res) => {
  try {
    const chartId = req.params.id;
    const userId = req.user.id;

    const chart = await Chart.findById(chartId);
    
    if (!chart) {
      return res.status(404).json({ message: 'Chart not found' });
    }

    // Check if user owns the chart or if it's public
    if (chart.owner.toString() !== userId && !chart.isPublic) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json({ chart });
  } catch (error) {
    console.error('Get Chart Error:', error.message);
    res.status(500).json({ message: 'Error fetching chart' });
  }
};

// Update a chart
exports.updateChart = async (req, res) => {
  try {
    const chartId = req.params.id;
    const userId = req.user.id;
    const updateData = req.body;

    const chart = await Chart.findById(chartId);
    
    if (!chart) {
      return res.status(404).json({ message: 'Chart not found' });
    }

    if (chart.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedChart = await Chart.findByIdAndUpdate(
      chartId,
      updateData,
      { new: true }
    );

    await logAction(userId, req.user.username, `Updated chart: ${updatedChart.title}`);

    res.status(200).json({
      message: 'Chart updated successfully',
      chart: updatedChart
    });
  } catch (error) {
    console.error('Update Chart Error:', error.message);
    res.status(500).json({ message: 'Error updating chart' });
  }
};

// Delete a chart
exports.deleteChart = async (req, res) => {
  try {
    const chartId = req.params.id;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const chart = await Chart.findById(chartId);
    
    if (!chart) {
      return res.status(404).json({ message: 'Chart not found' });
    }

    // Check permissions: admins can delete any chart, users can only delete their own
    if (!isAdmin && chart.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied. You can only delete your own charts.' });
    }

    // Log the deletion action with appropriate message
    const logMessage = isAdmin 
      ? `Admin deleted chart: ${chart.title} (owned by: ${chart.owner})`
      : `Deleted chart: ${chart.title}`;

    await Chart.findByIdAndDelete(chartId);
    await logAction(userId, req.user.username, logMessage);

    res.status(200).json({ 
      message: 'Chart deleted successfully',
      deletedBy: isAdmin ? 'admin' : 'owner'
    });
  } catch (error) {
    console.error('Delete Chart Error:', error.message);
    res.status(500).json({ message: 'Error deleting chart' });
  }
};

// Simple chart counting endpoint
exports.getChartCounts = async (req, res) => {
  try {
    console.log('Getting chart counts...');
    
    // Direct database queries for accurate counts
    const totalCharts = await Chart.countDocuments();
    const generatedCharts = await Chart.countDocuments({ chartSource: 'generated' });
    const savedCharts = await Chart.countDocuments({ chartSource: 'saved' });
    const downloadedCharts = await Chart.countDocuments({ chartSource: 'downloaded' });
    const publicCharts = await Chart.countDocuments({ isPublic: true });
    const privateCharts = await Chart.countDocuments({ isPublic: false });
    
    // Get unique users count
    const uniqueUsers = await Chart.distinct('owner').length;
    
    // Get recent charts (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentCharts = await Chart.countDocuments({ createdAt: { $gt: sevenDaysAgo } });
    
    // Get charts without chartSource
    const chartsWithoutSource = await Chart.countDocuments({
      $or: [
        { chartSource: { $exists: false } },
        { chartSource: null },
        { chartSource: "" }
      ]
    });
    
    console.log('Direct database counts:', {
      totalCharts,
      generatedCharts,
      savedCharts,
      downloadedCharts,
      publicCharts,
      privateCharts,
      uniqueUsers,
      recentCharts,
      chartsWithoutSource
    });
    
    const statistics = {
      totalCharts,
      generatedCharts,
      savedCharts,
      downloadedCharts,
      publicCharts,
      privateCharts,
      uniqueUsers,
      recentCharts,
      chartsWithoutSource
    };
    
    res.status(200).json({ statistics });
  } catch (error) {
    console.error('Error getting chart counts:', error);
    res.status(500).json({ message: 'Error getting chart counts', error: error.message });
  }
};

// Get all charts (for admin)
exports.getAllCharts = async (req, res) => {
  try {
    const charts = await Chart.find()
      .sort({ createdAt: -1 })
      .populate("owner", "username email")
      .populate("sourceFile", "fileName originalName createdAt");
    
    // Get chart statistics
    const totalCharts = charts.length;
    const generatedCharts = charts.filter(chart => chart.chartSource === 'generated').length;
    const savedCharts = charts.filter(chart => chart.chartSource === 'saved').length;
    const downloadedCharts = charts.filter(chart => chart.chartSource === 'downloaded').length;
    const publicCharts = charts.filter(chart => chart.isPublic).length;
    const privateCharts = charts.filter(chart => !chart.isPublic).length;
    const uniqueUsers = new Set(charts.map(chart => chart.owner._id.toString())).size;
    
    // Get recent chart activities (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentCharts = charts.filter(chart => new Date(chart.createdAt) > sevenDaysAgo).length;

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

// Get public charts
exports.getPublicCharts = async (req, res) => {
  try {
    const charts = await Chart.find({ isPublic: true })
      .populate('owner', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json({ charts });
  } catch (error) {
    console.error('Get Public Charts Error:', error.message);
    res.status(500).json({ message: 'Error fetching public charts' });
  }
};

// Download a single chart as image
exports.downloadChart = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const chart = await Chart.findById(id);
    if (!chart) {
      return res.status(404).json({ message: 'Chart not found' });
    }

    // Check if user owns the chart or is admin
    if (chart.owner.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Increment download count
    chart.downloadCount = (chart.downloadCount || 0) + 1;
    await chart.save();

    // For now, return chart data as JSON
    // In a real implementation, you would generate an image
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${chart.title || 'chart'}.json"`);
    res.json(chart);

  } catch (error) {
    console.error('Download Chart Error:', error.message);
    res.status(500).json({ message: 'Error downloading chart' });
  }
};

// Download all charts as zip
exports.downloadAllCharts = async (req, res) => {
  try {
    const userId = req.user.id;

    let charts;
    if (req.user.isAdmin) {
      // Admin can download all charts
      charts = await Chart.find().populate('owner', 'username');
    } else {
      // User can only download their own charts
      charts = await Chart.find({ owner: userId });
    }

    if (charts.length === 0) {
      return res.status(404).json({ message: 'No charts found' });
    }

    // For now, return charts data as JSON
    // In a real implementation, you would create a zip file
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="all-charts.json"');
    res.json(charts);

  } catch (error) {
    console.error('Download All Charts Error:', error.message);
    res.status(500).json({ message: 'Error downloading all charts' });
  }
}; 