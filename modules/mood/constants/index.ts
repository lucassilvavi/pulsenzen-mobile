/**
 * Constants for the Mood module
 * Centralizes all mood-related constants and configurations
 */

import { CelebrationConfig, MoodOption } from '../types';

export const MOOD_OPTIONS: MoodOption[] = [
  { 
    id: 'excelente', 
    label: 'Incrível', 
    emoji: '🤗', 
    color: '#4CAF50',
    description: 'Me sinto radiante!',
    bgGradient: ['#E8F5E8', '#C8E6C9', '#A5D6A7']
  },
  { 
    id: 'bem', 
    label: 'Bem', 
    emoji: '😊', 
    color: '#66BB6A',
    description: 'Estou bem hoje',
    bgGradient: ['#F1F8E9', '#DCEDC8', '#C5E1A5']
  },
  { 
    id: 'neutro', 
    label: 'Neutro', 
    emoji: '😌', 
    color: '#FFB74D',
    description: 'Nem bem, nem mal',
    bgGradient: ['#FFF8E1', '#FFECB3', '#FFE082']
  },
  { 
    id: 'mal', 
    label: 'Difícil', 
    emoji: '😔', 
    color: '#FF8A65',
    description: 'Não estou bem',
    bgGradient: ['#FFF3E0', '#FFE0B2', '#FFCC80']
  },
  { 
    id: 'pessimo', 
    label: 'Intenso', 
    emoji: '😢', 
    color: '#EF5350',
    description: 'Preciso de apoio',
    bgGradient: ['#FFEBEE', '#FFCDD2', '#EF9A9A']
  },
];

export const PERIOD_HOURS = {
  manha: { start: 5, end: 12 },
  tarde: { start: 12, end: 18 },
  noite: { start: 18, end: 5 }
} as const;

export const PERIOD_LABELS = {
  manha: 'manhã',
  tarde: 'tarde',
  noite: 'noite'
} as const;

export const PERIOD_GREETINGS = {
  manha: '🌅 Como você está começando o dia?',
  tarde: '☀️ Como está sendo sua tarde?',
  noite: '🌙 Como foi seu dia?'
} as const;

export const WELLNESS_TIPS = {
  manha: [
    {
      icon: '🌱',
      text: 'Cada novo dia é uma oportunidade de cuidar de si mesmo.',
      subtext: 'Respire fundo e permita-se sentir.'
    },
    {
      icon: '☀️',
      text: 'Seus sentimentos são válidos, independentemente de como você acorda.',
      subtext: 'Acolha-se com gentileza hoje.'
    },
    {
      icon: '💙',
      text: 'Reconhecer suas emoções é o primeiro passo para o bem-estar.',
      subtext: 'Você está no caminho certo.'
    }
  ],
  tarde: [
    {
      icon: '🌼',
      text: 'É normal que nosso humor flutue ao longo do dia.',
      subtext: 'Como você está se cuidando agora?'
    },
    {
      icon: '🤗',
      text: 'Pause por um momento e perceba como você está.',
      subtext: 'Sua presença consigo mesmo importa.'
    },
    {
      icon: '✨',
      text: 'Meio-dia pode ser um momento de renovação interior.',
      subtext: 'Que tal se conectar com suas necessidades?'
    }
  ],
  noite: [
    {
      icon: '🌙',
      text: 'Refletir sobre o dia faz parte do processo de autoconhecimento.',
      subtext: 'Como foi sua jornada hoje?'
    },
    {
      icon: '💜',
      text: 'Cada dia traz aprendizados sobre nós mesmos.',
      subtext: 'Honre sua experiência de hoje.'
    },
    {
      icon: '🕯️',
      text: 'A noite é um momento de acolhimento e gratidão.',
      subtext: 'Seja gentil consigo mesmo.'
    }
  ]
} as const;

export const CELEBRATION_CONFIGS: Record<string, CelebrationConfig> = {
  positive: {
    mood: 'positive',
    emojis: ['✨', '🌟', '💫', '⭐', '🎉', '💖', '🌈'],
    particleCount: 12,
    duration: 2000,
    colors: ['#4CAF50', '#66BB6A', '#81C784']
  },
  neutral: {
    mood: 'neutral',
    emojis: ['💙', '🤍', '💚', '🌸'],
    particleCount: 6,
    duration: 1500,
    colors: ['#FFB74D', '#FFCC80', '#FFE0B2']
  },
  negative: {
    mood: 'negative',
    emojis: ['💜', '🤗', '🌷', '🕯️'],
    particleCount: 6,
    duration: 1500,
    colors: ['#EF5350', '#FF8A65', '#FFAB91']
  }
};

export const STORAGE_KEYS = {
  MOOD_ENTRIES: '@mood_entries',
  LAST_RESPONSE: '@last_mood_response',
  MOOD_SETTINGS: '@mood_settings'
} as const;

export const ANIMATION_DURATIONS = {
  FADE_IN: 1200,
  SCALE_SEQUENCE: 100,
  PULSE_CYCLE: 2000,
  SELECTION_FEEDBACK: 300,
  SUCCESS_CELEBRATION: 800,
  LOADING_OVERLAY: 200
} as const;

export const THERAPEUTIC_MESSAGES = {
  VALIDATION: 'Cada sentimento é válido e importante ✨',
  GRATITUDE: '💙 Obrigado por compartilhar!',
  ENCOURAGEMENT: 'Cada momento importa.',
  ERROR_GENTLE: 'Ops! 😔',
  ERROR_RETRY: 'Não conseguimos registrar agora. Que tal tentar novamente?',
  LOADING: '✨ Registrando seu momento...'
} as const;
