import express from 'express';
import {
  getAllMissions,
  getMissionById,
  createMission,
  updateMission,
  deleteMission,
  completeMission,
  getMissionLeaderboard,
  searchMissions,
  startMission,
  recordMissionProgress,
  getUserMissionProgress,
  getUserActiveMissions,
  getUserCompletedMissions,
  getUserMissionHistory
} from '../controllers/missionController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateMission, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// ============================================
// PUBLIC ROUTES (no auth required)
// ============================================
router.get('/', getAllMissions);
router.get('/search', searchMissions);

// ============================================
// PROTECTED ROUTES (auth required)
// ============================================
router.use(protect);

// -------- TWO-SEGMENT ROUTES (/:param/action) - MUST BE BEFORE :id routes --------
// User mission queries
router.get('/user/active', authorize('youth'), getUserActiveMissions);
router.get('/user/completed', authorize('youth'), getUserCompletedMissions);
router.get('/user/history', authorize('youth'), getUserMissionHistory);

// Mission progress tracking (these MUST come before /:id routes!)
router.post('/:missionId/start', authorize('youth'), startMission);
router.post('/:missionId/progress', authorize('youth'), recordMissionProgress);
router.get('/:missionId/user-progress', authorize('youth'), getUserMissionProgress);
router.post('/:id/complete', authorize('youth'), completeMission);
router.get('/:id/leaderboard', getMissionLeaderboard);

// -------- ONE-SEGMENT ROUTES (/:id) - AFTER two-segment routes --------
router.post('/', authorize('coach', 'admin'), validateMission, handleValidationErrors, createMission);
router.get('/:id', getMissionById);
router.put('/:id', authorize('coach', 'admin'), updateMission);
router.delete('/:id', authorize('coach', 'admin'), deleteMission);

export default router;
