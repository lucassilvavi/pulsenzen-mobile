// Enhanced Mock data for Journal Module - Updated for new Type System
import { JournalEntry, JournalPrompt, MoodTag } from '../types';

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

// Enhanced Journal Entries with new structure
export const mockJournalEntries: JournalEntry[] = [
  {
    id: 'entry_1',
    content: 'Hoje estou especialmente grato pela minha família e pelos pequenos momentos de alegria que experimentei. Acordei com o sol entrando pela janela e isso me trouxe uma sensação de paz que não sentia há tempo. Às vezes são essas pequenas coisas que fazem toda a diferença no nosso dia.',
    selectedPrompt: mockJournalPrompts[0], // Gratidão prompt
    promptCategory: 'Gratidão',
    moodTags: [mockMoodTags[0], mockMoodTags[1]], // Feliz, Grato
    createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    wordCount: 65,
    readingTimeMinutes: 1,
    isFavorite: true,
    sentimentScore: 0.8,
    privacy: 'private',
    metadata: {
      deviceType: 'phone',
      timezone: 'America/Sao_Paulo',
      writingDuration: 180,
      revisionCount: 2
    }
  },
  {
    id: 'entry_2',
    content: 'Hoje foi um dia desafiador no trabalho. Enfrentei uma situação difícil com um colega, mas consegui manter a calma e resolver as coisas através do diálogo. Aprendi que é importante não levar as coisas para o lado pessoal e focar na solução dos problemas.',
    selectedPrompt: mockJournalPrompts[3], // Desafios prompt
    promptCategory: 'Desafios',
    moodTags: [mockMoodTags[13], mockMoodTags[9]], // Frustrado, Curioso
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    wordCount: 52,
    readingTimeMinutes: 1,
    isFavorite: false,
    sentimentScore: 0.2,
    privacy: 'private',
    metadata: {
      deviceType: 'phone',
      timezone: 'America/Sao_Paulo',
      writingDuration: 240,
      revisionCount: 1
    }
  },
  {
    id: 'entry_3',
    content: 'Estou me sentindo muito ansioso hoje. Não consigo parar de pensar nos compromissos da próxima semana. Talvez eu precise dedicar mais tempo para relaxar e praticar mindfulness. Vou tentar fazer alguns exercícios de respiração antes de dormir.',
    selectedPrompt: mockJournalPrompts[1], // Emoções prompt
    promptCategory: 'Emoções',
    moodTags: [mockMoodTags[11], mockMoodTags[7]], // Ansioso, Pensativo
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 259200000).toISOString(),
    wordCount: 48,
    readingTimeMinutes: 1,
    isFavorite: false,
    sentimentScore: -0.3,
    privacy: 'private',
    metadata: {
      deviceType: 'phone',
      timezone: 'America/Sao_Paulo',
      writingDuration: 300,
      revisionCount: 3
    }
  },
  {
    id: 'entry_4',
    content: 'Que dia incrível! Consegui finalizar o projeto que estava me desafiando há semanas. A sensação de conquista é indescritível. Celebrei com meus amigos e me sinto muito grato por ter pessoas que torcem por mim. Isso me motiva a continuar buscando meus objetivos.',
    selectedPrompt: mockJournalPrompts[2], // Conquistas prompt
    promptCategory: 'Conquistas',
    moodTags: [mockMoodTags[2], mockMoodTags[5], mockMoodTags[1]], // Animado, Confiante, Grato
    createdAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
    updatedAt: new Date(Date.now() - 345600000).toISOString(),
    wordCount: 58,
    readingTimeMinutes: 1,
    isFavorite: true,
    sentimentScore: 0.9,
    privacy: 'shared',
    metadata: {
      deviceType: 'phone',
      timezone: 'America/Sao_Paulo',
      writingDuration: 210,
      revisionCount: 1
    }
  },
  {
    id: 'entry_5',
    content: 'Hoje passei um tempo refletindo sobre meus relacionamentos. Percebi que preciso ser mais presente com as pessoas que amo. Às vezes fico tão focado no trabalho que esqueço de dar atenção para quem realmente importa. Vou fazer um esforço para mudar isso.',
    selectedPrompt: mockJournalPrompts[5], // Relacionamentos prompt
    promptCategory: 'Relacionamentos',
    moodTags: [mockMoodTags[7], mockMoodTags[4]], // Pensativo, Amado
    createdAt: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
    updatedAt: new Date(Date.now() - 432000000).toISOString(),
    wordCount: 55,
    readingTimeMinutes: 1,
    isFavorite: false,
    sentimentScore: 0.1,
    privacy: 'private',
    metadata: {
      deviceType: 'phone',
      timezone: 'America/Sao_Paulo',
      writingDuration: 280,
      revisionCount: 2
    }
  }
];
