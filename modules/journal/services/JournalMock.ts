// Enhanced Mock data for Journal Module - Updated for new Type System
import { JournalPrompt, MoodTag } from '../types';

// Mock Mood Tags
export const mockMoodTags: MoodTag[] = [
  // Positive Moods
  { id: 'happy', label: 'Feliz', emoji: '😊', category: 'positive', intensity: 4, hexColor: '#FFD700' },
  { id: 'grateful', label: 'Grato', emoji: '🙏', category: 'positive', intensity: 4, hexColor: '#32CD32' },
  { id: 'excited', label: 'Animado', emoji: '🤩', category: 'positive', intensity: 5, hexColor: '#FF69B4' },
  { id: 'calm', label: 'Calmo', emoji: '😌', category: 'positive', intensity: 3, hexColor: '#87CEEB' },
  { id: 'loved', label: 'Amado', emoji: '🥰', category: 'positive', intensity: 5, hexColor: '#FF1493' },
  { id: 'confident', label: 'Confiante', emoji: '😎', category: 'positive', intensity: 4, hexColor: '#4169E1' },
  
  // Neutral Moods
  { id: 'neutral', label: 'Neutro', emoji: '😐', category: 'neutral', intensity: 3, hexColor: '#C0C0C0' },
  { id: 'thoughtful', label: 'Pensativo', emoji: '🤔', category: 'neutral', intensity: 3, hexColor: '#D2B48C' },
  { id: 'tired', label: 'Cansado', emoji: '😴', category: 'neutral', intensity: 2, hexColor: '#8B8B8B' },
  { id: 'curious', label: 'Curioso', emoji: '🧐', category: 'neutral', intensity: 3, hexColor: '#DDA0DD' },
  
  // Negative Moods
  { id: 'sad', label: 'Triste', emoji: '😢', category: 'negative', intensity: 3, hexColor: '#4682B4' },
  { id: 'anxious', label: 'Ansioso', emoji: '😰', category: 'negative', intensity: 4, hexColor: '#FF6347' },
  { id: 'angry', label: 'Irritado', emoji: '😠', category: 'negative', intensity: 4, hexColor: '#DC143C' },
  { id: 'frustrated', label: 'Frustrado', emoji: '😤', category: 'negative', intensity: 3, hexColor: '#B22222' },
  { id: 'lonely', label: 'Solitário', emoji: '😔', category: 'negative', intensity: 3, hexColor: '#696969' },
];

// Enhanced Journal Prompts
export const mockJournalPrompts: JournalPrompt[] = [
  {
    id: 'gratitude',
    question: 'Pelo que você é grato hoje?',
    category: 'Gratidão',
    icon: '🙏',
    difficulty: 'beginner',
    tags: ['gratidão', 'positividade', 'reflexão'],
    estimatedTime: 5,
    type: 'standard'
  },
  {
    id: 'emotions',
    question: 'Como você está se sentindo agora e por quê?',
    category: 'Emoções',
    icon: '💭',
    difficulty: 'beginner',
    tags: ['emoções', 'autoconhecimento', 'identificação'],
    estimatedTime: 10,
    type: 'guided'
  },
  {
    id: 'achievements',
    question: 'Qual foi sua maior conquista hoje?',
    category: 'Conquistas',
    icon: '🏆',
    difficulty: 'beginner',
    tags: ['sucessos', 'realizações', 'progresso'],
    estimatedTime: 7,
    type: 'standard'
  },
  {
    id: 'challenges',
    question: 'Que desafio você enfrentou e como lidou com ele?',
    category: 'Desafios',
    icon: '💪',
    difficulty: 'intermediate',
    tags: ['problemas', 'soluções', 'crescimento'],
    estimatedTime: 15,
    type: 'therapeutic'
  },
  {
    id: 'learning',
    question: 'O que você aprendeu sobre si mesmo hoje?',
    category: 'Aprendizado',
    icon: '📚',
    difficulty: 'intermediate',
    tags: ['autoconhecimento', 'crescimento', 'insights'],
    estimatedTime: 12,
    type: 'guided'
  },
  {
    id: 'relationships',
    question: 'Como foram suas interações com outras pessoas hoje?',
    category: 'Relacionamentos',
    icon: '👥',
    difficulty: 'intermediate',
    tags: ['relacionamentos', 'social', 'comunicação'],
    estimatedTime: 10,
    type: 'standard'
  },
  {
    id: 'future',
    question: 'O que você espera do amanhã?',
    category: 'Futuro',
    icon: '🌅',
    difficulty: 'beginner',
    tags: ['esperança', 'planejamento', 'otimismo'],
    estimatedTime: 8,
    type: 'creative'
  },
  {
    id: 'reflection',
    question: 'Se você pudesse mudar algo no seu dia, o que seria?',
    category: 'Reflexão',
    icon: '🤔',
    difficulty: 'advanced',
    tags: ['reflexão', 'autocrítica', 'melhoria'],
    estimatedTime: 20,
    type: 'therapeutic'
  },
  {
    id: 'body-mind',
    question: 'Como seu corpo está se sentindo hoje? O que ele está tentando te dizer?',
    category: 'Corpo e Mente',
    icon: '�',
    difficulty: 'intermediate',
    tags: ['mindfulness', 'corpo', 'sensações'],
    estimatedTime: 15,
    type: 'guided'
  },
  {
    id: 'creativity',
    question: 'Descreva algo que você criou ou imaginou hoje. Pode ser qualquer coisa!',
    category: 'Criatividade',
    icon: '🎨',
    difficulty: 'beginner',
    tags: ['criatividade', 'imaginação', 'expressão'],
    estimatedTime: 12,
    type: 'creative'
  }
];
