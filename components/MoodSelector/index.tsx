import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { MoodLevel, useMood } from '@/modules/mood';
import { CelebrationEffect, WellnessTip } from '@/modules/mood/components';
import { fontSize, spacing } from '@/utils/responsive';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Dimensions, Easing, StyleSheet, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface Mood {
  id: MoodLevel;
  label: string;
  emoji: string;
  color: string;
  description: string;
}

const moods: Mood[] = [
  { 
    id: 'excelente', 
    label: 'Incrível', 
    emoji: '🤗', 
    color: '#4CAF50',
    description: 'Me sinto radiante!'
  },
  { 
    id: 'bem', 
    label: 'Bem', 
    emoji: '😊', 
    color: '#66BB6A',
    description: 'Estou bem hoje'
  },
  { 
    id: 'neutro', 
    label: 'Neutro', 
    emoji: '�', 
    color: '#FFB74D',
    description: 'Nem bem, nem mal'
  },
  { 
    id: 'mal', 
    label: 'Difícil', 
    emoji: '�', 
    color: '#FF8A65',
    description: 'Não estou bem'
  },
  { 
    id: 'pessimo', 
    label: 'Intenso', 
    emoji: '😢', 
    color: '#EF5350',
    description: 'Preciso de apoio'
  },
];

export default function MoodSelector() {
  const { 
    currentPeriod, 
    hasAnsweredToday, 
    isLoading, 
    submitMood 
  } = useMood();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMood, setCelebrationMood] = useState<'positive' | 'neutral' | 'negative'>('positive');
  const scaleAnims = useRef(moods.map(() => new Animated.Value(1))).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Anima a entrada quando o componente deve aparecer
  React.useEffect(() => {
    if (!isLoading && !hasAnsweredToday) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      
      // Anima cada emoji sequencialmente
      const animations = scaleAnims.map((anim, index) => 
        Animated.sequence([
          Animated.delay(index * 100),
          Animated.spring(anim, {
            toValue: 1.1,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
          Animated.spring(anim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          })
        ])
      );
      
      Animated.stagger(50, animations).start();
    }
  }, [isLoading, hasAnsweredToday, fadeAnim, scaleAnims]);

  // Animação de pulso suave para chamar atenção
  React.useEffect(() => {
    if (!isLoading && !hasAnsweredToday) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
      
      const timer = setTimeout(() => pulseAnimation.start(), 3000);
      return () => {
        clearTimeout(timer);
        pulseAnimation.stop();
      };
    }
  }, [isLoading, hasAnsweredToday, pulseAnim]);

  const handleMoodSelect = async (mood: MoodLevel, index: number) => {
    if (isSubmitting) return;

    setSelectedMood(mood);
    setIsSubmitting(true);
    
    // Determina o tipo de celebração baseado no humor
    const moodType = mood === 'excelente' || mood === 'bem' ? 'positive' 
                   : mood === 'neutro' ? 'neutral' 
                   : 'negative';
    setCelebrationMood(moodType);
    
    // Animação de seleção mais elaborada
    Animated.parallel([
      Animated.spring(scaleAnims[index], {
        toValue: 1.3,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }),
      // Anima outros itens para baixo
      ...scaleAnims.map((anim, i) => 
        i !== index ? Animated.spring(anim, {
          toValue: 0.9,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }) : Animated.spring(scaleAnims[index], {
          toValue: 1.3,
          useNativeDriver: true,
        })
      )
    ]).start();
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const response = await submitMood(mood);
      
      if (response.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Ativa celebração
        setShowCelebration(true);
        
        // Animação de sucesso
        Animated.sequence([
          Animated.spring(scaleAnims[index], {
            toValue: 1.4,
            useNativeDriver: true,
            tension: 200,
            friction: 8,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 800,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          })
        ]).start();
        
        // Mostra feedback positivo mais carinhoso
        setTimeout(() => {
          Alert.alert(
            '💙 Obrigado por compartilhar!', 
            `Registramos como você está se sentindo na ${getPeriodLabel(currentPeriod)}. Cada momento importa.`,
            [{ text: 'Continuar', style: 'default' }]
          );
        }, 1200);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      // Volta as animações ao normal
      scaleAnims.forEach(anim => {
        Animated.spring(anim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      });
      
      Alert.alert(
        'Ops! 😔', 
        'Não conseguimos registrar agora. Que tal tentar novamente?',
        [{ text: 'OK', style: 'default' }]
      );
      setSelectedMood(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPeriodLabel = (period: string) => {
    const labels: Record<string, string> = {
      'manha': 'manhã',
      'tarde': 'tarde',
      'noite': 'noite'
    };
    return labels[period] || period;
  };

  const getCurrentPeriodGreeting = () => {
    const greetings: Record<string, string> = {
      'manha': '🌅 Como você está começando o dia?',
      'tarde': '☀️ Como está sendo sua tarde?',
      'noite': '🌙 Como foi seu dia?'
    };
    return greetings[currentPeriod] || '💭 Como você está se sentindo?';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary.main} />
      </View>
    );
  }

  if (hasAnsweredToday) {
    return null;
  }

  return (
    <>
      <WellnessTip period={currentPeriod} />
      <Animated.View style={{ 
        opacity: fadeAnim, 
        transform: [{ scale: pulseAnim }] 
      }}>
        <View style={styles.container}>
          <LinearGradient
            colors={['#f8fffe', '#f1f8ff', '#ffffff']}
            style={styles.gradientBackground}
          >
            <View style={styles.header}>
              <ThemedText style={styles.title}>
                {getCurrentPeriodGreeting()}
              </ThemedText>
              <ThemedText style={styles.subtitle}>
                Cada sentimento é válido e importante ✨
              </ThemedText>
            </View>

            <View style={styles.moodsContainer}>
              {moods.map((mood, index) => (
                <Animated.View
                  key={mood.id}
                  style={[
                    styles.moodWrapper,
                    { transform: [{ scale: scaleAnims[index] }] }
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.moodOption,
                      selectedMood === mood.id && styles.selectedMoodOption,
                      isSubmitting && selectedMood !== mood.id && styles.disabledMoodOption
                    ]}
                    activeOpacity={0.8}
                    onPress={() => handleMoodSelect(mood.id, index)}
                    disabled={isSubmitting}
                  >
                    <View style={[
                      styles.moodCircle, 
                      { 
                        borderColor: mood.color,
                        shadowColor: mood.color,
                      },
                      selectedMood === mood.id && { 
                        backgroundColor: mood.color + '15',
                        shadowOpacity: 0.3,
                      }
                    ]}>
                      <ThemedText style={styles.moodEmoji}>
                        {mood.emoji}
                      </ThemedText>
                    </View>
                    <ThemedText style={[
                      styles.moodLabel,
                      selectedMood === mood.id && { 
                        color: mood.color, 
                        fontWeight: '700'
                      }
                    ]}>
                      {mood.label}
                    </ThemedText>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>

            {isSubmitting && (
              <View style={styles.loadingOverlay}>
                <View style={styles.loadingContent}>
                  <ActivityIndicator size="small" color={colors.primary.main} />
                  <ThemedText style={styles.loadingText}>
                    ✨ Registrando seu momento...
                  </ThemedText>
                </View>
              </View>
            )}
          </LinearGradient>
        </View>
      </Animated.View>
      
      <CelebrationEffect 
        trigger={showCelebration} 
        mood={celebrationMood}
        onComplete={() => setShowCelebration(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.primary.main,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  gradientBackground: {
    padding: spacing.xl,
    paddingBottom: spacing.lg,
    borderRadius: 20,
  },
  header: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.xl,
    fontFamily: 'Inter-Bold',
    color: colors.primary.main,
    textAlign: 'center',
    marginBottom: spacing.sm,
    lineHeight: fontSize.xl * 1.3,
  },
  subtitle: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Medium',
    color: colors.neutral.text.secondary,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: fontSize.md * 1.4,
  },
  moodsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
    gap: spacing.xs,
  },
  moodWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  moodOption: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  selectedMoodOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: colors.primary.main,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledMoodOption: {
    opacity: 0.6,
  },
  moodCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    backgroundColor: colors.neutral.white,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  moodEmoji: {
    fontSize: 32,
    lineHeight: 32,
  },
  moodLabel: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-SemiBold',
    color: colors.neutral.text.primary,
    textAlign: 'center',
    lineHeight: fontSize.sm * 1.2,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  loadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: fontSize.md,
    color: colors.primary.main,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
});