import { ThemedText } from '@/components/ThemedText';
import { fontSize, spacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface EmotionalPoint {
  date: string;
  mood: number; // 1-10 scale
  energy: number; // 1-10 scale
  emoji: string;
}

interface EmotionalJourneyCardProps {
  data: EmotionalPoint[];
  onPress?: () => void;
}

export function EmotionalJourneyCard({ data, onPress }: EmotionalJourneyCardProps) {
  // Calcula a média das últimas 7 entradas
  const recentData = data.slice(-7);
  const avgMood = recentData.length > 0 ? recentData.reduce((sum, point) => sum + point.mood, 0) / recentData.length : 5;
  const avgEnergy = recentData.length > 0 ? recentData.reduce((sum, point) => sum + point.energy, 0) / recentData.length : 5;
  
  // Determina o status emocional
  const getEmotionalStatus = () => {
    if (avgMood >= 7 && avgEnergy >= 7) {
      return { status: 'Florescendo', color: '#4CAF50', emoji: '🌸', gradient: ['#4CAF50', '#81C784'] };
    } else if (avgMood >= 6 && avgEnergy >= 6) {
      return { status: 'Crescendo', color: '#2196F3', emoji: '🌱', gradient: ['#2196F3', '#64B5F6'] };
    } else if (avgMood >= 4 && avgEnergy >= 4) {
      return { status: 'Equilibrando', color: '#FF9800', emoji: '⚖️', gradient: ['#FF9800', '#FFB74D'] };
    } else {
      return { status: 'Cuidando', color: '#9C27B0', emoji: '🤗', gradient: ['#9C27B0', '#BA68C8'] };
    }
  };

  const emotionalStatus = getEmotionalStatus();

  // Gera path SVG para o gráfico de linha
  const generatePath = () => {
    if (recentData.length < 2) return '';
    
    const cardWidth = width - spacing.lg * 2 - 40; // Largura disponível
    const cardHeight = 80;
    const stepX = cardWidth / (recentData.length - 1);
    
    let path = '';
    recentData.forEach((point, index) => {
      const x = index * stepX;
      const y = cardHeight - (point.mood / 10) * cardHeight;
      
      if (index === 0) {
        path += `M ${x} ${y}`;
      } else {
        // Cria uma curva suave
        const prevX = (index - 1) * stepX;
        const prevY = cardHeight - (recentData[index - 1].mood / 10) * cardHeight;
        const cpX1 = prevX + stepX / 3;
        const cpX2 = x - stepX / 3;
        path += ` C ${cpX1} ${prevY} ${cpX2} ${y} ${x} ${y}`;
      }
    });
    
    return path;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={emotionalStatus.gradient as [string, string]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <View style={styles.statusContainer}>
            <ThemedText style={styles.statusEmoji}>{emotionalStatus.emoji}</ThemedText>
            <View style={styles.statusText}>
              <ThemedText style={styles.statusTitle}>Sua Jornada</ThemedText>
              <ThemedText style={styles.statusLabel}>{emotionalStatus.status}</ThemedText>
            </View>
          </View>
          <TouchableOpacity style={styles.expandButton}>
            <Ionicons name="expand" size={20} color="rgba(255, 255, 255, 0.8)" />
          </TouchableOpacity>
        </View>

        {/* Mini Gráfico da Jornada Emocional */}
        <View style={styles.chartContainer}>
          {recentData.length >= 2 ? (
            <Svg height={80} width={width - spacing.lg * 2 - 40} style={styles.chart}>
              {/* Grid lines */}
              <Line
                x1="0"
                y1="20"
                x2={width - spacing.lg * 2 - 40}
                y2="20"
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="1"
              />
              <Line
                x1="0"
                y1="40"
                x2={width - spacing.lg * 2 - 40}
                y2="40"
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="1"
              />
              <Line
                x1="0"
                y1="60"
                x2={width - spacing.lg * 2 - 40}
                y2="60"
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="1"
              />
              
              {/* Linha do humor */}
              <Path
                d={generatePath()}
                stroke="rgba(255, 255, 255, 0.9)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Pontos dos dados */}
              {recentData.map((point, index) => {
                const cardWidth = width - spacing.lg * 2 - 40;
                const stepX = cardWidth / (recentData.length - 1);
                const x = index * stepX;
                const y = 80 - (point.mood / 10) * 80;
                
                return (
                  <Circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="white"
                    stroke="rgba(255, 255, 255, 0.3)"
                    strokeWidth="2"
                  />
                );
              })}
            </Svg>
          ) : (
            <View style={styles.noDataContainer}>
              <ThemedText style={styles.noDataText}>
                Continue escrevendo para ver sua jornada emocional
              </ThemedText>
            </View>
          )}
        </View>

        {/* Métricas resumidas */}
        <View style={styles.metricsContainer}>
          <View style={styles.metric}>
            <ThemedText style={styles.metricValue}>{avgMood.toFixed(1)}/10</ThemedText>
            <ThemedText style={styles.metricLabel}>Humor</ThemedText>
          </View>
          <View style={styles.metric}>
            <ThemedText style={styles.metricValue}>{avgEnergy.toFixed(1)}/10</ThemedText>
            <ThemedText style={styles.metricLabel}>Energia</ThemedText>
          </View>
          <View style={styles.metric}>
            <ThemedText style={styles.metricValue}>{recentData.length}</ThemedText>
            <ThemedText style={styles.metricLabel}>Entradas</ThemedText>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  gradient: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusEmoji: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  statusText: {
    flex: 1,
  },
  statusTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  statusLabel: {
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  expandButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartContainer: {
    marginBottom: spacing.md,
  },
  chart: {
    marginVertical: spacing.xs,
  },
  noDataContainer: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: 'white',
  },
  metricLabel: {
    fontSize: fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
});
