import express from 'express';
import {
  getUserJournals,
  createJournal,
  getJournalById,
  updateJournal,
  deleteJournal,
  addCoachFeedback,
  searchJournals,
  getJournalAuditEntries
} from '../controllers/journalController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateJournal, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get user's journals
router.get('/', getUserJournals);
router.get('/search', searchJournals);
router.get('/audit', authorize('admin'), getJournalAuditEntries);

// Create journal
router.post('/', validateJournal, handleValidationErrors, createJournal);

// Get/Update/Delete specific journal
router.get('/:id', getJournalById);
router.put('/:id', updateJournal);
router.delete('/:id', deleteJournal);

// Coach feedback
router.post('/:id/feedback', authorize('coach', 'admin'), addCoachFeedback);

export default router;
