import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useMemo } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, View } from 'react-native';
import { WELLNESS_TIPS } from '../constants';
import { useMood } from '../hooks/useMood';
import { MoodPeriod } from '../types';

interface WellnessTipProps {
  period?: MoodPeriod;
  style?: any;
  showAnimation?: boolean;
  customTip?: {
    icon: string;
    text: string;
    subtext: string;
  };
}

/**
 * WellnessTip - Componente otimizado para exibir dicas de bem-estar
 * 
 * Features implementadas:
 * - Integration com useMood hook
 * - Performance otimizada com memo
 * - Accessibility completa
 * - Customização avançada
 * - Error handling robusto
 */
const WellnessTip = memo(({ 
  period, 
  style, 
  showAnimation = true, 
  customTip 
}: WellnessTipProps) => {
  const { currentPeriod, errorStates } = useMood();
  const [fadeAnim] = React.useState(new Animated.Value(0));
  
  // Usa período do hook se não fornecido via props
  const activePeriod = period || currentPeriod;
  
  // Seleciona dica com memoização para performance
  const selectedTip = useMemo(() => {
    if (customTip) return customTip;
    
    const periodTips = WELLNESS_TIPS[activePeriod] || WELLNESS_TIPS.manha;
    const randomIndex = Math.floor(Math.random() * periodTips.length);
    return periodTips[randomIndex];
  }, [activePeriod, customTip]);

  // Configuração de animação memoizada
  const animationConfig = useMemo(() => ({
    toValue: 1,
    duration: 1000,
    useNativeDriver: true,
  }), []);

  React.useEffect(() => {
    if (!showAnimation) {
      fadeAnim.setValue(1);
      return;
    }

    const animation = Animated.timing(fadeAnim, animationConfig);
    const timer = setTimeout(() => {
      animation.start(() => {
        // Callback para acessibilidade
        AccessibilityInfo.announceForAccessibility(
          `Dica de bem-estar: ${selectedTip.text}`
        );
      });
    }, 800);
    
    return () => clearTimeout(timer);
  }, [fadeAnim, animationConfig, showAnimation, selectedTip.text]);

  // Error handling - se há erro de network, mostra dica motivacional
  const errorAwareTip = useMemo(() => {
    if (errorStates.network) {
      return {
        icon: '💙',
        text: 'Mesmo offline, você pode cuidar do seu bem-estar.',
        subtext: 'Seus sentimentos são importantes, independente da conexão.'
      };
    }
    return selectedTip;
  }, [errorStates.network, selectedTip]);

  return (
    <Animated.View 
      style={[styles.container, style, { opacity: fadeAnim }]}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={`Dica de bem-estar para ${activePeriod}: ${errorAwareTip.text}. ${errorAwareTip.subtext}`}
      accessibilityHint="Dica motivacional baseada no período do dia"
    >
      <LinearGradient
        colors={['#f0f9ff', '#e0f2fe', '#ffffff']}
        style={styles.gradient}
        accessible={false}
      >
        <View 
          style={styles.iconContainer}
          accessible={true}
          accessibilityRole="image"
          accessibilityLabel={`Ícone: ${errorAwareTip.icon}`}
        >
          <ThemedText style={styles.icon}>
            {errorAwareTip.icon}
          </ThemedText>
        </View>
        
        <View style={styles.textContainer}>
          <ThemedText 
            style={styles.text}
            accessible={true}
            accessibilityRole="header"
          >
            {errorAwareTip.text}
          </ThemedText>
          <ThemedText 
            style={styles.subtext}
            accessible={true}
          >
            {errorAwareTip.subtext}
          </ThemedText>
        </View>
      </LinearGradient>
    </Animated.View>
  );
});

WellnessTip.displayName = 'WellnessTip';

WellnessTip.displayName = 'WellnessTip';

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
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
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

export default WellnessTip;
