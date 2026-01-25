import Assessment from '../models/Assessment.js';
import Youth from '../models/Youth.js';
import Alert from '../models/Alert.js';
import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/errorResponse.js';
import { getLevelFromXP } from '../utils/level.js';

// Define XP rewards for assessments
const XP_REWARDS = {
  'mood-quick': 50,
  'PHQ9': 150,
  'GAD7': 150
};

// Submit assessment
export const submitAssessment = async (req, res, next) => {
  try {
    const { type } = req.params;
    const { responses } = req.body;

    if (!['PHQ9', 'GAD7', 'mood-quick'].includes(type)) {
      return sendError(res, 400, 'Invalid assessment type');
    }

    // Check if user is youth
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'youth') {
      return sendError(res, 403, 'Only youth can submit assessments');
    }

    // Get youth profile
    const youth = await Youth.findOne({ userId: req.userId });
    if (!youth) {
      return sendError(res, 404, 'Youth profile not found');
    }

    // Check if assessment already submitted today
    let lastSubmissionField;
    if (type === 'mood-quick') {
      lastSubmissionField = 'lastMoodCheckDate';
    } else if (type === 'PHQ9') {
      lastSubmissionField = 'lastPHQ9SubmissionDate';
    } else if (type === 'GAD7') {
      lastSubmissionField = 'lastGAD7SubmissionDate';
    }

    const today = new Date().toDateString();
    const lastSubmissionDate = youth[lastSubmissionField];
    
    if (lastSubmissionDate && new Date(lastSubmissionDate).toDateString() === today) {
      return sendError(res, 400, `You have already submitted a ${type} assessment today. Come back tomorrow!`);
    }

    // Calculate score based on type
    let totalScore = 0;
    responses.forEach(response => {
      totalScore += response.score || 0;
    });

    // Determine severity
    let severity = 'none';
    if (type === 'PHQ9') {
      if (totalScore >= 5 && totalScore <= 9) severity = 'mild';
      else if (totalScore >= 10 && totalScore <= 14) severity = 'moderate';
      else if (totalScore >= 15 && totalScore <= 19) severity = 'moderately-severe';
      else if (totalScore >= 20) severity = 'severe';
    } else if (type === 'GAD7') {
      if (totalScore >= 5 && totalScore <= 9) severity = 'mild';
      else if (totalScore >= 10 && totalScore <= 14) severity = 'moderate';
      else if (totalScore >= 15 && totalScore <= 21) severity = 'moderately-severe';
    }

    // Get recommendations based on severity
    const recommendations = getRecommendations(type, severity);

    const assessment = await Assessment.create({
      userId: req.userId,
      type,
      responses,
      totalScore,
      severity,
      recommendations,
      completedAt: new Date(),
      flaggedForReview: severity === 'severe' || severity === 'moderately-severe'
    });

    // Award XP with scaling levels
    const xpReward = XP_REWARDS[type] || 0;
    youth.totalPoints += xpReward;
    const levelInfo = getLevelFromXP(youth.totalPoints);
    youth.level = levelInfo.level;
    
    // Update last submission date
    youth[lastSubmissionField] = new Date();

    await youth.save();

    // Create alert if flagged
    if (assessment.flaggedForReview) {
      await Alert.create({
        youthId: req.userId,
        type: type === 'PHQ9' ? 'depression-indicators' : 'high-anxiety',
        severity: severity === 'severe' ? 'critical' : 'high',
        source: 'assessment',
        triggerId: assessment._id,
        triggerModel: 'Assessment',
        description: `High ${type} score: ${totalScore}`
      });
    }

    sendSuccess(res, 201, 'Assessment submitted successfully', {
      assessment,
      xpAwarded: xpReward,
      totalPoints: youth.totalPoints,
      level: youth.level,
      currentLevelXP: levelInfo.currentThreshold,
      nextLevelXP: levelInfo.nextThreshold,
      lastSubmissionDate: youth[lastSubmissionField]
    });
  } catch (error) {
    next(error);
  }
};

// Get assessment results
export const getAssessmentResults = async (req, res, next) => {
  try {
    const { id } = req.params;

    const assessment = await Assessment.findById(id);

    if (!assessment) {
      return sendError(res, 404, 'Assessment not found');
    }

    // Check authorization
    if (assessment.userId.toString() !== req.userId && req.userRole !== 'clinician' && req.userRole !== 'admin') {
      return sendError(res, 403, 'Not authorized to view this assessment');
    }

    sendSuccess(res, 200, 'Assessment results retrieved successfully', assessment);
  } catch (error) {
    next(error);
  }
};

// Get assessment history
export const getAssessmentHistory = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { type, page = 1, limit = 10 } = req.query;

    // Check authorization
    if (userId !== req.userId && req.userRole !== 'clinician' && req.userRole !== 'coach' && req.userRole !== 'admin') {
      return sendError(res, 403, 'Not authorized to view this history');
    }

    let query = { userId };
    if (type) {
      query.type = type;
    }

    const assessments = await Assessment.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ completedAt: -1 });

    const total = await Assessment.countDocuments(query);

    sendSuccess(res, 200, 'Assessment history retrieved successfully', {
      assessments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    next(error);
  }
};

// Get all assessments for review (clinician/admin)
export const getAssessmentsForReview = async (req, res, next) => {
  try {
    const { status = 'active', page = 1, limit = 10 } = req.query;

    let query = { flaggedForReview: true };

    if (status === 'resolved') {
      query.reviewedBy = { $ne: null };
    }

    const assessments = await Assessment.find(query)
      .populate('userId', 'firstName lastName email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ completedAt: -1 });

    const total = await Assessment.countDocuments(query);

    sendSuccess(res, 200, 'Assessments for review retrieved successfully', {
      assessments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    next(error);
  }
};

// Add review notes to assessment
export const addAssessmentReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    let assessment = await Assessment.findById(id);

    if (!assessment) {
      return sendError(res, 404, 'Assessment not found');
    }

    assessment.reviewedBy = {
      clinicianId: req.userId,
      reviewDate: new Date(),
      notes
    };

    await assessment.save();

    sendSuccess(res, 200, 'Review notes added successfully', assessment);
  } catch (error) {
    next(error);
  }
};

// Helper function to get recommendations
const getRecommendations = (type, severity) => {
  const recommendations = [];

  if (type === 'PHQ9') {
    if (severity === 'mild') {
      recommendations.push('Consider mindfulness or relaxation techniques');
      recommendations.push('Try journaling about your feelings');
    } else if (severity === 'moderate') {
      recommendations.push('Connect with a coach for support');
      recommendations.push('Explore coping strategies through missions');
    } else if (severity === 'moderately-severe' || severity === 'severe') {
      recommendations.push('Seek professional help from a clinician');
      recommendations.push('Contact a mental health crisis line if needed');
    }
  } else if (type === 'GAD7') {
    if (severity === 'mild') {
      recommendations.push('Practice deep breathing exercises');
      recommendations.push('Engage in physical activity');
    } else if (severity === 'moderate') {
      recommendations.push('Work with a coach on anxiety management');
      recommendations.push('Try grounding techniques');
    } else if (severity === 'moderately-severe' || severity === 'severe') {
      recommendations.push('Consult with a mental health professional');
      recommendations.push('Learn anxiety management strategies');
    }
  }

  return recommendations;
};
