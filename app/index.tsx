import { BiometricSetup } from '@/components/biometric';
import { MoodDebugScreen } from '@/components/debug/MoodDebugScreen';
import HeaderSection from '@/components/HeaderSection';
import { MoodSelector } from '@/components/MoodSelector';
import QuickAccess from '@/components/QuickAccess';
import RecommendedSection from '@/components/RecommendedSection';
import { ThemedView } from '@/components/ThemedView';
import { useUserData } from '@/hooks/useUserData';
import { PredictionBanner } from '@/modules/prediction';
import { BiometricPromptService } from '@/services/biometricPromptService';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { displayName } = useUserData();
  const [showDebug] = useState(false);
  const [showBiometricSetup, setShowBiometricSetup] = useState(false);
  
  // Check if should show biometric prompt
  useEffect(() => {
    const checkBiometricPrompt = async () => {
      const shouldShow = await BiometricPromptService.getShouldShowPrompt();
      if (shouldShow) {
        // Clear the flag first
        await BiometricPromptService.clearPromptFlag();
        
        // Show the prompt after a short delay
        setTimeout(() => {
          Alert.alert(
            '🔐 Segurança Aprimorada',
            'Quer habilitar autenticação biométrica para um acesso mais rápido e seguro?',
            [
              { text: 'Agora não', style: 'cancel' },
              { 
                text: 'Configurar', 
                onPress: () => setShowBiometricSetup(true)
              }
            ],
            { cancelable: true }
          );
        }, 500);
      }
    };
    
    checkBiometricPrompt();
  }, []);
  
  // Accessibility hooks - TODO: Re-enable when needed
  // const accessibilityState = useAccessibilityState();
  // const { announceNavigation } = useScreenReaderAnnouncement();

  // Announce screen content when loading
  // TODO: Re-enable when needed
  // useEffect(() => {
  //   if (displayName && displayName !== 'Visitante' && accessibilityState?.screenReaderEnabled) {
  //     announceNavigation(
  //       'Tela Principal',
  //       `Bem-vindo, ${displayName}. Tela principal do PulseZen carregada. Aqui você pode selecionar seu humor, ver citações diárias e acessar exercícios de respiração.`
  //     );
  //   }
  // }, [displayName, accessibilityState?.screenReaderEnabled, announceNavigation]);

  if (showDebug) {
    return <MoodDebugScreen />;
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#A1CEDC', '#E8F4F8']}
        style={styles.headerGradient}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        accessible={true}
        accessibilityRole="scrollbar"
        accessibilityLabel="Conteúdo principal da tela"
        accessibilityHint="Role para navegar pelas seções da tela principal"
      >
        <HeaderSection userName={displayName} />
        <MoodSelector />
        <PredictionBanner />
        <QuickAccess />
        {/*<StreakSection />*/}
        <RecommendedSection />
      </ScrollView>
      
      {/* Biometric Setup Modal */}
      <BiometricSetup
        visible={showBiometricSetup}
        onClose={() => setShowBiometricSetup(false)}
        onSetupComplete={() => setShowBiometricSetup(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 300,
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingBottom: 30,
    backgroundColor: 'transparent',
  },
});
