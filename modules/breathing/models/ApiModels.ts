// Enhanced models for API integration
export interface BreathingTechniqueAPI {
  id: string;
  key: string;
  title: string;
  description: string;
  category: 'relaxation' | 'focus' | 'energy' | 'sleep' | 'emergency';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timing: {
    inhaleTime: number;
    holdTime: number;
    exhaleTime: number;
    pauseTime?: number;
  };
  cycles: number;
  estimatedDuration: number; // em segundos
  benefits: string[];
  instructions: string[];
  prerequisites?: string[];
  contraindications?: string[];
  media: {
    icon: {
      name: string;
      color: string;
      bg: string;
    };
    animation?: string;
    audio?: string;
    backgroundImage?: string;
  };
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    isActive: boolean;
    isPremium: boolean;
    tags: string[];
  };
}

export interface BreathingSessionAPI {
  id: string;
  userId: string;
  techniqueId: string;
  startTime: string;
  endTime?: string;
  status: 'started' | 'completed' | 'interrupted' | 'paused';
  progress: {
    completedCycles: number;
    totalCycles: number;
    currentPhase: 'inhale' | 'hold' | 'exhale' | 'pause';
    elapsedTime: number; // em segundos
    remainingTime: number; // em segundos
  };
  quality?: {
    rating: number; // 1-5
    feedback?: string;
    difficultyRating?: number; // 1-5
    wouldRecommend?: boolean;
  };
  vitals?: {
    heartRateBefore?: number;
    heartRateAfter?: number;
    stressLevel?: number; // 1-10
  };
  settings: {
    hapticEnabled: boolean;
    audioEnabled: boolean;
    visualStyle: 'default' | 'minimal' | 'nature' | 'abstract';
    animationSpeed: number; // 0.5-2.0
  };
  environment: {
    deviceType: 'phone' | 'tablet' | 'watch';
    appVersion: string;
    location?: {
      latitude: number;
      longitude: number;
      timezone: string;
    };
    ambient?: {
      noise_level?: number;
      lighting?: 'bright' | 'dim' | 'dark';
      temperature?: number;
    };
  };
  notes?: string;
}

export interface BreathingStatsAPI {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  favoriteCategory: string;
  favoriteTechnique: string;
  averageRating: number;
  completionRate: number; // percentage
  weeklyGoal: number;
  weeklyProgress: number;
  monthlyStats: {
    sessions: number;
    minutes: number;
    averageRating: number;
  };
  achievements: Achievement[];
  trends: {
    sessionsOverTime: { date: string; count: number }[];
    averageRatingOverTime: { date: string; rating: number }[];
    favoriteTimeOfDay: string;
    improvementMetrics: {
      stressReduction: number;
      focusImprovement: number;
      sleepQuality: number;
    };
  };
}

export interface Achievement {
  id: string;
  type: 'streak' | 'sessions' | 'time' | 'technique' | 'quality';
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress: number; // 0-100
  target: number;
  category: string;
}

export interface UserPreferencesAPI {
  defaultTechniqueId?: string;
  reminderSettings: {
    enabled: boolean;
    times: string[]; // HH:MM format
    frequency: 'daily' | 'weekdays' | 'weekends' | 'custom';
    customDays?: number[]; // 0-6, Sunday to Saturday
  };
  sessionSettings: {
    defaultDuration: number;
    autoStart: boolean;
    showProgress: boolean;
    hapticEnabled: boolean;
    audioEnabled: boolean;
    visualStyle: string;
  };
  goals: {
    weeklyMinutes: number;
    weeklyDays: number;
    streakTarget: number;
  };
  privacy: {
    shareStats: boolean;
    anonymousAnalytics: boolean;
    locationTracking: boolean;
  };
}

export interface CustomTechniqueAPI {
  name: string;
  description: string;
  timing: {
    inhaleTime: number;
    holdTime: number;
    exhaleTime: number;
    pauseTime?: number;
  };
  cycles: number;
  category: string;
  isPublic: boolean;
  basedOnTechniqueId?: string;
}

// API Response wrappers
export interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  status: 'success' | 'error';
  message?: string;
}

// Filters and queries
export interface TechniqueFilters {
  category?: string[];
  difficulty?: string[];
  duration?: { min: number; max: number };
  isPremium?: boolean;
  tags?: string[];
  search?: string;
}

export interface SessionFilters {
  dateRange?: { start: string; end: string };
  techniqueId?: string;
  status?: string[];
  minRating?: number;
  limit?: number;
  offset?: number;
}

// Error types
export interface BreathingApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export type BreathingErrorType = 
  | 'NETWORK_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR'
  | 'NOT_FOUND'
  | 'RATE_LIMIT'
  | 'UNKNOWN_ERROR';
