const mongoose = require('mongoose');

const chartSchema = new mongoose.Schema({
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  chartType: { 
    type: String, 
    required: true,
    enum: ['bar', 'line', 'pie', 'doughnut', 'radar', 'scatter']
  },
  chartData: { 
    type: Object, 
    required: true 
  },
  chartOptions: { 
    type: Object, 
    default: {} 
  },
  description: { 
    type: String, 
    default: '' 
  },
  tags: [{ 
    type: String 
  }],
  isPublic: { 
    type: Boolean, 
    default: false 
  },
  thumbnail: { 
    type: String 
  },
  // New fields for chart source tracking
  chartSource: {
    type: String,
    enum: ['generated', 'saved', 'downloaded'],
    default: 'saved'
  },
  sourceFile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FileUpload'
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  metadata: {
    originalFileName: String,
    dataPoints: Number,
    chartDimensions: {
      width: Number,
      height: Number
    }
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Chart', chartSchema); 