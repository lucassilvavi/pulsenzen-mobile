import Button from '@/components/base/Button';
import Card from '@/components/base/Card';
import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
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
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  promptCard: {
    flex: 1,
    minWidth: '100%',
    marginBottom: 0,
    borderRadius: 12,
    overflow: 'visible',
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.neutral.divider,
    // Sombra sutil para iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  promptContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 60,
  },
  promptIcon: {
    fontSize: 32,
    marginRight: spacing.md,
    marginTop: 4,
  },
  promptInfo: {
    flex: 1,
  },
  promptCategory: {
    fontSize: fontSize.sm,
    color: colors.neutral.text.secondary,
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  promptQuestion: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Regular',
    color: colors.neutral.text.primary,
    lineHeight: 20,
  },
});
