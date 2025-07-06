/**
 * Utility functions for the Mood module
 * Helper functions and formatters specific to mood functionality
 */

import { MOOD_OPTIONS, PERIOD_GREETINGS, PERIOD_LABELS, WELLNESS_TIPS } from '../constants';
import { MoodEntry, MoodLevel, MoodOption, MoodPeriod } from '../types';

/**
 * Obtém a configuração de um humor específico
 */
export function getMoodOption(moodLevel: MoodLevel): MoodOption | undefined {
  return MOOD_OPTIONS.find(option => option.id === moodLevel);
}

/**
 * Converte valor numérico para nível de humor
 */
export function getMoodLevelFromValue(value: number): MoodLevel {
  if (value >= 4.5) return 'excelente';
  if (value >= 3.5) return 'bem';
  if (value >= 2.5) return 'neutro';
  if (value >= 1.5) return 'mal';
  return 'pessimo';
}

/**
 * Converte nível de humor para valor numérico
 */
export function getMoodValue(moodLevel: MoodLevel): number {
  const values: Record<MoodLevel, number> = {
    'excelente': 5,
    'bem': 4,
    'neutro': 3,
    'mal': 2,
    'pessimo': 1
  };
  return values[moodLevel];
}

/**
 * Formata o rótulo do período
 */
export function formatPeriodLabel(period: MoodPeriod): string {
  return PERIOD_LABELS[period];
}

/**
 * Obtém saudação contextual do período
 */
export function getPeriodGreeting(period: MoodPeriod): string {
  return PERIOD_GREETINGS[period] || '💭 Como você está se sentindo?';
}

/**
 * Obtém dica de bem-estar aleatória para o período
 */
export function getRandomWellnessTip(period: MoodPeriod) {
  const tips = WELLNESS_TIPS[period] || WELLNESS_TIPS.manha;
  return tips[Math.floor(Math.random() * tips.length)];
}

/**
 * Calcula porcentagem de distribuição de humores
 */
export function calculateMoodPercentages(distribution: Record<MoodLevel, number>) {
  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
  
  if (total === 0) {
    return Object.keys(distribution).reduce((acc, key) => {
      acc[key as MoodLevel] = 0;
      return acc;
    }, {} as Record<MoodLevel, number>);
  }
  
  return Object.entries(distribution).reduce((acc, [mood, count]) => {
    acc[mood as MoodLevel] = Math.round((count / total) * 100);
    return acc;
  }, {} as Record<MoodLevel, number>);
}

/**
 * Determina o tipo de celebração baseado no humor
 */
export function getCelebrationType(mood: MoodLevel): 'positive' | 'neutral' | 'negative' {
  if (mood === 'excelente' || mood === 'bem') return 'positive';
  if (mood === 'neutro') return 'neutral';
  return 'negative';
}

/**
 * Formata data para exibição amigável
 */
export function formatMoodDate(date: string): string {
  const moodDate = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateStr = moodDate.toISOString().split('T')[0];
  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (dateStr === todayStr) return 'Hoje';
  if (dateStr === yesterdayStr) return 'Ontem';
  
  return moodDate.toLocaleDateString('pt-BR', { 
    day: 'numeric', 
    month: 'short' 
  });
}

/**
 * Agrupa entradas por data
 */
export function groupEntriesByDate(entries: MoodEntry[]): Record<string, MoodEntry[]> {
  return entries.reduce((groups, entry) => {
    const date = entry.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {} as Record<string, MoodEntry[]>);
}

/**
 * Obtém streak de humor positivo
 */
export function getPositiveMoodStreak(entries: MoodEntry[]): number {
  const sortedEntries = entries
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .filter(entry => entry.mood === 'excelente' || entry.mood === 'bem');

  let streak = 0;
  const today = new Date();
  let currentDate = new Date(today);

  for (const entry of sortedEntries) {
    const entryDate = new Date(entry.date);
    const daysDiff = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === streak) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Determina se é um humor que precisa de suporte
 */
export function needsSupport(mood: MoodLevel): boolean {
  return mood === 'mal' || mood === 'pessimo';
}

/**
 * Obtém mensagem de encorajamento baseada no humor
 */
export function getEncouragementMessage(mood: MoodLevel): string {
  const messages = {
    excelente: 'Que alegria saber que você está radiante! ✨',
    bem: 'Fico feliz que você esteja bem hoje! 😊',
    neutro: 'Tudo bem sentir-se assim. Você não está sozinho. 💙',
    mal: 'Obrigado por compartilhar. Sua coragem em expressar como se sente é admirável. 🤗',
    pessimo: 'Sei que está difícil agora. Você é mais forte do que imagina. 💜'
  };
  
  return messages[mood];
}

/**
 * Calcula média de humor para um período específico
 */
export function calculatePeriodAverage(entries: MoodEntry[], period: MoodPeriod): number {
  const periodEntries = entries.filter(entry => entry.period === period);
  
  if (periodEntries.length === 0) return 0;
  
  const total = periodEntries.reduce((sum, entry) => sum + getMoodValue(entry.mood), 0);
  return total / periodEntries.length;
}

/**
 * Verifica se é horário apropriado para notificação de humor
 */
export function isAppropriateTimeForNotification(): boolean {
  const hour = new Date().getHours();
  // Evita notificações muito cedo ou muito tarde
  return hour >= 7 && hour <= 22;
}

/**
 * Gera ID único para entrada de humor
 */
export function generateMoodEntryId(date: string, period: MoodPeriod): string {
  return `${date}-${period}-${Date.now()}`;
}
