import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface MoodEntry {
  date: string;
  mood: number; // 1-10 scale
  emoji: string;
  note?: string;
}

interface MoodTimelineChartProps {
  data: MoodEntry[];
  onPress?: (entry: MoodEntry) => void;
}

export function MoodTimelineChart({ data, onPress }: MoodTimelineChartProps) {
  // Organiza dados por semana
  const getWeeklyData = () => {
    const weeks: { [key: string]: MoodEntry[] } = {};
    
    data.forEach(entry => {
      const date = new Date(entry.date);
      const week = getWeekKey(date);
      if (!weeks[week]) weeks[week] = [];
      weeks[week].push(entry);
    });
    
    return Object.entries(weeks)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 4); // Últimas 4 semanas
  };

  const getWeekKey = (date: Date) => {
    const year = date.getFullYear();
    const week = Math.ceil(((date.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + 1) / 7);
    return `${year}-W${week}`;
  };

  const getMoodColor = (mood: number) => {
    if (mood >= 8) return '#4CAF50'; // Verde - Muito feliz
    if (mood >= 6) return '#2196F3'; // Azul - Bem
    if (mood >= 4) return '#FF9800'; // Laranja - Neutro
    return '#9C27B0'; // Roxo - Precisa de cuidado
  };

  const getMoodLabel = (mood: number) => {
    if (mood >= 8) return 'Radiante';
    if (mood >= 6) return 'Bem';
    if (mood >= 4) return 'Neutro';
    return 'Difícil';
  };

  const weeklyData = getWeeklyData();

  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ThemedText style={styles.emptyTitle}>Sua Linha do Tempo Emocional</ThemedText>
        <ThemedText style={styles.emptyText}>
          À medida que você escreve, seus humores aparecerão aqui como uma linha do tempo visual da sua jornada.
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Linha do Tempo dos Humores</ThemedText>
        <ThemedText style={styles.subtitle}>Últimas 4 semanas</ThemedText>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollContainer}>
        {weeklyData.map(([weekKey, entries], weekIndex) => {
          const avgMood = entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length;
          
          return (
            <View key={weekKey} style={styles.weekContainer}>
              <View style={styles.weekHeader}>
                <ThemedText style={styles.weekLabel}>
                  Semana {weekIndex + 1}
                </ThemedText>
                <View style={[styles.avgMoodIndicator, { backgroundColor: getMoodColor(avgMood) }]}>
                  <ThemedText style={styles.avgMoodText}>{avgMood.toFixed(1)}</ThemedText>
                </View>
              </View>

              <View style={styles.timelineContainer}>
                {entries.slice(-7).map((entry, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.moodPoint}
                    onPress={() => onPress?.(entry)}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={[getMoodColor(entry.mood), `${getMoodColor(entry.mood)}80`]}
                      style={[
                        styles.moodDot,
                        { 
                          height: Math.max(20, (entry.mood / 10) * 60),
                          backgroundColor: getMoodColor(entry.mood)
                        }
                      ]}
                    >
                      <ThemedText style={styles.moodEmoji}>{entry.emoji}</ThemedText>
                    </LinearGradient>
                    
                    <ThemedText style={styles.dayLabel}>
                      {new Date(entry.date).toLocaleDateString('pt-BR', { weekday: 'short' })}
                    </ThemedText>
                    
                    <View style={[styles.moodBar, { height: (entry.mood / 10) * 40 + 10 }]}>
                      <LinearGradient
                        colors={[getMoodColor(entry.mood), `${getMoodColor(entry.mood)}40`]}
                        style={styles.moodBarGradient}
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.weekSummary}>
                <ThemedText style={styles.summaryLabel}>
                  {getMoodLabel(avgMood)}
                </ThemedText>
                <ThemedText style={styles.entryCount}>
                  {entries.length} entradas
                </ThemedText>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Legenda dos humores */}
      <View style={styles.legend}>
        <ThemedText style={styles.legendTitle}>Legenda</ThemedText>
        <View style={styles.legendItems}>
          {[
            { label: 'Radiante', color: '#4CAF50', range: '8-10' },
            { label: 'Bem', color: '#2196F3', range: '6-7' },
            { label: 'Neutro', color: '#FF9800', range: '4-5' },
            { label: 'Difícil', color: '#9C27B0', range: '1-3' },
          ].map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <ThemedText style={styles.legendText}>{item.label}</ThemedText>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: spacing.xl,
    marginBottom: spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.neutral.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.neutral.text.secondary,
    textAlign: 'center',
    lineHeight: fontSize.sm * 1.4,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.neutral.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.neutral.text.secondary,
  },
  scrollContainer: {
    marginBottom: spacing.lg,
  },
  weekContainer: {
    width: 120,
    marginRight: spacing.md,
  },
  weekHeader: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  weekLabel: {
    fontSize: fontSize.xs,
    fontWeight: '500',
    color: colors.neutral.text.secondary,
    marginBottom: spacing.xs,
  },
  avgMoodIndicator: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
  },
  avgMoodText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: 'white',
  },
  timelineContainer: {
    height: 120,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  moodPoint: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
    width: '100%',
  },
  moodDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  moodEmoji: {
    fontSize: 12,
  },
  dayLabel: {
    fontSize: fontSize.xs,
    color: colors.neutral.text.secondary,
    marginBottom: spacing.xs,
  },
  moodBar: {
    width: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  moodBarGradient: {
    flex: 1,
  },
  weekSummary: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: fontSize.xs,
    fontWeight: '500',
    color: colors.neutral.text.primary,
    marginBottom: 2,
  },
  entryCount: {
    fontSize: fontSize.xs,
    color: colors.neutral.text.secondary,
  },
  legend: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral.divider,
    paddingTop: spacing.md,
  },
  legendTitle: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.neutral.text.primary,
    marginBottom: spacing.sm,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.xs,
  },
  legendText: {
    fontSize: fontSize.xs,
    color: colors.neutral.text.secondary,
  },
});
