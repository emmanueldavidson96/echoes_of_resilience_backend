import express from 'express';
import {
  logMood,
  getMoodEntries,
  getMoodHistory,
  getMoodTrends,
  updateMoodEntry,
  deleteMoodEntry,
  getAdminMoodReports,
  getCoachAssignedYouthMoodTracking
} from '../controllers/moodController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateMood, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Mood logging
router.post('/', validateMood, handleValidationErrors, logMood);

// Get mood entries
router.get('/', getMoodEntries);
router.get('/history', getMoodHistory);
router.get('/trends', getMoodTrends);
router.get('/reports', authorize('admin'), getAdminMoodReports);
router.get('/coach/assigned', authorize('coach', 'admin'), getCoachAssignedYouthMoodTracking);

// Update/Delete mood entry
router.put('/:id', updateMoodEntry);
router.delete('/:id', deleteMoodEntry);

export default router;
