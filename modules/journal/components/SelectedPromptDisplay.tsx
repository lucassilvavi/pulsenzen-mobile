import Card from '@/components/base/Card';
import IconButton from '@/components/base/IconButton';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface SelectedPromptDisplayProps {
  category: string;
  question: string;
  onEdit: () => void;
}

export default function SelectedPromptDisplay({ category, question, onEdit }: SelectedPromptDisplayProps) {
  return (
    <View style={styles.selectedPromptSection}>
      <Card style={styles.selectedPromptCard}>
        <View style={styles.selectedPromptHeader}>
          <ThemedText style={styles.selectedPromptCategory}>{category}</ThemedText>
          <IconButton
            icon={<IconSymbol name="pencil" size={16} color={colors.journal.accent} />}
            onPress={onEdit}
          />
        </View>
        <ThemedText style={styles.selectedPromptText}>{question}</ThemedText>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  selectedPromptSection: {
    marginBottom: spacing.xl,
  },
  selectedPromptCard: {
    backgroundColor: colors.neutral.card,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  selectedPromptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.journal.accent,
  },
  selectedPromptCategory: {
    fontSize: fontSize.sm,
    color: colors.neutral.white,
    fontFamily: 'Inter-Bold',
  },
  selectedPromptText: {
    fontSize: fontSize.md,
    color: colors.neutral.text.primary,
    padding: spacing.md,
  },
});
