import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BenefitsSection from '@/components/BenefitsSection';
import SectionIntro from '@/components/SectionIntro';
import { ThemedView } from '@/components/ThemedView';
import TipsSection from '@/components/TipsSection';
import BreathingTechniquesSection from '../components/BreathingTechniquesSection';
import { breathingBenefits, breathingTechniques, breathingTips } from '../constants';
import { BreathingTechnique } from '../types';

export default function BreathingScreen() {
  const insets = useSafeAreaInsets();

  const handleSessionPress = (technique: BreathingTechnique) => {
    router.push({
      pathname: '/breathing-session',
      params: { technique: JSON.stringify(technique) },
    });
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + 60 }]}>
      <LinearGradient
        colors={['#A1CEDC', '#E8F4F8']}
        style={styles.headerGradient}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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
