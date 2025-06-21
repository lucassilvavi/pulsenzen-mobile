import Button from '@/components/base/Button';
import Card from '@/components/base/Card';
import IconButton from '@/components/base/IconButton';
import ScreenContainer from '@/components/base/ScreenContainer';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, ScrollView, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');

interface CopingStrategy {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  steps: string[];
  icon: string;
}

const copingStrategies: CopingStrategy[] = [
  {
    id: '5-4-3-2-1',
    title: 'Técnica 5-4-3-2-1',
    description: 'Use seus sentidos para se reconectar com o presente',
    duration: 5,
    icon: '👁️',
    steps: [
      '5 coisas que você pode VER ao seu redor',
      '4 coisas que você pode TOCAR',
      '3 coisas que você pode OUVIR',
      '2 coisas que você pode CHEIRAR',
      '1 coisa que você pode SABOREAR'
    ],
  },
  {
    id: 'box-breathing',
    title: 'Respiração Quadrada',
    description: 'Técnica de respiração para acalmar o sistema nervoso',
    duration: 3,
    icon: '🫁',
    steps: [
      'Inspire por 4 segundos',
      'Segure a respiração por 4 segundos',
      'Expire por 4 segundos',
      'Pause por 4 segundos',
      'Repita o ciclo'
    ],
  },
  {
    id: 'progressive-relaxation',
    title: 'Relaxamento Progressivo',
    description: 'Relaxe cada parte do seu corpo sistematicamente',
    duration: 10,
    icon: '💆‍♀️',
    steps: [
      'Comece pelos pés e tensione por 5 segundos',
      'Relaxe completamente e sinta a diferença',
      'Suba para as panturrilhas e repita',
      'Continue até chegar à cabeça',
      'Respire profundamente ao final'
    ],
  },
  {
    id: 'cold-water',
    title: 'Água Fria',
    description: 'Use água fria para ativar o nervo vago',
    duration: 2,
    icon: '💧',
    steps: [
      'Molhe o rosto com água fria',
      'Ou coloque uma toalha fria no pescoço',
      'Respire profundamente',
      'Sinta a sensação refrescante',
      'Repita se necessário'
    ],
  },
];

const emergencyContacts = [
  { name: 'CVV - Centro de Valorização da Vida', number: '188', description: '24h gratuito' },
  { name: 'SAMU', number: '192', description: 'Emergências médicas' },
  { name: 'Bombeiros', number: '193', description: 'Emergências gerais' },
];

export default function SOSSessionScreen() {
  const router = useRouter();
  const [selectedStrategy, setSelectedStrategy] = useState<CopingStrategy | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Animation values
  const pulseAnimation = useRef(new Animated.Value(0)).current;
  const breathingAnimation = useRef(new Animated.Value(0)).current;

  // Timer ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Start calming pulse animation
    startPulseAnimation();
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startBreathingAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathingAnimation, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(breathingAnimation, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startStrategy = (strategy: CopingStrategy) => {
    setSelectedStrategy(strategy);
    setIsActive(true);
    setCurrentStep(0);
    setTimeRemaining(strategy.duration * 60);
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (strategy.id === 'box-breathing') {
      startBreathingAnimation();
    }
    
    // Start countdown timer
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          completeStrategy();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const completeStrategy = () => {
    setIsActive(false);
    setSelectedStrategy(null);
    setCurrentStep(0);
    setTimeRemaining(0);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    Alert.alert(
      'Parabéns!',
      'Você completou a técnica. Como está se sentindo agora?',
      [
        { text: 'Melhor', style: 'default' },
        { text: 'Preciso de mais ajuda', style: 'default' },
        { text: 'OK', style: 'cancel' },
      ]
    );
  };

  const stopStrategy = () => {
    setIsActive(false);
    setSelectedStrategy(null);
    setCurrentStep(0);
    setTimeRemaining(0);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const nextStep = () => {
    if (selectedStrategy && currentStep < selectedStrategy.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const callEmergency = (number: string) => {
    Alert.alert(
      'Ligar para emergência',
      `Deseja ligar para ${number}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Ligar', style: 'default', onPress: () => {
          // In a real app, this would use Linking.openURL(`tel:${number}`)
          Alert.alert('Simulação', `Ligando para ${number}...`);
        }},
      ]
    );
  };

  return (
    <ScreenContainer 
      gradientColors={['#FFCDD2', '#FFEBEE']}
      gradientHeight={height}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <IconButton
            icon={<IconSymbol name="xmark" size={24} color={colors.error.main} />}
            onPress={() => router.back()}
            style={styles.closeButton}
          />
          <View style={styles.headerContent}>
            <ThemedText style={styles.headerTitle}>
              Modo SOS
            </ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Você não está sozinho. Vamos passar por isso juntos.
            </ThemedText>
          </View>
        </View>

        {/* Calming Animation */}
        <View style={styles.animationContainer}>
          <Animated.View
            style={[
              styles.pulseCircle,
              {
                opacity: pulseAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 0.7],
                }),
                transform: [{
                  scale: pulseAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1.1],
                  }),
                }],
              },
            ]}
          />
          {selectedStrategy?.id === 'box-breathing' && (
            <Animated.View
              style={[
                styles.breathingGuide,
                {
                  transform: [{
                    scale: breathingAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1.3],
                    }),
                  }],
                },
              ]}
            />
          )}
          <View style={styles.centerContent}>
            <ThemedText style={styles.calmingText}>
              {isActive ? 'Respire' : 'Você está seguro'}
            </ThemedText>
          </View>
        </View>

        {/* Active Strategy */}
        {isActive && selectedStrategy && (
          <View style={styles.activeStrategyContainer}>
            <Card style={styles.activeStrategyCard}>
              <View style={styles.strategyHeader}>
                <ThemedText style={styles.strategyTitle}>
                  {selectedStrategy.title}
                </ThemedText>
                <ThemedText style={styles.strategyTimer}>
                  {formatTime(timeRemaining)}
                </ThemedText>
              </View>
              
              <View style={styles.stepContainer}>
                <ThemedText style={styles.stepCounter}>
                  Passo {currentStep + 1} de {selectedStrategy.steps.length}
                </ThemedText>
                <ThemedText style={styles.stepText}>
                  {selectedStrategy.steps[currentStep]}
                </ThemedText>
              </View>
              
              <View style={styles.stepControls}>
                <Button
                  label="Anterior"
                  variant="outline"
                  onPress={previousStep}
                  disabled={currentStep === 0}
                  style={styles.stepButton}
                />
                <Button
                  label="Próximo"
                  variant="primary"
                  onPress={nextStep}
                  disabled={currentStep === selectedStrategy.steps.length - 1}
                  style={[styles.stepButton, { backgroundColor: colors.error.main }]}
                />
              </View>
              
              <Button
                label="Parar"
                variant="outline"
                onPress={stopStrategy}
                style={[styles.stopButton, { borderColor: colors.error.main }]}
                labelStyle={{ color: colors.error.main }}
              />
            </Card>
          </View>
        )}

        {/* Strategy Selection */}
        {!isActive && (
          <ScrollView 
            style={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Immediate Help Message */}
            <Card style={styles.helpMessageCard}>
              <ThemedText style={styles.helpMessage}>
                Se você está em crise, lembre-se: este momento vai passar. 
                Escolha uma técnica abaixo para se acalmar.
              </ThemedText>
            </Card>

            {/* Coping Strategies */}
            <View style={styles.strategiesSection}>
              <ThemedText style={styles.sectionTitle}>
                Técnicas de Alívio Rápido
              </ThemedText>
              <View style={styles.strategiesGrid}>
                {copingStrategies.map((strategy) => (
                  <Card
                    key={strategy.id}
                    style={styles.strategyCard}
                    onPress={() => startStrategy(strategy)}
                  >
                    <View style={styles.strategyContent}>
                      <View style={styles.strategyIcon}>
                        <ThemedText style={styles.strategyEmoji}>
                          {strategy.icon}
                        </ThemedText>
                      </View>
                      <View style={styles.strategyInfo}>
                        <ThemedText style={styles.strategyCardTitle}>
                          {strategy.title}
                        </ThemedText>
                        <ThemedText style={styles.strategyDescription}>
                          {strategy.description}
                        </ThemedText>
                        <ThemedText style={styles.strategyDuration}>
                          {strategy.duration} minutos
                        </ThemedText>
                      </View>
                    </View>
                  </Card>
                ))}
              </View>
            </View>

            {/* Emergency Contacts */}
            <View style={styles.emergencySection}>
              <ThemedText style={styles.sectionTitle}>
                Precisa de Ajuda Profissional?
              </ThemedText>
              <View style={styles.emergencyGrid}>
                {emergencyContacts.map((contact, index) => (
                  <Card
                    key={index}
                    style={styles.emergencyCard}
                    onPress={() => callEmergency(contact.number)}
                  >
                    <View style={styles.emergencyContent}>
                      <View style={styles.emergencyIcon}>
                        <IconSymbol name="phone.fill" size={24} color={colors.neutral.white} />
                      </View>
                      <View style={styles.emergencyInfo}>
                        <ThemedText style={styles.emergencyName}>
                          {contact.name}
                        </ThemedText>
                        <ThemedText style={styles.emergencyNumber}>
                          {contact.number}
                        </ThemedText>
                        <ThemedText style={styles.emergencyDescription}>
                          {contact.description}
                        </ThemedText>
                      </View>
                    </View>
                  </Card>
                ))}
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  closeButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    marginTop: spacing.sm,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    marginLeft: -40, // Compensate for close button
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontFamily: 'Inter-Bold',
    color: colors.error.main,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Regular',
    color: colors.error.dark,
    textAlign: 'center',
    lineHeight: fontSize.md * 1.4,
  },
  animationContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  pulseCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.error.light,
    position: 'absolute',
  },
  breathingGuide: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.error.main,
    position: 'absolute',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  calmingText: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-SemiBold',
    color: colors.error.main,
    textAlign: 'center',
  },
  activeStrategyContainer: {
    flex: 1,
  },
  activeStrategyCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 20,
    padding: spacing.xl,
    shadowColor: colors.neutral.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
  },
  strategyHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
});