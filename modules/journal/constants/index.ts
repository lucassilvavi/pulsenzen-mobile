// Journal module constants
export const JOURNAL_PROMPTS_CATEGORIES = [
  'Gratidão',
  'Emoções',
  'Conquistas',
  'Desafios',
  'Aprendizado',
  'Relacionamentos',
  'Futuro',
  'Reflexão',
] as const;

export const DEFAULT_MOOD_TAGS = [
  '😊 Feliz',
  '😢 Triste', 
  '😠 Irritado',
  '😰 Ansioso',
  '😌 Calmo',
  '🤗 Grato',
  '💪 Motivado',
  '😴 Cansado',
  '🤔 Pensativo',
  '❤️ Amoroso',
] as const;

export const JOURNAL_SETTINGS = {
  MIN_ENTRY_LENGTH: 10,
  MAX_ENTRY_LENGTH: 5000,
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds
  BACKUP_RETENTION_DAYS: 30,
} as const;

// Journal specific colors
export const journalColors = {
  primary: '#FF8A65',
  secondary: '#FFA726',
  background: '#FFF8E1',
  gradient: ['#FFE0B2', '#FFF8E1'],
  accent: '#FF7043',
  moodBackground: '#FFF3E0',
};
