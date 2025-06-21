// Service for Journal API integration and local mock data
import { JournalEntry, JournalPrompt } from '../types/journal';
import { mockJournalEntries, mockJournalPrompts } from './journalMock';

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
}
