import Journal from '../models/Journal.js';
import Alert from '../models/Alert.js';
import { sendSuccess, sendError } from '../utils/errorResponse.js';

const RISK_KEYWORDS = [
  'suicide',
  'kill myself',
  'self harm',
  'self-harm',
  'die',
  'dying',
  'poison',
  'end it all',
  'hurt myself',
  'cut myself',
  'hopeless',
  'worthless'
];

const findRiskKeywords = (text = '') => {
  const normalized = text.toLowerCase();
  return RISK_KEYWORDS.filter((kw) => normalized.includes(kw));
};

const ensureJournalAlert = async ({ journal, keywords }) => {
  if (!keywords.length) return;

  const existing = await Alert.findOne({ triggerId: journal._id, triggerModel: 'Journal' });
  if (existing) return;

  await Alert.create({
    youthId: journal.userId,
    type: 'self-harm-mention',
    severity: keywords.some((kw) => ['suicide', 'kill myself', 'end it all', 'hurt myself', 'cut myself'].includes(kw))
      ? 'critical'
      : 'high',
    source: 'journal',
    triggerId: journal._id,
    triggerModel: 'Journal',
    description: 'Concerning language detected in journal entry',
    details: {
      keywords
    }
  });
};

// Get all journals for user
export const getUserJournals = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const journals = await Journal.find({ userId: req.userId })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Journal.countDocuments({ userId: req.userId });

    sendSuccess(res, 200, 'Journals retrieved successfully', {
      journals,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    next(error);
  }
};

// Create journal entry
export const createJournal = async (req, res, next) => {
  try {
    const { title, content, mood, emotionTags, reflectionPrompt, gratitudeItems, tags, isPrivate } = req.body;

    const journal = await Journal.create({
      userId: req.userId,
      title,
      content,
      mood,
      emotionTags,
      reflectionPrompt,
      gratitudeItems,
      tags,
      isPrivate
    });

    const keywords = findRiskKeywords(`${title || ''} ${content || ''}`);
    await ensureJournalAlert({ journal, keywords });

    sendSuccess(res, 201, 'Journal entry created successfully', journal);
  } catch (error) {
    next(error);
  }
};

// Get journal by ID
export const getJournalById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const journal = await Journal.findById(id);

    if (!journal) {
      return sendError(res, 404, 'Journal not found');
    }

    // Check authorization
    if (journal.userId.toString() !== req.userId && req.userRole !== 'coach' && req.userRole !== 'clinician' && req.userRole !== 'admin') {
      return sendError(res, 403, 'Not authorized to view this journal');
    }

    sendSuccess(res, 200, 'Journal retrieved successfully', journal);
  } catch (error) {
    next(error);
  }
};

// Update journal entry
export const updateJournal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, mood, emotionTags, reflectionPrompt, gratitudeItems, tags, isPrivate } = req.body;

    let journal = await Journal.findById(id);

    if (!journal) {
      return sendError(res, 404, 'Journal not found');
    }

    // Check authorization
    if (journal.userId.toString() !== req.userId) {
      return sendError(res, 403, 'Not authorized to update this journal');
    }

    journal = await Journal.findByIdAndUpdate(
      id,
      { title, content, mood, emotionTags, reflectionPrompt, gratitudeItems, tags, isPrivate },
      { new: true, runValidators: true }
    );

    const keywords = findRiskKeywords(`${title || journal.title || ''} ${content || journal.content || ''}`);
    await ensureJournalAlert({ journal, keywords });

    sendSuccess(res, 200, 'Journal updated successfully', journal);
  } catch (error) {
    next(error);
  }
};

// Delete journal entry
export const deleteJournal = async (req, res, next) => {
  try {
    const { id } = req.params;

    const journal = await Journal.findById(id);

    if (!journal) {
      return sendError(res, 404, 'Journal not found');
    }

    // Check authorization
    if (journal.userId.toString() !== req.userId) {
      return sendError(res, 403, 'Not authorized to delete this journal');
    }

    await Journal.findByIdAndDelete(id);

    sendSuccess(res, 200, 'Journal deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

// Add coach feedback
export const addCoachFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;

    let journal = await Journal.findById(id);

    if (!journal) {
      return sendError(res, 404, 'Journal not found');
    }

    // Check if user is coach
    if (req.userRole !== 'coach' && req.userRole !== 'admin') {
      return sendError(res, 403, 'Not authorized to add feedback');
    }

    journal.coachFeedback = {
      coachId: req.userId,
      feedback,
      feedbackDate: new Date()
    };
    journal.reviewedByCoach = true;

    await journal.save();

    sendSuccess(res, 200, 'Coach feedback added successfully', journal);
  } catch (error) {
    next(error);
  }
};

// Search journals
export const searchJournals = async (req, res, next) => {
  try {
    const { query } = req.query;

    const journals = await Journal.find({
      userId: req.userId,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    }).sort({ createdAt: -1 }).limit(20);

    sendSuccess(res, 200, 'Journals found successfully', journals);
  } catch (error) {
    next(error);
  }
};

// Admin journal audit (troublesome entries via alerts)
export const getJournalAuditEntries = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const riskyKeywords = [
      'suicide',
      'kill myself',
      'self harm',
      'self-harm',
      'die',
      'dying',
      'poison',
      'end it all',
      'hurt myself',
      'cut myself',
      'hopeless',
      'worthless'
    ];

    const keywordRegexes = riskyKeywords.map((kw) => new RegExp(kw, 'i'));

    const query = {
      $or: [
        { title: { $in: keywordRegexes } },
        { content: { $in: keywordRegexes } },
        { tags: { $in: keywordRegexes } },
        { emotionTags: { $in: keywordRegexes } }
      ]
    };

    const journals = await Journal.find(query)
      .populate('userId', 'firstName lastName email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Journal.countDocuments(query);

    const entries = journals.map((journal) => {
      const text = `${journal.title || ''} ${journal.content || ''}`.toLowerCase();
      const matchedKeywords = riskyKeywords.filter((kw) => text.includes(kw));
      return {
        _id: journal._id,
        title: journal.title,
        content: journal.content,
        mood: journal.mood,
        emotionTags: journal.emotionTags || [],
        tags: journal.tags || [],
        createdAt: journal.createdAt,
        userId: journal.userId,
        flagged: true,
        keywords: matchedKeywords
      };
    });

    sendSuccess(res, 200, 'Journal audit entries retrieved successfully', {
      entries,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    next(error);
  }
};
