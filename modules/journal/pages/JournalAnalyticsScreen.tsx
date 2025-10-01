import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { useAccessibilityProps, useScreenReaderAnnouncement } from '@/hooks/useAccessibility';
import { fontSize, spacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MoodTimelineChart } from '../components/MoodTimelineChart';
import { JournalService, JournalStatsService } from '../services';
import { ReportSharingService } from '../services/ReportSharingService';
import { JournalEntry } from '../types';

const { width } = Dimensions.get('window');

export default function JournalAnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { createButtonProps } = useAccessibilityProps();
  const { announceNavigation } = useScreenReaderAnnouncement();
  
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    totalEntries: 0,
    uniqueDays: 0,
    percentPositive: 0,
    totalWords: 0,
    avgWordsPerEntry: 0,
    currentStreak: 0,
    longestStreak: 0,
    moodDistribution: [] as { mood: string; count: number; percentage: number }[],
    weeklyProgress: [] as { week: string; entries: number }[],
    moodTimeline: [] as any[]
  });

  const scrollY = new Animated.Value(0);

  const loadAnalyticsData = useCallback(async () => {
    try {
      // Buscar dados completos da API de analytics
      const [analyticsData, timelineData] = await Promise.all([
        JournalService.getAnalytics(),
        JournalService.getTimelineData(7)
      ]);
      
      // Transformar dados da timeline para o formato esperado pelo MoodTimelineChart
      const timelineEntries = timelineData.map((day: any) => ({
        date: day.date,
        dayOfWeek: day.dayOfWeek, // Usar o dayOfWeek da API
        mood: day.moodLevel === 'radiante' ? 9 : 
              day.moodLevel === 'bem' ? 7 : 
              day.moodLevel === 'neutro' ? 5 : 3,
        emoji: day.moodEmoji || '😐'
      }));

      setStats(analyticsData);
      setEntries(timelineEntries);
      
      announceNavigation(
        'Analytics da Jornada',
        `Seus dados foram carregados. Você tem ${analyticsData.totalEntries} entradas e ${analyticsData.uniqueDays} dias de escrita.`
      );
    } catch (error) {
      console.error('Erro ao carregar analytics da API:', error);
      // Fallback para dados locais em caso de erro
      try {
        const journalEntries = await JournalService.getEntries();
        setEntries(journalEntries);
        
        const basicStats = JournalStatsService.calculateStats(journalEntries);
        const advancedStats = calculateAdvancedStats(journalEntries);
        
        setStats({
          ...basicStats,
          ...advancedStats
        });

        console.log('Fallback para dados locais realizado com sucesso');
      } catch (fallbackError) {
        console.error('Erro no fallback:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  }, [announceNavigation]);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  const calculateAdvancedStats = (entries: JournalEntry[]) => {
    if (entries.length === 0) {
      return {
        totalWords: 0,
        avgWordsPerEntry: 0,
        currentStreak: 0,
        longestStreak: 0,
        moodDistribution: [],
        weeklyProgress: []
      };
    }

    // Total de palavras
    const totalWords = entries.reduce((sum, entry) => sum + entry.wordCount, 0);
    const avgWordsPerEntry = Math.round(totalWords / entries.length);

    // Distribuição de humor
    const moodMap = new Map<string, number>();
    entries.forEach(entry => {
      if (entry.moodTags && Array.isArray(entry.moodTags)) {
        entry.moodTags.forEach(tag => {
          const tagKey = `${tag.emoji} ${tag.label}`;
          moodMap.set(tagKey, (moodMap.get(tagKey) || 0) + 1);
        });
      }
    });

    const moodDistribution = Array.from(moodMap.entries())
      .map(([mood, count]) => ({
        mood,
        count,
        percentage: Math.round((count / entries.length) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Progresso semanal (últimas 4 semanas)
    const weeks = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
    const weeklyProgress = weeks.map((week, index) => ({
      week,
      entries: Math.floor(Math.random() * 8) + 1 // Mock data
    }));

    // Streaks (simplificado)
    const currentStreak = Math.min(entries.length, 7);
    const longestStreak = Math.min(entries.length + 2, 12);

    return {
      totalWords,
      avgWordsPerEntry,
      currentStreak,
      longestStreak,
      moodDistribution,
      weeklyProgress
    };
  };

  const handleShareReport = async () => {
    try {
      // Mostrar loading ou feedback
      console.log('Gerando relatório terapêutico...');
      
      // Usar o serviço de compartilhamento nativo
      await ReportSharingService.shareTherapeuticReport(stats);
      
    } catch (error) {
      console.error('Erro ao compartilhar relatório:', error);
    }
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 7) return '#4CAF50';
    if (streak >= 3) return '#FF9800';
    return '#757575';
  };

  const getStreakEmoji = (streak: number) => {
    if (streak >= 14) return '🔥🔥🔥';
    if (streak >= 7) return '🔥🔥';
    if (streak >= 3) return '🔥';
    return '💭';
  };

  const getMotivationalMessage = (currentStreak: number, longestStreak: number) => {
    if (currentStreak === 0) {
      return "Que tal escrever hoje? Cada jornada começa com um único passo! ✨";
    }
    
    if (currentStreak === 1) {
      return "Ótimo começo! Continue escrevendo para manter o ritmo! 🌱";
    }
    
    if (currentStreak >= 2 && currentStreak <= 6) {
      return "Você está construindo um bom hábito! Continue assim! 💪";
    }
    
    if (currentStreak >= 7 && currentStreak <= 13) {
      return "Uma semana incrível! Sua consistência está impressionante! 🌟";
    }
    
    if (currentStreak >= 14) {
      return "Extraordinário! Você é um exemplo de dedicação! 🏆";
    }
    
    if (currentStreak === longestStreak && currentStreak > 1) {
      return "Novo recorde! Você está superando seus próprios limites! 🎉";
    }
    
    return "Continue sua jornada de autoconhecimento! 📖";
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#A8D5BA', '#F2F9F5']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      <View style={[styles.customHeader, { paddingTop: insets.top + 40 }]}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Voltar para o journal"
            accessibilityHint="Navega de volta para a tela principal do journal"
          >
            <Ionicons name="chevron-back" size={24} color={colors.primary.main} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Relatório</ThemedText>
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={handleShareReport}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Compartilhar analytics"
            accessibilityHint="Compartilha seus dados de analytics do journal"
          >
            <Ionicons name="share" size={22} color={colors.primary.main} />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={[styles.loadingContainer, { paddingTop: insets.top + 100 }]}>
          <LinearGradient
            colors={['#4A90E2', '#7BB3F0']}
            style={styles.loadingCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.loadingContent}>
              <ThemedText style={styles.loadingTitle}>Analisando sua jornada...</ThemedText>
              <ThemedText style={styles.loadingSubtitle}>
                Calculando insights personalizados ✨
              </ThemedText>
              <View style={styles.loadingIndicator}>
                <View style={styles.loadingDot} />
                <View style={[styles.loadingDot, styles.loadingDotDelay1]} />
                <View style={[styles.loadingDot, styles.loadingDotDelay2]} />
              </View>
            </View>
          </LinearGradient>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingTop: spacing.lg }]}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
        >
        {/* Hero Stats */}
        <LinearGradient
          colors={['#4A90E2', '#7BB3F0']}
          style={styles.heroSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroContent}>
            <ThemedText style={styles.heroTitle}>Sua Jornada em Números</ThemedText>
            <ThemedText style={styles.heroSubtitle}>
              Cada estatística conta uma parte da sua história ✨
            </ThemedText>
            
            <View style={styles.mainStatsGrid}>
              <View 
                style={styles.mainStat}
                accessible={true}
                accessibilityRole="text"
                accessibilityLabel={`${stats.totalEntries} entradas no journal`}
              >
                <View style={styles.statIconContainer}>
                  <Ionicons name="document-text" size={24} color="rgba(255,255,255,0.9)" />
                </View>
                <ThemedText style={styles.mainStatNumber}>{stats.totalEntries}</ThemedText>
                <ThemedText style={styles.mainStatLabel}>Entradas</ThemedText>
              </View>
              <View 
                style={styles.mainStat}
                accessible={true}
                accessibilityRole="text"
                accessibilityLabel={`${stats.uniqueDays} dias únicos de escrita`}
              >
                <View style={styles.statIconContainer}>
                  <Ionicons name="calendar" size={24} color="rgba(255,255,255,0.9)" />
                </View>
                <ThemedText style={styles.mainStatNumber}>{stats.uniqueDays}</ThemedText>
                <ThemedText style={styles.mainStatLabel}>Dias</ThemedText>
              </View>
              <View 
                style={styles.mainStat}
                accessible={true}
                accessibilityRole="text"
                accessibilityLabel={`${stats.totalWords} palavras escritas no total`}
              >
                <View style={styles.statIconContainer}>
                  <Ionicons name="text" size={24} color="rgba(255,255,255,0.9)" />
                </View>
                <ThemedText style={styles.mainStatNumber}>{stats.totalWords}</ThemedText>
                <ThemedText style={styles.mainStatLabel}>Palavras</ThemedText>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Mood Timeline */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Evolução Emocional</ThemedText>
          
          <View style={styles.chartContainer}>
            <MoodTimelineChart 
              data={entries}
            />
          </View>
        </View>

        {/* Mood Distribution */}
        {stats.moodDistribution.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Suas Emoções Principais 🎭</ThemedText>
            
            <View style={styles.moodList}>
              {stats.moodDistribution.map((mood: any, index: number) => (
                <View key={mood.mood} style={styles.moodItem}>
                  <View style={styles.moodInfo}>
                    <ThemedText style={styles.moodEmoji}>
                      {index === 0 ? '😊' : index === 1 ? '😌' : index === 2 ? '✨' : index === 3 ? '🌟' : '💭'}
                    </ThemedText>
                    <View>
                      <ThemedText style={styles.moodName}>{mood.mood}</ThemedText>
                      <ThemedText style={styles.moodCount}>{mood.count} vezes</ThemedText>
                    </View>
                  </View>
                                    <View style={styles.moodBar}>
                    <LinearGradient
                      colors={['#4A90E2', '#7BB3F0']}
                      style={[styles.moodBarFill, { width: `${mood.percentage}%` }]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    />
                  </View>
                  <ThemedText style={styles.moodPercentage}>{mood.percentage}%</ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Weekly Progress */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Progresso Semanal 📈</ThemedText>
          
          <View style={styles.weeklyGrid}>
            {stats.weeklyProgress.map((week: any, index: number) => (
              <View key={week.week} style={styles.weekCard}>
                <LinearGradient
                  colors={index % 2 === 0 ? ['#4A90E2', '#7BB3F0'] : ['#5BA7F7', '#8EC5F9']}
                  style={styles.weekCardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <ThemedText style={styles.weekLabel}>{week.week}</ThemedText>
                  <ThemedText style={styles.weekNumber}>{week.entries}</ThemedText>
                  <ThemedText style={styles.weekSubtext}>entradas</ThemedText>
                </LinearGradient>
              </View>
            ))}
          </View>
        </View>

                {/* Streak Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Consistência</ThemedText>
          </View>
          
          <View style={styles.streakContainer}>
            <LinearGradient
              colors={['#5BA7F7', '#8EC5F9']}
              style={styles.streakCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              accessible={true}
              accessibilityRole="text"
              accessibilityLabel={`Sequência atual de ${stats.streak?.currentStreak || 0} dias seguidos. Seu recorde é ${stats.streak?.longestStreak || 0} dias`}
            >
              {/* Header com streak atual */}
              <View style={styles.streakHeader}>
                <View style={styles.streakIconContainer}>
                  <ThemedText style={styles.streakEmojiLarge}>
                    {getStreakEmoji(stats.streak?.currentStreak || 0)}
                  </ThemedText>
                </View>
                <View style={styles.streakContent}>
                  <ThemedText style={styles.streakNumber}>
                    {stats.streak?.currentStreak || 0}
                  </ThemedText>
                  <ThemedText style={styles.streakLabel}>
                    {(stats.streak?.currentStreak || 0) === 1 ? 'Dia seguido' : 'Dias seguidos'}
                  </ThemedText>
                </View>
                <View style={styles.streakBadge}>
                  <ThemedText style={styles.streakBadgeText}>
                    {(stats.streak?.currentStreak || 0) > 0 ? 'ATIVO' : 'PARADO'}
                  </ThemedText>
                </View>
              </View>

              {/* Separador */}
              <View style={styles.streakDivider} />

              {/* Footer com recorde e motivação */}
              <View style={styles.streakFooter}>
                <View style={styles.streakRecord}>
                  <Ionicons name="trophy" size={16} color="#FFD700" />
                  <ThemedText style={styles.streakRecordText}>
                    Recorde: {stats.streak?.longestStreak || 0} {(stats.streak?.longestStreak || 0) === 1 ? 'dia' : 'dias'}
                  </ThemedText>
                </View>
                
                <ThemedText style={styles.streakMotivation}>
                  {getMotivationalMessage(stats.streak?.currentStreak || 0, stats.streak?.longestStreak || 0)}
                </ThemedText>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Additional Stats */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Outros Insights 💡</ThemedText>
          
          <View style={styles.additionalStats}>
            <View style={styles.statCard}>
              <LinearGradient
                colors={['#4A90E2', '#6BB6FF']}
                style={styles.statCardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="create" size={24} color="white" />
                <ThemedText style={styles.statNumberWhite}>{stats.avgWordsPerEntry}</ThemedText>
                <ThemedText style={styles.statLabelWhite}>Palavras por entrada</ThemedText>
              </LinearGradient>
            </View>
            
            <View style={styles.statCard}>
              <LinearGradient
                colors={['#5BA7F7', '#87CEEB']}
                style={styles.statCardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="trending-up" size={24} color="white" />
                <ThemedText style={styles.statNumberWhite}>{stats.percentPositive}%</ThemedText>
                <ThemedText style={styles.statLabelWhite}>Entradas positivas</ThemedText>
              </LinearGradient>
            </View>
            
            <View style={styles.statCard}>
              <LinearGradient
                colors={['#4169E1', '#6495ED']}
                style={styles.statCardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="calendar" size={24} color="white" />
                <ThemedText style={styles.statNumberWhite}>{Math.round(stats.totalEntries / Math.max(stats.uniqueDays, 1) * 10) / 10}</ThemedText>
                <ThemedText style={styles.statLabelWhite}>Média por dia</ThemedText>
              </LinearGradient>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 300,
    zIndex: 0,
  },
  customHeader: {
    flexDirection: 'column',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: colors.journal.border.light,
    zIndex: 1,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.journal.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.journal.border.light,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.journal.text.primary,
  },
  shareButton: {
    padding: spacing.xs,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.journal.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.journal.border.light,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroSection: {
    marginHorizontal: spacing.lg,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  heroContent: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    fontSize: fontSize.md,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  mainStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  mainStat: {
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  mainStatNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  mainStatLabel: {
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.xs,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.journal.text.primary,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  streakContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  streakCard: {
    borderRadius: 24,
    padding: spacing.lg,
    shadowColor: '#5BA7F7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  streakIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  streakEmoji: {
    fontSize: 24,
    marginRight: spacing.xs,
  },
  streakEmojiLarge: {
    fontSize: 24,
  },
  streakContent: {
    flex: 1,
  },
  streakNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
  },
  streakLabel: {
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  streakDescription: {
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: spacing.xs,
  },
  streakFooter: {
    flexDirection: 'column',
    marginTop: spacing.sm,
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  moodList: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  moodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  moodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 120,
  },
  moodEmoji: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  moodName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.neutral.text.primary,
  },
  moodCount: {
    fontSize: fontSize.xs,
    color: colors.neutral.text.secondary,
  },
  moodBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.neutral.background,
    borderRadius: 4,
    marginHorizontal: spacing.md,
  },
  moodBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  moodPercentage: {
    fontSize: fontSize.xs,
    color: colors.neutral.text.secondary,
    width: 35,
    textAlign: 'right',
  },
  weeklyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekCard: {
    borderRadius: 16,
    flex: 1,
    marginHorizontal: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  weekCardGradient: {
    padding: spacing.md,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  weekLabel: {
    fontSize: fontSize.xs,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  weekNumber: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: 'white',
  },
  weekSubtext: {
    fontSize: fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.xs,
  },
  additionalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    borderRadius: 20,
    flex: 1,
    marginHorizontal: spacing.xs,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  statCardGradient: {
    padding: spacing.md,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.neutral.text.primary,
    marginTop: spacing.xs,
  },
  statNumberWhite: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: 'white',
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.neutral.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  statLabelWhite: {
    fontSize: fontSize.xs,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  bottomSpacing: {
    height: 80,
  },
  
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  loadingCard: {
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    width: width - (spacing.lg * 2),
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.journal.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: fontSize.md,
    color: colors.journal.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4A90E2',
    marginHorizontal: 4,
    opacity: 0.4,
  },
  loadingDotDelay1: {
    opacity: 0.7,
  },
  loadingDotDelay2: {
    opacity: 1,
  },
  // Novos estilos para Consistência melhorada
  streakBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  streakBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.5,
  },
  streakDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: spacing.md,
  },
  streakRecord: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  streakRecordText: {
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
  streakMotivation: {
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
    lineHeight: 20,
    marginTop: spacing.xs,
  },
});
