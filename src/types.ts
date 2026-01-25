/**
 * TypeScript type definitions for Echoes of Resilience Backend
 * These types can be used by both frontend and backend for better type safety
 */

// User Types
export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  avatar?: string;
  role: 'youth' | 'parent' | 'coach' | 'clinician' | 'admin';
  dateOfBirth?: Date;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Youth Profile
export interface IYouthProfile {
  _id: string;
  userId: string;
  gradeLevel: 'elementary' | 'middle' | 'high' | 'college' | 'adult';
  school?: string;
  parentId?: string;
  coachId?: string;
  clinicianId?: string;
  interests: string[];
  emotionalStrengths: string[];
  areasForGrowth: string[];
  completedMissions: ICompletedMission[];
  totalPoints: number;
  level: number;
  streaks: {
    moodTracking: number;
    journaling: number;
  };
  badges: IBadge[];
}

export interface ICompletedMission {
  missionId: string;
  completedAt: Date;
  score: number;
}

export interface IBadge {
  badgeId: string;
  unlockedAt: Date;
}

// Mission
export interface IMission {
  _id: string;
  title: string;
  description: string;
  objectives: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'emotional-awareness' | 'social-skills' | 'stress-management' | 'resilience' | 'mindfulness' | 'creativity';
  rewards: {
    points: number;
    badges: string[];
  };
  targetAgeGroup: string[];
  duration: number;
  durationUnit: 'minutes' | 'hours' | 'days';
  createdBy: string;
  isActive: boolean;
  completions: number;
  rating: {
    average: number;
    count: number;
  };
  tags: string[];
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Journal
export interface IJournal {
  _id: string;
  userId: string;
  title: string;
  content: string;
  mood: 'very-sad' | 'sad' | 'neutral' | 'happy' | 'very-happy';
  emotionTags: string[];
  isPrivate: boolean;
  reflectionPrompt?: string;
  gratitudeItems: string[];
  reviewedByCoach: boolean;
  coachFeedback?: {
    coachId: string;
    feedback: string;
    feedbackDate: Date;
  };
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Mood Entry
export interface IMoodEntry {
  _id: string;
  userId: string;
  mood: 'very-sad' | 'sad' | 'neutral' | 'happy' | 'very-happy';
  intensity: number; // 1-10
  emotions: string[];
  triggers: string[];
  activities: string[];
  location?: string;
  socialContext: 'alone' | 'with-family' | 'with-friends' | 'at-school' | 'at-work' | 'in-group';
  notes?: string;
  physicalSensations: string[];
  copingStrategies: string[];
  isHelpful?: boolean;
  createdAt: Date;
}

// Assessment
export interface IAssessment {
  _id: string;
  userId: string;
  type: 'PHQ9' | 'GAD7' | 'mood-quick';
  responses: IAssessmentResponse[];
  totalScore: number;
  severity: 'none' | 'mild' | 'moderate' | 'moderately-severe' | 'severe';
  interpretation?: string;
  recommendations: string[];
  flaggedForReview: boolean;
  reviewedBy?: {
    clinicianId: string;
    reviewDate: Date;
    notes: string;
  };
  followUpRequired: boolean;
  createdAt: Date;
  completedAt: Date;
}

export interface IAssessmentResponse {
  questionId: string;
  answer: any;
  score: number;
}

// Alert
export interface IAlert {
  _id: string;
  youthId: string;
  type: 'high-anxiety' | 'depression-indicators' | 'self-harm-mention' | 'concerning-pattern' | 'missing-engagement' | 'critical-alert';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: 'assessment' | 'journal' | 'mood-trend' | 'clinician-flagged' | 'system-automated';
  triggerId?: string;
  description?: string;
  details?: any;
  status: 'active' | 'acknowledged' | 'resolved' | 'false-positive';
  assignedTo?: string;
  actionsTaken: IAlertAction[];
  followUpRequired: boolean;
  followUpDate?: Date;
  createdAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
}

export interface IAlertAction {
  action: string;
  takenBy: string;
  timestamp: Date;
  notes: string;
}

// API Response Types
export interface IApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors?: any[];
}

export interface IPaginatedResponse<T> {
  items: T[];
  total: number;
  currentPage: number;
  totalPages: number;
}

// Auth Types
export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'youth' | 'parent' | 'coach' | 'clinician' | 'admin';
  dateOfBirth?: Date;
}

export interface IAuthResponse {
  token: string;
  user: IUser;
}

// Dashboard Types
export interface IYouthDashboardData {
  user: IUser;
  youthProfile: IYouthProfile;
  recentMissions: IMission[];
  completedToday: number;
  moodToday?: IMoodEntry;
  streaks: {
    moodTracking: number;
    journaling: number;
  };
  upcomingMissions: IMission[];
  topBadges: IBadge[];
}

export interface ICoachDashboardData {
  assignedYouth: IUser[];
  totalMissions: number;
  pendingReviews: IJournal[];
  alerts: IAlert[];
  upcomingSchedule: any[];
}

export interface IClinicianDashboardData {
  activeAlerts: IAlert[];
  criticalAlerts: IAlert[];
  pendingReviews: IAssessment[];
  youthUnderCare: IUser[];
  alertsSummary: {
    total: number;
    critical: number;
    high: number;
    byType: Record<string, number>;
  };
}

export interface IAdminDashboardData {
  totalUsers: number;
  usersByRole: Record<string, number>;
  totalMissions: number;
  totalAlerts: number;
  criticalAlerts: number;
  systemHealth: {
    database: string;
    server: string;
    memory: number;
  };
}
