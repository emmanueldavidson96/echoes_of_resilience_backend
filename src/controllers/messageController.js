import Message from '../models/Message.js';
import { sendSuccess, sendError } from '../utils/errorResponse.js';

// Send message from coach to youth
export const sendMessage = async (req, res, next) => {
  try {
    const { recipientId, content, messageType = 'text', relatedEntityType, relatedEntityId } = req.body;
    const senderId = req.userId;

    if (!recipientId || !content) {
      return sendError(res, 400, 'Recipient ID and content are required');
    }

    const message = new Message({
      senderId,
      recipientId,
      content,
      messageType,
      relatedEntityType,
      relatedEntityId
    });

    await message.save();
    await message.populate('senderId', 'firstName lastName');

    return sendSuccess(res, 201, 'Message sent successfully', message);
  } catch (err) {
    console.error('Error sending message:', err);
    return sendError(res, 500, 'Failed to send message', err);
  }
};

// Get messages for current user (as recipient)
export const getMessages = async (req, res, next) => {
  try {
    const recipientId = req.userId;
    const { isRead } = req.query;

    let query = { recipientId };
    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    const messages = await Message.find(query)
      .populate('senderId', 'firstName lastName email role')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Messages retrieved successfully', messages);
  } catch (err) {
    console.error('Error getting messages:', err);
    return sendError(res, 500, 'Failed to retrieve messages', err);
  }
};

// Get messages sent by current user
export const getSentMessages = async (req, res, next) => {
  try {
    const senderId = req.userId;

    const messages = await Message.find({ senderId })
      .populate('recipientId', 'firstName lastName email role')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Sent messages retrieved successfully', messages);
  } catch (err) {
    console.error('Error getting sent messages:', err);
    return sendError(res, 500, 'Failed to retrieve sent messages', err);
  }
};

// Mark message as read
export const markMessageAsRead = async (req, res, next) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByIdAndUpdate(
      messageId,
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!message) {
      return sendError(res, 404, 'Message not found');
    }

    return sendSuccess(res, 200, 'Message marked as read', message);
  } catch (err) {
    console.error('Error marking message as read:', err);
    return sendError(res, 500, 'Failed to mark message as read', err);
  }
};

// Get unread message count
export const getUnreadMessageCount = async (req, res, next) => {
  try {
    const recipientId = req.userId;

    const count = await Message.countDocuments({
      recipientId,
      isRead: false
    });

    return sendSuccess(res, 200, 'Unread count retrieved', { unreadCount: count });
  } catch (err) {
    console.error('Error getting unread count:', err);
    return sendError(res, 500, 'Failed to get unread count', err);
  }
};

// Delete message
export const deleteMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;

    const message = await Message.findById(messageId);
    if (!message) {
      return sendError(res, 404, 'Message not found');
    }

    // Only sender or recipient can delete
    if (message.senderId.toString() !== userId && message.recipientId.toString() !== userId) {
      return sendError(res, 403, 'Not authorized to delete this message');
    }

    await Message.findByIdAndDelete(messageId);
    return sendSuccess(res, 200, 'Message deleted successfully');
  } catch (err) {
    console.error('Error deleting message:', err);
    return sendError(res, 500, 'Failed to delete message', err);
  }
};
