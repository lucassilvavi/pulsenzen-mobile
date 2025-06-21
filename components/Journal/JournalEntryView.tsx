import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface JournalEntryViewProps {
  prompt: string;
  promptCategory: string;
  moodTags: string[];
  text: string;
  date: string;
  onBack: () => void;
}

export default function JournalEntryView({ prompt, promptCategory, moodTags, text, date, onBack }: JournalEntryViewProps) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.category}>{promptCategory}</ThemedText>
      <ThemedText style={styles.date}>{date}</ThemedText>
      <ThemedText style={styles.promptLabel}>Pergunta</ThemedText>
      <ThemedText style={styles.prompt}>{prompt}</ThemedText>
      <ThemedText style={styles.moodLabel}>Emoções</ThemedText>
      <View style={styles.moodTagsContainer}>
        {moodTags.map(tag => (
          <View key={tag} style={styles.moodTag}>
            <ThemedText style={styles.moodTagText}>{tag}</ThemedText>
          </View>
        ))}
      </View>
      <ThemedText style={styles.answerLabel}>Sua resposta</ThemedText>
      <ThemedText style={styles.text}>{text}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: spacing.lg,
  },
  category: {
    fontSize: fontSize.sm,
    color: colors.journal.accent,
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  date: {
    fontSize: fontSize.sm,
    color: colors.neutral.text.secondary,
    marginBottom: spacing.md,
  },
  promptLabel: {
    fontSize: fontSize.sm,
    color: colors.neutral.text.secondary,
    marginBottom: 2,
    marginTop: spacing.sm,
  },
  prompt: {
    fontSize: fontSize.md,
    color: colors.neutral.text.primary,
    fontFamily: 'Inter-Medium',
    marginBottom: spacing.md,
  },
  moodLabel: {
    fontSize: fontSize.sm,
    color: colors.neutral.text.secondary,
    marginBottom: 2,
    marginTop: spacing.sm,
  },
  moodTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  moodTag: {
    backgroundColor: colors.journal.accent,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  moodTagText: {
    color: colors.neutral.white,
    fontSize: fontSize.sm,
  },
  answerLabel: {
    fontSize: fontSize.sm,
    color: colors.neutral.text.secondary,
    marginBottom: 2,
    marginTop: spacing.sm,
  },
  text: {
    fontSize: fontSize.md,
    color: colors.neutral.text.primary,
    marginTop: 2,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
});
