import ScreenContainer from '@/components/base/ScreenContainer';
import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { CalmingAnimation } from '@/modules/breathing';
import { fontSize, spacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

import { ActiveSession, CopingStrategiesGrid, EmergencyContacts, HelpMessage } from '../components';
import { sosGradients } from '../constants';
import { SOSService } from '../services';
import { CopingStrategy, EmergencyContact, SOSSession } from '../types';

const { width, height } = Dimensions.get('window');

export default function SOSScreen() {
  const router = useRouter();
  
  // State
  const [strategies, setStrategies] = useState<CopingStrategy[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<CopingStrategy | null>(null);
  const [currentSession, setCurrentSession] = useState<SOSSession | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);

  // Timer ref
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadData();
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const loadData = async () => {
    try {
      const [strategiesData, contactsData] = await Promise.all([
        SOSService.getCopingStrategies(),
        SOSService.getEmergencyContacts()
      ]);
      
      setStrategies(strategiesData);
      setEmergencyContacts(contactsData);
    } catch (error) {
      console.error('Error loading SOS data:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const startStrategy = async (strategy: CopingStrategy) => {
    try {
      // If it's a breathing technique, navigate to breathing-session
      if (strategy.category === 'breathing') {
        const breathingTechnique = {
          key: strategy.id,
          icon: { name: 'square', color: '#4CAF50', bg: '#E8F5E9' },
          title: strategy.title,
          duration: `${strategy.duration} minutos • Emergência`,
          description: strategy.description,
          inhaleTime: 4,
          holdTime: 4,
          exhaleTime: 4,
          cycles: Math.max(1, Math.floor(strategy.duration * 60 / 16)) 
        };
        
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push({
          pathname: '/breathing-session',
          params: { technique: JSON.stringify(breathingTechnique) }
        });
        return;
      }

      // For non-breathing strategies, continue with existing logic
      setSelectedStrategy(strategy);
      setIsActive(true);
      setCurrentStep(0);
      setTimeRemaining(strategy.duration * 60);
      
      // Start session in service
      const session = await SOSService.startSession(strategy.id);
      setCurrentSession(session);
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
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
    } catch (error) {
      console.error('Error starting strategy:', error);
      Alert.alert('Erro', 'Não foi possível iniciar a técnica. Tente novamente.');
    }
  };

  const completeStrategy = async () => {
    try {
      setIsActive(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Complete session in service
      if (currentSession) {
        await SOSService.completeSession(currentSession.id);
      }
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Show completion dialog
      Alert.alert(
        'Parabéns!',
        'Você completou a técnica. Como está se sentindo agora?',
        [
          { 
            text: 'Melhor', 
            onPress: async () => {
              if (currentSession) {
                await SOSService.completeSession(currentSession.id, 4, 'Me sinto melhor');
              }
            }
          },
          { 
            text: 'Preciso de mais ajuda', 
            onPress: async () => {
              if (currentSession) {
                await SOSService.completeSession(currentSession.id, 2, 'Ainda preciso de ajuda');
              }
            }
          },
          { text: 'OK', style: 'cancel' },
        ]
      );
      
      // Reset state
      setSelectedStrategy(null);
      setCurrentSession(null);
      setCurrentStep(0);
      setTimeRemaining(0);
    } catch (error) {
      console.error('Error completing strategy:', error);
      Alert.alert('Erro', 'Erro ao finalizar a sessão.');
    }
  };

  const stopStrategy = () => {
    setIsActive(false);
    setSelectedStrategy(null);
    setCurrentSession(null);
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

  const handleEmergencyContact = (contact: EmergencyContact) => {
    Alert.alert(
      'Ligar para emergência',
      `Deseja ligar para ${contact.name} (${contact.number})?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Ligar', 
          style: 'default', 
          onPress: () => {
            // In a real app, this would use Linking.openURL(`tel:${contact.number}`)
            Alert.alert('Simulação', `Ligando para ${contact.name}...`);
          }
        },
      ]
    );
  };

  return (
    <ScreenContainer 
      gradientColors={sosGradients.primary}
      gradientHeight={height}
    >
      <View style={styles.container}>
        {/* Custom Header */}
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>SOS</ThemedText>
          <View style={styles.headerRight} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>
            Você não está sozinho. Vamos passar por isso juntos.
          </ThemedText>
        </View>

        {/* Calming Animation */}
        <CalmingAnimation 
          isActive={isActive}
          animationType={selectedStrategy?.id === 'box-breathing' ? 'breathing' : 'pulse'}
          message={isActive ? 'Respire devagar' : 'Você está seguro'}
        />

        {/* Active Strategy */}
        {isActive && selectedStrategy && (
          <ActiveSession
            strategy={selectedStrategy}
            currentStep={currentStep}
            timeRemaining={timeRemaining}
            onNext={nextStep}
            onPrevious={previousStep}
            onStop={stopStrategy}
            onComplete={completeStrategy}
          />
        )}

        {/* Strategy Selection */}
        {!isActive && (
          <ScrollView 
            style={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Help Message */}
            <HelpMessage />

            {/* Coping Strategies */}
            <CopingStrategiesGrid
              strategies={strategies}
              onStrategySelect={startStrategy}
              loading={loading}
            />

            {/* Emergency Contacts */}
            <EmergencyContacts
              contacts={emergencyContacts}
              onContactPress={handleEmergencyContact}
            />
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
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    width: 40,
    height: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-SemiBold',
    color: colors.neutral.white,
  },
  contentContainer: {
    flex: 1,
  },
});
