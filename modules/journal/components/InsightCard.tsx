import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface InsightData {
  id: string;
  title: string;
  description: string;
  insight: string;
  actionSuggestion: string;
  category: 'mood' | 'growth' | 'pattern' | 'achievement';
  confidence: number; // 0-1
  icon: string;
}

interface InsightCardProps {
  insight: InsightData;
  onPress?: () => void;
  onAction?: () => void;
}

export function InsightCard({ insight, onPress, onAction }: InsightCardProps) {
  const getCategoryConfig = (category: string) => {
    switch (category) {
      case 'mood':
        return {
          colors: ['#E3F2FD', '#BBDEFB'],
          iconColor: '#1976D2',
          accentColor: '#2196F3',
          iconName: 'happy-outline' as const,
          label: 'Humor'
        };
      case 'growth':
        return {
          colors: ['#E8F5E8', '#C8E6C9'],
          iconColor: '#388E3C',
          accentColor: '#4CAF50',
          iconName: 'trending-up' as const,
          label: 'Crescimento'
        };
      case 'pattern':
        return {
          colors: ['#FFF3E0', '#FFE0B2'],
          iconColor: '#F57C00',
          accentColor: '#FF9800',
          iconName: 'analytics-outline' as const,
          label: 'Padrão'
        };
      case 'achievement':
        return {
          colors: ['#F3E5F5', '#E1BEE7'],
          iconColor: '#7B1FA2',
          accentColor: '#9C27B0',
          iconName: 'trophy-outline' as const,
          label: 'Conquista'
        };
      default:
        return {
          colors: ['#F5F5F5', '#E0E0E0'],
          iconColor: '#757575',
          accentColor: '#9E9E9E',
          iconName: 'information-circle-outline' as const,
          label: 'Insight'
        };
    }
  };

  const config = getCategoryConfig(insight.category);
  const confidencePercentage = Math.round(insight.confidence * 100);

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={config.colors as [string, string]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header com categoria e confiança */}
        <View style={styles.header}>
          <View style={styles.categoryContainer}>
            <View style={[styles.iconContainer, { backgroundColor: config.iconColor }]}>
              <Ionicons name={config.iconName} size={16} color="white" />
            </View>
            <ThemedText style={[styles.categoryLabel, { color: config.iconColor }]}>
              {config.label}
            </ThemedText>
          </View>
          
          <View style={styles.confidenceContainer}>
            <View style={styles.confidenceBar}>
              <View 
                style={[
                  styles.confidenceFill,
                  { 
                    width: `${confidencePercentage}%`,
                    backgroundColor: config.accentColor
                  }
                ]}
              />
            </View>
            <ThemedText style={styles.confidenceText}>
              {confidencePercentage}%
            </ThemedText>
          </View>
        </View>

        {/* Conteúdo principal */}
        <View style={styles.content}>
          <ThemedText style={styles.title}>{insight.title}</ThemedText>
          <ThemedText style={styles.description}>{insight.description}</ThemedText>
          
          {/* Insight box com destaque */}
          <View style={[styles.insightBox, { borderLeftColor: config.accentColor }]}>
            <View style={styles.insightHeader}>
              <Ionicons name="bulb" size={16} color={config.accentColor} />
              <ThemedText style={[styles.insightLabel, { color: config.accentColor }]}>
                Insight
              </ThemedText>
            </View>
            <ThemedText style={styles.insightText}>{insight.insight}</ThemedText>
          </View>
        </View>

        {/* Ação sugerida */}
        <View style={styles.actionContainer}>
          <View style={styles.actionText}>
            <ThemedText style={styles.actionLabel}>Sugestão:</ThemedText>
            <ThemedText style={styles.actionDescription}>
              {insight.actionSuggestion}
            </ThemedText>
          </View>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: config.accentColor }]}
            onPress={onAction}
          >
            <ThemedText style={styles.actionButtonText}>Tentar</ThemedText>
            <Ionicons name="arrow-forward" size={14} color="white" />
          </TouchableOpacity>
        </View>

        {/* Decoração visual */}
        <View style={[styles.decorativeCircle, { backgroundColor: config.accentColor }]} />
        <View style={[styles.decorativeCircle2, { backgroundColor: config.iconColor }]} />
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  gradient: {
    padding: spacing.lg,
    position: 'relative',
    minHeight: 200,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
  },
  categoryLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceBar: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 2,
    marginRight: spacing.xs,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 2,
  },
  confidenceText: {
    fontSize: fontSize.xs,
    fontWeight: '500',
    color: colors.neutral.text.secondary,
  },
  content: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.neutral.text.primary,
    marginBottom: spacing.sm,
    lineHeight: fontSize.lg * 1.2,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.neutral.text.secondary,
    lineHeight: fontSize.sm * 1.4,
    marginBottom: spacing.md,
  },
  insightBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: spacing.md,
    borderLeftWidth: 4,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  insightLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginLeft: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  insightText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.neutral.text.primary,
    lineHeight: fontSize.sm * 1.3,
    fontStyle: 'italic',
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionText: {
    flex: 1,
    marginRight: spacing.md,
  },
  actionLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.neutral.text.secondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionDescription: {
    fontSize: fontSize.sm,
    color: colors.neutral.text.primary,
    lineHeight: fontSize.sm * 1.3,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: 'white',
    marginRight: spacing.xs,
  },
  decorativeCircle: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.1,
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -10,
    left: -10,
    width: 30,
    height: 30,
    borderRadius: 15,
    opacity: 0.05,
  },
});
