import MoodEntry from '../models/MoodEntry.js';
import Coach from '../models/Coach.js';
import Youth from '../models/Youth.js';
import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/errorResponse.js';

// Log mood entry
export const logMood = async (req, res, next) => {
  try {
    const { mood, intensity, emotions, triggers, activities, location, socialContext, notes, physicalSensations, copingStrategies, isHelpful } = req.body;

    const moodEntry = await MoodEntry.create({
      userId: req.userId,
      mood,
      intensity,
      emotions,
      triggers,
      activities,
      location,
      socialContext,
      notes,
      physicalSensations,
      copingStrategies,
      isHelpful
    });

    sendSuccess(res, 201, 'Mood entry logged successfully', moodEntry);
  } catch (error) {
    next(error);
  }
};

// Get mood entries
export const getMoodEntries = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, startDate, endDate } = req.query;

    let query = { userId: req.userId };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const moodEntries = await MoodEntry.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await MoodEntry.countDocuments(query);

    sendSuccess(res, 200, 'Mood entries retrieved successfully', {
      moodEntries,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    next(error);
  }
};

// Get mood tracking history
export const getMoodHistory = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const moodHistory = await MoodEntry.find({
      userId: req.userId,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 });

    // Calculate statistics
    const stats = {
      totalEntries: moodHistory.length,
      averageIntensity: moodHistory.length > 0 ? moodHistory.reduce((sum, entry) => sum + entry.intensity, 0) / moodHistory.length : 0,
      moodDistribution: {
        'very-sad': 0,
        'sad': 0,
        'neutral': 0,
        'happy': 0,
        'very-happy': 0
      },
      mostCommonEmotions: [],
      mostCommonTriggers: [],
      mostHelpfulCopingStrategies: []
    };

    // Calculate distributions and frequencies
    const emotionFreq = {};
    const triggerFreq = {};
    const copingFreq = {};

    moodHistory.forEach(entry => {
      stats.moodDistribution[entry.mood]++;

      entry.emotions?.forEach(emotion => {
        emotionFreq[emotion] = (emotionFreq[emotion] || 0) + 1;
      });

      entry.triggers?.forEach(trigger => {
        triggerFreq[trigger] = (triggerFreq[trigger] || 0) + 1;
      });

      if (entry.isHelpful) {
        entry.copingStrategies?.forEach(strategy => {
          copingFreq[strategy] = (copingFreq[strategy] || 0) + 1;
        });
      }
    });

    stats.mostCommonEmotions = Object.entries(emotionFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([emotion, count]) => ({ emotion, count }));

    stats.mostCommonTriggers = Object.entries(triggerFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([trigger, count]) => ({ trigger, count }));

    stats.mostHelpfulCopingStrategies = Object.entries(copingFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([strategy, count]) => ({ strategy, count }));

    sendSuccess(res, 200, 'Mood history retrieved successfully', {
      moodHistory,
      stats
    });
  } catch (error) {
    next(error);
  }
};

// Get mood trends
export const getMoodTrends = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const moodEntries = await MoodEntry.find({
      userId: req.userId,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 });

    // Group by day
    const trendsByDay = {};

    moodEntries.forEach(entry => {
      const day = entry.createdAt.toISOString().split('T')[0];
      if (!trendsByDay[day]) {
        trendsByDay[day] = [];
      }
      trendsByDay[day].push(entry);
    });

    const trends = Object.entries(trendsByDay).map(([date, entries]) => ({
      date,
      count: entries.length,
      averageIntensity: entries.reduce((sum, e) => sum + e.intensity, 0) / entries.length,
      predominantMood: entries.sort((a, b) => 
        ['very-sad', 'sad', 'neutral', 'happy', 'very-happy'].indexOf(a.mood) - 
        ['very-sad', 'sad', 'neutral', 'happy', 'very-happy'].indexOf(b.mood)
      )[0]?.mood
    }));

    sendSuccess(res, 200, 'Mood trends retrieved successfully', trends);
  } catch (error) {
    next(error);
  }
};

// Update mood entry
export const updateMoodEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { mood, intensity, emotions, triggers, activities, notes, isHelpful } = req.body;

    let moodEntry = await MoodEntry.findById(id);

    if (!moodEntry) {
      return sendError(res, 404, 'Mood entry not found');
    }

    if (moodEntry.userId.toString() !== req.userId) {
      return sendError(res, 403, 'Not authorized to update this mood entry');
    }

    moodEntry = await MoodEntry.findByIdAndUpdate(
      id,
      { mood, intensity, emotions, triggers, activities, notes, isHelpful },
      { new: true, runValidators: true }
    );

    sendSuccess(res, 200, 'Mood entry updated successfully', moodEntry);
  } catch (error) {
    next(error);
  }
};

// Delete mood entry
export const deleteMoodEntry = async (req, res, next) => {
  try {
    const { id } = req.params;

    const moodEntry = await MoodEntry.findById(id);

    if (!moodEntry) {
      return sendError(res, 404, 'Mood entry not found');
    }

    if (moodEntry.userId.toString() !== req.userId) {
      return sendError(res, 403, 'Not authorized to delete this mood entry');
    }

    await MoodEntry.findByIdAndDelete(id);

    sendSuccess(res, 200, 'Mood entry deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

// Coach mood tracking for assigned youth
export const getCoachAssignedYouthMoodTracking = async (req, res, next) => {
  try {
    const coach = await Coach.findOne({ userId: req.userId });
    if (!coach) {
      return sendError(res, 404, 'Coach profile not found');
    }

    const assignedYouthIds = coach.assignedYouth || [];
    if (assignedYouthIds.length === 0) {
      return sendSuccess(res, 200, 'No assigned youth', { youths: [] });
    }

    const [users, youthProfiles] = await Promise.all([
      User.find({ _id: { $in: assignedYouthIds } }).select('firstName lastName'),
      Youth.find({ userId: { $in: assignedYouthIds } }).select('userId level totalPoints')
    ]);

    const results = await Promise.all(
      assignedYouthIds.map(async (youthId) => {
        const moodEntries = await MoodEntry.find({ userId: youthId }).sort({ createdAt: -1 });

        const totalEntries = moodEntries.length;
        const currentMood = moodEntries[0]?.mood || 'neutral';
        const averageIntensity = totalEntries > 0
          ? moodEntries.reduce((sum, entry) => sum + entry.intensity, 0) / totalEntries
          : 0;

        const moodDistribution = {
          'very-happy': 0,
          'happy': 0,
          'neutral': 0,
          'sad': 0,
          'very-sad': 0
        };

        moodEntries.forEach((entry) => {
          moodDistribution[entry.mood] = (moodDistribution[entry.mood] || 0) + 1;
        });

        const user = users.find(u => u._id.toString() === youthId.toString());
        const youthProfile = youthProfiles.find(y => y.userId.toString() === youthId.toString());

        return {
          id: youthId,
          name: user ? `${user.firstName} ${user.lastName}` : 'Youth',
          level: youthProfile?.level || 1,
          currentMood,
          totalEntries,
          averageIntensity: Number(averageIntensity.toFixed(1)),
          moodDistribution
        };
      })
    );

    sendSuccess(res, 200, 'Coach mood tracking retrieved successfully', { youths: results });
  } catch (error) {
    next(error);
  }
};

// Admin mood reports
export const getAdminMoodReports = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days) + 1);

    const distribution = await MoodEntry.aggregate([
      {
        $group: {
          _id: '$mood',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalEntries = distribution.reduce((sum, item) => sum + item.count, 0);

    const trendsAgg = await MoodEntry.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            mood: '$mood'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.day',
          moods: { $push: { mood: '$_id.mood', count: '$count' } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    sendSuccess(res, 200, 'Admin mood reports retrieved successfully', {
      totalEntries,
      distribution,
      weeklyTrend: trendsAgg
    });
  } catch (error) {
    next(error);
  }
};
