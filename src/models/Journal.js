import mongoose from 'mongoose';

const journalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Journal title is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Journal content is required']
  },
  mood: {
    type: String,
    enum: ['very-sad', 'sad', 'neutral', 'happy', 'very-happy'],
    required: true
  },
  emotionTags: [String],
  isPrivate: {
    type: Boolean,
    default: true
  },
  attachments: [{
    url: String,
    type: String
  }],
  reflectionPrompt: String,
  gratitudeItems: [String],
  reviewedByCoach: {
    type: Boolean,
    default: false
  },
  coachFeedback: {
    coachId: mongoose.Schema.Types.ObjectId,
    feedback: String,
    feedbackDate: Date
  },
  tags: [String],
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

export default mongoose.model('Journal', journalSchema);
