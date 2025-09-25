import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { JournalEntry } from '../types';

interface JournalEntryViewProps {
  entry: JournalEntry;
  onBack: () => void;
}

const { width } = Dimensions.get('window');

export default function JournalEntryView({ entry, onBack }: JournalEntryViewProps) {
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const wordCount = entry.wordCount || entry.content?.trim().split(/\s+/).filter(word => word.length > 0).length || 0;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <View style={styles.container}>
      {/* Fixed Header with Close Button */}
      <View style={styles.fixedHeader}>
        <TouchableOpacity 
          onPress={onBack} 
          style={styles.closeButton}
        >
          <Ionicons name="close" size={24} color={colors.neutral.text.primary} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Entrada do Diário</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section with Date and Category */}
        <View style={styles.headerSection}>
          <View style={styles.dateContainer}>
            <View style={styles.dateIconContainer}>
              <Ionicons name="calendar" size={16} color={colors.journal.accent} />
            </View>
            <ThemedText style={styles.dateText}>{formatDate(entry.createdAt)}</ThemedText>
          </View>
          
          {entry.promptCategory && (
            <View style={styles.categoryBadge}>
              <ThemedText style={styles.categoryText}>{entry.promptCategory}</ThemedText>
            </View>
          )}
          
          {entry.isFavorite && (
            <View style={styles.favoriteIndicator}>
              <Ionicons name="heart" size={16} color={colors.error.main} />
            </View>
          )}
        </View>

        {/* Question/Prompt Section */}
        {entry.selectedPrompt?.question && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconContainer}>
                <Ionicons name="help-circle" size={20} color={colors.journal.accent} />
              </View>
              <ThemedText style={styles.sectionTitle}>Pergunta de Reflexão</ThemedText>
            </View>
            <View style={styles.promptCard}>
              <ThemedText style={styles.promptText}>
                {entry.selectedPrompt.question}
              </ThemedText>
            </View>
          </View>
        )}

        {/* Emotions/Mood Section */}
        {entry.moodTags && entry.moodTags.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconContainer}>
                <Ionicons name="heart" size={20} color={colors.journal.accent} />
              </View>
              <ThemedText style={styles.sectionTitle}>Estado Emocional</ThemedText>
            </View>
            <View style={styles.emotionsGrid}>
              {entry.moodTags.map((tag, index) => (
                <View key={`${tag.id || tag.label}-${index}`} style={[
                  styles.emotionCard,
                  tag.category === 'positive' && styles.emotionCardPositive,
                  tag.category === 'negative' && styles.emotionCardNegative,
                  tag.category === 'neutral' && styles.emotionCardNeutral
                ]}>
                  <ThemedText style={styles.emotionEmoji}>{tag.emoji}</ThemedText>
                  <ThemedText style={styles.emotionLabel}>{tag.label}</ThemedText>
                  {tag.intensity && (
                    <View style={styles.intensityIndicator}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <View 
                          key={i}
                          style={[
                            styles.intensityDot,
                            i < tag.intensity && styles.intensityDotActive
                          ]} 
                        />
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Content/Text Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="document-text" size={20} color={colors.journal.accent} />
            </View>
            <ThemedText style={styles.sectionTitle}>Sua Reflexão</ThemedText>
          </View>
          <View style={styles.responseCard}>
            <ThemedText style={styles.responseText}>{entry.content}</ThemedText>
            
            {/* Stats Section */}
            <View style={styles.responseStats}>
              <View style={styles.statItem}>
                <Ionicons name="document" size={16} color={colors.neutral.text.secondary} />
                <ThemedText style={styles.statText}>
                  {wordCount} palavras
                </ThemedText>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="timer" size={16} color={colors.neutral.text.secondary} />
                <ThemedText style={styles.statText}>
                  ~{readingTime} min de leitura
                </ThemedText>
              </View>
              {entry.sentimentScore !== undefined && (
                <View style={styles.statItem}>
                  <Ionicons 
                    name={entry.sentimentScore > 0 ? "happy" : entry.sentimentScore < 0 ? "sad" : "remove"} 
                    size={16} 
                    color={colors.neutral.text.secondary} 
                  />
                  <ThemedText style={styles.statText}>
                    {entry.sentimentScore > 0 ? 'Positivo' : entry.sentimentScore < 0 ? 'Negativo' : 'Neutro'}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  
  // Fixed Header Styles
  fixedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.divider,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  closeButton: {
    padding: spacing.xs,
    borderRadius: 20,
    backgroundColor: colors.neutral.card,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.neutral.text.primary,
  },
  placeholder: {
    width: 40,
  },

  // Scroll Container
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  
  // Header Section
  headerSection: {
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.divider,
    marginBottom: spacing.lg,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dateIconContainer: {
    marginRight: spacing.sm,
  },
  dateText: {
    fontSize: fontSize.md,
    color: colors.neutral.text.secondary,
    fontWeight: '500',
  },
  categoryBadge: {
    backgroundColor: colors.journal.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  categoryText: {
    fontSize: fontSize.xs,
    color: colors.neutral.white,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  favoriteIndicator: {
    alignSelf: 'flex-start',
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
    fontWeight: '600',
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
  },
  promptText: {
    fontSize: fontSize.md,
    color: colors.neutral.text.primary,
    lineHeight: 24,
    fontStyle: 'italic',
  },

  // Emotions Section
  emotionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  emotionCard: {
    backgroundColor: colors.neutral.card,
    borderRadius: 12,
    padding: spacing.md,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.neutral.divider,
  },
  emotionCardPositive: {
    borderColor: colors.success.main + '30',
    backgroundColor: colors.success.main + '10',
  },
  emotionCardNegative: {
    borderColor: colors.error.main + '30',
    backgroundColor: colors.error.main + '10',
  },
  emotionCardNeutral: {
    borderColor: colors.warning.main + '30',
    backgroundColor: colors.warning.main + '10',
  },
  emotionEmoji: {
    fontSize: fontSize.xl,
    marginBottom: spacing.xs,
  },
  emotionLabel: {
    fontSize: fontSize.sm,
    color: colors.neutral.text.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
  intensityIndicator: {
    flexDirection: 'row',
    marginTop: spacing.xs,
    gap: 2,
  },
  intensityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.neutral.divider,
  },
  intensityDotActive: {
    backgroundColor: colors.journal.accent,
  },

  // Response Section
  responseCard: {
    backgroundColor: colors.neutral.card,
    borderRadius: 16,
    padding: spacing.lg,
  },
  responseText: {
    fontSize: fontSize.md,
    color: colors.neutral.text.primary,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  responseStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.divider,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: fontSize.sm,
    color: colors.neutral.text.secondary,
  },

  // Bottom Spacing
  bottomSpacing: {
    height: spacing.xl,
  },
});