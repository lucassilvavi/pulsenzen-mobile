import { BreathingTechnique } from '../types';

// Breathing module colors and themes
export const breathingColors = {
  primary: '#A1CEDC',
  secondary: '#E8F4F8',
  accent: '#2196F3',
};

export const breathingGradients = {
  primary: ['#A1CEDC', '#E8F4F8'],
  accent: ['#2196F3', '#64B5F6'],
};

export const breathingTechniques: BreathingTechnique[] = [
  {
    key: '4-7-8',
    icon: { name: 'wind', color: '#2196F3', bg: '#E3F2FD' },
    title: 'Respiração 4-7-8',
    duration: '5 minutos • Relaxamento',
    description: 'Inspire por 4 segundos, segure por 7 segundos e expire por 8 segundos. Ideal para reduzir ansiedade e ajudar a adormecer.',
    inhaleTime: 4,
    holdTime: 7,
    exhaleTime: 8,
    cycles: 4,
  },
  {
    key: 'box',
    icon: { name: 'square', color: '#4CAF50', bg: '#E8F5E9' },
    title: 'Respiração Quadrada',
    duration: '4 minutos • Foco',
    description: 'Inspire, segure, expire e segure novamente, cada etapa por 4 segundos. Excelente para melhorar a concentração e equilíbrio.',
    inhaleTime: 4,
    holdTime: 4,
    exhaleTime: 4,
    cycles: 4,
  },
  {
    key: 'deep',
    icon: { name: 'lungs', color: '#FF9800', bg: '#FFF3E0' },
    title: 'Respiração Profunda',
    duration: '3 minutos • Calmante',
    description: 'Inspire lentamente pelo nariz, expandindo o abdômen, e expire pela boca. Ajuda a reduzir o estresse e acalmar o sistema nervoso.',
    inhaleTime: 4,
    holdTime: 4,
    exhaleTime: 4,
    cycles: 4,
  },
  {
    key: 'alternate',
    icon: { name: 'arrow.left.and.right', color: '#03A9F4', bg: '#E1F5FE' },
    title: 'Respiração Alternada',
    duration: '7 minutos • Equilíbrio',
    description: 'Alterne a respiração entre as narinas. Técnica do yoga que equilibra os hemisférios cerebrais e promove clareza mental.',
    inhaleTime: 4,
    holdTime: 4,
    exhaleTime: 4,
    cycles: 4,
  },
];

export const breathingBenefits = [
  {
    icon: { name: 'heart.fill', color: '#4CAF50', bg: '#E8F5E9' },
    text: 'Reduz o estresse e ansiedade',
  },
  {
    icon: { name: 'brain', color: '#2196F3', bg: '#E3F2FD' },
    text: 'Melhora a concentração e foco',
  },
  {
    icon: { name: 'moon.stars.fill', color: '#FF9800', bg: '#FFF3E0' },
    text: 'Promove melhor qualidade de sono',
  },
  {
    icon: { name: 'bolt.fill', color: '#9C27B0', bg: '#F3E5F5' },
    text: 'Aumenta os níveis de energia',
  },
];

export const breathingTips = [
  'Encontre um local tranquilo e confortável',
  'Mantenha uma postura ereta mas relaxada',
  'Pratique regularmente, mesmo que por poucos minutos',
  'Seja gentil consigo mesmo, a prática leva tempo',
];
