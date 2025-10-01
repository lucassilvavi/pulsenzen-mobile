import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface MoodEntry {
  date: string;
  dayOfWeek?: string; // Dia da semana da API
  mood: number; // 1-10 scale
  emoji: string;
  note?: string;
}

interface MoodTimelineChartProps {
  data: MoodEntry[];
  onPress?: (entry: MoodEntry) => void;
}

export function MoodTimelineChart({ data, onPress }: MoodTimelineChartProps) {
  const getMoodColor = (mood: number) => {
    if (mood >= 8) return '#4CAF50'; // Verde - Radiante
    if (mood >= 6) return '#2196F3'; // Azul - Bem  
    if (mood >= 4) return '#FF9800'; // Laranja - Neutro
    return '#9C27B0'; // Roxo - Difícil
  };

  const getMoodLabel = (mood: number) => {
    if (!mood || isNaN(mood)) return 'Sem dados';
    if (mood >= 8) return 'Radiante';
    if (mood >= 6) return 'Bem';
    if (mood >= 4) return 'Neutro';
    return 'Difícil';
  };

  const mapDayOfWeek = (dayOfWeek: string) => {
    const dayMap: { [key: string]: string } = {
      'Mon': 'seg',
      'Tue': 'ter', 
      'Wed': 'qua',
      'Thu': 'qui',
      'Fri': 'sex',
      'Sat': 'sáb',
      'Sun': 'dom'
    };
    return dayMap[dayOfWeek] || dayOfWeek.toLowerCase();
  };

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

  // Processar os últimos 7 dias incluindo hoje
  const processLastWeekData = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const uniqueDays = new Map();
    
    // Primeiro, verificar se hoje já tem entrada
    let hasToday = false;
    for (const entry of data) {
      if (!entry.date) continue; // Pular entradas sem data
      
      try {
        const entryDateStr = new Date(entry.date).toISOString().split('T')[0];
        if (entryDateStr === todayStr) {
          hasToday = true;
          break;
        }
      } catch (error) {
        console.warn('Data inválida encontrada:', entry.date);
        continue;
      }
    }
    
    // Se não tem entrada hoje, criar uma entrada fictícia para mostrar o dia
    if (!hasToday && data.length > 0) {
      uniqueDays.set(todayStr, {
        date: today.toISOString(),
        mood: 5, // Neutro
        emoji: '😐',
        isPlaceholder: true
      });
    }
    
    // Processar as entradas reais
    for (let i = data.length - 1; i >= 0 && uniqueDays.size < 7; i--) {
      const entry = data[i];
      if (!entry.date) continue;
      
      try {
        const dateKey = new Date(entry.date).toISOString().split('T')[0];
        if (!uniqueDays.has(dateKey)) {
          uniqueDays.set(dateKey, entry);
        }
      } catch (error) {
        console.warn('Data inválida encontrada:', entry.date);
        continue;
      }
    }
    
    // Converter para array e ordenar por data (mais antigo primeiro)
    return Array.from(uniqueDays.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7); // Garantir máximo 7 dias
  };

  const lastWeekEntries = processLastWeekData();
  const avgMood = lastWeekEntries.length > 0 
    ? lastWeekEntries.reduce((sum, entry) => sum + (entry.mood || 0), 0) / lastWeekEntries.length 
    : 0;

  return (
    <View style={styles.container}>
      {/* Header centralizado */}
      <View style={styles.centerHeader}>
        <ThemedText style={styles.title}>Linha do Tempo dos Humores</ThemedText>
        <ThemedText style={styles.subtitle}>Últimos 7 dias</ThemedText>
        {avgMood > 0 && (
          <View style={[styles.avgMoodIndicator, { backgroundColor: getMoodColor(avgMood) }]}>
            <ThemedText style={styles.avgMoodText}>{avgMood.toFixed(1)}</ThemedText>
          </View>
        )}
      </View>

      {/* Timeline das barras */}
        <View style={styles.timelineContainer}>
          <View style={styles.moodBarsContainer}>
            {lastWeekEntries.map((entry, index) => {
              if (!entry.date) return null;
              
              let entryDate, entryDateStr, todayStr;
              try {
                entryDate = new Date(entry.date);
                const today = new Date();
                
                // Normalizar as datas para comparação (apenas dia, mês, ano)
                entryDateStr = entryDate.toISOString().split('T')[0];
                todayStr = today.toISOString().split('T')[0];
              } catch (error) {
                console.warn('Data inválida no mapeamento:', entry.date);
                return null;
              }
              const isToday = entryDateStr === todayStr;
              
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.moodBarWrapper}
                  onPress={() => onPress?.(entry)}
                  activeOpacity={0.7}
                >
                  <View style={styles.moodPoint}>
                    <ThemedText style={[
                      styles.moodEmoji,
                      entry.isPlaceholder && { opacity: 0.5 }
                    ]}>
                      {entry.emoji}
                    </ThemedText>
                  </View>
                  
                  <View 
                    style={[
                      styles.moodBar, 
                      { 
                        height: Math.max(30, (entry.mood / 10) * 60),
                        backgroundColor: getMoodColor(entry.mood),
                        opacity: entry.isPlaceholder ? 0.3 : 1
                      },
                      isToday && styles.todayBar
                    ]} 
                  />
                  
                  <ThemedText style={[
                    styles.dayLabel,
                    isToday && styles.todayLabel
                  ]}>
                    {isToday ? 'hoje' : 
                      (entry.dayOfWeek ? 
                        mapDayOfWeek(entry.dayOfWeek) :
                        (() => {
                          try {
                            return new Date(entry.date).toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3);
                          } catch {
                            return 'N/A';
                          }
                        })()
                      )
                    }
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        
      {/* Resumo centralizado */}
      <View style={styles.centerSummary}>
        <ThemedText style={styles.summaryLabel}>
          {getMoodLabel(avgMood)}
        </ThemedText>
        <ThemedText style={styles.entryCount}>
          {lastWeekEntries.length} entradas
        </ThemedText>
      </View>

      {/* Legenda dos humores */}
      <View style={styles.legend}>
        <ThemedText style={styles.legendTitle}>Legenda</ThemedText>
        <View style={styles.legendItems}>
          {[
            { label: 'Radiante', color: '#4CAF50' },
            { label: 'Bem', color: '#2196F3' },
            { label: 'Neutro', color: '#FF9800' },
            { label: 'Difícil', color: '#9C27B0' },
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
  centerHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.neutral.text.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.neutral.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  scrollContainer: {
    marginBottom: spacing.lg,
  },
  singleWeekContainer: {
    width: '100%',
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
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  moodBarsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: '100%',
    height: 120,
    paddingHorizontal: spacing.md,
  },
  moodBarWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  moodPoint: {
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  moodEmoji: {
    fontSize: 16,
  },
  moodBar: {
    width: 12,
    borderRadius: 6,
    marginBottom: spacing.xs,
    minHeight: 20,
  },
  dayLabel: {
    fontSize: fontSize.xs,
    color: colors.neutral.text.secondary,
    textAlign: 'center',
  },
  todayBar: {
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  todayLabel: {
    fontSize: fontSize.xs,
    color: '#4A90E2',
    fontWeight: '600',
    textAlign: 'center',
  },
  weekSummary: {
    alignItems: 'center',
  },
  centerSummary: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  summaryLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.neutral.text.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  entryCount: {
    fontSize: fontSize.xs,
    color: colors.neutral.text.secondary,
    textAlign: 'center',
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
