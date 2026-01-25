import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  assignSurvey,
  getMySurveyAssignments,
  getSurveyAssignmentById,
  startSurveyAssignment,
  submitSurveyAssignment
} from '../controllers/surveyAssignmentController.js';

const router = express.Router();

router.use(protect);

router.post('/', authorize('admin', 'coach', 'clinician'), assignSurvey);
router.get('/mine', authorize('youth'), getMySurveyAssignments);
router.get('/:assignmentId', authorize('admin', 'coach', 'clinician', 'youth'), getSurveyAssignmentById);
router.post('/:assignmentId/start', authorize('youth'), startSurveyAssignment);
router.post('/:assignmentId/submit', authorize('youth'), submitSurveyAssignment);

export default router;
