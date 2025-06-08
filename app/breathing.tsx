import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BenefitsSection from '@/components/BenefitsSection';
import BreathingTechniquesSection from '@/components/BreathingTechniquesSection';
import SectionIntro from '@/components/SectionIntro';
import { ThemedView } from '@/components/ThemedView';
import TipsSection from '@/components/TipsSection';

const benefits = [
            {
              icon: { name: 'heart.fill', color: '#4CAF50', bg: '#E8F5E9' },
              text: 'Reduz o estresse e ansiedade',
            },
            {
              icon: { name: 'brain', color: '#2196F3', bg: '#E3F2FD' },
              text: 'Melhora a concentração e foco',
            },
            {
              icon: { name: 'moon.stars.fill', color: '#FF9800', bg: '#FFF3E0' },
              text: 'Promove melhor qualidade de sono',
            },
            {
              icon: { name: 'bolt.fill', color: '#9C27B0', bg: '#F3E5F5' },
              text: 'Aumenta os níveis de energia',
            },
          ]


export default function BreathingScreen() {
  const insets = useSafeAreaInsets();

  const handleSessionPress = (sessionType) => {
    router.push({
      pathname: '/breathing-session',
      params: { type: sessionType }
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
          style={styles.sectionContainer}
        />
        <BenefitsSection
          title="Benefícios da Respiração Consciente"
          benefits={benefits}
          style={styles.sectionContainer}
        />

        <TipsSection
          title="Dicas para uma prática eficaz"
          tips={[
            'Encontre um local tranquilo e confortável',
            'Mantenha uma postura ereta mas relaxada',
            'Pratique regularmente, mesmo que por poucos minutos',
            'Seja gentil consigo mesmo, a prática leva tempo',
          ]}
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