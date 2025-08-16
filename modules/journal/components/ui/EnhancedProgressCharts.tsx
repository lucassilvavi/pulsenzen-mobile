import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { useAccessibilityProps, useReducedMotion } from '../../hooks/useAccessibility';

interface ProgressBarProps {
  progress: number; // 0-100
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'success' | 'warning' | 'error';
  animated?: boolean;
  showPercentage?: boolean;
  label?: string;
  accessibilityLabel?: string;
  testID?: string;
}

interface CircularProgressProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  variant?: 'primary' | 'success' | 'warning' | 'error';
  animated?: boolean;
  showPercentage?: boolean;
  label?: string;
  accessibilityLabel?: string;
  testID?: string;
}

interface MoodProgressProps {
  moodData: Array<{
    date: string;
    mood: number; // 1-5
    color: string;
  }>;
  title?: string;
  animated?: boolean;
  accessibilityLabel?: string;
  testID?: string;
}

interface StatsCardProps {
  title: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  animated?: boolean;
  accessibilityLabel?: string;
  testID?: string;
}

const COLORS = {
  primary: ['#667eea', '#764ba2'],
  success: ['#56ab2f', '#a8e6cf'],
  warning: ['#f093fb', '#f5576c'],
  error: ['#ff6b6b', '#ee5a52'],
  secondary: ['#6c757d', '#adb5bd'],
  background: '#f8f9fa',
  text: '#2c3e50',
  textSecondary: '#7f8c8d',
  border: '#e9ecef',
};

const SIZES = {
  small: { height: 8, fontSize: 12 },
  medium: { height: 12, fontSize: 14 },
  large: { height: 16, fontSize: 16 },
};

/**
 * Enhanced Progress Bar with animations and accessibility
 */
export const EnhancedProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  size = 'medium',
  variant = 'primary',
  animated = true,
  showPercentage = false,
  label,
  accessibilityLabel,
  testID,
}) => {
  const progressValue = useSharedValue(0);
  const reducedMotion = useReducedMotion();
  const accessibilityProps = useAccessibilityProps();

  const colors = COLORS[variant];
  const sizeConfig = SIZES[size];

  useEffect(() => {
    if (reducedMotion || !animated) {
      progressValue.value = progress;
    } else {
      progressValue.value = withSpring(progress, {
        damping: 15,
        stiffness: 200,
      });
    }
  }, [progress, animated, reducedMotion]);

  const animatedBarStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value}%`,
  }));

  const accessibilityValue = {
    min: 0,
    max: 100,
    now: progress,
    text: `${Math.round(progress)}%`,
  };

  return (
    <View
      style={styles.progressContainer}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel || label || 'Progress indicator'}
      accessibilityValue={accessibilityValue}
      testID={testID}
      {...accessibilityProps}
    >
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {showPercentage && (
            <Text style={styles.percentage}>{Math.round(progress)}%</Text>
          )}
        </View>
      )}
      
      <View style={[styles.progressTrack, { height: sizeConfig.height }]}>
        <Animated.View style={[styles.progressBar, animatedBarStyle]}>
          <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          />
        </Animated.View>
      </View>
    </View>
  );
};

/**
 * Enhanced Circular Progress with animations
 */
export const EnhancedCircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 100,
  strokeWidth = 8,
  variant = 'primary',
  animated = true,
  showPercentage = false,
  label,
  accessibilityLabel,
  testID,
}) => {
  const progressValue = useSharedValue(0);
  const reducedMotion = useReducedMotion();
  const accessibilityProps = useAccessibilityProps();

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const colors = COLORS[variant];

  useEffect(() => {
    if (reducedMotion || !animated) {
      progressValue.value = progress;
    } else {
      progressValue.value = withTiming(progress, {
        duration: 1000,
        easing: Easing.out(Easing.quad),
      });
    }
  }, [progress, animated, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => {
    const strokeDashoffset = circumference - (progressValue.value / 100) * circumference;
    return {
      strokeDashoffset,
    };
  });

  return (
    <View
      style={[styles.circularContainer, { width: size, height: size }]}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel || label || 'Circular progress indicator'}
      accessibilityValue={{
        min: 0,
        max: 100,
        now: progress,
        text: `${Math.round(progress)}%`,
      }}
      testID={testID}
      {...accessibilityProps}
    >
      <View style={styles.circularContent}>
        {showPercentage && (
          <Text style={[styles.circularText, { fontSize: size * 0.2 }]}>
            {Math.round(progress)}%
          </Text>
        )}
        {label && (
          <Text style={[styles.circularLabel, { fontSize: size * 0.12 }]}>
            {label}
          </Text>
        )}
      </View>
    </View>
  );
};

/**
 * Mood Progress Chart
 */
export const MoodProgressChart: React.FC<MoodProgressProps> = ({
  moodData,
  title = 'Mood Trend',
  animated = true,
  accessibilityLabel,
  testID,
}) => {
  const reducedMotion = useReducedMotion();
  const accessibilityProps = useAccessibilityProps();

  const maxHeight = 100;
  const barWidth = 20;
  const spacing = 8;

  return (
    <View
      style={styles.chartContainer}
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel || `${title}. Chart showing mood data over time`}
      testID={testID}
      {...accessibilityProps}
    >
      {title && <Text style={styles.chartTitle}>{title}</Text>}
      
      <View style={styles.chartContent}>
        <View style={styles.barsContainer}>
          {moodData.map((data, index) => {
            const height = (data.mood / 5) * maxHeight;
            const animatedHeight = useSharedValue(0);

            useEffect(() => {
              if (reducedMotion || !animated) {
                animatedHeight.value = height;
              } else {
                animatedHeight.value = withTiming(height, {
                  duration: 500,
                  delay: index * 100,
                  easing: Easing.out(Easing.quad),
                });
              }
            }, [height, animated, reducedMotion, index]);

            const animatedBarStyle = useAnimatedStyle(() => ({
              height: animatedHeight.value,
              backgroundColor: data.color,
            }));

            return (
              <View key={data.date} style={styles.barContainer}>
                <Animated.View
                  style={[
                    styles.bar,
                    {
                      width: barWidth,
                      marginHorizontal: spacing / 2,
                    },
                    animatedBarStyle,
                  ]}
                />
                <Text style={styles.barLabel}>
                  {new Date(data.date).getDate()}
                </Text>
              </View>
            );
          })}
        </View>
        
        <View style={styles.chartLabels}>
          <Text style={styles.chartAxisLabel}>😔</Text>
          <Text style={styles.chartAxisLabel}>😐</Text>
          <Text style={styles.chartAxisLabel}>😊</Text>
        </View>
      </View>
    </View>
  );
};

/**
 * Enhanced Stats Card with animations
 */
export const EnhancedStatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  trend,
  trendValue,
  icon,
  variant = 'primary',
  animated = true,
  accessibilityLabel,
  testID,
}) => {
  const scaleValue = useSharedValue(0);
  const opacityValue = useSharedValue(0);
  const reducedMotion = useReducedMotion();
  const accessibilityProps = useAccessibilityProps();

  const colors = COLORS[variant];

  useEffect(() => {
    if (reducedMotion || !animated) {
      scaleValue.value = 1;
      opacityValue.value = 1;
    } else {
      scaleValue.value = withSpring(1, {
        damping: 15,
        stiffness: 200,
      });
      opacityValue.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.quad),
      });
    }
  }, [animated, reducedMotion]);

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
    opacity: opacityValue.value,
  }));

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      case 'stable':
        return '→';
      default:
        return '';
    }
  };

  return (
    <Animated.View
      style={[styles.statsCard, animatedCardStyle]}
      accessible
      accessibilityRole="summary"
      accessibilityLabel={
        accessibilityLabel ||
        `${title}: ${value}${trend ? `, trend ${trend} ${trendValue || ''}` : ''}`
      }
      testID={testID}
      {...accessibilityProps}
    >
      <LinearGradient
        colors={[colors[0] + '20', colors[1] + '10']}
        style={styles.cardGradient}
      >
        <View style={styles.cardHeader}>
          {icon && <View style={styles.cardIcon}>{icon}</View>}
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        
        <Text style={styles.cardValue}>{value}</Text>
        
        {trend && (
          <View style={styles.cardTrend}>
            <Text style={styles.trendIcon}>{getTrendIcon()}</Text>
            {trendValue && (
              <Text style={[
                styles.trendValue,
                { color: trend === 'up' ? '#27ae60' : trend === 'down' ? '#e74c3c' : '#7f8c8d' }
              ]}>
                {trendValue}
              </Text>
            )}
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Progress Bar Styles
  progressContainer: {
    marginVertical: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  percentage: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  progressTrack: {
    backgroundColor: COLORS.border,
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },

  // Circular Progress Styles
  circularContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circularContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularText: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
  circularLabel: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },

  // Chart Styles
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flex: 1,
    height: 120,
  },
  barContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    height: '100%',
  },
  bar: {
    borderRadius: 4,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  chartLabels: {
    marginLeft: 8,
    justifyContent: 'space-between',
    height: 100,
  },
  chartAxisLabel: {
    fontSize: 16,
    textAlign: 'center',
  },

  // Stats Card Styles
  statsCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardGradient: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIcon: {
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  cardTrend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  trendValue: {
    fontSize: 12,
    fontWeight: '600',
  },
});
