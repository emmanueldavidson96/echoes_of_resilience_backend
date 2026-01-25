import mongoose from 'mongoose';

const clinicianSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  licenseNumber: {
    type: String,
    required: true
  },
  licensingState: String,
  specialization: [String],
  credentials: [String],
  bio: String,
  yearsOfExperience: Number,
  supervisions: [{
    youthId: mongoose.Schema.Types.ObjectId,
    startDate: Date,
    endDate: Date
  }],
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

export default mongoose.model('Clinician', clinicianSchema);
