import mongoose from 'mongoose';

const moodEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mood: {
    type: String,
    enum: ['very-sad', 'sad', 'neutral', 'happy', 'very-happy'],
    required: true
  },
  intensity: {
    type: Number,
    min: 1,
    max: 10,
    required: true
  },
  emotions: [String],
  triggers: [String],
  activities: [String],
  location: String,
  socialContext: {
    type: String,
    enum: ['alone', 'with-family', 'with-friends', 'at-school', 'at-work', 'in-group'],
    default: 'alone'
  },
  notes: String,
  physicalSensations: [String],
  copingStrategies: [String],
  isHelpful: Boolean,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
moodEntrySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('MoodEntry', moodEntrySchema);
