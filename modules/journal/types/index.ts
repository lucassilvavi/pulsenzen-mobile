// Types for Journal features
export interface JournalPrompt {
  id: string;
  question: string;
  category: string;
  icon: string;
}

export interface JournalEntry {
  id: string;
  text: string;
  prompt: string;
  promptCategory: string;
  moodTags: string[];
  date: string;
  wordCount: number;
}

export interface JournalStats {
  totalEntries: number;
  uniqueDays: number;
  percentPositive: number;
}
