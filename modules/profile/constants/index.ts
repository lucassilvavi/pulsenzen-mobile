// Profile module constants
import { Achievement } from '../types';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-session',
    title: 'Primeira Sessão',
    description: 'Complete sua primeira sessão de meditação',
    icon: '🏆',
    isLocked: false,
    condition: { type: 'sessions', target: 1 }
  },
  {
    id: 'week-streak',
    title: '7 Dias Seguidos',
    description: 'Mantenha uma sequência de 7 dias',
    icon: '🔥',
    isLocked: false,
    condition: { type: 'streak', target: 7 }
  },
  {
    id: 'month-streak',
    title: '30 Dias Seguidos',
    description: 'Mantenha uma sequência de 30 dias',
    icon: '🌟',
    isLocked: true,
    condition: { type: 'streak', target: 30 }
  },
  {
    id: 'hundred-sessions',
    title: '100 Sessões',
    description: 'Complete 100 sessões de meditação',
    icon: '💎',
    isLocked: true,
    condition: { type: 'sessions', target: 100 }
  },
  {
    id: 'journal-writer',
    title: 'Escritor',
    description: 'Escreva 10 entradas no diário',
    icon: '📝',
    isLocked: true,
    condition: { type: 'journals', target: 10 }
  },
  {
    id: 'mood-tracker',
    title: 'Rastreador de Humor',
    description: 'Registre seu humor por 14 dias',
    icon: '😊',
    isLocked: true,
    condition: { type: 'moods', target: 14 }
  }
];

export const DEFAULT_SETTINGS = {
  notifications: {
    enabled: true,
    reminders: true,
    achievements: true,
    dailyGoals: true,
  },
  privacy: {
    shareStats: false,
    anonymousData: true,
  },
  preferences: {
    theme: 'auto' as const,
    language: 'pt-BR',
  },
};

export const STORAGE_KEYS = {
  USER_PROFILE: 'user_profile',
  USER_STATS: 'user_stats',
  USER_ACHIEVEMENTS: 'user_achievements', 
  USER_SETTINGS: 'user_settings',
  USER_AVATAR: 'user_avatar', // Will be used with user ID: user_avatar_{userId}
} as const;

// Helper function to create user-specific storage keys
export const getUserSpecificKey = (baseKey: string, userId: string) => {
  return `${baseKey}_${userId}`;
};

export const PROFILE_COLORS = {
  primary: '#2196F3',
  secondary: '#A1CEDC',
  accent: '#0277BD',
  gradient: ['#A1CEDC', '#E8F4F8'],
} as const;
