import { body, validationResult } from 'express-validator';

export const validateRegister = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['youth', 'parent', 'coach', 'clinician', 'admin']).withMessage('Valid role is required'),
  body('dateOfBirth').if((value) => value !== undefined).isISO8601().withMessage('Valid date of birth is required'),
];

export const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const validateForgotPassword = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
];

export const validateResetPassword = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const validateMission = [
  body('title').trim().notEmpty().withMessage('Mission title is required'),
  body('description').trim().notEmpty().withMessage('Mission description is required'),
  body('difficulty').isIn(['easy', 'medium', 'hard']).withMessage('Valid difficulty is required'),
  body('category').isIn(['emotional-awareness', 'social-skills', 'stress-management', 'resilience', 'mindfulness', 'creativity']).withMessage('Valid category is required'),
];

export const validateJournal = [
  body('title').trim().notEmpty().withMessage('Journal title is required'),
  body('content').trim().notEmpty().withMessage('Journal content is required'),
  body('mood').isIn(['very-sad', 'sad', 'neutral', 'happy', 'very-happy']).withMessage('Valid mood is required'),
];

export const validateMood = [
  body('mood').isIn(['very-sad', 'sad', 'neutral', 'happy', 'very-happy']).withMessage('Valid mood is required'),
  body('intensity').isInt({ min: 1, max: 10 }).withMessage('Intensity must be between 1 and 10'),
];

export const validateAssessment = [
  body('type')
    .optional()
    .custom((value, { req }) => {
      const typeFromParam = req.params?.type;
      const finalType = value || typeFromParam;
      if (!['PHQ9', 'GAD7', 'mood-quick'].includes(finalType)) {
        throw new Error('Valid assessment type is required');
      }
      // Normalize back onto the body so downstream code can rely on it
      req.body.type = finalType;
      return true;
    }),
  body('responses').isArray().withMessage('Responses must be an array'),
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};
