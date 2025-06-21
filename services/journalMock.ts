// Mock for API integration (can be replaced with MSW or MirageJS for real API mocks)
import { JournalEntry, JournalPrompt } from '../types/journal';

export const mockJournalPrompts: JournalPrompt[] = [
    {
        id: 'gratitude',
        question: 'Pelo que você é grato hoje?',
        category: 'Gratidão',
        icon: '🙏',
    },
    {
        id: 'emotions',
        question: 'Como você está se sentindo agora e por quê?',
        category: 'Emoções',
        icon: '💭',
    },
    {
        id: 'achievements',
        question: 'Qual foi sua maior conquista hoje?',
        category: 'Conquistas',
        icon: '🏆',
    },
    {
        id: 'challenges',
        question: 'Que desafio você enfrentou e como lidou com ele?',
        category: 'Desafios',
        icon: '💪',
    },
    {
        id: 'learning',
        question: 'O que você aprendeu sobre si mesmo hoje?',
        category: 'Aprendizado',
        icon: '📚',
    },
    {
        id: 'relationships',
        question: 'Como foram suas interações com outras pessoas hoje?',
        category: 'Relacionamentos',
        icon: '👥',
    },
    {
        id: 'future',
        question: 'O que você espera do amanhã?',
        category: 'Futuro',
        icon: '🌅',
    },
    {
        id: 'reflection',
        question: 'Se você pudesse mudar algo no seu dia, o que seria?',
        category: 'Reflexão',
        icon: '🤔',
    },
];

export const mockJournalEntries: JournalEntry[] = [
  {
    id: '1',
    text: 'Hoje estou grato pela minha família.',
    prompt: 'Pelo que você é grato hoje?',
    promptCategory: 'Gratidão',
    moodTags: ['😊 Feliz', '🤗 Grato'],
    date: new Date().toISOString(),
    wordCount: 7,
  },
];
