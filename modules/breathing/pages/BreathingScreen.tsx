import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BenefitsSection from '@/components/BenefitsSection';
import SectionIntro from '@/components/SectionIntro';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TipsSection from '@/components/TipsSection';
import { colors } from '@/constants/theme';
import { useAccessibilityProps, useScreenReaderAnnouncement } from '@/hooks/useAccessibility';
import { fontSize, spacing } from '@/utils/responsive';
import BreathingTechniquesSection from '../components/BreathingTechniquesSection';
import { breathingBenefits, breathingTechniques, breathingTips } from '../constants';
import { BreathingTechnique } from '../types';

export default function BreathingScreen() {
  const insets = useSafeAreaInsets();
  
  // Accessibility hooks
  const { createButtonProps } = useAccessibilityProps();
  const { announceNavigation } = useScreenReaderAnnouncement();

  const handleSessionPress = (technique: BreathingTechnique) => {
    router.push({
      pathname: '/breathing-session',
      params: { technique: JSON.stringify(technique) },
    });
  };

  // Announce screen content when component mounts
  useEffect(() => {
    announceNavigation(
      'Tela de Respiração',
      'Página de exercícios de respiração carregada. Aqui você pode escolher entre diferentes técnicas de respiração para relaxar e reduzir o estresse.'
    );
  }, [announceNavigation]);

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <LinearGradient
        colors={['#A1CEDC', '#E8F4F8']}
        style={styles.headerGradient}
      />
      
      {/* Custom Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          {...createButtonProps(
            'Voltar',
            'Toque para voltar à tela anterior',
            false
          )}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primary.main} />
        </TouchableOpacity>
        <ThemedText 
          style={styles.headerTitle}
          accessibilityRole="header"
          accessibilityLabel="Título da página: Respiração"
        >
          Respiração
        </ThemedText>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        accessible={true}
        accessibilityRole="scrollbar"
        accessibilityLabel="Conteúdo da página de respiração"
        accessibilityHint="Role para ver as técnicas de respiração, benefícios e dicas"
      >
        <SectionIntro title="Respire e relaxe">
          Exercícios de respiração podem ajudar a reduzir o estresse, 
          acalmar a mente e melhorar o foco. Escolha uma técnica abaixo 
          para começar sua prática.
        </SectionIntro>

        <BreathingTechniquesSection
          onTechniquePress={handleSessionPress}
          techniques={breathingTechniques}
          style={styles.sectionContainer}
        />
        
        <BenefitsSection
          title="Benefícios da Respiração Consciente"
          benefits={breathingBenefits}
          style={styles.sectionContainer}
        />

        <TipsSection
          title="Dicas para uma prática eficaz"
          tips={breathingTips}
          style={styles.tipsCard}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    zIndex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-SemiBold',
    color: colors.primary.main,
  },
  headerRight: {
    width: 40,
    height: 40,
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
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  sectionContainer: {
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  tipsCard: {
    padding: 20,
    marginBottom: 20,
  },
});
