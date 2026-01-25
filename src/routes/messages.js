import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  sendMessage,
  getMessages,
  getSentMessages,
  markMessageAsRead,
  getUnreadMessageCount,
  deleteMessage
} from '../controllers/messageController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Send message
router.post('/', sendMessage);

// Get messages for current user
router.get('/', getMessages);

// Get messages sent by current user
router.get('/sent', getSentMessages);

// Get unread message count
router.get('/unread/count', getUnreadMessageCount);

// Mark message as read
router.put('/:messageId/read', markMessageAsRead);

// Delete message
router.delete('/:messageId', deleteMessage);

export default router;
