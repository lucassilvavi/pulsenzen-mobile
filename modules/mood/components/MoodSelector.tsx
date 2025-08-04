import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Dimensions, Easing, StyleSheet, TouchableOpacity, View } from 'react-native';

// Imports modulares
import { ANIMATION_DURATIONS, MOOD_OPTIONS, THERAPEUTIC_MESSAGES } from '../constants';
import { useMood } from '../hooks/useMood';
import { MoodLevel, MoodSelectorProps } from '../types';
import { formatPeriodLabel, getCelebrationType, getPeriodGreeting } from '../utils';
import CelebrationEffect from './CelebrationEffect';
import WellnessTip from './WellnessTip';

const { width } = Dimensions.get('window');

export default function MoodSelector({ onMoodSelect, disabled = false, compact = false }: MoodSelectorProps) {
  const { 
    currentPeriod, 
    hasAnsweredToday, 
    isLoading, 
    loadingStates,
    errorStates,
    syncStatus,
    submitMood,
    clearErrors 
  } = useMood();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMood, setCelebrationMood] = useState<'positive' | 'neutral' | 'negative'>('positive');
  const scaleAnims = useRef(MOOD_OPTIONS.map(() => new Animated.Value(1))).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Anima a entrada quando o componente deve aparecer
  React.useEffect(() => {
    if (!isLoading && !hasAnsweredToday) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: ANIMATION_DURATIONS.FADE_IN,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      
      // Anima cada emoji sequencialmente
      const animations = scaleAnims.map((anim, index) => 
        Animated.sequence([
          Animated.delay(index * ANIMATION_DURATIONS.SCALE_SEQUENCE),
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
            duration: ANIMATION_DURATIONS.PULSE_CYCLE,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: ANIMATION_DURATIONS.PULSE_CYCLE,
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
    if (isSubmitting || disabled || loadingStates.submittingMood) return;

    // Limpa erros anteriores
    clearErrors();
    setSelectedMood(mood);
    setIsSubmitting(true);
    
    // Determina o tipo de celebração baseado no humor
    const moodType = getCelebrationType(mood);
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
      
      const response = await submitMood(mood, {
        timestamp: Date.now(),
        activities: [], // Pode ser expandido no futuro
        emotions: []
      });
      
      if (response.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Ativa celebração
        setShowCelebration(true);
        
        // Callback opcional
        onMoodSelect?.(mood);
        
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
            duration: ANIMATION_DURATIONS.SUCCESS_CELEBRATION,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          })
        ]).start();
        
        // Feedback personalizado baseado no sync status
        const feedbackMessage = syncStatus.isOnline 
          ? `Registramos como você está se sentindo na ${formatPeriodLabel(currentPeriod)}. ${THERAPEUTIC_MESSAGES.ENCOURAGEMENT}`
          : `Registramos localmente como você está se sentindo. Será sincronizado quando possível. ${THERAPEUTIC_MESSAGES.ENCOURAGEMENT}`;
        
        setTimeout(() => {
          Alert.alert(
            THERAPEUTIC_MESSAGES.GRATITUDE, 
            feedbackMessage,
            [{ text: 'Continuar', style: 'default' }]
          );
        }, 1200);
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
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
      
      // Error handling específico baseado no tipo
      let errorTitle: string = THERAPEUTIC_MESSAGES.ERROR_GENTLE;
      let errorMessage: string = THERAPEUTIC_MESSAGES.ERROR_RETRY;
      
      if (errorStates.network) {
        errorMessage = 'Sem conexão, mas salvamos localmente. Será sincronizado depois.';
        errorTitle = '💙 Salvo offline';
      } else if (errorStates.validation) {
        errorMessage = errorStates.validation;
      } else if (errorStates.server) {
        errorMessage = 'Problema no servidor. Tente novamente em alguns minutos.';
      }
      
      Alert.alert(errorTitle, errorMessage, [{ text: 'OK', style: 'default' }]);
      setSelectedMood(null);
    } finally {
      setIsSubmitting(false);
    }
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
      {!compact && <WellnessTip period={currentPeriod} />}
      <Animated.View style={{ 
        opacity: fadeAnim, 
        transform: [{ scale: pulseAnim }] 
      }}>
        <View style={[styles.container, compact && styles.compactContainer]}>
          <LinearGradient
            colors={['#f8fffe', '#f1f8ff', '#ffffff']}
            style={styles.gradientBackground}
          >
            <View style={styles.header}>
              <ThemedText style={[styles.title, compact && styles.compactTitle]}>
                {getPeriodGreeting(currentPeriod)}
              </ThemedText>
              {!compact && (
                <ThemedText style={styles.subtitle}>
                  {THERAPEUTIC_MESSAGES.VALIDATION}
                </ThemedText>
              )}
            </View>

            {/* Status de sincronização */}
            {!syncStatus.isOnline && (
              <View style={styles.offlineIndicator}>
                <ThemedText style={styles.offlineText}>
                  📱 Modo offline - dados serão sincronizados depois
                </ThemedText>
              </View>
            )}
            
            {syncStatus.hasPendingOperations && (
              <View style={styles.pendingIndicator}>
                <ThemedText style={styles.pendingText}>
                  🔄 {syncStatus.isSyncing ? 'Sincronizando...' : 'Dados pendentes para sincronização'}
                </ThemedText>
              </View>
            )}

            <View style={[styles.moodsContainer, compact && styles.compactMoodsContainer]}>
              {MOOD_OPTIONS.map((mood, index) => (
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
                      compact && styles.compactMoodOption,
                      selectedMood === mood.id && styles.selectedMoodOption,
                      (isSubmitting || disabled) && selectedMood !== mood.id && styles.disabledMoodOption
                    ]}
                    activeOpacity={0.8}
                    onPress={() => handleMoodSelect(mood.id, index)}
                    disabled={isSubmitting || disabled}
                  >
                    <View style={[
                      styles.moodCircle, 
                      compact && styles.compactMoodCircle,
                      { 
                        borderColor: mood.color,
                        shadowColor: mood.color,
                      },
                      selectedMood === mood.id && { 
                        backgroundColor: mood.color + '15',
                        shadowOpacity: 0.3,
                      }
                    ]}>
                      <ThemedText style={[styles.moodEmoji, compact && styles.compactMoodEmoji]}>
                        {mood.emoji}
                      </ThemedText>
                    </View>
                    <ThemedText style={[
                      styles.moodLabel,
                      compact && styles.compactMoodLabel,
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
                    {THERAPEUTIC_MESSAGES.LOADING}
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
  compactContainer: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 16,
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
  compactTitle: {
    fontSize: fontSize.lg,
    marginBottom: spacing.xs,
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
  compactMoodsContainer: {
    gap: spacing.xs / 2,
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
  compactMoodOption: {
    paddingVertical: spacing.sm,
    borderRadius: 12,
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
  compactMoodCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    marginBottom: spacing.xs,
  },
  moodEmoji: {
    fontSize: 32,
    lineHeight: 32,
  },
  compactMoodEmoji: {
    fontSize: 24,
    lineHeight: 24,
  },
  moodLabel: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-SemiBold',
    color: colors.neutral.text.primary,
    textAlign: 'center',
    lineHeight: fontSize.sm * 1.2,
  },
  compactMoodLabel: {
    fontSize: fontSize.xs,
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
  offlineIndicator: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: '#FFC107',
  },
  offlineText: {
    fontSize: fontSize.xs,
    color: '#F57C00',
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  pendingIndicator: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary.main,
  },
  pendingText: {
    fontSize: fontSize.xs,
    color: colors.primary.main,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
});
