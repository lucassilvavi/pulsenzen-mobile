// Types for Profile module
export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  avatar?: string;
  sex?: string;
  age?: number;
  dateOfBirth?: string; // Add dateOfBirth field
  goals?: string[];
  experience?: string;
  joinDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserStats {
  streakDays: number;
  completedSessions: number;
  totalMinutes: number;
  totalJournalEntries?: number;
  totalMoodEntries?: number;
  lastActivity?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  isLocked: boolean;
  condition: {
    type: 'streak' | 'sessions' | 'minutes' | 'journals' | 'moods';
    target: number;
  };
}

export interface UserSettings {
  notifications: {
    enabled: boolean;
    reminders: boolean;
    achievements: boolean;
    dailyGoals: boolean;
  };
  privacy: {
    shareStats: boolean;
    anonymousData: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
  };
}

export interface ProfileState {
  profile: UserProfile | null;
  stats: UserStats | null;
  achievements: Achievement[];
  settings: UserSettings | null;
  isLoading: boolean;
  error: string | null;
}
