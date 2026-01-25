import User from '../models/User.js';
import Youth from '../models/Youth.js';
import Parent from '../models/Parent.js';
import Coach from '../models/Coach.js';
import Clinician from '../models/Clinician.js';
import { sendTokenResponse } from '../utils/validators.js';
import { sendSuccess, sendError } from '../utils/errorResponse.js';

// Register user
export const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role, dateOfBirth, phoneNumber, location } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return sendError(res, 400, 'User already exists with that email');
    }

    // Create user
    user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
      dateOfBirth,
      phoneNumber,
      location
    });

    // Create role-specific profile
    if (role === 'youth') {
      await Youth.create({ userId: user._id });
    } else if (role === 'parent') {
      await Parent.create({ userId: user._id, relationship: 'parent' });
    } else if (role === 'coach') {
      await Coach.create({ userId: user._id });
    } else if (role === 'clinician') {
      await Clinician.create({ userId: user._id, licenseNumber: '' });
    }

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// Login user
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check email & password
    if (!email || !password) {
      return sendError(res, 400, 'Please provide email and password');
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return sendError(res, 401, 'Invalid credentials');
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid credentials');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Logout user
export const logout = async (req, res, next) => {
  try {
    res.clearCookie('token');
    sendSuccess(res, 200, 'Logged out successfully', null);
  } catch (error) {
    next(error);
  }
};

// Get current user
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    let roleProfile = null;
    if (user.role === 'youth') {
      roleProfile = await Youth.findOne({ userId: user._id }).populate('parentId coachId clinicianId');
    } else if (user.role === 'parent') {
      roleProfile = await Parent.findOne({ userId: user._id }).populate('guardedYouth');
    } else if (user.role === 'coach') {
      roleProfile = await Coach.findOne({ userId: user._id }).populate('assignedYouth');
    } else if (user.role === 'clinician') {
      roleProfile = await Clinician.findOne({ userId: user._id });
    }

    sendSuccess(res, 200, 'User retrieved successfully', {
      user: user.toJSON(),
      roleProfile
    });
  } catch (error) {
    next(error);
  }
};

// Refresh token
export const refreshToken = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Forgot password (placeholder)
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // TODO: Send password reset email
    sendSuccess(res, 200, 'Password reset email sent', null);
  } catch (error) {
    next(error);
  }
};

// Reset password (placeholder)
export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    // TODO: Verify token and update password
    sendSuccess(res, 200, 'Password reset successfully', null);
  } catch (error) {
    next(error);
  }
};
