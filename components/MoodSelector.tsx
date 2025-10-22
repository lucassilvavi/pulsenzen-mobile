import React, { useCallback, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Animated, Easing, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useMood } from '@/context/MoodContext';
import * as Haptics from 'expo-haptics';

const MOOD_OPTIONS = [
  { level: 'pessimo', emoji: '😔', label: 'Péssimo', value: 1, color: '#FF6B6B' },
  { level: 'mal', emoji: '😞', label: 'Mal', value: 2, color: '#FF8E53' },
  { level: 'neutro', emoji: '😐', label: 'Neutro', value: 3, color: '#FFD93D' },
  { level: 'bem', emoji: '😊', label: 'Bem', value: 4, color: '#6BCF7F' },
  { level: 'excelente', emoji: '😄', label: 'Excelente', value: 5, color: '#4ECDC4' },
];

export function MoodSelector() {
  const { 
    shouldShowMoodSelector, 
    currentPeriod,
    submitMood,
    isSubmitting,
    moodStatus,
    isLoading,
    errorStates,
    clearErrors,
    showError
  } = useMood();

  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const scaleAnims = useRef(MOOD_OPTIONS.map(() => new Animated.Value(1))).current;

  // Mostrar erros para o usuário
  React.useEffect(() => {
    const hasAnyError = Object.values(errorStates).some(error => error !== null);
    if (hasAnyError) {
      const errorMessage = Object.values(errorStates).find(error => error !== null);
      if (errorMessage) {
        Alert.alert(
          '⚠️ Algo deu errado',
          errorMessage,
          [
            { 
              text: 'OK', 
              onPress: clearErrors,
              style: 'cancel' 
            }
          ]
        );
      }
    }
  }, [errorStates, clearErrors]);

  // Anima a entrada do componente
  React.useEffect(() => {
    if (shouldShowMoodSelector) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
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
  }, [shouldShowMoodSelector, fadeAnim, scaleAnims]);

  // Move useCallback to before any conditional returns (Rules of Hooks)
  const handleMoodSelect = useCallback(async (moodLevel: string, index: number) => {
    if (isSubmitting) return;
    
    // Prevenir múltiplos cliques rápidos
    if (selectedMood) return;
    
    setSelectedMood(moodLevel);
    
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Anima o emoji selecionado
    Animated.sequence([
      Animated.spring(scaleAnims[index], {
        toValue: 1.3,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.spring(scaleAnims[index], {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      })
    ]).start();

    try {
      const result = await submitMood(moodLevel);
      
      if (result.success) {
        // Feedback de sucesso
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          '✨ Humor registrado!', 
          'Obrigado por compartilhar como você está se sentindo.', 
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        console.error('MoodSelector: Submissão falhou:', result.message);
        // Reset visual state on failure
        setSelectedMood(null);
      }
      // Não mostramos erro aqui porque o MoodContext já vai tratar via errorStates
    } catch (error: any) {
      console.error('MoodSelector: Erro na submissão:', error);
      // Feedback de erro via haptic
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
      
      setSelectedMood(null);
    }
  }, [isSubmitting, submitMood, scaleAnims, selectedMood]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#F8F9FA', '#FFFFFF']}
          style={styles.gradientBackground}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.loadingText}>Carregando estado do humor...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (!shouldShowMoodSelector) {
    return null;
  }

  const getPeriodLabel = () => {
    switch (currentPeriod) {
      case 'manha': return 'manhã';
      case 'tarde': return 'tarde';
      case 'noite': return 'noite';
      default: return 'período';
    }
  };

  const getPeriodGreeting = () => {
    switch (currentPeriod) {
      case 'manha': return '☀️ Bom dia!';
      case 'tarde': return '🌤️ Boa tarde!';
      case 'noite': return '🌙 Boa noite!';
      default: return '👋 Olá!';
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['#F8F9FA', '#FFFFFF']}
        style={styles.gradientBackground}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>{getPeriodGreeting()}</Text>
          <Text style={styles.title}>
            Como você está se sentindo nesta {getPeriodLabel()}?
          </Text>
        </View>
        
        <View style={styles.moodsContainer}>
          {MOOD_OPTIONS.map((option, index) => (
            <Animated.View 
              key={option.level}
              style={[
                styles.moodWrapper,
                { transform: [{ scale: scaleAnims[index] }] }
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.moodOption,
                  selectedMood === option.level && styles.selectedMoodOption,
                  isSubmitting && styles.disabledMoodOption
                ]}
                onPress={() => handleMoodSelect(option.level, index)}
                disabled={isSubmitting}
                activeOpacity={0.7}
              >
                <View style={[styles.moodCircle, { borderColor: option.color }]}>
                  <Text style={styles.moodEmoji}>{option.emoji}</Text>
                </View>
                <Text style={styles.moodLabel}>{option.label}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
        
        {isSubmitting && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContent}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.loadingText}>Registrando seu humor...</Text>
            </View>
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  gradientBackground: {
    padding: 24,
    paddingBottom: 20,
    borderRadius: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    lineHeight: 26,
  },
  moodsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    gap: 4,
  },
  moodWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  moodOption: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  selectedMoodOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#007AFF',
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
    width: 50,
    height: 50,
    borderRadius: 32,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  moodEmoji: {
    fontSize: 30,
    lineHeight: 32,
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    lineHeight: 14,
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
    padding: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    textAlign: 'center',
  },
});