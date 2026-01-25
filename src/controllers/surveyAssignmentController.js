import Survey from '../models/Survey.js';
import SurveyAssignment from '../models/SurveyAssignment.js';
import Youth from '../models/Youth.js';
import Coach from '../models/Coach.js';
import { sendSuccess, sendError } from '../utils/errorResponse.js';

export const assignSurvey = async (req, res, next) => {
  try {
    const { surveyId, youthId } = req.body;

    if (!surveyId || !youthId) {
      return sendError(res, 400, 'Survey and youth are required');
    }

    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return sendError(res, 404, 'Survey not found');
    }

    const youthUser = await Youth.findOne({ userId: youthId });
    if (!youthUser) {
      return sendError(res, 404, 'Youth not found');
    }

    if (req.userRole === 'coach') {
      const coach = await Coach.findOne({ userId: req.userId });
      if (!coach) {
        return sendError(res, 403, 'Coach profile not found');
      }
      const isAssigned = coach.assignedYouth?.some((id) => id.toString() === youthId);
      if (!isAssigned) {
        return sendError(res, 403, 'You can only assign surveys to your assigned youth');
      }
    }

    const existing = await SurveyAssignment.findOne({
      surveyId,
      youthId,
      status: { $in: ['assigned', 'in-progress'] }
    });

    if (existing) {
      return sendError(res, 409, 'This survey is already assigned to the selected youth');
    }

    const assignment = await SurveyAssignment.create({
      surveyId,
      youthId,
      assignedBy: req.userId,
      assignedByRole: req.userRole
    });

    sendSuccess(res, 201, 'Survey assigned successfully', assignment);
  } catch (error) {
    next(error);
  }
};

export const getMySurveyAssignments = async (req, res, next) => {
  try {
    const status = req.query.status || 'assigned';
    const assignments = await SurveyAssignment.find({
      youthId: req.userId,
      status: status === 'all' ? { $in: ['assigned', 'in-progress', 'completed'] } : status
    })
      .populate('surveyId')
      .sort({ assignedAt: -1 });

    sendSuccess(res, 200, 'Survey assignments retrieved successfully', assignments);
  } catch (error) {
    next(error);
  }
};

export const getSurveyAssignmentById = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await SurveyAssignment.findById(assignmentId).populate('surveyId');

    if (!assignment) {
      return sendError(res, 404, 'Survey assignment not found');
    }

    if (req.userRole === 'youth' && assignment.youthId.toString() !== req.userId) {
      return sendError(res, 403, 'You are not allowed to view this survey assignment');
    }

    sendSuccess(res, 200, 'Survey assignment retrieved successfully', assignment);
  } catch (error) {
    next(error);
  }
};

export const startSurveyAssignment = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await SurveyAssignment.findById(assignmentId);

    if (!assignment) {
      return sendError(res, 404, 'Survey assignment not found');
    }

    if (assignment.youthId.toString() !== req.userId) {
      return sendError(res, 403, 'You are not allowed to start this survey');
    }

    if (assignment.status === 'assigned') {
      assignment.status = 'in-progress';
      assignment.startedAt = new Date();
      await assignment.save();
    }

    sendSuccess(res, 200, 'Survey assignment started', assignment);
  } catch (error) {
    next(error);
  }
};

export const submitSurveyAssignment = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const { responses } = req.body;

    const assignment = await SurveyAssignment.findById(assignmentId).populate('surveyId');
    if (!assignment) {
      return sendError(res, 404, 'Survey assignment not found');
    }

    if (assignment.youthId.toString() !== req.userId) {
      return sendError(res, 403, 'You are not allowed to submit this survey');
    }

    if (!Array.isArray(responses) || responses.length === 0) {
      return sendError(res, 400, 'Responses are required');
    }

    assignment.responses = responses.map((response) => ({
      questionId: response.questionId,
      answer: response.answer,
      answeredAt: new Date()
    }));
    assignment.status = 'completed';
    assignment.completedAt = new Date();

    await assignment.save();

    sendSuccess(res, 200, 'Survey submitted successfully', assignment);
  } catch (error) {
    next(error);
  }
};
