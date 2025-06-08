import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CopingStrategies from '@/components/CopingStrategies';
import EmergencyCard from '@/components/EmergencyCard';
import QuickReliefExercises from '@/components/QuickReliefExercises';
import ReminderCard from '@/components/ReminderCard';
import { ThemedView } from '@/components/ThemedView';



const quickReliefExercises: Exercise[] = [
  {
    key: 'breathing',
    icon: { name: 'wind', color: '#2196F3', bg: '#E3F2FD' },
    title: 'Respiração de Emergência',
    duration: '2 minutos • Ansiedade',
    description: 'Técnica de respiração rápida para acalmar o sistema nervoso e reduzir sintomas de ansiedade aguda.',
  },
  {
    key: 'grounding',
    icon: { name: 'hand.raised.fill', color: '#4CAF50', bg: '#E8F5E9' },
    title: 'Técnica de Aterramento 5-4-3-2-1',
    duration: '3 minutos • Pânico',
    description: 'Use seus sentidos para ancorar-se no momento presente. Eficaz durante ataques de pânico ou dissociação.',
  },
  {
    key: 'bodyscan',
    icon: { name: 'person.fill', color: '#FF9800', bg: '#FFF3E0' },
    title: 'Escaneamento Corporal',
    duration: '4 minutos • Tensão',
    description: 'Identifique e libere tensão muscular progressivamente, do topo da cabeça até os pés.',
  },
  {
    key: 'visualization',
    icon: { name: 'eye.fill', color: '#03A9F4', bg: '#E1F5FE' },
    title: 'Visualização de Lugar Seguro',
    duration: '5 minutos • Conforto',
    description: 'Imagine-se em um local seguro e tranquilo, engajando todos os sentidos para acalmar a mente.',
  },
];

const copingStrategies = [
  {
    key: 'cold-water',
    icon: { name: 'drop.fill', color: '#4CAF50', bg: '#E8F5E9' },
    title: 'Água Fria',
    description: 'Mergulhe o rosto em água fria ou coloque um pano gelado no rosto para ativar o reflexo de mergulho e acalmar o sistema nervoso.',
  },
  {
    key: 'movement',
    icon: { name: 'figure.walk', color: '#2196F3', bg: '#E3F2FD' },
    title: 'Movimento',
    description: 'Caminhe, estique-se ou dance por alguns minutos para liberar energia nervosa e tensão acumulada no corpo.',
  },
  {
    key: 'music',
    icon: { name: 'music.note', color: '#FF9800', bg: '#FFF3E0' },
    title: 'Música',
    description: 'Ouça uma música calmante ou que traga boas memórias para mudar seu estado emocional rapidamente.',
  },
  {
    key: 'connection',
    icon: { name: 'person.2.fill', color: '#9C27B0', bg: '#F3E5F5' },
    title: 'Conexão',
    description: 'Entre em contato com alguém de confiança. Compartilhar seus sentimentos pode reduzir significativamente a angústia.',
  },
];


export default function SOSScreen() {
  const insets = useSafeAreaInsets();

  const handleSOSPress = (exerciseType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push({
      pathname: '/sos-session',
      params: { type: exerciseType }
    });
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + 60 }]}>
      <LinearGradient
        colors={['#FFCDD2', '#FFEBEE']}
        style={styles.headerGradient}
      />
    
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <EmergencyCard/>
        <QuickReliefExercises exercises={quickReliefExercises} onExercisePress={handleSOSPress} />
        <CopingStrategies strategies={copingStrategies} />
        <ReminderCard
        message="Este momento difícil vai passar. Você já superou desafios antes e tem a força para superar este também. Respire fundo e seja gentil consigo mesmo."
        style={styles.reminderCard}
        textStyle={styles.reminderText}
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
  reminderCard: {
    padding: 20,
    marginBottom: 20,
    backgroundColor: '#FFF8E1',
  },
  reminderText: {
    marginTop: 10,
    lineHeight: 22,
    fontStyle: 'italic',
  },
});