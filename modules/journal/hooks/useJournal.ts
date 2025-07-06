import { useEffect, useState } from 'react';
import { JournalService } from '../services';
import { JournalEntry, JournalPrompt, JournalStats } from '../types';

export function useJournal() {
  const [prompts, setPrompts] = useState<JournalPrompt[]>([]);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [stats, setStats] = useState<JournalStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPrompts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await JournalService.getPrompts();
      setPrompts(data);
    } catch (err) {
      setError('Failed to load prompts');
      console.error('Error loading prompts:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await JournalService.getEntries();
      setEntries(data);
    } catch (err) {
      setError('Failed to load entries');
      console.error('Error loading entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setError(null);
      const data = await JournalService.getStats();
      setStats(data);
    } catch (err) {
      setError('Failed to load stats');
      console.error('Error loading stats:', err);
    }
  };

  const saveEntry = async (entry: JournalEntry) => {
    try {
      setLoading(true);
      setError(null);
      await JournalService.saveEntry(entry);
      // Refresh entries and stats
      await Promise.all([loadEntries(), loadStats()]);
      return true;
    } catch (err) {
      setError('Failed to save entry');
      console.error('Error saving entry:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const searchEntries = async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const results = await JournalService.searchEntries(query);
      return results;
    } catch (err) {
      setError('Failed to search entries');
      console.error('Error searching entries:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getRandomPrompt = () => {
    return JournalService.getRandomPrompt();
  };

  useEffect(() => {
    loadPrompts();
    loadEntries();
    loadStats();
  }, []);

  return {
    prompts,
    entries,
    stats,
    loading,
    error,
    loadPrompts,
    loadEntries,
    loadStats,
    saveEntry,
    searchEntries,
    getRandomPrompt,
  };
}
