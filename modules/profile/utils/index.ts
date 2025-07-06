import { ACHIEVEMENTS } from '../constants';
import { Achievement, UserStats } from '../types';

/**
 * Calculate the user's level based on total experience points
 */
export const calculateUserLevel = (stats: UserStats): number => {
  const totalPoints = (stats.completedSessions * 10) + 
                     (stats.totalMinutes * 0.5) + 
                     (stats.streakDays * 20) +
                     ((stats.totalJournalEntries || 0) * 5) +
                     ((stats.totalMoodEntries || 0) * 3);
  
  return Math.floor(totalPoints / 100) + 1;
};

/**
 * Calculate progress to next level
 */
export const calculateLevelProgress = (stats: UserStats): { current: number; next: number; progress: number } => {
  const totalPoints = (stats.completedSessions * 10) + 
                     (stats.totalMinutes * 0.5) + 
                     (stats.streakDays * 20) +
                     ((stats.totalJournalEntries || 0) * 5) +
                     ((stats.totalMoodEntries || 0) * 3);
  
  const currentLevel = Math.floor(totalPoints / 100) + 1;
  const pointsForCurrentLevel = (currentLevel - 1) * 100;
  const pointsForNextLevel = currentLevel * 100;
  const currentProgress = totalPoints - pointsForCurrentLevel;
  const progressPercentage = (currentProgress / 100) * 100;

  return {
    current: currentLevel,
    next: currentLevel + 1,
    progress: Math.min(progressPercentage, 100),
  };
};

/**
 * Check which achievements the user has unlocked based on their stats
 */
export const checkUnlockedAchievements = (stats: UserStats): Achievement[] => {
  return ACHIEVEMENTS.filter(achievement => {
    switch (achievement.condition.type) {
      case 'sessions':
        return stats.completedSessions >= achievement.condition.target;
      case 'streak':
        return stats.streakDays >= achievement.condition.target;
      case 'minutes':
        return stats.totalMinutes >= achievement.condition.target;
      case 'journals':
        return (stats.totalJournalEntries || 0) >= achievement.condition.target;
      case 'moods':
        return (stats.totalMoodEntries || 0) >= achievement.condition.target;
      default:
        return false;
    }
  }).map(achievement => ({
    ...achievement,
    isLocked: false,
    unlockedAt: new Date().toISOString(),
  }));
};

/**
 * Format time duration in a human-readable way
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
};

/**
 * Get a motivational message based on user stats
 */
export const getMotivationalMessage = (stats: UserStats): string => {
  const messages = {
    newbie: [
      'Parabéns por começar sua jornada de bem-estar! 🌱',
      'Cada pequeno passo conta. Continue assim! 💚',
      'Você está no caminho certo! 🎯',
    ],
    regular: [
      'Você está fazendo um ótimo progresso! 🌟',
      'Sua dedicação está dando frutos! 🌸',
      'Continue assim, você está indo muito bem! 💪',
    ],
    experienced: [
      'Impressionante! Você é um exemplo a ser seguido! 🏆',
      'Sua constância é inspiradora! ✨',
      'Você dominou a arte do autocuidado! 🧘‍♀️',
    ],
  };

  let category: keyof typeof messages = 'newbie';
  
  if (stats.completedSessions >= 50 || stats.streakDays >= 30) {
    category = 'experienced';
  } else if (stats.completedSessions >= 10 || stats.streakDays >= 7) {
    category = 'regular';
  }

  const categoryMessages = messages[category];
  return categoryMessages[Math.floor(Math.random() * categoryMessages.length)];
};

/**
 * Calculate wellness score based on various factors
 */
export const calculateWellnessScore = (stats: UserStats): number => {
  const sessionScore = Math.min(stats.completedSessions * 2, 40);
  const streakScore = Math.min(stats.streakDays * 3, 30);
  const timeScore = Math.min(stats.totalMinutes / 10, 20);
  const journalScore = Math.min((stats.totalJournalEntries || 0) * 1, 5);
  const moodScore = Math.min((stats.totalMoodEntries || 0) * 1, 5);

  return Math.min(sessionScore + streakScore + timeScore + journalScore + moodScore, 100);
};

/**
 * Get achievements that are close to being unlocked
 */
export const getUpcomingAchievements = (stats: UserStats, unlockedAchievements: Achievement[]): Achievement[] => {
  const unlockedIds = unlockedAchievements.map(a => a.id);
  
  return ACHIEVEMENTS
    .filter(achievement => !unlockedIds.includes(achievement.id))
    .map(achievement => {
      let currentProgress = 0;
      
      switch (achievement.condition.type) {
        case 'sessions':
          currentProgress = stats.completedSessions;
          break;
        case 'streak':
          currentProgress = stats.streakDays;
          break;
        case 'minutes':
          currentProgress = stats.totalMinutes;
          break;
        case 'journals':
          currentProgress = stats.totalJournalEntries || 0;
          break;
        case 'moods':
          currentProgress = stats.totalMoodEntries || 0;
          break;
      }
      
      const progressPercentage = (currentProgress / achievement.condition.target) * 100;
      
      return {
        ...achievement,
        progress: Math.min(progressPercentage, 100),
      };
    })
    .filter(achievement => achievement.progress >= 50) // Only show achievements that are at least 50% complete
    .sort((a, b) => b.progress - a.progress) // Sort by progress (highest first)
    .slice(0, 3); // Only show top 3
};
