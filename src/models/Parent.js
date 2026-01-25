import mongoose from 'mongoose';

const parentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  relationship: {
    type: String,
    enum: ['parent', 'guardian', 'caregiver', 'foster-parent'],
    required: true
  },
  guardedYouth: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  notificationPreferences: {
    emailAlerts: {
      type: Boolean,
      default: true
    },
    weeklyReport: {
      type: Boolean,
      default: true
    },
    criticalAlerts: {
      type: Boolean,
      default: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
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

export default mongoose.model('Parent', parentSchema);
