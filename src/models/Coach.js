import mongoose from 'mongoose';

const coachSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specialization: [String],
  credentials: [String],
  bio: String,
  yearsOfExperience: Number,
  assignedYouth: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  availability: {
    monday: String,
    tuesday: String,
    wednesday: String,
    thursday: String,
    friday: String,
    saturday: String,
    sunday: String
  },
  ratesPerSession: Number,
  sessionDuration: Number,
  isActive: {
    type: Boolean,
    default: true
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

export default mongoose.model('Coach', coachSchema);
