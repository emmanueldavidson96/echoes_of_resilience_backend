import mongoose from 'mongoose';

const youthSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gradeLevel: {
    type: String,
    enum: ['elementary', 'middle', 'high', 'college', 'adult'],
    default: 'high'
  },
  school: {
    type: String,
    trim: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  coachId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  clinicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  interests: [String],
  emotionalStrengths: [String],
  areasForGrowth: [String],
  assessmentHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment'
  }],
  completedMissions: [{
    missionId: mongoose.Schema.Types.ObjectId,
    completedAt: Date,
    score: Number
  }],
  totalPoints: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  streaks: {
    moodTracking: {
      type: Number,
      default: 0
    },
    journaling: {
      type: Number,
      default: 0
    }
  },
  badges: [{
    badgeId: String,
    unlockedAt: Date
  }],
  lastDailyRewardClaim: {
    type: Date,
    default: null
  },
  lastMoodCheckDate: {
    type: Date,
    default: null
  },
  lastPHQ9SubmissionDate: {
    type: Date,
    default: null
  },
  lastGAD7SubmissionDate: {
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

export default mongoose.model('Youth', youthSchema);
