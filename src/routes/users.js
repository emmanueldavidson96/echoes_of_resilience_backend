import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getUserById,
  deleteUserAccount,
  getUserCoaches,
  getAllUsers,
  getAllCoaches,
  searchUsers,
  deactivateUser,
  activateUser,
  claimDailyReward,
  deleteUserByAdmin,
  addYouthToCoach,
  removeYouthFromCoach,
  addYouthToParent,
  getYouthMissions,
  getYouthJournals,
  getYouthMoods,
  getYouthActiveMissions,
  getYouthProfileDetails,
  getAdminUsers,
  getCoachProfileDetails,
  getAllYouthUsers
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// User profile routes
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.delete('/account', deleteUserAccount);

// Admin listing for coach/admin/parent/clinician messaging
router.get('/admins', authorize('coach', 'admin', 'parent', 'clinician'), getAdminUsers);
router.get('/youth/list/all', authorize('admin', 'clinician'), getAllYouthUsers);

// Parent management routes (admin)
router.put('/parents/:parentId/add-youth', authorize('admin'), addYouthToParent);

// Coach profile details (admin)
router.get('/coaches/:coachId/details', authorize('admin'), getCoachProfileDetails);

// Daily reward
router.post('/youth/claim-daily-reward', claimDailyReward);

// Get specific user
router.get('/:id', getUserById);

// Youth-specific data (for coaches viewing assigned youth)
router.get('/:youthId/missions', authorize('coach', 'admin', 'clinician'), getYouthMissions);
router.get('/:youthId/journals', authorize('coach', 'admin', 'clinician'), getYouthJournals);
router.get('/:youthId/moods', authorize('coach', 'admin', 'clinician'), getYouthMoods);
router.get('/:youthId/active-missions', authorize('coach', 'admin', 'clinician'), getYouthActiveMissions);
router.get('/:youthId/youth-profile', authorize('coach', 'admin', 'clinician'), getYouthProfileDetails);

// Youth-specific
router.get('/:userId/coaches', getUserCoaches);

// Coach management routes
router.get('/coaches/list/all', getAllCoaches);
router.put('/coaches/:coachId/add-youth', addYouthToCoach);
router.put('/coaches/:coachId/remove-youth', removeYouthFromCoach);

// Admin routes
router.get('/', authorize('admin'), getAllUsers);
router.get('/search', searchUsers);
router.put('/:userId/deactivate', authorize('admin'), deactivateUser);
router.put('/:userId/activate', authorize('admin'), activateUser);
router.delete('/:userId', authorize('admin'), deleteUserByAdmin);

export default router;
