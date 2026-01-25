import MissionAssignment from '../models/MissionAssignment.js';
import Mission from '../models/Mission.js';
import Message from '../models/Message.js';
import { sendSuccess, sendError } from '../utils/errorResponse.js';

// Assign mission to youth
export const assignMissionToYouth = async (req, res, next) => {
  try {
    const { missionId, youthId, dueDate, notes } = req.body;
    const assignedBy = req.userId;

    if (!missionId || !youthId) {
      return sendError(res, 400, 'Mission ID and Youth ID are required');
    }

    // Check if mission exists
    const mission = await Mission.findById(missionId);
    if (!mission) {
      return sendError(res, 404, 'Mission not found');
    }

    // Check if already assigned (and not completed)
    const existingAssignment = await MissionAssignment.findOne({
      missionId,
      youthId,
      status: { $in: ['assigned', 'in-progress'] }
    });

    if (existingAssignment) {
      return sendError(res, 400, 'This mission is already assigned to the youth');
    }

    const assignment = new MissionAssignment({
      missionId,
      youthId,
      assignedBy,
      dueDate,
      notes,
      status: 'assigned'
    });

    await assignment.save();
    await assignment.populate('missionId');
    await assignment.populate('assignedBy', 'firstName lastName');

    // Create notification message
    const notification = new Message({
      senderId: assignedBy,
      recipientId: youthId,
      content: `You have been assigned a new mission: ${mission.title}`,
      messageType: 'assignment',
      relatedEntityType: 'mission',
      relatedEntityId: missionId
    });

    await notification.save();

    return sendSuccess(res, 201, 'Mission assigned successfully', assignment);
  } catch (err) {
    console.error('Error assigning mission:', err);
    return sendError(res, 500, 'Failed to assign mission', err);
  }
};

// Get assigned missions for youth
export const getYouthAssignedMissions = async (req, res, next) => {
  try {
    const { youthId } = req.params;
    const { status } = req.query;

    let query = { youthId };
    if (status) {
      query.status = status;
    }

    const assignments = await MissionAssignment.find(query)
      .populate('missionId')
      .populate('assignedBy', 'firstName lastName')
      .sort({ assignedAt: -1 });

    return sendSuccess(res, 200, 'Assigned missions retrieved', assignments);
  } catch (err) {
    console.error('Error getting assigned missions:', err);
    return sendError(res, 500, 'Failed to retrieve assigned missions', err);
  }
};

// Get all active missions assigned to youth
export const getActiveAssignedMissions = async (req, res, next) => {
  try {
    const youthId = req.userId;

    const assignments = await MissionAssignment.find({
      youthId,
      status: { $in: ['assigned', 'in-progress'] }
    })
      .populate('missionId')
      .populate('assignedBy', 'firstName lastName')
      .sort({ assignedAt: -1 });

    return sendSuccess(res, 200, 'Active assigned missions retrieved', assignments);
  } catch (err) {
    console.error('Error getting active missions:', err);
    return sendError(res, 500, 'Failed to retrieve active missions', err);
  }
};

// Update mission assignment status
export const updateMissionAssignmentStatus = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const { status, score, feedback } = req.body;
    const userId = req.userId;

    const assignment = await MissionAssignment.findById(assignmentId);
    if (!assignment) {
      return sendError(res, 404, 'Assignment not found');
    }

    // Only youth or assignee can update
    if (assignment.youthId.toString() !== userId && assignment.assignedBy.toString() !== userId) {
      return sendError(res, 403, 'Not authorized to update this assignment');
    }

    // Update status
    if (status) {
      assignment.status = status;
      if (status === 'in-progress' && !assignment.startedAt) {
        assignment.startedAt = new Date();
      }
      if (status === 'completed' && !assignment.completedAt) {
        assignment.completedAt = new Date();
      }
    }

    if (score !== undefined) {
      assignment.score = score;
    }

    if (feedback) {
      assignment.feedback = feedback;
    }

    await assignment.save();
    await assignment.populate('missionId');
    await assignment.populate('assignedBy', 'firstName lastName');

    return sendSuccess(res, 200, 'Mission assignment updated', assignment);
  } catch (err) {
    console.error('Error updating mission assignment:', err);
    return sendError(res, 500, 'Failed to update mission assignment', err);
  }
};

// Get missions assigned by coach for review
export const getCoachAssignedMissions = async (req, res, next) => {
  try {
    const coachId = req.userId;
    const { status } = req.query;

    let query = { assignedBy: coachId };
    if (status) {
      query.status = status;
    }

    const assignments = await MissionAssignment.find(query)
      .populate('missionId')
      .populate('youthId', 'firstName lastName')
      .sort({ assignedAt: -1 });

    return sendSuccess(res, 200, 'Coach assigned missions retrieved', assignments);
  } catch (err) {
    console.error('Error getting coach assigned missions:', err);
    return sendError(res, 500, 'Failed to retrieve coach assigned missions', err);
  }
};

// Delete mission assignment
export const deleteMissionAssignment = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const userId = req.userId;

    const assignment = await MissionAssignment.findById(assignmentId);
    if (!assignment) {
      return sendError(res, 404, 'Assignment not found');
    }

    // Only assignee (coach) can delete
    if (assignment.assignedBy.toString() !== userId) {
      return sendError(res, 403, 'Not authorized to delete this assignment');
    }

    await MissionAssignment.findByIdAndDelete(assignmentId);
    return sendSuccess(res, 200, 'Mission assignment deleted');
  } catch (err) {
    console.error('Error deleting mission assignment:', err);
    return sendError(res, 500, 'Failed to delete mission assignment', err);
  }
};
