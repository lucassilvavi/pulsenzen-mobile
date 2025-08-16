import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { JournalEntry } from '../types';

interface JournalEntryPreviewProps {
  entry: JournalEntry;
  onPress: () => void;
  onOptionsPress?: () => void;
  showMoodIndicator?: boolean;
  showWordCount?: boolean;
  maxLines?: number;
}

export const JournalEntryPreview = ({ 
  entry, 
  onPress, 
  onOptionsPress,
  showMoodIndicator = true,
  showWordCount = true,
  maxLines = 3
}: JournalEntryPreviewProps) => {
  
  // Determina a cor do humor baseado nas mood tags
  const getMoodColor = () => {
    if (!entry.sentimentScore) return colors.neutral.text.secondary;
    
    if (entry.sentimentScore >= 0.6) return '#4CAF50'; // Verde - Muito positivo
    if (entry.sentimentScore >= 0.2) return '#2196F3'; // Azul - Positivo
    if (entry.sentimentScore >= -0.2) return '#FF9800'; // Laranja - Neutro
    return '#9C27B0'; // Roxo - Precisa de atenção
  };

  const getMoodLabel = () => {
    if (!entry.sentimentScore) return 'Neutro';
    
    if (entry.sentimentScore >= 0.6) return 'Radiante';
    if (entry.sentimentScore >= 0.2) return 'Bem';
    if (entry.sentimentScore >= -0.2) return 'Neutro';
    return 'Difícil';
  };

  // Formata a data de forma amigável
  const formatDate = (date: string) => {
    const entryDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const isToday = entryDate.toDateString() === today.toDateString();
    const isYesterday = entryDate.toDateString() === yesterday.toDateString();
    
    if (isToday) return 'Hoje';
    if (isYesterday) return 'Ontem';
    
    return entryDate.toLocaleDateString('pt-BR', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  // Extrai preview do texto (primeiras palavras significativas)
  const getTextPreview = () => {
    const cleanText = entry.content.replace(/\n/g, ' ').trim();
    const words = cleanText.split(' ');
    
    if (words.length <= 30) return cleanText;
    return words.slice(0, 30).join(' ') + '...';
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.card}>
        {/* Header com data e opções */}
        <View style={styles.header}>
          <View style={styles.dateContainer}>
            <ThemedText style={styles.dateText}>
              {formatDate(entry.createdAt)}
            </ThemedText>
            <ThemedText style={styles.timeText}>
              {new Date(entry.createdAt).toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </ThemedText>
          </View>
          
          {onOptionsPress && (
            <TouchableOpacity 
              style={styles.optionsButton}
              onPress={onOptionsPress}
            >
              <Ionicons name="ellipsis-vertical" size={16} color={colors.neutral.text.secondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Categoria e humor */}
        <View style={styles.metaContainer}>
          {entry.promptCategory && (
            <View style={styles.categoryTag}>
              <ThemedText style={styles.categoryText}>
                {entry.promptCategory}
              </ThemedText>
            </View>
          )}
          
          {showMoodIndicator && entry.sentimentScore !== undefined && (
            <View style={styles.moodContainer}>
              <View style={[styles.moodDot, { backgroundColor: getMoodColor() }]} />
              <ThemedText style={[styles.moodText, { color: getMoodColor() }]}>
                {getMoodLabel()}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Preview do conteúdo */}
        <View style={styles.contentContainer}>
          <ThemedText 
            style={styles.contentText}
            numberOfLines={maxLines}
          >
            {getTextPreview()}
          </ThemedText>
        </View>

        {/* Tags de humor */}
        {entry.moodTags && entry.moodTags.length > 0 && (
          <View style={styles.tagsContainer}>
            {entry.moodTags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <ThemedText style={styles.tagText}>
                  {tag.emoji} {tag.label}
                </ThemedText>
              </View>
            ))}
            {entry.moodTags.length > 3 && (
              <View style={styles.moreTagsIndicator}>
                <ThemedText style={styles.moreTagsText}>
                  +{entry.moodTags.length - 3}
                </ThemedText>
              </View>
            )}
          </View>
        )}

        {/* Footer com estatísticas */}
        <View style={styles.footer}>
          <View style={styles.statsContainer}>
            {showWordCount && (
              <View style={styles.stat}>
                <Ionicons name="document-text-outline" size={14} color={colors.neutral.text.secondary} />
                <ThemedText style={styles.statText}>
                  {entry.wordCount} palavras
                </ThemedText>
              </View>
            )}
            
            {entry.readingTimeMinutes && (
              <View style={styles.stat}>
                <Ionicons name="time-outline" size={14} color={colors.neutral.text.secondary} />
                <ThemedText style={styles.statText}>
                  {entry.readingTimeMinutes}min de leitura
                </ThemedText>
              </View>
            )}
          </View>
          
          {/* Indicador de entrada favorita */}
          {entry.isFavorite && (
            <View style={styles.favoriteContainer}>
              <Ionicons name="heart" size={16} color="#F44336" />
            </View>
          )}
        </View>

        {/* Decoração visual baseada no humor */}
        {showMoodIndicator && entry.sentimentScore !== undefined && (
          <LinearGradient
            colors={[
              `${getMoodColor()}15`,
              `${getMoodColor()}05`,
              'transparent'
            ]}
            style={styles.moodGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: spacing.lg,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  dateContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.neutral.text.primary,
    marginBottom: 2,
  },
  timeText: {
    fontSize: fontSize.xs,
    color: colors.neutral.text.secondary,
  },
  optionsButton: {
    padding: spacing.xs,
    borderRadius: 12,
    backgroundColor: colors.neutral.background,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  categoryTag: {
    backgroundColor: colors.primary.light,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: fontSize.xs,
    fontWeight: '500',
    color: colors.primary.main,
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  moodText: {
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
  contentContainer: {
    marginBottom: spacing.md,
  },
  contentText: {
    fontSize: fontSize.sm,
    color: colors.neutral.text.primary,
    lineHeight: fontSize.sm * 1.5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  tag: {
    backgroundColor: colors.neutral.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  tagText: {
    fontSize: fontSize.xs,
    color: colors.neutral.text.secondary,
  },
  moreTagsIndicator: {
    backgroundColor: colors.neutral.divider,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  moreTagsText: {
    fontSize: fontSize.xs,
    color: colors.neutral.text.secondary,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  statText: {
    fontSize: fontSize.xs,
    color: colors.neutral.text.secondary,
    marginLeft: spacing.xs,
  },
  favoriteContainer: {
    padding: spacing.xs,
  },
  moodGradient: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 60,
  },
});