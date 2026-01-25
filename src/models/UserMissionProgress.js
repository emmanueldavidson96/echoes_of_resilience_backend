import mongoose from 'mongoose';

const dayProgressSchema = new mongoose.Schema({
  day: {
    type: Number,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  skipped: {
    type: Boolean,
    default: false
  },
  note: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const userMissionProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  missionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mission',
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  progress: [dayProgressSchema],
  status: {
    type: String,
    enum: ['active', 'completed', 'failed'],
    default: 'active'
  },
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  xpEarned: {
    type: Number,
    default: 0
  },
  xpAwarded: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  retryCount: {
    type: Number,
    default: 0
  },
  lastRetryDate: {
    type: Date,
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

// Index for quick lookups
userMissionProgressSchema.index({ userId: 1, missionId: 1 });
userMissionProgressSchema.index({ userId: 1, status: 1 });

export default mongoose.model('UserMissionProgress', userMissionProgressSchema);
