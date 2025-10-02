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
  serverSynced?: boolean; // Indica se foi sincronizado com o servidor
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

export interface LoadingStates {
  initializing: boolean;
  submittingMood: boolean;
  loadingEntries: boolean;
  loadingStats: boolean;
  syncing: boolean;
  refreshing: boolean;
  bulkDeleting: boolean;
  exporting: boolean;
  filtering: boolean;
}

export interface ErrorStates {
  network: string | null;
  validation: string | null;
  server: string | null;
  general: string | null;
}

export interface SyncStatusUI {
  isOnline: boolean;
  lastSync: number | null;
  hasPendingOperations: boolean;
  isSyncing: boolean;
}

export interface UseMoodReturn {
  // Estados principais (compatibilidade)
  currentPeriod: MoodPeriod;
  hasAnsweredCurrentPeriod: boolean;
  isLoading: boolean;
  error: string | null;
  todayEntries: MoodEntry[];
  recentStats: {
    averageMood: number;
    totalEntries: number;
    moodDistribution: Record<MoodLevel, number>;
  } | null;
  
  // Estados avançados
  loadingStates: LoadingStates;
  errorStates: ErrorStates;
  syncStatus: SyncStatusUI;
  
  // Métodos principais
  submitMood: (mood: MoodLevel, additionalData?: Partial<MoodEntry>) => Promise<MoodResponse>;
  getMoodEntries: () => Promise<MoodEntry[]>;
  getMoodStats: (days?: number) => Promise<MoodStats>;
  resetCurrentPeriodResponse: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  
  // Métodos avançados
  clearErrors: () => void;
  initializeAutoSync: () => Promise<void>;
  checkCurrentPeriodResponse: () => Promise<boolean>;
  
  // Novos métodos - Item 11.2 Features Avançadas
  bulkDeleteEntries: (entryIds: string[]) => Promise<{
    success: number;
    failed: number;
    errors: string[];
  }>;
  exportMoodData: (options: {
    format: 'csv' | 'json';
    dateRange?: {
      startDate: string;
      endDate: string;
    };
    includeStats?: boolean;
  }) => Promise<{
    success: boolean;
    data?: string;
    filename?: string;
    message?: string;
  }>;
  getFilteredEntries: (filters: {
    moodLevels?: MoodLevel[];
    periods?: ('manha' | 'tarde' | 'noite')[];
    dateRange?: {
      startDate: string;
      endDate: string;
    };
    hasNotes?: boolean;
    hasActivities?: boolean;
    activities?: string[];
  }) => Promise<MoodEntry[]>;
  invalidateCache: (cacheKeys: string[]) => Promise<void>;
  refreshData: () => Promise<void>;
}

export interface WellnessTip {
  icon: string;
  text: string;
  subtext: string;
}
