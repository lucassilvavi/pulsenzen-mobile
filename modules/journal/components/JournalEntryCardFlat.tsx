import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { JournalEntry } from '../types';

interface JournalEntryCardProps {
  entry: JournalEntry;
  onPress: (entryId: string) => void;
}

export const JournalEntryCardFlat: React.FC<JournalEntryCardProps> = ({ entry, onPress }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPreview = (content: string, maxLength: number = 120) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const getMoodColor = () => {
    if (entry.moodTags && entry.moodTags.length > 0) {
      // Use the first mood tag's color if available
      return entry.moodTags[0].hexColor || colors.primary.main;
    }
    return colors.neutral.divider;
  };

  return (
    <TouchableOpacity onPress={() => onPress(entry.id)} style={styles.container}>
      <ThemedView style={styles.card}>
        <View style={styles.header}>
          <View style={styles.dateContainer}>
            <ThemedText style={styles.date}>{formatDate(entry.createdAt)}</ThemedText>
            {entry.isFavorite && (
              <Ionicons name="heart" size={16} color={colors.warning.main} />
            )}
          </View>
          <View style={styles.metadata}>
            <ThemedText style={styles.wordCount}>{entry.wordCount} palavras</ThemedText>
            {entry.readingTimeMinutes && (
              <ThemedText style={styles.readingTime}>
                {entry.readingTimeMinutes} min
              </ThemedText>
            )}
          </View>
        </View>

        <ThemedText style={styles.content}>
          {getPreview(entry.content)}
        </ThemedText>

        {entry.moodTags && entry.moodTags.length > 0 && (
          <View style={styles.moodTags}>
            {entry.moodTags.slice(0, 3).map((tag, index) => (
              <View 
                key={`${tag.id}-${index}`}
                style={[styles.moodTag, { backgroundColor: tag.hexColor + '20' }]}
              >
                <ThemedText style={[styles.moodTagText, { color: tag.hexColor }]}>
                  {tag.emoji} {tag.label}
                </ThemedText>
              </View>
            ))}
            {entry.moodTags.length > 3 && (
              <ThemedText style={styles.moreTags}>
                +{entry.moodTags.length - 3} mais
              </ThemedText>
            )}
          </View>
        )}

        <View style={styles.footer}>
          <ThemedText style={styles.category}>{entry.promptCategory}</ThemedText>
          <View style={[styles.indicator, { backgroundColor: getMoodColor() }]} />
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  card: {
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral.divider,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  date: {
    fontSize: fontSize.sm,
    color: colors.neutral.text.secondary,
  },
  metadata: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  wordCount: {
    fontSize: fontSize.xs,
    color: colors.neutral.text.secondary,
  },
  readingTime: {
    fontSize: fontSize.xs,
    color: colors.neutral.text.secondary,
  },
  content: {
    fontSize: fontSize.md,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  moodTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  moodTag: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
  },
  moodTagText: {
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
  moreTags: {
    fontSize: fontSize.xs,
    color: colors.neutral.text.secondary,
    alignSelf: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: fontSize.xs,
    color: colors.neutral.text.secondary,
    textTransform: 'capitalize',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default JournalEntryCardFlat;