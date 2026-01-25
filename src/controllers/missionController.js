import Mission from '../models/Mission.js';
import Youth from '../models/Youth.js';
import UserMissionProgress from '../models/UserMissionProgress.js';
import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/errorResponse.js';

// Get all missions
export const getAllMissions = async (req, res, next) => {
  try {
    const { category, difficulty, page = 1, limit = 10, ageGroup } = req.query;

    let query = { isActive: true };

    if (category) {
      query.category = category;
    }
    if (difficulty) {
      query.difficulty = difficulty;
    }
    if (ageGroup) {
      query.targetAgeGroup = { $in: [ageGroup] };
    }

    const missions = await Mission.find(query)
      .populate('createdBy', 'firstName lastName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Mission.countDocuments(query);

    sendSuccess(res, 200, 'Missions retrieved successfully', {
      missions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    next(error);
  }
};

// Get mission by ID
export const getMissionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const mission = await Mission.findById(id).populate('createdBy', 'firstName lastName');

    if (!mission) {
      return sendError(res, 404, 'Mission not found');
    }

    sendSuccess(res, 200, 'Mission retrieved successfully', mission);
  } catch (error) {
    next(error);
  }
};

// Create mission (coach/admin)
export const createMission = async (req, res, next) => {
  try {
    const { title, description, objectives, difficulty, category, targetAgeGroup, duration, durationUnit, rewards, tags, imageUrl } = req.body;

    const mission = await Mission.create({
      title,
      description,
      objectives,
      difficulty,
      category,
      targetAgeGroup,
      duration,
      durationUnit,
      rewards,
      tags,
      imageUrl,
      createdBy: req.userId
    });

    const populatedMission = await mission.populate('createdBy', 'firstName lastName');

    sendSuccess(res, 201, 'Mission created successfully', populatedMission);
  } catch (error) {
    next(error);
  }
};

// Update mission (creator/admin)
export const updateMission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, objectives, difficulty, category, targetAgeGroup, duration, durationUnit, rewards, tags, imageUrl, isActive } = req.body;

    let mission = await Mission.findById(id);

    if (!mission) {
      return sendError(res, 404, 'Mission not found');
    }

    // Check if user is creator or admin
    if (mission.createdBy.toString() !== req.userId && req.userRole !== 'admin') {
      return sendError(res, 403, 'Not authorized to update this mission');
    }

    mission = await Mission.findByIdAndUpdate(
      id,
      { title, description, objectives, difficulty, category, targetAgeGroup, duration, durationUnit, rewards, tags, imageUrl, isActive },
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName');

    sendSuccess(res, 200, 'Mission updated successfully', mission);
  } catch (error) {
    next(error);
  }
};

// Delete mission
export const deleteMission = async (req, res, next) => {
  try {
    const { id } = req.params;

    const mission = await Mission.findById(id);

    if (!mission) {
      return sendError(res, 404, 'Mission not found');
    }

    // Check if user is creator or admin
    if (mission.createdBy.toString() !== req.userId && req.userRole !== 'admin') {
      return sendError(res, 403, 'Not authorized to delete this mission');
    }

    await Mission.findByIdAndDelete(id);

    sendSuccess(res, 200, 'Mission deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

// Complete mission
export const completeMission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { score } = req.body;

    const mission = await Mission.findById(id);

    if (!mission) {
      return sendError(res, 404, 'Mission not found');
    }

    // Update youth profile
    const youthProfile = await Youth.findOne({ userId: req.userId });

    if (!youthProfile) {
      return sendError(res, 404, 'Youth profile not found');
    }

    youthProfile.completedMissions.push({
      missionId: mission._id,
      completedAt: new Date(),
      score: score || 100
    });

    youthProfile.totalPoints += mission.rewards.points;
    await youthProfile.save();

    // Update mission
    mission.completions += 1;
    await mission.save();

    sendSuccess(res, 200, 'Mission completed successfully', {
      mission,
      youthProfile
    });
  } catch (error) {
    next(error);
  }
};

// Get mission leaderboard
export const getMissionLeaderboard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 10 } = req.query;

    const mission = await Mission.findById(id);

    if (!mission) {
      return sendError(res, 404, 'Mission not found');
    }

    const leaderboard = await Youth.find({
      'completedMissions.missionId': id
    })
      .populate('userId', 'firstName lastName')
      .sort({ totalPoints: -1 })
      .limit(limit);

    sendSuccess(res, 200, 'Mission leaderboard retrieved successfully', leaderboard);
  } catch (error) {
    next(error);
  }
};

// Search missions
export const searchMissions = async (req, res, next) => {
  try {
    const { query } = req.query;

    const missions = await Mission.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ],
      isActive: true
    })
      .populate('createdBy', 'firstName lastName')
      .limit(20);

    sendSuccess(res, 200, 'Missions found successfully', missions);
  } catch (error) {
    next(error);
  }
};

// Start mission (initialize user progress)
export const startMission = async (req, res, next) => {
  try {
    const { missionId } = req.params;
    const userId = req.userId;

    const mission = await Mission.findById(missionId);
    if (!mission) {
      return sendError(res, 404, 'Mission not found');
    }

    // Calculate end date based on duration
    let endDate = new Date();
    if (mission.durationUnit === 'minutes') {
      endDate.setMinutes(endDate.getMinutes() + mission.duration);
    } else if (mission.durationUnit === 'hours') {
      endDate.setHours(endDate.getHours() + mission.duration);
    } else if (mission.durationUnit === 'days') {
      endDate.setDate(endDate.getDate() + mission.duration);
    }

    // Check if user already has active progress for this mission
    let userProgress = await UserMissionProgress.findOne({
      userId,
      missionId,
      status: 'active'
    });

    if (userProgress) {
      return sendError(res, 400, 'You already have an active mission. Complete or fail it before starting again.');
    }

    // Create progress array for all days
    const daysCount = mission.durationUnit === 'days' ? mission.duration : 1;
    const progressArray = Array.from({ length: daysCount }, (_, i) => ({
      day: i + 1,
      completed: false,
      skipped: false,
      note: '',
      timestamp: null
    }));

    userProgress = await UserMissionProgress.create({
      userId,
      missionId,
      startDate: new Date(),
      endDate,
      progress: progressArray,
      status: 'active',
      completionPercentage: 0
    });

    await userProgress.populate('missionId');

    sendSuccess(res, 201, 'Mission started successfully', userProgress);
  } catch (error) {
    next(error);
  }
};

// Record daily mission progress
export const recordMissionProgress = async (req, res, next) => {
  try {
    const { missionId } = req.params;
    const { day, completed, skipped, note } = req.body;
    const userId = req.userId;

    // Validate input
    if (!day || (completed === undefined && skipped === undefined)) {
      return sendError(res, 400, 'Day and action (completed/skipped) are required');
    }

    const userProgress = await UserMissionProgress.findOne({
      userId,
      missionId,
      status: 'active'
    });

    if (!userProgress) {
      return sendError(res, 404, 'Active mission progress not found');
    }

    // Update the specific day's progress
    const dayIndex = day - 1;
    if (dayIndex < 0 || dayIndex >= userProgress.progress.length) {
      return sendError(res, 400, 'Invalid day number');
    }

    userProgress.progress[dayIndex] = {
      day,
      completed: completed || false,
      skipped: skipped || false,
      note: note || '',
      timestamp: new Date()
    };

    // Calculate completion percentage
    const completedDays = userProgress.progress.filter(p => p.completed).length;
    const completionPercentage = (completedDays / userProgress.progress.length) * 100;
    userProgress.completionPercentage = Math.round(completionPercentage);

    // Determine status
    if (userProgress.completionPercentage === 100) {
      userProgress.status = 'completed';
      userProgress.completedAt = new Date();
    } else if (day === userProgress.progress.length && userProgress.completionPercentage < 80) {
      userProgress.status = 'failed';
      userProgress.completedAt = new Date();
    }

    await userProgress.save();

    // Award XP if mission is completed with 80%+ completion
    if (userProgress.status === 'completed' && userProgress.completionPercentage >= 80 && !userProgress.xpAwarded) {
      const mission = await Mission.findById(missionId);
      const user = await User.findById(userId);
      const youthProfile = await Youth.findOne({ userId });

      if (user && youthProfile && mission) {
        // Award XP
        const xpAmount = mission.rewards.points;
        userProgress.xpEarned = xpAmount;
        userProgress.xpAwarded = true;

        // Update user and youth profile
        user.totalXP = (user.totalXP || 0) + xpAmount;
        youthProfile.totalPoints += xpAmount;

        // Check for level up
        const xpPerLevel = 1000;
        const newLevel = Math.floor(user.totalXP / xpPerLevel) + 1;
        if (newLevel > user.level) {
          user.level = newLevel;
        }

        await user.save();
        await youthProfile.save();
      }
    }

    await userProgress.populate('missionId');

    sendSuccess(res, 200, 'Mission progress recorded successfully', userProgress);
  } catch (error) {
    next(error);
  }
};

// Get user's mission progress
export const getUserMissionProgress = async (req, res, next) => {
  try {
    const { missionId } = req.params;
    const userId = req.userId;

    const userProgress = await UserMissionProgress.findOne({
      userId,
      missionId
    })
      .populate('missionId')
      .populate('userId', 'firstName lastName email');

    if (!userProgress) {
      return sendError(res, 404, 'Mission progress not found');
    }

    sendSuccess(res, 200, 'Mission progress retrieved successfully', userProgress);
  } catch (error) {
    next(error);
  }
};

// Get all user's active missions
export const getUserActiveMissions = async (req, res, next) => {
  try {
    const userId = req.userId;

    const activeMissions = await UserMissionProgress.find({
      userId,
      status: 'active'
    })
      .populate('missionId')
      .sort({ createdAt: -1 });

    sendSuccess(res, 200, 'Active missions retrieved successfully', activeMissions);
  } catch (error) {
    next(error);
  }
};

// Get all user's completed missions
export const getUserCompletedMissions = async (req, res, next) => {
  try {
    const userId = req.userId;

    const completedMissions = await UserMissionProgress.find({
      userId,
      status: 'completed'
    })
      .populate('missionId')
      .sort({ completedAt: -1 });

    sendSuccess(res, 200, 'Completed missions retrieved successfully', completedMissions);
  } catch (error) {
    next(error);
  }
};

// Get all user's missions with history
export const getUserMissionHistory = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10 } = req.query;

    const missions = await UserMissionProgress.find({ userId })
      .populate('missionId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await UserMissionProgress.countDocuments({ userId });

    sendSuccess(res, 200, 'Mission history retrieved successfully', {
      missions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    next(error);
  }
};
