// Journal Service - Streamlined for Essential Operations
import AsyncStorage from '@react-native-async-storage/async-storage';
import { JournalEntry, JournalEntryFilters, JournalPrompt } from '../types';
import { mockJournalPrompts } from './JournalMock';

const STORAGE_KEY = 'journal_entries_v2';

export class JournalService {
  // Initialize local storage
  private static async loadEntries(): Promise<JournalEntry[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const entries = JSON.parse(stored);
        return entries;
      }
      return []; // Return empty array instead of mock data
    } catch (error) {
      console.error('Error loading entries:', error);
      return [];
    }
  }

  private static async saveEntries(entries: JournalEntry[]): Promise<void> {
    try {
      // Save all user-created entries
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
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

  // === Analytics API ===
  static async getAnalytics() {
    try {
      console.log('🚀 Buscando analytics da API...');
      const { journalApiService } = await import('../../../services/journalApiService');
      return await journalApiService.getJournalAnalytics();
    } catch (error: any) {
      console.error('❌ Erro ao buscar analytics da API:', error);
      
      // Tratamento específico para erro de autenticação
      if (error?.message?.includes('Authentication required')) {
        throw new Error('Sessão expirada. Faça login novamente para acessar os dados.');
      }
      
      // Outros erros de API
      throw new Error('Não foi possível carregar os dados. Verifique sua conexão.');
    }
  }

  // === Timeline API ===
  static async getTimelineData(days: number = 7) {
    try {
      console.log('🚀 Buscando timeline da API...');
      const { journalApiService } = await import('../../../services/journalApiService');
      return await journalApiService.getTimelineData(days);
    } catch (error: any) {
      console.error('❌ Erro ao buscar timeline da API:', error);
      
      // Tratamento específico para erro de autenticação
      if (error?.message?.includes('Authentication required')) {
        throw new Error('Sessão expirada. Faça login novamente para acessar os dados.');
      }
      
      // Outros erros de API
      throw new Error('Não foi possível carregar a timeline. Verifique sua conexão.');
    }
  }
}
