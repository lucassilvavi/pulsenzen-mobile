// Service for Journal API integration and local mock data
import { JournalEntry, JournalPrompt, JournalStats } from '../types';
import { mockJournalEntries, mockJournalPrompts } from './JournalMock';

export class JournalService {
  // Simulate fetching prompts from API
  static async getPrompts(): Promise<JournalPrompt[]> {
    return Promise.resolve(mockJournalPrompts);
  }

  // Simulate fetching journal entries from API
  static async getEntries(): Promise<JournalEntry[]> {
    return Promise.resolve(mockJournalEntries);
  }

  // Simulate saving a journal entry
  static async saveEntry(entry: JournalEntry): Promise<void> {
    mockJournalEntries.unshift(entry);
    return Promise.resolve();
  }

  // Get journal statistics
  static async getStats(): Promise<JournalStats> {
    const entries = mockJournalEntries;
    const totalWords = entries.reduce((sum, entry) => sum + entry.wordCount, 0);
    const categoryCount: Record<string, number> = {};
    
    entries.forEach(entry => {
      categoryCount[entry.promptCategory] = (categoryCount[entry.promptCategory] || 0) + 1;
    });

    const favoriteCategory = Object.keys(categoryCount).reduce((a, b) => 
      categoryCount[a] > categoryCount[b] ? a : b, '');

    return Promise.resolve({
      totalEntries: entries.length,
      wordsWritten: totalWords,
      streakDays: 0, // Calculate based on consecutive days
      favoriteCategory,
      averageWordsPerEntry: entries.length ? Math.round(totalWords / entries.length) : 0,
    });
  }

  // Get random prompt for quick access
  static getRandomPrompt(): JournalPrompt {
    const randomIndex = Math.floor(Math.random() * mockJournalPrompts.length);
    return mockJournalPrompts[randomIndex];
  }

  // Search entries by text or category
  static async searchEntries(query: string): Promise<JournalEntry[]> {
    const entries = mockJournalEntries;
    const lowercaseQuery = query.toLowerCase();
    
    return Promise.resolve(entries.filter(entry => 
      entry.text.toLowerCase().includes(lowercaseQuery) ||
      entry.promptCategory.toLowerCase().includes(lowercaseQuery) ||
      entry.moodTags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    ));
  }
}
