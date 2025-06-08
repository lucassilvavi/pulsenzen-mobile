import JournalEntryCard from '@/components/JournalEntryCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

type Entry = {
  id: string;
  date: string;
  title: string;
  preview: string;
  mood: { label: string; color: string; bg: string; icon: string };
  tags: string[];
};

type JournalEntriesListProps = {
  entries: Entry[];
  onEntryPress: (id: string) => void;
  sectionTitle?: string;
};

export default function JournalEntriesList({
  entries,
  onEntryPress,
  sectionTitle = 'Entradas Recentes',
}: JournalEntriesListProps) {
  return (
    <ThemedView style={{ marginBottom: 20, backgroundColor: 'transparent', }}>
      <ThemedText type="subtitle" style={{ marginBottom: 15 }}>{sectionTitle}</ThemedText>
      {entries.map(entry => (
        <JournalEntryCard
          key={entry.id}
          date={entry.date}
          title={entry.title}
          preview={entry.preview}
          mood={entry.mood}
          tags={entry.tags}
          onPress={() => onEntryPress(entry.id)}
        />
      ))}
    </ThemedView>
  );
}