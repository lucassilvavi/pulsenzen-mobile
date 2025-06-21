import { JournalEntry } from '@/types/journal';

export type JournalStats = {
  totalEntries: number;
  uniqueDays: number;
  percentPositive: number;
};

export class JournalStatsService {
  static calculateStats(entries: JournalEntry[]): JournalStats {
    const totalEntries = entries.length;
    const uniqueDaysSet = new Set(
      entries.map(e => new Date(e.date).toDateString())
    );
    const uniqueDays = uniqueDaysSet.size;

    // Considera positiva se tiver tag 'positivo' ou 'positiva' (ajuste conforme sua lógica)
    const positiveCount = entries.filter(e =>
      (e.moodTags || []).some(tag =>
        tag.toLowerCase().includes('positivo') || tag.toLowerCase().includes('positiva')
      )
    ).length;
    const percentPositive = totalEntries > 0 ? Math.round((positiveCount / totalEntries) * 100) : 0;

    return {
      totalEntries,
      uniqueDays,
      percentPositive,
    };
  }
}
