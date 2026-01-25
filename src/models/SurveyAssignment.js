import mongoose from 'mongoose';

const surveyResponseSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  answer: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  answeredAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const surveyAssignmentSchema = new mongoose.Schema({
  surveyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Survey',
    required: true
  },
  youthId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedByRole: {
    type: String,
    enum: ['coach', 'clinician', 'admin'],
    required: true
  },
  status: {
    type: String,
    enum: ['assigned', 'in-progress', 'completed'],
    default: 'assigned'
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  startedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  responses: {
    type: [surveyResponseSchema],
    default: []
  }
}, {
  timestamps: true
});

export default mongoose.model('SurveyAssignment', surveyAssignmentSchema);
