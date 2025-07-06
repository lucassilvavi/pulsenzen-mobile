import Card from '@/components/base/Card';
import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { useMood } from '@/modules/mood';
import { fontSize, spacing } from '@/utils/responsive';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

interface MoodSummaryProps {
  showTitle?: boolean;
  compact?: boolean;
}

export default function MoodSummary({ showTitle = true, compact = false }: MoodSummaryProps) {
  const { todayEntries, recentStats, isLoading } = useMood();

  const getMoodEmoji = (moodLevel: string) => {
    const emojis: Record<string, string> = {
      'excelente': '😄',
      'bem': '😊',
      'neutro': '😐',
      'mal': '😟',
      'pessimo': '😢'
    };
    return emojis[moodLevel] || '😐';
  };

  const getMoodColor = (moodLevel: string) => {
    const colors: Record<string, string> = {
      'excelente': '#4CAF50',
      'bem': '#8BC34A',
      'neutro': '#FFC107',
      'mal': '#FF9800',
      'pessimo': '#F44336'
    };
    return colors[moodLevel] || '#FFC107';
  };

  const getPeriodLabel = (period: string) => {
    const labels: Record<string, string> = {
      'manha': 'Manhã',
      'tarde': 'Tarde',
      'noite': 'Noite'
    };
    return labels[period] || period;
  };

  if (isLoading) {
    return (
      <Card style={compact ? styles.compactContainer : styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary.main} />
        </View>
      </Card>
    );
  }

  if (todayEntries.length === 0 && !recentStats) {
    return null;
  }

  return (
    <Card style={compact ? styles.compactContainer : styles.container}>
      {showTitle && (
        <ThemedText style={styles.title}>
          {compact ? 'Seu Humor' : 'Resumo do Seu Humor'}
        </ThemedText>
      )}

      {/* Entradas de hoje */}
      {todayEntries.length > 0 && (
        <View style={styles.todaySection}>
          <ThemedText style={styles.sectionTitle}>Hoje</ThemedText>
          <View style={styles.entriesContainer}>
            {todayEntries.map((entry) => (
              <View key={entry.id} style={styles.entryItem}>
                <View style={styles.entryInfo}>
                  <ThemedText style={styles.periodText}>
                    {getPeriodLabel(entry.period)}
                  </ThemedText>
                  <View style={styles.moodContainer}>
                    <ThemedText style={styles.moodEmoji}>
                      {getMoodEmoji(entry.mood)}
                    </ThemedText>
                    <View 
                      style={[
                        styles.moodIndicator, 
                        { backgroundColor: getMoodColor(entry.mood) }
                      ]} 
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Estatísticas recentes */}
      {recentStats && !compact && (
        <View style={styles.statsSection}>
          <ThemedText style={styles.sectionTitle}>Últimos 7 dias</ThemedText>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>
                {recentStats.totalEntries}
              </ThemedText>
              <ThemedText style={styles.statLabel}>
                {recentStats.totalEntries === 1 ? 'registro' : 'registros'}
              </ThemedText>
            </View>
            
            <View style={styles.statItem}>
              <ThemedText style={[
                styles.statNumber, 
                { color: getMoodColor(getAverageMoodLevel(recentStats.averageMood)) }
              ]}>
                {getMoodEmoji(getAverageMoodLevel(recentStats.averageMood))}
              </ThemedText>
              <ThemedText style={styles.statLabel}>
                humor médio
              </ThemedText>
            </View>
          </View>
        </View>
      )}
    </Card>
  );
}

function getAverageMoodLevel(average: number): string {
  if (average >= 4.5) return 'excelente';
  if (average >= 3.5) return 'bem';
  if (average >= 2.5) return 'neutro';
  if (average >= 1.5) return 'mal';
  return 'pessimo';
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  compactContainer: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  loadingContainer: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-SemiBold',
    color: colors.primary.main,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  todaySection: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Medium',
    color: colors.neutral.text.primary,
    marginBottom: spacing.sm,
  },
  entriesContainer: {
    gap: spacing.xs,
  },
  entryItem: {
    paddingVertical: spacing.xs,
  },
  entryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  periodText: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: colors.neutral.text.secondary,
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  moodEmoji: {
    fontSize: 20,
  },
  moodIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statsSection: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral.divider,
    paddingTop: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: fontSize.xl,
    fontFamily: 'Inter-Bold',
    color: colors.primary.main,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: fontSize.xs,
    fontFamily: 'Inter-Regular',
    color: colors.neutral.text.secondary,
    textAlign: 'center',
  },
});
