import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  assignMissionToYouth,
  getYouthAssignedMissions,
  getActiveAssignedMissions,
  updateMissionAssignmentStatus,
  getCoachAssignedMissions,
  deleteMissionAssignment
} from '../controllers/missionAssignmentController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Assign mission to youth (coach endpoint)
router.post('/', assignMissionToYouth);

// Get active assigned missions for current user (youth endpoint)
router.get('/active/mine', getActiveAssignedMissions);

// Get missions assigned by current coach
router.get('/coach/assigned', getCoachAssignedMissions);

// Get all assignments for a specific youth
router.get('/youth/:youthId', getYouthAssignedMissions);

// Update mission assignment status
router.put('/:assignmentId', updateMissionAssignmentStatus);

// Delete mission assignment
router.delete('/:assignmentId', deleteMissionAssignment);

export default router;
