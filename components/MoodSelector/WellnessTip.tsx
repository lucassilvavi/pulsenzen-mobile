import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface WellnessTipProps {
  period: string;
}

const tips = {
  manha: [
    {
      icon: '🌱',
      text: 'Cada novo dia é uma oportunidade de cuidar de si mesmo.',
      subtext: 'Respire fundo e permita-se sentir.'
    },
    {
      icon: '☀️',
      text: 'Seus sentimentos são válidos, independentemente de como você acorda.',
      subtext: 'Acolha-se com gentileza hoje.'
    },
    {
      icon: '💙',
      text: 'Reconhecer suas emoções é o primeiro passo para o bem-estar.',
      subtext: 'Você está no caminho certo.'
    }
  ],
  tarde: [
    {
      icon: '🌼',
      text: 'É normal que nosso humor flutue ao longo do dia.',
      subtext: 'Como você está se cuidando agora?'
    },
    {
      icon: '🤗',
      text: 'Pause por um momento e perceba como você está.',
      subtext: 'Sua presença consigo mesmo importa.'
    },
    {
      icon: '✨',
      text: 'Meio-dia pode ser um momento de renovação interior.',
      subtext: 'Que tal se conectar com suas necessidades?'
    }
  ],
  noite: [
    {
      icon: '🌙',
      text: 'Refletir sobre o dia faz parte do processo de autoconhecimento.',
      subtext: 'Como foi sua jornada hoje?'
    },
    {
      icon: '💜',
      text: 'Cada dia traz aprendizados sobre nós mesmos.',
      subtext: 'Honre sua experiência de hoje.'
    },
    {
      icon: '🕯️',
      text: 'A noite é um momento de acolhimento e gratidão.',
      subtext: 'Seja gentil consigo mesmo.'
    }
  ]
};

export default function WellnessTip({ period }: WellnessTipProps) {
  const [fadeAnim] = React.useState(new Animated.Value(0));
  
  // Seleciona uma dica aleatória baseada no período
  const periodTips = tips[period as keyof typeof tips] || tips.manha;
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
