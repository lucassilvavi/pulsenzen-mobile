import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { WELLNESS_TIPS } from '../constants';

interface WellnessTipProps {
  period: string;
}

export default function WellnessTip({ period }: WellnessTipProps) {
  const [fadeAnim] = React.useState(new Animated.Value(0));
  
  // Seleciona uma dica aleatória baseada no período
  const periodTips = WELLNESS_TIPS[period as keyof typeof WELLNESS_TIPS] || WELLNESS_TIPS.manha;
  const randomTip = periodTips[Math.floor(Math.random() * periodTips.length)];

  React.useEffect(() => {
    const animation = Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    });
    
    const timer = setTimeout(() => animation.start(), 800);
    return () => clearTimeout(timer);
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['#f0f9ff', '#e0f2fe', '#ffffff']}
        style={styles.gradient}
      >
        <View style={styles.iconContainer}>
          <ThemedText style={styles.icon}>
            {randomTip.icon}
          </ThemedText>
        </View>
        
        <View style={styles.textContainer}>
          <ThemedText style={styles.text}>
            {randomTip.text}
          </ThemedText>
          <ThemedText style={styles.subtext}>
            {randomTip.subtext}
          </ThemedText>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.primary.light,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  gradient: {
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 28,
    lineHeight: 28,
  },
  textContainer: {
    flex: 1,
  },
  text: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-SemiBold',
    color: colors.primary.main,
    lineHeight: fontSize.sm * 1.4,
    marginBottom: spacing.xs,
  },
  subtext: {
    fontSize: fontSize.xs,
    fontFamily: 'Inter-Regular',
    color: colors.neutral.text.secondary,
    lineHeight: fontSize.xs * 1.3,
    opacity: 0.8,
  },
});
