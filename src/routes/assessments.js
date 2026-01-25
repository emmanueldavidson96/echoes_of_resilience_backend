import express from 'express';
import {
  submitAssessment,
  getAssessmentResults,
  getAssessmentHistory,
  getAssessmentsForReview,
  addAssessmentReview
} from '../controllers/assessmentController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateAssessment, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Protected routes
router.use(protect);

// Youth - submit assessment
// Normalize type from param into body for validation/downstream
router.post(
  '/:type',
  (req, _res, next) => {
    if (!req.body.type && req.params.type) {
      req.body.type = req.params.type;
    }
    next();
  },
  validateAssessment,
  handleValidationErrors,
  submitAssessment
);

// Get assessment results
router.get('/:id', getAssessmentResults);

// Get user's assessment history
router.get('/user/:userId/history', getAssessmentHistory);

// Clinician/Admin - get assessments for review
router.get('/review', authorize('clinician', 'admin'), getAssessmentsForReview);

// Clinician/Admin - add review notes
router.post('/:id/review', authorize('clinician', 'admin'), addAssessmentReview);

export default router;
