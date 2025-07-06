/**
 * Types for the Mood module
 * Centralizes all mood-related type definitions
 */

export type MoodLevel = 'excelente' | 'bem' | 'neutro' | 'mal' | 'pessimo';
export type MoodPeriod = 'manha' | 'tarde' | 'noite';

export interface MoodEntry {
  id: string;
  mood: MoodLevel;
  period: MoodPeriod;
  date: string; // YYYY-MM-DD format
  timestamp: number;
  notes?: string;
  activities?: string[];
  emotions?: string[];
}

export interface MoodResponse {
  success: boolean;
  message?: string;
  data?: MoodEntry;
}

export interface MoodOption {
  id: MoodLevel;
  label: string;
  emoji: string;
  color: string;
  description: string;
  bgGradient?: string[];
}

export interface MoodStats {
  averageMood: number;
  totalEntries: number;
  moodDistribution: Record<MoodLevel, number>;
  streak: number;
  lastEntry?: MoodEntry;
}

export interface WellnessTipData {
  icon: string;
  text: string;
  subtext: string;
  period: MoodPeriod;
}

export interface CelebrationConfig {
  mood: 'positive' | 'neutral' | 'negative';
  emojis: string[];
  particleCount: number;
  duration: number;
  colors?: string[];
}

export interface MoodSelectorProps {
  onMoodSelect?: (mood: MoodLevel) => void;
  disabled?: boolean;
  compact?: boolean;
}

export interface MoodSummaryProps {
  compact?: boolean;
  showTitle?: boolean;
  period?: 'week' | 'month' | 'year';
  style?: any;
}

export interface UseMoodReturn {
  currentPeriod: MoodPeriod;
  hasAnsweredToday: boolean;
  isLoading: boolean;
  error: string | null;
  todayEntries: MoodEntry[];
  recentStats: {
    averageMood: number;
    totalEntries: number;
    moodDistribution: Record<MoodLevel, number>;
  } | null;
  submitMood: (mood: MoodLevel) => Promise<MoodResponse>;
  getMoodEntries: () => Promise<MoodEntry[]>;
  getMoodStats: (days?: number) => Promise<MoodStats>;
  resetTodayResponse: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

export interface WellnessTip {
  icon: string;
  text: string;
  subtext: string;
}
