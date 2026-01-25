import mongoose from 'mongoose';

const missionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Mission title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Mission description is required']
  },
  objectives: [String],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['emotional-awareness', 'social-skills', 'stress-management', 'resilience', 'mindfulness', 'creativity'],
    required: true
  },
  rewards: {
    points: {
      type: Number,
      default: 100
    },
    badges: [String]
  },
  targetAgeGroup: [{
    type: String,
    enum: ['5-7', '8-10', '11-13', '14-16', '17+']
  }],
  duration: {
    type: Number,
    required: true
  },
  durationUnit: {
    type: String,
    enum: ['minutes', 'hours', 'days'],
    default: 'minutes'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  completions: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  tags: [String],
  imageUrl: String,
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

export default mongoose.model('Mission', missionSchema);
