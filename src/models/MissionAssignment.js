import mongoose from 'mongoose';

const missionAssignmentSchema = new mongoose.Schema({
  missionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mission',
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
  status: {
    type: String,
    enum: ['assigned', 'in-progress', 'completed', 'abandoned'],
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
  score: {
    type: Number,
    default: null,
    min: 0,
    max: 100
  },
  feedback: {
    type: String,
    default: null
  },
  dueDate: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('MissionAssignment', missionAssignmentSchema);
