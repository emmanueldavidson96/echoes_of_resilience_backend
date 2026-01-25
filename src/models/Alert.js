import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  youthId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['high-anxiety', 'depression-indicators', 'self-harm-mention', 'concerning-pattern', 'missing-engagement', 'critical-alert'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  source: {
    type: String,
    enum: ['assessment', 'journal', 'mood-trend', 'clinician-flagged', 'system-automated'],
    required: true
  },
  triggerId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'triggerModel'
  },
  triggerModel: {
    type: String,
    enum: ['Assessment', 'Journal', 'MoodEntry']
  },
  description: String,
  details: mongoose.Schema.Types.Mixed,
  status: {
    type: String,
    enum: ['active', 'acknowledged', 'resolved', 'false-positive'],
    default: 'active'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  actionsTaken: [{
    action: String,
    takenBy: mongoose.Schema.Types.ObjectId,
    timestamp: Date,
    notes: String
  }],
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  acknowledgedAt: Date,
  resolvedAt: Date
}, {
  timestamps: true
});

// Index for efficient alert querying
alertSchema.index({ youthId: 1, status: 1, createdAt: -1 });

export default mongoose.model('Alert', alertSchema);
