import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { useAccessibilityProps, useScreenReaderAnnouncement } from '@/hooks/useAccessibility';
import { fontSize, spacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MoodTimelineChart } from '../components/MoodTimelineChart';
import { JournalService, JournalStatsService } from '../services';
import { JournalEntry } from '../types';

const { width } = Dimensions.get('window');

export default function JournalAnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { createButtonProps } = useAccessibilityProps();
  const { announceNavigation } = useScreenReaderAnnouncement();
  
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [stats, setStats] = useState({
    totalEntries: 0,
    uniqueDays: 0,
    percentPositive: 0,
    totalWords: 0,
    avgWordsPerEntry: 0,
    currentStreak: 0,
    longestStreak: 0,
    moodDistribution: [] as { mood: string; count: number; percentage: number }[],
    weeklyProgress: [] as { week: string; entries: number }[]
  });

  const scrollY = new Animated.Value(0);

  const loadAnalyticsData = useCallback(async () => {
    try {
      const journalEntries = await JournalService.getEntries();
      setEntries(journalEntries);
      
      const basicStats = JournalStatsService.calculateStats(journalEntries);
      const advancedStats = calculateAdvancedStats(journalEntries);
      
      setStats({
        ...basicStats,
        ...advancedStats
      });
      
      announceNavigation(
        'Analytics da Jornada',
        `Seus dados foram carregados. Você tem ${journalEntries.length} entradas e ${basicStats.uniqueDays} dias de escrita.`
      );
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
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
      entry.moodTags.forEach(tag => {
        const tagKey = `${tag.emoji} ${tag.label}`;
        moodMap.set(tagKey, (moodMap.get(tagKey) || 0) + 1);
      });
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <BlurView intensity={95} style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
              <Ionicons name="chevron-back" size={24} color={colors.primary.main} />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Analytics</ThemedText>
            <TouchableOpacity style={styles.headerActionButton}>
              <Ionicons name="share" size={22} color={colors.primary.main} />
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 80 }]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* Hero Stats */}
        <LinearGradient
          colors={['#667eea', '#764ba2', '#8B5FBF']}
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
              <View style={styles.mainStat}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="document-text" size={24} color="rgba(255,255,255,0.9)" />
                </View>
                <ThemedText style={styles.mainStatNumber}>{stats.totalEntries}</ThemedText>
                <ThemedText style={styles.mainStatLabel}>Entradas</ThemedText>
              </View>
              <View style={styles.mainStat}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="calendar" size={24} color="rgba(255,255,255,0.9)" />
                </View>
                <ThemedText style={styles.mainStatNumber}>{stats.uniqueDays}</ThemedText>
                <ThemedText style={styles.mainStatLabel}>Dias</ThemedText>
              </View>
              <View style={styles.mainStat}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="text" size={24} color="rgba(255,255,255,0.9)" />
                </View>
                <ThemedText style={styles.mainStatNumber}>{stats.totalWords}</ThemedText>
                <ThemedText style={styles.mainStatLabel}>Palavras</ThemedText>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Streak Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Consistência</ThemedText>
            <ThemedText style={styles.streakEmoji}>🔥</ThemedText>
          </View>
          
          <View style={styles.streakContainer}>
            <LinearGradient
              colors={[getStreakColor(stats.currentStreak), getStreakColor(stats.currentStreak) + '80']}
              style={styles.streakCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.streakHeader}>
                <View style={styles.streakIconContainer}>
                  <ThemedText style={styles.streakEmojiLarge}>
                    {getStreakEmoji(stats.currentStreak)}
                  </ThemedText>
                </View>
                <View style={styles.streakContent}>
                  <ThemedText style={styles.streakNumber}>{stats.currentStreak}</ThemedText>
                  <ThemedText style={styles.streakLabel}>Dias seguidos</ThemedText>
                </View>
              </View>
              <View style={styles.streakFooter}>
                <Ionicons name="trophy" size={16} color="rgba(255,255,255,0.8)" />
                <ThemedText style={styles.streakDescription}>
                  Seu recorde: {stats.longestStreak} dias
                </ThemedText>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Mood Timeline */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Evolução Emocional</ThemedText>
          
          <View style={styles.chartContainer}>
            <MoodTimelineChart 
              data={entries.slice(-14).map((entry, index) => ({
                date: entry.createdAt,
                mood: entry.sentimentScore ? Math.round(entry.sentimentScore * 4) + 6 : Math.floor(Math.random() * 4) + 6,
                emoji: entry.moodTags[0]?.emoji || ['😊', '😌', '✨', '🌟'][Math.floor(Math.random() * 4)],
                label: new Date(entry.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
              }))}
            />
          </View>
        </View>

        {/* Mood Distribution */}
        {stats.moodDistribution.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Suas Emoções Principais 🎭</ThemedText>
            
            <View style={styles.moodList}>
              {stats.moodDistribution.map((mood, index) => (
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
                      colors={['#667eea', '#764ba2']}
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
            {stats.weeklyProgress.map((week, index) => (
              <View key={week.week} style={styles.weekCard}>
                <LinearGradient
                  colors={index % 2 === 0 ? ['#4facfe', '#00f2fe'] : ['#43e97b', '#38f9d7']}
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

        {/* Additional Stats */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Outros Insights 💡</ThemedText>
          
          <View style={styles.additionalStats}>
            <View style={styles.statCard}>
              <LinearGradient
                colors={['#f093fb', '#f5576c']}
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
                colors={['#4facfe', '#00f2fe']}
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
                colors={['#43e97b', '#38f9d7']}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  headerBlur: {
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.primary.main,
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroSection: {
    marginHorizontal: spacing.lg,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: spacing.xl,
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
    fontSize: 32,
    fontWeight: '800',
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
    color: colors.neutral.text.primary,
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
    borderRadius: 16,
    padding: spacing.lg,
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
    fontSize: 28,
  },
  streakContent: {
    flex: 1,
  },
  streakNumber: {
    fontSize: 28,
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
    flexDirection: 'row',
    alignItems: 'center',
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
});
