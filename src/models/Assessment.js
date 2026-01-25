import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['PHQ9', 'GAD7', 'mood-quick'],
    required: true
  },
  responses: [{
    questionId: String,
    answer: mongoose.Schema.Types.Mixed,
    score: Number
  }],
  totalScore: {
    type: Number,
    required: true
  },
  severity: {
    type: String,
    enum: ['none', 'mild', 'moderate', 'moderately-severe', 'severe'],
    required: true
  },
  interpretation: String,
  recommendations: [String],
  flaggedForReview: {
    type: Boolean,
    default: false
  },
  reviewedBy: {
    clinicianId: mongoose.Schema.Types.ObjectId,
    reviewDate: Date,
    notes: String
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Assessment', assessmentSchema);
