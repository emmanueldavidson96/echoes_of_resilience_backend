import Alert from '../models/Alert.js';
import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/errorResponse.js';

// Get all alerts (admin/clinician)
export const getAllAlerts = async (req, res, next) => {
  try {
    const { status, severity, page = 1, limit = 10 } = req.query;

    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }
    if (severity && severity !== 'all') {
      query.severity = severity;
    }

    const alerts = await Alert.find(query)
      .populate('youthId', 'firstName lastName email dateOfBirth')
      .populate('assignedTo', 'firstName lastName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Alert.countDocuments(query);

    sendSuccess(res, 200, 'Alerts retrieved successfully', {
      alerts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    next(error);
  }
};

// Get alert details
export const getAlertDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const alert = await Alert.findById(id)
      .populate('youthId', 'firstName lastName email dateOfBirth')
      .populate('assignedTo', 'firstName lastName')
      .populate('actionsTaken.takenBy', 'firstName lastName');

    if (!alert) {
      return sendError(res, 404, 'Alert not found');
    }

    sendSuccess(res, 200, 'Alert details retrieved successfully', alert);
  } catch (error) {
    next(error);
  }
};

// Update alert status
export const updateAlertStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, assignedTo } = req.body;

    if (!['active', 'acknowledged', 'resolved', 'false-positive'].includes(status)) {
      return sendError(res, 400, 'Invalid status');
    }

    let alert = await Alert.findById(id);

    if (!alert) {
      return sendError(res, 404, 'Alert not found');
    }

    alert.status = status;

    if (assignedTo) {
      alert.assignedTo = assignedTo;
    }

    if (status === 'resolved') {
      alert.resolvedAt = new Date();
    } else if (status === 'acknowledged') {
      alert.acknowledgedAt = new Date();
    }

    await alert.save();

    const populatedAlert = await Alert.findById(id)
      .populate('youthId', 'firstName lastName')
      .populate('assignedTo', 'firstName lastName');

    sendSuccess(res, 200, 'Alert status updated successfully', populatedAlert);
  } catch (error) {
    next(error);
  }
};

// Add notes to alert
export const addAlertNotes = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body;

    let alert = await Alert.findById(id);

    if (!alert) {
      return sendError(res, 404, 'Alert not found');
    }

    alert.actionsTaken.push({
      action,
      takenBy: req.userId,
      timestamp: new Date(),
      notes
    });

    await alert.save();

    const populatedAlert = await Alert.findById(id)
      .populate('youthId', 'firstName lastName')
      .populate('actionsTaken.takenBy', 'firstName lastName');

    sendSuccess(res, 200, 'Alert notes added successfully', populatedAlert);
  } catch (error) {
    next(error);
  }
};

// Get youth-specific alerts
export const getYouthAlerts = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Check authorization
    if (userId !== req.userId && req.userRole !== 'clinician' && req.userRole !== 'coach' && req.userRole !== 'admin') {
      return sendError(res, 403, 'Not authorized to view these alerts');
    }

    const alerts = await Alert.find({ youthId: userId })
      .sort({ createdAt: -1 })
      .populate('assignedTo', 'firstName lastName')
      .populate('youthId', 'firstName lastName email dateOfBirth');

    sendSuccess(res, 200, 'Youth alerts retrieved successfully', alerts);
  } catch (error) {
    next(error);
  }
};

// Get dashboard alerts summary
export const getAlertsSummary = async (req, res, next) => {
  try {
    const summary = {
      total: await Alert.countDocuments({}),
      active: await Alert.countDocuments({ status: 'active' }),
      critical: await Alert.countDocuments({ severity: 'critical' }),
      high: await Alert.countDocuments({ severity: 'high' }),
      byType: {}
    };

    const types = ['high-anxiety', 'depression-indicators', 'self-harm-mention', 'concerning-pattern', 'missing-engagement', 'critical-alert'];
    for (const type of types) {
      summary.byType[type] = await Alert.countDocuments({ type });
    }

    sendSuccess(res, 200, 'Alerts summary retrieved successfully', summary);
  } catch (error) {
    next(error);
  }
};

// Assign alert to clinician
export const assignAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { clinicianId } = req.body;

    // Verify clinician exists
    const clinician = await User.findById(clinicianId);
    if (!clinician || clinician.role !== 'clinician') {
      return sendError(res, 404, 'Clinician not found');
    }

    let alert = await Alert.findByIdAndUpdate(
      id,
      { assignedTo: clinicianId },
      { new: true }
    ).populate('assignedTo', 'firstName lastName');

    sendSuccess(res, 200, 'Alert assigned successfully', alert);
  } catch (error) {
    next(error);
  }
};
