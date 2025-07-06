import Button from '@/components/base/Button';
import Card from '@/components/base/Card';
import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { JournalPrompt } from '../types';

interface PromptSelectorProps {
  prompts: JournalPrompt[];
  onSelect: (prompt: JournalPrompt) => void;
  onCustomPrompt: () => void;
}

export default function PromptSelector({ prompts, onSelect, onCustomPrompt }: PromptSelectorProps) {
  return (
    <View style={styles.promptSection}>
      <ThemedText style={styles.sectionTitle}>
        Escolha um tema para refletir:
      </ThemedText>
      <Button
        label="Criar pergunta personalizada"
        variant="outline"
        onPress={onCustomPrompt}
        style={styles.customPromptButton}
        labelStyle={{ color: colors.journal.accent }}
      />
      <View style={styles.promptsGrid}>
        {prompts.map((prompt) => (
          <Card
            key={prompt.id}
            style={styles.promptCard}
            onPress={() => onSelect(prompt)}
          >
            <View style={styles.promptContent}>
              <ThemedText style={styles.promptIcon}>{prompt.icon}</ThemedText>
              <View style={styles.promptInfo}>
                <ThemedText style={styles.promptCategory}>{prompt.category}</ThemedText>
                <ThemedText style={styles.promptQuestion}>{prompt.question}</ThemedText>
              </View>
            </View>
          </Card>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  promptSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Bold',
    color: colors.journal.accent,
    marginBottom: spacing.sm,
  },
  customPromptButton: {
    borderWidth: 1,
    borderColor: colors.journal.accent,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  promptsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  promptCard: {
    flexBasis: '48%',
    marginBottom: spacing.sm,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  promptContent: {
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  promptIcon: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  promptInfo: {
    flex: 1,
  },
  promptCategory: {
    fontSize: fontSize.sm,
    color: colors.neutral.text.secondary,
    marginBottom: 4,
  },
  promptQuestion: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Medium',
    color: colors.neutral.text.primary,
  },
});
