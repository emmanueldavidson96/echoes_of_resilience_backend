import mongoose from 'mongoose';

const surveyOptionSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    trim: true
  },
  value: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    default: null
  }
}, { _id: false });

const surveyQuestionSchema = new mongoose.Schema({
  prompt: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['text', 'date', 'select', 'single-choice', 'multi-choice', 'info'],
    required: true
  },
  required: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    default: null
  },
  allowMultiple: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: ''
  },
  options: {
    type: [surveyOptionSchema],
    default: []
  }
}, { timestamps: false });

const surveySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  version: {
    type: String,
    default: '1.0'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  questions: {
    type: [surveyQuestionSchema],
    default: []
  }
}, {
  timestamps: true
});

export default mongoose.model('Survey', surveySchema);
