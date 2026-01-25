import express from 'express';
import {
  getAllAlerts,
  getAlertDetails,
  updateAlertStatus,
  addAlertNotes,
  getYouthAlerts,
  getAlertsSummary,
  assignAlert
} from '../controllers/alertController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.use(protect);

// Clinician/Admin routes
router.get('/', authorize('clinician', 'admin'), getAllAlerts);
router.get('/summary', authorize('clinician', 'admin'), getAlertsSummary);
router.get('/:id', authorize('clinician', 'admin'), getAlertDetails);
router.put('/:id/status', authorize('clinician', 'admin'), updateAlertStatus);
router.post('/:id/notes', authorize('clinician', 'admin'), addAlertNotes);
router.post('/:id/assign', authorize('admin'), assignAlert);

// Youth/Parent/Coach - view own alerts
router.get('/youth/:userId', getYouthAlerts);

export default router;
