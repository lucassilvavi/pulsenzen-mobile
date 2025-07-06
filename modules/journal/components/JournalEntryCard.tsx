import Card from '@/components/base/Card';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

type Tag = string;

type JournalEntryCardProps = {
  date: string;
  title: string;
  preview: string;
  mood: { label: string; color: string; bg: string; icon: string };
  tags: Tag[];
  onPress?: () => void;
  style?: ViewStyle;
};

export default function JournalEntryCard({
  date,
  title,
  preview,
  mood,
  tags,
  onPress,
  style,
}: JournalEntryCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={style}>
      <Card style={styles.card}>
        <ThemedView style={styles.header}>
          <ThemedView>
            <ThemedText style={styles.date}>{date}</ThemedText>
            <ThemedText style={styles.title}>{title}</ThemedText>
          </ThemedView>
          <ThemedView style={[styles.moodBadge, { backgroundColor: mood.bg }]}>
            <IconSymbol name={mood.icon} size={16} color={mood.color} />
            <ThemedText style={[styles.moodText, { color: mood.color }]}>{mood.label}</ThemedText>
          </ThemedView>
        </ThemedView>
        <ThemedText style={styles.preview} numberOfLines={2}>
          {preview}
        </ThemedText>
        <ThemedView style={styles.tags}>
          {tags.map(tag => (
            <ThemedView key={tag} style={styles.tag}>
              <ThemedText style={styles.tagText}>{tag}</ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
    marginBottom: 15,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  date: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 3,
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  moodText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  preview: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
  },
});