import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { ThemedText } from '../../../components/ThemedText';
import { useBreathingSession } from '../hooks/useBreathingSession';
import { BreathingPhase, BreathingTechnique } from '../types';

const { height, width } = Dimensions.get('window');

interface BreathingSessionScreenProps {
  technique: BreathingTechnique;
  onComplete?: () => void;
  onBack?: () => void;
}

const RNAnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function BreathingSessionScreen({ 
  technique, 
  onComplete, 
  onBack 
}: BreathingSessionScreenProps) {
  const insets = useSafeAreaInsets();
  
  // Animated values for enhanced UX
  const backgroundAnim = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatingParticles = useRef([...Array(6)].map(() => new Animated.Value(0))).current;
  
  const {
    isPlaying,
    currentCycle,
    currentPhase,
    timeRemaining,
    totalCycles,
    circleScale,
    circleOpacity,
    progressAnim,
    startSession,
    stopSession,
  } = useBreathingSession({
    technique,
    onSessionComplete: onComplete,
    onPhaseChange: (phase: BreathingPhase) => {
      // Enhanced haptic feedback
      if (phase === 'inhale') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        animateBackground(0.3);
      } else if (phase === 'exhale') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        animateBackground(0.7);
      } else if (phase === 'hold') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        animateBackground(1);
      }
    },
  });

  // Handler para finalizar sessão com reset visual garantido
  const handleStopSession = () => {
    stopSession();
    // Força re-renderização e reset visual imediatamente
    setTimeout(() => {
      // Reset adicional se necessário
    }, 100);
  };

  // Dynamic background animation
  const animateBackground = (toValue: number) => {
    Animated.timing(backgroundAnim, {
      toValue,
      duration: 800,
      useNativeDriver: false,
    }).start();
  };

  // Floating particles animation
  useEffect(() => {
    if (isPlaying) {
      const animateParticles = () => {
        floatingParticles.forEach((particle, index) => {
          Animated.loop(
            Animated.sequence([
              Animated.timing(particle, {
                toValue: 1,
                duration: 3000 + (index * 500),
                useNativeDriver: true,
              }),
              Animated.timing(particle, {
                toValue: 0,
                duration: 2000 + (index * 300),
                useNativeDriver: true,
              }),
            ])
          ).start();
        });
      };
      animateParticles();
      
      // Hide header during session
      Animated.timing(headerOpacity, {
        toValue: 0.3,
        duration: 1000,
        useNativeDriver: true,
      }).start();
      
      // Continuous pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Show header when not playing
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [isPlaying]);

  const getPhaseText = () => {
    switch (currentPhase) {
      case 'inhale':
        return 'Inspire profundamente';
      case 'hold':
        return 'Mantenha o ar';
      case 'exhale':
        return 'Expire devagar';
      default:
        return 'Prepare-se...';
    }
  };

  const getPhaseGradient = (): [string, string] => {
  switch (currentPhase) {
    case 'inhale':
      return ['#8ED1FC', '#B2E5E5']; // Azul céu suave para serenidade
    case 'hold':
      return ['#C8B5E8', '#E8D5F2']; // Lavanda suave para pausa tranquila
    case 'exhale':
      return ['#A8E6CF', '#C2F0D1']; // Verde menta para liberação calmante
    default:
      return ['#F0F4F8', '#E2E8F0']; // Cinza muito claro e neutro
  }
};

// Cores específicas para o círculo interno (melhor legibilidade)
const getInnerCircleColors = (): [string, string] => {
  switch (currentPhase) {
    case 'inhale':
      return ['rgba(255,255,255,0.98)', 'rgba(248,252,255,0.95)']; // Branco com toque azul muito sutil
    case 'hold':
      return ['rgba(255,255,255,0.98)', 'rgba(254,250,255,0.95)']; // Branco com toque lavanda muito sutil
    case 'exhale':
      return ['rgba(255,255,255,0.98)', 'rgba(250,255,252,0.95)']; // Branco com toque verde muito sutil
    default:
      return ['rgba(255,255,255,0.98)', 'rgba(255,255,255,0.92)']; // Branco puro
  }
};

// Cores de texto escuras para contraste com fundo branco do círculo
const getCircleTextColor = () => {
  switch (currentPhase) {
    case 'inhale':
      return '#2C5282'; // Azul tranquilo mais suave
    case 'hold':
      return '#6B46C1'; // Roxo calmo mais suave
    case 'exhale':
      return '#2F855A'; // Verde natural mais suave
    default:
      return '#4A5568'; // Cinza neutro mais suave
  }
};

const getPhaseColor = () => {
  switch (currentPhase) {
    case 'inhale':
      return '#63B3ED'; // Azul respiração suave
    case 'hold':
      return '#B794F6'; // Lavanda pausa serena
    case 'exhale':
      return '#68D391'; // Verde liberação natural
    default:
      return '#CBD5E0'; // Cinza neutro suave
  }
};

// Cores de texto para máximo contraste com cada fase
const getTextColor = () => {
  switch (currentPhase) {
    case 'inhale':
      return '#2A4A6B'; // Azul marinho suave
    case 'hold':
      return '#553C9A'; // Roxo profundo suave
    case 'exhale':
      return '#285E3A'; // Verde floresta suave
    default:
      return '#2D3748'; // Cinza escuro suave
  }
};

  const dynamicBackground = backgroundAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#667eea', '#f093fb', '#4facfe'], // Volta às cores originais
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Dynamic Background */}
      <Animated.View style={[styles.backgroundContainer, { backgroundColor: dynamicBackground }]}>
        <LinearGradient
          colors={getPhaseGradient()}
          style={styles.gradientOverlay}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        {/* Floating Particles */}
        {isPlaying && floatingParticles.map((particle, index) => (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                opacity: particle.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 0.6, 0],
                }),
                transform: [
                  {
                    translateY: particle.interpolate({
                      inputRange: [0, 1],
                      outputRange: [height, -100],
                    }),
                  },
                  {
                    translateX: particle.interpolate({
                      inputRange: [0, 1],
                      outputRange: [
                        (width / 6) * index,
                        (width / 6) * index + (Math.random() - 0.5) * 100,
                      ],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </Animated.View>

      {/* Header */}
      <Animated.View style={[styles.header, { paddingTop: insets.top + 20, opacity: headerOpacity }]}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View style={styles.backButtonContainer}>
            <Ionicons name="chevron-back" size={24} color="#6c6c6cff" />
          </View>
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
              <ThemedText 
                style={styles.techniqueTitle}
                numberOfLines={2}
                adjustsFontSizeToFit
              >
                {technique.title}
              </ThemedText>
              <ThemedText 
                style={[styles.techniqueDescription, { marginHorizontal: 32 }]} // Adiciona espaçamento lateral para evitar sobreposição
              >
                {technique.description}
              </ThemedText>
        </View>
      </Animated.View>

      {/* Main Breathing Interface */}
      <View style={styles.breathingContainer}>
        {/* Enhanced Breathing Circle */}
        <Animated.View style={[styles.breathingWrapper, { transform: [{ scale: pulseAnim }] }]}>
          {/* SVG Progress Ring */}
          <View style={styles.svgContainer}>
            <Svg width={280} height={280} style={styles.progressSvg}>
              {/* Background Circle */}
              <Circle
                cx={140}
                cy={140}
                r={120}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth={3}
                fill="none"
              />
              
              {/* Progress Circle */}
              <RNAnimatedCircle
                cx={140}
                cy={140}
                r={120}
                stroke="rgba(255,255,255,0.8)"
                strokeWidth={4}
                fill="none"
                strokeDasharray={2 * Math.PI * 120}
                strokeDashoffset={progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [2 * Math.PI * 120, 0],
                })}
                strokeLinecap="round"
                strokeOpacity={isPlaying ? 1 : 0.3}
              />
            </Svg>
          </View>
          
          {/* Main Breathing Circle */}
          <Animated.View
            style={[
              styles.breathingCircle,
              {
                transform: [{ scale: circleScale }],
                opacity: circleOpacity,
                backgroundColor: getPhaseColor(),
              },
            ]}
          >
            <LinearGradient
              colors={getPhaseGradient()}
              style={styles.circleGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.innerCircle}>
                <LinearGradient
                  colors={getInnerCircleColors()}
                  style={styles.innerCircleGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.breathingContent}>
                    <ThemedText style={[styles.phaseText, { color: getCircleTextColor() }]}>
                      {getPhaseText()}
                    </ThemedText>
                    {isPlaying && (
                      <Animated.View style={[styles.timerContainer, { opacity: circleOpacity }]}>
                        <ThemedText style={[styles.timerText, { color: getCircleTextColor() }]}>
                          {timeRemaining}
                        </ThemedText>
                        <View style={styles.timerDots}>
                          {[...Array(3)].map((_, i) => (
                            <Animated.View
                              key={i}
                            style={[
                              styles.timerDot,
                              {
                                opacity: backgroundAnim.interpolate({
                                  inputRange: [0, 0.5, 1],
                                  outputRange: i === 0 ? [1, 0.3, 0.3] : i === 1 ? [0.3, 1, 0.3] : [0.3, 0.3, 1],
                                }),
                              },
                            ]}
                          />
                        ))}
                      </View>
                    </Animated.View>
                  )}
                  </View>
                </LinearGradient>
              </View>
            </LinearGradient>
          </Animated.View>
        </Animated.View>

        {/* Session Progress */}
        {isPlaying && (
          <Animated.View style={[styles.progressContainer, { opacity: headerOpacity }]}>
            <View style={styles.cycleInfo}>
              <ThemedText style={styles.cycleText}>
                Ciclo {Math.min(currentCycle + 1, totalCycles)} de {totalCycles}
              </ThemedText>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.max(0, Math.min(100, ((currentCycle) / totalCycles) * 100))}%`,
                      backgroundColor: getPhaseColor(),
                    }
                  ]}
                />
              </View>
            </View>
          </Animated.View>
        )}
      </View>

      {/* Enhanced Controls */}
      <Animated.View style={[styles.controlsContainer, { opacity: headerOpacity, paddingBottom: insets.bottom + 20 }]}>
        {!isPlaying ? (
          <TouchableOpacity
            onPress={startSession}
            style={styles.startButton}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(123, 150, 216, 1)', 'rgba(25, 42, 198, 0.95)']} // Mais opaco
              style={styles.startButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="play" size={28} color={getPhaseColor()} style={styles.playIcon} />
              <ThemedText style={[styles.startButtonText, { color: getPhaseColor() }]}>
                Iniciar Sessão
              </ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleStopSession}
            style={styles.stopButton}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.3)', 'rgba(255, 255, 255, 0)']} // Mais visível
              style={styles.stopButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="stop" size={24} color="rgba(76, 76, 76, 1)" style={styles.stopIcon} />
              <ThemedText style={styles.stopButtonText}>
                Finalizar
              </ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradientOverlay: {
    flex: 1,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 10,
  },
  backButton: {
    zIndex: 20,
  },
  backButtonContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 1)', // Volta ao fundo branco transparente
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    marginLeft: -44, // Compensate for back button width
    paddingHorizontal: 20,
  },
  techniqueTitle: {
    fontSize: 20, // CORRIGIDO: tamanho menor
    fontWeight: 'bold',
    color: 'rgba(119, 119, 119, 0.95)',
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  techniqueDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(119, 119, 119, 0.95)',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
    paddingHorizontal: 10,
    textShadowColor: 'rgba(0,0,0,0.15)', // Sombra para contraste
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  breathingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  breathingWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  svgContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressSvg: {
    transform: [{ rotate: '-90deg' }],
  },
  breathingCircle: {
    width: 240,
    height: 240,
    borderRadius: 120,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0,0,0,0.3)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 20,
  },
  circleGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircleGradient: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0,0,0,0.15)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  innerCircle: {
    // Removido width, height, borderRadius, backgroundColor e shadow pois agora usa innerCircleGradient
  },
  breathingContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseText: {
    fontSize: 18, // CORRIGIDO: tamanho menor
    fontWeight: '600',
    // color será aplicada dinamicamente
    textAlign: 'center',
    marginBottom: 8,
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 24, // CORRIGIDO: tamanho menor
    fontWeight: 'bold',
    // color será aplicada dinamicamente
    textAlign: 'center',
    marginBottom: 8,
  },
  timerDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    marginHorizontal: 3,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 160,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  cycleInfo: {
    alignItems: 'center',
    width: '100%',
  },
  cycleText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(76, 76, 76, 1)', // Cinza escuro
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0,0,0,0.5)', // Sombra preta forte
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  progressBar: {
    width: '80%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.4)', // Mais visível
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    shadowColor: 'rgba(255,255,255,0.5)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  startButton: {
    width: '100%',
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 12,
  },
  startButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  playIcon: {
    marginRight: 12,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  stopButton: {
    width: '80%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(22, 22, 22, 0.5)', // Borda mais visível
  },
  stopButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  stopIcon: {
    marginRight: 8,
  },
  stopButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(76, 76, 76, 1)',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.2)', 
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
