// Enhanced Types for Journal Module - Aligned with Backend
// Version 2.0 - Production Ready with full API consistency

// Core Mood Tag Interface
export interface MoodTag {
  id: string;
  label: string;
  emoji: string;
  category: 'positive' | 'negative' | 'neutral';
  intensity: 1 | 2 | 3 | 4 | 5;
  hexColor: string;
}

// Enhanced Journal Prompt Interface
export interface JournalPrompt {
  id: string;
  question: string;
  category: string;
  icon: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  estimatedTime?: number;       // em minutos
  isPersonalized?: boolean;     // Para prompts gerados por IA
  type?: 'standard' | 'guided' | 'creative' | 'therapeutic';
}

// Main Journal Entry Interface - Aligned with Backend 'content' field
export interface JournalEntry {
  id: string;
  content: string;              // ✅ Renamed from 'text' to match backend
  selectedPrompt?: JournalPrompt;  // ✅ Object instead of string
  promptCategory: string;
  moodTags: MoodTag[];          // ✅ Structured objects instead of strings
  createdAt: string;            // ✅ ISO string format (renamed from 'date')
  updatedAt?: string;
  wordCount: number;
  readingTimeMinutes?: number;  // ✅ Renamed for clarity
  isFavorite?: boolean;
  sentimentScore?: number;      // ✅ For analytics (-1 to 1)
  privacy: 'private' | 'shared' | 'anonymous';
  
  // Metadata for enhanced tracking
  metadata?: {
    deviceType?: string;
    timezone?: string;
    writingDuration?: number;   // em segundos
    revisionCount?: number;
  };
}

// Enhanced Journal Statistics
export interface JournalStats {
  totalEntries: number;
  uniqueDays: number;
  percentPositive: number;
  averageWordsPerEntry?: number;
  currentStreak?: number;
  longestStreak?: number;
  favoriteCategories?: { category: string; count: number }[];
  moodDistribution?: { mood: string; percentage: number }[];
}

// Search and Filter Types
export interface JournalEntryFilters {
  dateRange?: { start: string; end: string };
  categories?: string[];
  moodTags?: string[];
  searchQuery?: string;
}

// User Preferences
export interface JournalPreferences {
  defaultCategory?: string;
  reminderEnabled: boolean;
  reminderTime?: string;
  privateByDefault: boolean;
  autoSaveDrafts: boolean;
}

// Draft Entry for Auto-save
export interface JournalDraft {
  id: string;
  content: string;
  promptId?: string;
  moodTags: MoodTag[];
  lastSaved: string;
}

// Analytics Types
export interface MoodTrend {
  date: string;
  averageMood: number;
  dominantMood: string;
  entryCount: number;
}

export interface PersonalInsight {
  type: 'pattern' | 'growth' | 'milestone' | 'suggestion';
  title: string;
  description: string;
  recommendation?: string;
  confidence: number;
  relatedEntries?: string[];
}

// Achievement System Types
export interface JournalAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'consistency' | 'depth' | 'reflection' | 'milestone';
  requirement: {
    type: 'entries_count' | 'streak_days' | 'word_count' | 'mood_improvement';
    target: number;
    current?: number;
  };
  reward: {
    points: number;
    badge: string;
    title?: string;
  };
  unlocked?: boolean;
  unlockedAt?: string;
}

// Crisis Detection Types
export interface CrisisFlag {
  type: 'self_harm' | 'suicidal_ideation' | 'severe_depression' | 'panic' | 'substance_abuse';
  severity: 'low' | 'medium' | 'high' | 'critical';
  context: string;
  suggestion: string;
}

export interface CrisisAssessment {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number; // 0-1
  triggerFactors: string[];
  recommendations: string[];
  shouldNotifySupport: boolean;
  supportResources: SupportResource[];
}

export interface SupportResource {
  type: 'emergency' | 'professional' | 'community' | 'selfcare';
  title: string;
  subtitle: string;
  phone?: string;
  action?: string;
  description: string;
}

// AI Features Types
export interface SentimentAnalysis {
  sentimentScore: number; // -1 to 1
  emotions: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
    confidence: number;
  };
  keywords: string[];
  suggestedMoodTags: MoodTag[];
  insights: string[];
  warningFlags?: CrisisFlag[];
}

// Export Service Types
export interface ExportOptions {
  dateRange?: { start: string; end: string };
  includeStats?: boolean;
  includeMoodTags?: boolean;
  format: 'pdf' | 'text' | 'json';
  includePrivate?: boolean;
}
