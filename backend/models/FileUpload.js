const mongoose = require('mongoose');

const fileUploadSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fileName: { type: String, required: true },
    data: { type: Array, required: true }
}, { timestamps: true });

module.exports = mongoose.model('FileUpload', fileUploadSchema);
