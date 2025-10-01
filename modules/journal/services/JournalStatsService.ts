import { JournalEntry } from '../types';

export interface JournalStatsBasic {
  totalEntries: number;
  uniqueDays: number;
  percentPositive: number;
}

export class JournalStatsService {
  static calculateStats(entries: JournalEntry[]): JournalStatsBasic {
    const totalEntries = entries.length;
    const uniqueDaysSet = new Set(
      entries.map(e => new Date(e.createdAt).toDateString())
    );
    const uniqueDays = uniqueDaysSet.size;

    // Considera positiva se tiver tag de categoria 'positive' ou sentimentScore > 0
    const positiveCount = entries.filter(e => {
      const hasPositiveTags = (e.moodTags || []).some(tag =>
        tag.category === 'positive' || 
        (tag.label && tag.label.toLowerCase().includes('feliz')) || 
        (tag.label && tag.label.toLowerCase().includes('grato'))
      );
      const hasPositiveSentiment = e.sentimentScore && e.sentimentScore > 0.2;
      return hasPositiveTags || hasPositiveSentiment;
    }).length;
    const percentPositive = totalEntries > 0 ? Math.round((positiveCount / totalEntries) * 100) : 0;

    return {
      totalEntries,
      uniqueDays,
      percentPositive,
    };
  }
}
