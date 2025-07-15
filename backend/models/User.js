const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },

    isBlocked: { type: Boolean, default: false },
    googleId: { type: String },
    githubId: { type: String }
    
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
