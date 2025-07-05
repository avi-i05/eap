const User = require('../models/User');
const FileUpload = require('../models/FileUpload');

// Get All Users
exports.getAllUsers = async (req, res) => {
    try {
        console.log('Admin Request by:', req.user); // ✅ Debug: See who is making the request
        const users = await User.find().select('-password');
res.status(200).json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
};

// Get All Files (Populating owner for file display)
exports.getAllFiles = async (req, res) => {
    try {
        console.log('Admin Request by:', req.user); // ✅ Debug: See who is making the request
        const files = await FileUpload.find()
            .sort({ createdAt: -1 })
            .populate('owner', 'username email'); // Populate owner info

            res.status(200).json({ files });
        } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({ message: 'Error fetching files' });
    }
};
