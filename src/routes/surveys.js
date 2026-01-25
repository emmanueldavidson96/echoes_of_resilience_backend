import express from 'express';
import { getSurveys, getSurveyById } from '../controllers/surveyController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', authorize('admin', 'coach', 'clinician', 'youth'), getSurveys);
router.get('/:surveyId', authorize('admin', 'coach', 'clinician', 'youth'), getSurveyById);

export default router;
