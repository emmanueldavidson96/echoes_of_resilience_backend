import User from '../models/User.js';
import Youth from '../models/Youth.js';
import Coach from '../models/Coach.js';
import Clinician from '../models/Clinician.js';
import Parent from '../models/Parent.js';
import Journal from '../models/Journal.js';
import MoodEntry from '../models/MoodEntry.js';
import UserMissionProgress from '../models/UserMissionProgress.js';
import { sendSuccess, sendError } from '../utils/errorResponse.js';
import { getLevelFromXP } from '../utils/level.js';

// Get user profile
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // If user is youth, also return youth profile with points, level, badges, etc.
    if (user.role === 'youth') {
      const youth = await Youth.findOne({ userId: req.userId });
      if (youth) {
        // Recompute level based on current totalPoints
        const levelInfo = getLevelFromXP(youth.totalPoints);
        youth.level = levelInfo.level;
        await youth.save();

        return sendSuccess(res, 200, 'User profile retrieved successfully', {
          ...user.toJSON(),
          youth: {
            totalPoints: youth.totalPoints,
            level: youth.level,
            currentLevelXP: levelInfo.currentThreshold,
            nextLevelXP: levelInfo.nextThreshold,
            badges: youth.badges,
            completedMissions: youth.completedMissions,
            streaks: youth.streaks,
            lastMoodCheck: youth.lastMoodCheck,
            lastDailyRewardClaim: youth.lastDailyRewardClaim,
            lastMoodCheckDate: youth.lastMoodCheckDate,
            lastPHQ9SubmissionDate: youth.lastPHQ9SubmissionDate,
            lastGAD7SubmissionDate: youth.lastGAD7SubmissionDate,
            emergencyContacts: youth.emergencyContacts
          }
        });
      }
    }

    // If user is coach, return coach profile with assigned youth
    if (user.role === 'coach') {
      const coach = await Coach.findOne({ userId: req.userId }).populate({
        path: 'assignedYouth',
        select: '_id firstName lastName email avatar phoneNumber location'
      });
      
      if (coach) {
        // Get Youth profiles for assigned youth to include level, totalPoints, etc.
        const youthProfiles = await Youth.find({ userId: { $in: coach.assignedYouth.map(y => y._id) } });
        
        // Combine user data with youth profile data
        const assignedYouthWithStats = coach.assignedYouth.map(youthUser => {
          const youthProfile = youthProfiles.find(yp => yp.userId.toString() === youthUser._id.toString());
          return {
            userId: youthUser._id,
            firstName: youthUser.firstName,
            lastName: youthUser.lastName,
            email: youthUser.email,
            avatar: youthUser.avatar,
            phoneNumber: youthUser.phoneNumber,
            location: youthUser.location,
            totalPoints: youthProfile?.totalPoints || 0,
            level: youthProfile?.level || 1,
            completedMissions: youthProfile?.completedMissions?.length || 0,
            streaks: youthProfile?.streaks || { journal: 0, mood: 0, mission: 0 }
          };
        });

        return sendSuccess(res, 200, 'User profile retrieved successfully', {
          ...user.toJSON(),
          coach: {
            specialization: coach.specialization,
            credentials: coach.credentials,
            bio: coach.bio,
            yearsOfExperience: coach.yearsOfExperience,
            rating: coach.rating,
            assignedYouth: assignedYouthWithStats
          }
        });
      }
    }

    // If user is parent, return parent profile with guarded youth
    if (user.role === 'parent') {
      const parent = await Parent.findOne({ userId: req.userId }).populate({
        path: 'guardedYouth',
        select: '_id firstName lastName email phoneNumber location'
      });

      if (parent) {
        const youthProfiles = await Youth.find({ userId: { $in: parent.guardedYouth.map(y => y._id) } });

        const guardedYouthWithStats = await Promise.all(
          parent.guardedYouth.map(async (youthUser) => {
            const youthProfile = youthProfiles.find(yp => yp.userId.toString() === youthUser._id.toString());
            const journalsWritten = await Journal.countDocuments({ userId: youthUser._id });
            const moodsLogged = await MoodEntry.countDocuments({ userId: youthUser._id });

            return {
              userId: youthUser._id,
              firstName: youthUser.firstName,
              lastName: youthUser.lastName,
              email: youthUser.email,
              phoneNumber: youthUser.phoneNumber,
              location: youthUser.location,
              totalPoints: youthProfile?.totalPoints || 0,
              level: youthProfile?.level || 1,
              completedMissions: youthProfile?.completedMissions?.length || 0,
              streaks: youthProfile?.streaks || { journal: 0, mood: 0, mission: 0 },
              journalsWritten,
              moodsLogged
            };
          })
        );

        return sendSuccess(res, 200, 'User profile retrieved successfully', {
          ...user.toJSON(),
          parent: {
            relationship: parent.relationship,
            guardedYouth: guardedYouthWithStats
          }
        });
      }
    }

    sendSuccess(res, 200, 'User profile retrieved successfully', user.toJSON());
  } catch (error) {
    next(error);
  }
};

// Update user profile
export const updateUserProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phoneNumber, location, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { firstName, lastName, phoneNumber, location, avatar },
      { new: true, runValidators: true }
    );

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    sendSuccess(res, 200, 'User profile updated successfully', user.toJSON());
  } catch (error) {
    next(error);
  }
};

// Get user by ID
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    sendSuccess(res, 200, 'User retrieved successfully', user.toJSON());
  } catch (error) {
    next(error);
  }
};

// Get admin users list (coach/admin)
export const getAdminUsers = async (req, res, next) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-password');
    sendSuccess(res, 200, 'Admin users retrieved successfully', admins);
  } catch (error) {
    next(error);
  }
};

// Get coach profile details (admin)
export const getCoachProfileDetails = async (req, res, next) => {
  try {
    const { coachId } = req.params;

    const coach = await Coach.findById(coachId)
      .populate('userId', 'firstName lastName email phoneNumber createdAt')
      .populate('assignedYouth', 'firstName lastName email phoneNumber location');

    if (!coach) {
      return sendError(res, 404, 'Coach not found');
    }

    const youthProfiles = await Youth.find({ userId: { $in: coach.assignedYouth.map(y => y._id) } });

    const assignedYouthWithStats = coach.assignedYouth.map(youthUser => {
      const youthProfile = youthProfiles.find(yp => yp.userId.toString() === youthUser._id.toString());
      return {
        userId: youthUser._id,
        firstName: youthUser.firstName,
        lastName: youthUser.lastName,
        email: youthUser.email,
        phoneNumber: youthUser.phoneNumber,
        location: youthUser.location,
        totalPoints: youthProfile?.totalPoints || 0,
        level: youthProfile?.level || 1,
        completedMissions: youthProfile?.completedMissions?.length || 0,
        streaks: youthProfile?.streaks || { journal: 0, mood: 0, mission: 0 }
      };
    });

    sendSuccess(res, 200, 'Coach profile details retrieved successfully', {
      coach: {
        _id: coach._id,
        userId: coach.userId,
        specialization: coach.specialization,
        credentials: coach.credentials,
        bio: coach.bio,
        yearsOfExperience: coach.yearsOfExperience,
        rating: coach.rating,
        isActive: coach.isActive,
        assignedYouth: assignedYouthWithStats
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get youth profile details (admin/coach/clinician)
export const getYouthProfileDetails = async (req, res, next) => {
  try {
    const { youthId } = req.params;

    const user = await User.findById(youthId).select('-password');
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    const youth = await Youth.findOne({ userId: youthId });
    let parentUser = null;

    if (youth?.parentId) {
      parentUser = await User.findById(youth.parentId).select('firstName lastName email');
    }

    const journalsWritten = await Journal.countDocuments({ userId: youthId });
    const moodsLogged = await MoodEntry.countDocuments({ userId: youthId });

    const completedMissions = youth?.completedMissions?.length || 0;
    const levelInfo = getLevelFromXP(youth?.totalPoints || 0);

    sendSuccess(res, 200, 'Youth profile details retrieved successfully', {
      user: user.toJSON(),
      youth: youth
        ? {
            totalPoints: youth.totalPoints,
            level: youth.level || levelInfo.level,
            currentLevelXP: levelInfo.currentThreshold,
            nextLevelXP: levelInfo.nextThreshold,
            badges: youth.badges,
            streaks: youth.streaks,
          }
        : null,
      stats: {
        journalsWritten,
        moodsLogged,
        missionsCompleted: completedMissions,
      },
      parent: parentUser
        ? {
            _id: parentUser._id,
            firstName: parentUser.firstName,
            lastName: parentUser.lastName,
            email: parentUser.email
          }
        : null,
      parentId: youth?.parentId || null
    });
  } catch (error) {
    next(error);
  }
};

// Add youth to parent (admin only)
export const addYouthToParent = async (req, res, next) => {
  try {
    const { parentId } = req.params;
    const { youthId } = req.body;

    if (!youthId) {
      return sendError(res, 400, 'Youth ID is required');
    }

    const parent = await Parent.findById(parentId) || await Parent.findOne({ userId: parentId });
    if (!parent) {
      return sendError(res, 404, 'Parent not found');
    }

    const parentUser = await User.findById(parent.userId);
    if (!parentUser || parentUser.role !== 'parent') {
      return sendError(res, 404, 'Parent user not found');
    }

    const youthUser = await User.findById(youthId);
    if (!youthUser || youthUser.role !== 'youth') {
      return sendError(res, 404, 'Youth user not found');
    }

    const youthProfile = await Youth.findOne({ userId: youthId });
    if (!youthProfile) {
      return sendError(res, 404, 'Youth profile not found');
    }

    if (youthProfile.parentId && youthProfile.parentId.toString() !== parent.userId.toString()) {
      await Parent.updateOne({ userId: youthProfile.parentId }, { $pull: { guardedYouth: youthId } });
    }

    if (!parent.guardedYouth.some((id) => id.toString() === youthId)) {
      parent.guardedYouth.push(youthId);
    }

    youthProfile.parentId = parent.userId;

    await Promise.all([parent.save(), youthProfile.save()]);

    sendSuccess(res, 200, 'Youth linked to parent successfully', {
      parentId: parent.userId,
      youthId
    });
  } catch (error) {
    next(error);
  }
};

// Delete user account
export const deleteUserAccount = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.userId);

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // Delete role-specific profile
    if (user.role === 'youth') {
      await Youth.deleteOne({ userId: user._id });
    } else if (user.role === 'parent') {
      await Parent.deleteOne({ userId: user._id });
    } else if (user.role === 'coach') {
      await Coach.deleteOne({ userId: user._id });
    } else if (user.role === 'clinician') {
      await Clinician.deleteOne({ userId: user._id });
    }

    sendSuccess(res, 200, 'User account deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

// Get user coaches (for youth)
export const getUserCoaches = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const youthProfile = await Youth.findOne({ userId }).populate('coachId');

    if (!youthProfile) {
      return sendError(res, 404, 'Youth profile not found');
    }

    sendSuccess(res, 200, 'Coaches retrieved successfully', youthProfile.coachId);
  } catch (error) {
    next(error);
  }
};

// Get all users (admin only)
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;

    let query = {};
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-password');

    const total = await User.countDocuments(query);

    sendSuccess(res, 200, 'Users retrieved successfully', {
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    next(error);
  }
};

// Get all coaches with populated user data
export const getAllCoaches = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const coaches = await Coach.find()
      .populate({
        path: 'userId',
        select: 'firstName lastName email createdAt'
      })
      .populate({
        path: 'assignedYouth',
        select: '_id firstName lastName totalPoints level'
      })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Coach.countDocuments();

    sendSuccess(res, 200, 'Coaches retrieved successfully', {
      coaches,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    next(error);
  }
};

// Search users
export const searchUsers = async (req, res, next) => {
  try {
    const { query } = req.query;

    const users = await User.find({
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('-password').limit(20);

    sendSuccess(res, 200, 'Users found successfully', users);
  } catch (error) {
    next(error);
  }
};

// Deactivate user
export const deactivateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    sendSuccess(res, 200, 'User deactivated successfully', user.toJSON());
  } catch (error) {
    next(error);
  }
};

// Activate user
export const activateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: true },
      { new: true }
    );

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    sendSuccess(res, 200, 'User activated successfully', user.toJSON());
  } catch (error) {
    next(error);
  }
};

// Claim daily reward (add 100 XP)
export const claimDailyReward = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    if (user.role !== 'youth') {
      return sendError(res, 403, 'Only youth can claim daily rewards');
    }

    const youth = await Youth.findOne({ userId: req.userId });
    if (!youth) {
      return sendError(res, 404, 'Youth profile not found');
    }

    // Check if already claimed today
    const today = new Date().toDateString();
    const lastClaimDate = youth.lastDailyRewardClaim ? new Date(youth.lastDailyRewardClaim).toDateString() : null;

    if (lastClaimDate === today) {
      return sendError(res, 400, 'Daily reward already claimed today. Come back tomorrow!');
    }

    // Add 100 XP
    const XP_REWARD = 100;
    youth.totalPoints += XP_REWARD;
    
    // Update level using scaling thresholds
    const levelInfo = getLevelFromXP(youth.totalPoints);
    youth.level = levelInfo.level;
    
    // Update last claim date
    youth.lastDailyRewardClaim = new Date();

    await youth.save();

    // Return updated youth profile
    sendSuccess(res, 200, 'Daily reward claimed successfully!', {
      totalPoints: youth.totalPoints,
      level: youth.level,
      currentLevelXP: levelInfo.currentThreshold,
      nextLevelXP: levelInfo.nextThreshold,
      xpAdded: XP_REWARD,
      lastDailyRewardClaim: youth.lastDailyRewardClaim
    });
  } catch (error) {
    next(error);
  }
};

// Delete user by admin
export const deleteUserByAdmin = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // Delete role-specific profile
    if (user.role === 'youth') {
      await Youth.deleteOne({ userId: user._id });
    } else if (user.role === 'parent') {
      await Parent.deleteOne({ userId: user._id });
    } else if (user.role === 'coach') {
      await Coach.deleteOne({ userId: user._id });
    } else if (user.role === 'clinician') {
      await Clinician.deleteOne({ userId: user._id });
    }

    sendSuccess(res, 200, 'User deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

// Add youth to coach
export const addYouthToCoach = async (req, res, next) => {
  try {
    const { coachId } = req.params;
    const { youthId } = req.body;

    if (!youthId) {
      return sendError(res, 400, 'Youth ID is required');
    }

    // Accept either coach document _id or linked userId
    const coach = await Coach.findById(coachId) || await Coach.findOne({ userId: coachId });
    if (!coach) {
      return sendError(res, 404, 'Coach not found');
    }

    // Add youth to coach's assignedYouth array if not already present
    if (!coach.assignedYouth.includes(youthId)) {
      coach.assignedYouth.push(youthId);
      await coach.save();
    }

    // Update Youth profile to link to this coach
    const youth = await Youth.findOne({ userId: youthId });
    if (youth) {
      youth.coachId = coachId;
      await youth.save();
    }

    sendSuccess(res, 200, 'Youth assigned to coach successfully', coach);
  } catch (error) {
    next(error);
  }
};

// Remove youth from coach
export const removeYouthFromCoach = async (req, res, next) => {
  try {
    const { coachId } = req.params;
    const { youthId } = req.body;

    if (!youthId) {
      return sendError(res, 400, 'Youth ID is required');
    }

    // Accept either coach document _id or linked userId
    const coach = await Coach.findById(coachId) || await Coach.findOne({ userId: coachId });
    if (!coach) {
      return sendError(res, 404, 'Coach not found');
    }

    // Remove youth from coach's assignedYouth array
    coach.assignedYouth = coach.assignedYouth.filter(id => id.toString() !== youthId);
    await coach.save();

    // Update Youth profile to remove coach link
    const youth = await Youth.findOne({ userId: youthId });
    if (youth && youth.coachId?.toString() === coachId) {
      youth.coachId = undefined;
      await youth.save();
    }

    sendSuccess(res, 200, 'Youth removed from coach successfully', coach);
  } catch (error) {
    next(error);
  }
};
// Get youth's completed missions (for coach viewing)
export const getYouthMissions = async (req, res, next) => {
  try {
    const { youthId } = req.params;

    const youth = await Youth.findOne({ userId: youthId }).populate('completedMissions.missionId');

    if (!youth) {
      return sendError(res, 404, 'Youth not found');
    }

    sendSuccess(res, 200, 'Youth missions retrieved successfully', {
      completed: youth.completedMissions || [],
      total: (youth.completedMissions || []).length
    });
  } catch (error) {
    next(error);
  }
};

// Get youth's journal entries (for coach viewing)
export const getYouthJournals = async (req, res, next) => {
  try {
    const { youthId } = req.params;
    const { limit = 10, page = 1 } = req.query;

    const journals = await Journal.find({ userId: youthId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Journal.countDocuments({ userId: youthId });

    sendSuccess(res, 200, 'Youth journals retrieved successfully', {
      journals,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    next(error);
  }
};

// Get youth's mood entries (for coach viewing)
export const getYouthMoods = async (req, res, next) => {
  try {
    const { youthId } = req.params;
    const { limit = 30, page = 1 } = req.query;

    const moods = await MoodEntry.find({ userId: youthId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MoodEntry.countDocuments({ userId: youthId });

    // Calculate mood statistics
    const moodCounts = {};
    moods.forEach(mood => {
      moodCounts[mood.mood] = (moodCounts[mood.mood] || 0) + 1;
    });

    sendSuccess(res, 200, 'Youth mood entries retrieved successfully', {
      moods,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      stats: moodCounts
    });
  } catch (error) {
    next(error);
  }
};

// Get youth's active missions (assigned by coach)
export const getYouthActiveMissions = async (req, res, next) => {
  try {
    const { youthId } = req.params;

    const activeMissions = await UserMissionProgress.find({
      userId: youthId,
      status: 'active'
    })
      .populate('missionId')
      .sort({ createdAt: -1 });

    sendSuccess(res, 200, 'Youth active missions retrieved successfully', activeMissions);
  } catch (error) {
    next(error);
  }
};