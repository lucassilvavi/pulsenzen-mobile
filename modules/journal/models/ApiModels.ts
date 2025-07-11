// Enhanced models for Journal API integration
export interface JournalPromptAPI {
  id: string;
  question: string;
  category: string;
  subcategory?: string;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'standard' | 'guided' | 'creative' | 'therapeutic';
  estimatedTime: number; // em minutos
  benefits: string[];
  instructions?: string[];
  tags: string[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    isActive: boolean;
    isPremium: boolean;
    language: string;
    popularity: number; // score 0-100
  };
  translations?: {
    [language: string]: {
      question: string;
      category: string;
      benefits: string[];
      instructions?: string[];
    };
  };
}

export interface MoodTagAPI {
  id: string;
  emoji: string;
  label: string;
  value: string;
  color: string;
  category: 'positive' | 'negative' | 'neutral';
  intensity: 1 | 2 | 3 | 4 | 5;
  metadata: {
    culturalContext?: string;
    ageGroup?: string;
    description?: string;
  };
}

export interface JournalEntryAPI {
  id: string;
  userId: string;
  title?: string;
  content: string;
  promptId?: string;
  customPrompt?: string;
  moodTags: MoodTagAPI[];
  category: string;
  subcategory?: string;
  wordCount: number;
  characterCount: number;
  readingTime: number; // em segundos
  sentiment?: {
    score: number; // -1 to 1
    label: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
    confidence: number; // 0 to 1
  };
  emotions?: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
    disgust: number;
  };
  keywords: string[];
  themes: string[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    timezone: string;
    deviceType: 'phone' | 'tablet' | 'web';
    appVersion: string;
    location?: {
      city: string;
      country: string;
      latitude?: number;
      longitude?: number;
    };
    weather?: {
      condition: string;
      temperature: number;
      humidity: number;
    };
    writingSession: {
      startTime: string;
      endTime: string;
      pauseCount: number;
      revisionCount: number;
    };
  };
  privacy: {
    level: 'private' | 'shared' | 'public';
    shareableWith?: string[]; // user IDs
    anonymized: boolean;
  };
  attachments?: AttachmentAPI[];
  reminders?: ReminderAPI[];
  goals?: GoalAPI[];
  reflections?: ReflectionAPI[];
}

export interface AttachmentAPI {
  id: string;
  type: 'image' | 'audio' | 'video' | 'document';
  url: string;
  thumbnail?: string;
  size: number;
  mimeType: string;
  caption?: string;
  metadata: {
    uploadedAt: string;
    originalName: string;
    isProcessed: boolean;
  };
}

export interface ReminderAPI {
  id: string;
  entryId: string;
  type: 'review' | 'follow_up' | 'reflection' | 'goal_check';
  scheduledFor: string;
  message: string;
  isCompleted: boolean;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: string;
  };
  metadata: {
    createdAt: string;
    completedAt?: string;
  };
}

export interface GoalAPI {
  id: string;
  title: string;
  description: string;
  category: string;
  targetDate?: string;
  isCompleted: boolean;
  progress: number; // 0-100
  relatedEntries: string[]; // entry IDs
  milestones: MilestoneAPI[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
  };
}

export interface MilestoneAPI {
  id: string;
  title: string;
  targetDate?: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface ReflectionAPI {
  id: string;
  entryId: string;
  type: 'progress' | 'pattern' | 'insight' | 'gratitude';
  content: string;
  insights: string[];
  metadata: {
    createdAt: string;
    isAIGenerated: boolean;
    confidence?: number;
  };
}

export interface JournalAnalyticsAPI {
  userId: string;
  timeframe: {
    start: string;
    end: string;
    period: 'week' | 'month' | 'quarter' | 'year' | 'all_time';
  };
  writingStats: {
    totalEntries: number;
    totalWords: number;
    totalCharacters: number;
    averageWordsPerEntry: number;
    averageEntriesPerDay: number;
    longestEntry: number;
    shortestEntry: number;
    writingStreak: {
      current: number;
      longest: number;
      streakStartDate?: string;
    };
  };
  moodAnalysis: {
    distribution: {
      [moodId: string]: {
        count: number;
        percentage: number;
        trend: 'increasing' | 'decreasing' | 'stable';
      };
    };
    averageSentiment: number;
    moodTrends: MoodTrendAPI[];
    correlations: MoodCorrelationAPI[];
  };
  categoryStats: {
    [category: string]: {
      count: number;
      percentage: number;
      averageWordCount: number;
      averageSentiment: number;
      favoritePrompts: string[];
    };
  };
  temporalPatterns: {
    preferredWritingTimes: { hour: number; count: number }[];
    dayOfWeekDistribution: { day: string; count: number }[];
    seasonalTrends: { season: string; averageMood: number }[];
  };
  insights: InsightAPI[];
  achievements: AchievementAPI[];
  recommendations: RecommendationAPI[];
}

export interface MoodTrendAPI {
  date: string;
  averageMood: number;
  dominantMood: string;
  moodVariability: number;
  entryCount: number;
}

export interface MoodCorrelationAPI {
  factor: string;
  correlation: number;
  significance: number;
  description: string;
}

export interface InsightAPI {
  id: string;
  type: 'pattern' | 'milestone' | 'improvement' | 'suggestion';
  title: string;
  description: string;
  relevance: number; // 0-1
  actionable: boolean;
  relatedEntries?: string[];
  metadata: {
    generatedAt: string;
    algorithm: string;
    confidence: number;
  };
}

export interface AchievementAPI {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'writing' | 'mood' | 'consistency' | 'growth' | 'milestone';
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum';
  progress: number; // 0-100
  isUnlocked: boolean;
  unlockedAt?: string;
  requirements: {
    type: string;
    target: number;
    current: number;
  }[];
}

export interface RecommendationAPI {
  id: string;
  type: 'prompt' | 'goal' | 'reflection' | 'practice';
  title: string;
  description: string;
  reason: string;
  priority: 'low' | 'medium' | 'high';
  estimatedTime: number;
  relatedData?: any;
  metadata: {
    generatedAt: string;
    algorithm: string;
    relevance: number;
  };
}

export interface UserJournalPreferencesAPI {
  userId: string;
  writingPreferences: {
    defaultPromptCategory?: string;
    favoritePrompts: string[];
    customPrompts: CustomPromptAPI[];
    reminderSettings: {
      enabled: boolean;
      frequency: 'daily' | 'weekdays' | 'custom';
      times: string[]; // HH:MM format
      customDays?: number[]; // 0-6
      message?: string;
    };
    privacySettings: {
      defaultPrivacyLevel: 'private' | 'shared' | 'public';
      shareAnalytics: boolean;
      allowAIInsights: boolean;
    };
  };
  displayPreferences: {
    dateFormat: string;
    timeFormat: '12h' | '24h';
    moodDisplayStyle: 'emoji' | 'text' | 'color';
    entryListView: 'compact' | 'detailed' | 'card';
    enableAnimations: boolean;
  };
  goalSettings: {
    weeklyWritingGoal: number; // minutes
    monthlyEntryGoal: number;
    streakTarget: number;
    categories: string[];
  };
  experimentalFeatures: {
    aiSuggestions: boolean;
    moodPrediction: boolean;
    contentAnalysis: boolean;
    socialFeatures: boolean;
  };
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: string;
  };
}

export interface CustomPromptAPI {
  id: string;
  userId: string;
  question: string;
  category: string;
  icon?: string;
  isPublic: boolean;
  usageCount: number;
  rating?: number;
  tags: string[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
  };
}

// API Response wrappers
export interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
  timestamp: string;
  requestId: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  status: 'success' | 'error';
  message?: string;
  timestamp: string;
}

// Filters and queries
export interface JournalEntryFilters {
  dateRange?: { start: string; end: string };
  categories?: string[];
  moodTags?: string[];
  sentimentRange?: { min: number; max: number };
  wordCountRange?: { min: number; max: number };
  hasAttachments?: boolean;
  privacyLevel?: ('private' | 'shared' | 'public')[];
  search?: string;
  sortBy?: 'date' | 'wordCount' | 'sentiment' | 'category';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface PromptFilters {
  categories?: string[];
  difficulty?: ('easy' | 'medium' | 'hard')[];
  type?: ('standard' | 'guided' | 'creative' | 'therapeutic')[];
  estimatedTime?: { min: number; max: number };
  isPremium?: boolean;
  language?: string;
  tags?: string[];
  search?: string;
}

export interface AnalyticsFilters {
  timeframe: 'week' | 'month' | 'quarter' | 'year' | 'all_time';
  includePrivate?: boolean;
  categories?: string[];
  moodFocus?: string[];
}

// Error types
export interface JournalApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  requestId: string;
}

export type JournalErrorType = 
  | 'NETWORK_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMIT'
  | 'SERVER_ERROR'
  | 'STORAGE_FULL'
  | 'CONTENT_FILTERED'
  | 'UNKNOWN_ERROR';

// Sync and offline types
export interface OfflineJournalEntry {
  tempId: string;
  entry: Partial<JournalEntryAPI>;
  action: 'create' | 'update' | 'delete';
  timestamp: string;
  retryCount: number;
}

export interface SyncStatus {
  lastSyncAt: string;
  pendingUploads: number;
  pendingDownloads: number;
  conflictsCount: number;
  isOnline: boolean;
  syncInProgress: boolean;
}
