import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';

interface JournalEntryViewProps {
  prompt: string;
  promptCategory: string;
  moodTags: string[];
  text: string;
  date: string;
  onBack: () => void;
}

const { width } = Dimensions.get('window');

export default function JournalEntryView({ prompt, promptCategory, moodTags, text, date, onBack }: JournalEntryViewProps) {
  // Extract emoji and text from mood tags
  const formatMoodTag = (tag: string) => {
    const parts = tag.split(' ');
    const emoji = parts[0];
    const label = parts.slice(1).join(' ');
    return { emoji, label };
  };

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.categoryContainer}>
          <View style={styles.categoryBadge}>
            <ThemedText style={styles.categoryText}>{promptCategory}</ThemedText>
          </View>
          <ThemedText style={styles.dateText}>{date}</ThemedText>
        </View>
      </View>

      {/* Question Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <View style={styles.iconContainer}>
            <Ionicons name="help-circle" size={20} color={colors.journal.accent} />
          </View>
          <ThemedText style={styles.sectionTitle}>Pergunta de Reflexão</ThemedText>
        </View>
        <View style={styles.promptCard}>
          <ThemedText style={[
            styles.promptText, 
            (!prompt || !prompt.trim()) && styles.promptTextEmpty
          ]}>
            {prompt && prompt.trim() ? prompt : "Reflexão livre - sem pergunta específica"}
          </ThemedText>
        </View>
      </View>

      {/* Emotions Section */}
      {moodTags && moodTags.length > 0 && (
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="heart" size={20} color={colors.journal.accent} />
            </View>
            <ThemedText style={styles.sectionTitle}>Estado Emocional</ThemedText>
          </View>
          <View style={styles.emotionsGrid}>
            {moodTags.map((tag, index) => {
              const { emoji, label } = formatMoodTag(tag);
              return (
                <View key={`${tag}-${index}`} style={styles.emotionCard}>
                  <ThemedText style={styles.emotionEmoji}>{emoji}</ThemedText>
                  <ThemedText style={styles.emotionLabel}>
                    {label}
                  </ThemedText>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Response Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <View style={styles.iconContainer}>
            <Ionicons name="document-text" size={20} color={colors.journal.accent} />
          </View>
          <ThemedText style={styles.sectionTitle}>Sua Reflexão</ThemedText>
        </View>
        <View style={styles.responseCard}>
          <ThemedText style={styles.responseText}>{text}</ThemedText>
          <View style={styles.responseStats}>
            <View style={styles.statItem}>
              <Ionicons name="document" size={16} color={colors.neutral.text.secondary} />
              <ThemedText style={styles.statText}>
                {text.trim().split(/\s+/).filter(word => word.length > 0).length} palavras
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="timer" size={16} color={colors.neutral.text.secondary} />
              <ThemedText style={styles.statText}>
                ~{Math.ceil(text.trim().split(/\s+/).filter(word => word.length > 0).length / 200)} min de leitura
              </ThemedText>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
    paddingTop: 60, // Espaço para o botão de fechar (mais flexível que 'top')
  },
  scrollContent: {
    paddingBottom: spacing.xl * 2,
  },
  
  // Header Section
  headerSection: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.divider,
    marginBottom: spacing.lg,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryBadge: {
    backgroundColor: colors.journal.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    shadowColor: colors.journal.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryText: {
    fontSize: fontSize.xs,
    color: colors.neutral.white,
    fontFamily: 'Inter-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  dateText: {
    fontSize: fontSize.sm,
    color: colors.neutral.text.secondary,
    fontFamily: 'Inter-Medium',
  },

  // Section Layout
  sectionContainer: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${colors.journal.accent}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Bold',
    color: colors.neutral.text.primary,
    letterSpacing: 0.3,
  },

  // Question Section
  promptCard: {
    backgroundColor: colors.neutral.card,
    borderRadius: 16,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.journal.accent,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  promptText: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Medium',
    color: colors.neutral.text.primary,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  promptTextEmpty: {
    fontStyle: 'normal',
    color: colors.neutral.text.secondary,
    fontSize: fontSize.sm,
  },

  // Emotions Section
  emotionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm, // Back to original spacing
    justifyContent: 'flex-start',
  },
  emotionCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 12, // Back to original radius
    paddingHorizontal: spacing.md, // More padding for better text visibility
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral.divider,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    minWidth: width * 0.4, // Minimum width to ensure text is visible
    maxWidth: width * 0.48, // Slightly larger max width
    flex: 0,
    marginRight: spacing.xs,
    marginBottom: spacing.sm,
  },
  emotionEmoji: {
    fontSize: fontSize.lg, // Back to larger emoji
    marginRight: spacing.sm, // More space between emoji and text
    minWidth: 24, // Slightly larger min width
  },
  emotionLabel: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Medium',
    color: colors.neutral.text.primary,
    flex: 1,
    flexShrink: 1, // Allow text to shrink if needed
  },

  // Response Section
  responseCard: {
    backgroundColor: colors.neutral.card,
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  responseText: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Regular',
    color: colors.neutral.text.primary,
    lineHeight: 26,
    marginBottom: spacing.md,
  },
  responseStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.divider,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: fontSize.xs,
    color: colors.neutral.text.secondary,
    fontFamily: 'Inter-Medium',
    marginLeft: spacing.xs,
  },

  // Bottom Spacing
  bottomSpacing: {
    height: spacing.xl,
  },

  // Legacy styles (keep for backward compatibility)
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
