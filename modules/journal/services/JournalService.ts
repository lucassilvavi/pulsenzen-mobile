// Enhanced Service for Journal Module - Mock Data with Full API Compatible Interface
import AsyncStorage from '@react-native-async-storage/async-storage';
import { JournalEntry, JournalEntryFilters, JournalPrompt, JournalStats } from '../types';
import { mockJournalEntries, mockJournalPrompts } from './JournalMock';

const STORAGE_KEY = 'journal_entries_v2';

export class JournalService {
  // Initialize local storage
  private static async loadEntries(): Promise<JournalEntry[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const entries = JSON.parse(stored);
        return [...entries, ...mockJournalEntries]; // Merge with mock data
      }
      return mockJournalEntries;
    } catch (error) {
      console.error('Error loading entries:', error);
      return mockJournalEntries;
    }
  }

  private static async saveEntries(entries: JournalEntry[]): Promise<void> {
    try {
      // Only save user-created entries (not mock data)
      const userEntries = entries.filter(entry => 
        !mockJournalEntries.some(mock => mock.id === entry.id)
      );
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userEntries));
    } catch (error) {
      console.error('Error saving entries:', error);
    }
  }

  // === Prompts API ===
  
  static async getPrompts(filters?: any): Promise<JournalPrompt[]> {
    let prompts = [...mockJournalPrompts];
    
    if (filters?.category) {
      prompts = prompts.filter(p => p.category === filters.category);
    }
    
    return Promise.resolve(prompts);
  }

  static async getRandomPrompt(): Promise<JournalPrompt | null> {
    const prompts = await this.getPrompts();
    if (prompts.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * prompts.length);
    return prompts[randomIndex];
  }

  // === Entries API ===

  static async getEntries(filters?: JournalEntryFilters): Promise<JournalEntry[]> {
    let entries = await this.loadEntries();
    
    // Apply filters
    if (filters?.dateRange) {
      const start = new Date(filters.dateRange.start);
      const end = new Date(filters.dateRange.end);
      entries = entries.filter(entry => {
        const entryDate = new Date(entry.createdAt);
        return entryDate >= start && entryDate <= end;
      });
    }
    
    if (filters?.categories?.length) {
      entries = entries.filter(entry => 
        filters.categories!.includes(entry.promptCategory)
      );
    }
    
    if (filters?.moodTags?.length) {
      entries = entries.filter(entry =>
        entry.moodTags.some(tag => 
          filters.moodTags!.includes(tag.id)
        )
      );
    }
    
    if (filters?.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      entries = entries.filter(entry =>
        entry.content.toLowerCase().includes(query) ||
        entry.promptCategory.toLowerCase().includes(query)
      );
    }
    
    // Sort by date (newest first)
    return entries.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  static async getEntryById(id: string): Promise<JournalEntry | null> {
    const entries = await this.loadEntries();
    return entries.find(entry => entry.id === id) || null;
  }

  static async createEntry(entryData: Partial<JournalEntry>): Promise<JournalEntry> {
    const entries = await this.loadEntries();
    
    const newEntry: JournalEntry = {
      id: `journal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: entryData.content || '',
      selectedPrompt: entryData.selectedPrompt,
      promptCategory: entryData.promptCategory || 'Geral',
      moodTags: entryData.moodTags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      wordCount: entryData.content ? entryData.content.split(/\s+/).filter(word => word.length > 0).length : 0,
      readingTimeMinutes: entryData.content ? Math.ceil(entryData.content.split(/\s+/).length / 200) : 0,
      isFavorite: entryData.isFavorite || false,
      privacy: entryData.privacy || 'private',
      metadata: {
        deviceType: 'phone',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        writingDuration: 0,
        revisionCount: 0
      }
    };

    const updatedEntries = [newEntry, ...entries];
    await this.saveEntries(updatedEntries);
    
    return newEntry;
  }

  static async updateEntry(id: string, updates: Partial<JournalEntry>): Promise<JournalEntry> {
    const entries = await this.loadEntries();
    const entryIndex = entries.findIndex(entry => entry.id === id);
    
    if (entryIndex === -1) {
      throw new Error(`Entry with id ${id} not found`);
    }

    const updatedEntry: JournalEntry = {
      ...entries[entryIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
      wordCount: updates.content ? 
        updates.content.split(/\s+/).filter(word => word.length > 0).length : 
        entries[entryIndex].wordCount,
    };

    entries[entryIndex] = updatedEntry;
    await this.saveEntries(entries);
    
    return updatedEntry;
  }

  static async deleteEntry(id: string): Promise<void> {
    const entries = await this.loadEntries();
    const filteredEntries = entries.filter(entry => entry.id !== id);
    
    if (filteredEntries.length === entries.length) {
      throw new Error(`Entry with id ${id} not found`);
    }
    
    await this.saveEntries(filteredEntries);
  }

  // === Search & Analytics ===

  static async searchEntries(query: string): Promise<JournalEntry[]> {
    const entries = await this.loadEntries();
    const lowercaseQuery = query.toLowerCase();
    
    return entries.filter(entry => 
      entry.content.toLowerCase().includes(lowercaseQuery) ||
      entry.promptCategory.toLowerCase().includes(lowercaseQuery) ||
      entry.moodTags.some(tag => tag.label.toLowerCase().includes(lowercaseQuery))
    );
  }

  static async getStatistics(): Promise<JournalStats> {
    const entries = await this.loadEntries();
    
    if (entries.length === 0) {
      return {
        totalEntries: 0,
        uniqueDays: 0,
        percentPositive: 0,
        averageWordsPerEntry: 0,
        currentStreak: 0,
        longestStreak: 0
      };
    }

    // Calculate unique days
    const uniqueDays = new Set(
      entries.map(entry => entry.createdAt.split('T')[0])
    ).size;

    // Calculate average words
    const totalWords = entries.reduce((sum, entry) => sum + entry.wordCount, 0);
    const averageWordsPerEntry = Math.round(totalWords / entries.length);

    // Calculate positive sentiment percentage (simplified)
    const positiveEntries = entries.filter(entry => 
      entry.moodTags.some(tag => tag.category === 'positive')
    ).length;
    const percentPositive = Math.round((positiveEntries / entries.length) * 100);

    // Calculate category distribution
    const categoryCount: Record<string, number> = {};
    entries.forEach(entry => {
      categoryCount[entry.promptCategory] = (categoryCount[entry.promptCategory] || 0) + 1;
    });

    const favoriteCategories = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));

    // Calculate mood distribution
    const moodCount: Record<string, number> = {};
    entries.forEach(entry => {
      entry.moodTags.forEach(tag => {
        moodCount[tag.label] = (moodCount[tag.label] || 0) + 1;
      });
    });

    const totalMoodTags = Object.values(moodCount).reduce((sum, count) => sum + count, 0);
    const moodDistribution = Object.entries(moodCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([mood, count]) => ({ 
        mood, 
        percentage: Math.round((count / totalMoodTags) * 100) 
      }));

    return {
      totalEntries: entries.length,
      uniqueDays,
      percentPositive,
      averageWordsPerEntry,
      currentStreak: this.calculateCurrentStreak(entries),
      longestStreak: this.calculateLongestStreak(entries),
      favoriteCategories,
      moodDistribution
    };
  }

  // === Utility Methods ===

  private static calculateCurrentStreak(entries: JournalEntry[]): number {
    if (entries.length === 0) return 0;

    const sortedEntries = entries
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const uniqueDates = Array.from(new Set(
      sortedEntries.map(entry => entry.createdAt.split('T')[0])
    )).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Check if user wrote today or yesterday to start counting
    if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
      let currentDate = new Date(uniqueDates[0]);
      let i = 0;

      while (i < uniqueDates.length) {
        const expectedDate = currentDate.toISOString().split('T')[0];
        if (uniqueDates[i] === expectedDate) {
          streak++;
          currentDate = new Date(currentDate.getTime() - 86400000); // Previous day
          i++;
        } else {
          break;
        }
      }
    }

    return streak;
  }

  private static calculateLongestStreak(entries: JournalEntry[]): number {
    if (entries.length === 0) return 0;

    const uniqueDates = Array.from(new Set(
      entries.map(entry => entry.createdAt.split('T')[0])
    )).sort();

    let longestStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i - 1]);
      const currentDate = new Date(uniqueDates[i]);
      const diffTime = currentDate.getTime() - prevDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return longestStreak;
  }

  // === Legacy Support (backward compatibility) ===

  static async saveEntry(entry: JournalEntry): Promise<void> {
    await this.createEntry(entry);
  }

  static async getStats(): Promise<JournalStats> {
    return this.getStatistics();
  }
}
