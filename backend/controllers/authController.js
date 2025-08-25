const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const logAction = require("../utils/logAction");

exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role || 'user'
    });

    await newUser.save();

    // Try to log the action, but don't fail registration if logging fails
    try {
      await logAction(newUser._id, newUser.username, "Registered");
    } catch (logError) {
      console.error('Failed to log registration action:', logError.message);
      // Continue with registration even if logging fails
    }

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    console.log('Login attempt received:', { email: req.body.email, hasPassword: !!req.body.password });
    
    const { email, password } = req.body;

    // Check if JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    console.log('JWT_SECRET is set, proceeding with login...');

    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found:', { userId: user._id, username: user.username, isBlocked: user.isBlocked });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for user:', user._id);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    if (user.isBlocked) {
      console.log('User is blocked:', user._id);
      return res.status(403).json({ message: "Your account has been blocked by the admin." });
    }

    console.log('Password verified, creating token...');

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    console.log('Token created successfully');

    // Try to log the action, but don't fail login if logging fails
    try {
      await logAction(user._id, user.username, "Logged in");
      console.log('Login action logged successfully');
    } catch (logError) {
      console.error('Failed to log login action:', logError.message);
      // Continue with login even if logging fails
    }

    console.log('Sending successful login response');

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found with this email" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Support" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <h3>Password Reset</h3>
        <p>Click the link below to reset your password. This link expires in 15 minutes:</p>
        <a href="${resetLink}">${resetLink}</a>
      `,
    });

    // Try to log the action, but don't fail if logging fails
    try {
      await logAction(user._id, user.username, "Requested password reset");
    } catch (logError) {
      console.error('Failed to log password reset request:', logError.message);
    }

    res.status(200).json({ message: "Reset link sent to your email" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });

    const user = await User.findById(decoded.id);
    if (user) {
      // Try to log the action, but don't fail if logging fails
      try {
        await logAction(user._id, user.username, "Password reset successful");
      } catch (logError) {
        console.error('Failed to log password reset:', logError.message);
      }
    }

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired reset link" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    console.log('Change password request received:', { 
      userId: req.user?.id, 
      hasCurrentPassword: !!req.body.currentPassword,
      hasNewPassword: !!req.body.newPassword 
    });

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: "User not found" });
    }

    console.log('User found:', { userId: user._id, username: user.username });

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      console.log('Password mismatch for user:', userId);
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    console.log('Password verified successfully');

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    // Try to log the action, but don't fail if logging fails
    try {
      await logAction(user._id, user.username, "Password changed successfully");
    } catch (logError) {
      console.error('Failed to log password change:', logError.message);
    }

    console.log('Password changed successfully for user:', userId);
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error('Change Password Error:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        joinDate: user.createdAt,
        isBlocked: user.isBlocked
      }
    });
  } catch (error) {
    console.error('Get User Profile Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email } = req.body;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: "Email is already taken" });
      }
    }

    // Check if username is already taken by another user
    if (username) {
      const existingUser = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: "Username is already taken" });
      }
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;

    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      updateData, 
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Try to log the action, but don't fail if logging fails
    try {
      await logAction(updatedUser._id, updatedUser.username, "Profile updated");
    } catch (logError) {
      console.error('Failed to log profile update:', logError.message);
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        joinDate: updatedUser.createdAt,
        isBlocked: updatedUser.isBlocked
      }
    });
  } catch (error) {
    console.error('Update User Profile Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required to delete account" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify password before deletion
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password is incorrect" });
    }

    // Delete user account
    await User.findByIdAndDelete(userId);

    // Try to log the action, but don't fail if logging fails
    try {
      await logAction(user._id, user.username, "Account deleted");
    } catch (logError) {
      console.error('Failed to log account deletion:', logError.message);
    }

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error('Delete User Account Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
