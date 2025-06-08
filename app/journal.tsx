import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Card from '@/components/base/Card';
import JournalEntriesList from '@/components/JournalEntriesList';
import PromptsSection from '@/components/PromptsSection';
import SearchAndActionBar from '@/components/SearchAndActionBar';
import StatsBar from '@/components/StatsBar';
import { ThemedView } from '@/components/ThemedView';
import TipsSection from '@/components/TipsSection';

const journals = [
            {
              id: '1',
              date: 'Hoje, 15:30',
              title: 'Um dia de reflexão',
              preview: 'Hoje foi um dia muito produtivo. Consegui finalizar aquele projeto que estava me preocupando há semanas e ainda tive tempo para uma caminhada no parque...',
              mood: { label: 'Ótimo', color: '#4CAF50', bg: '#E8F5E9', icon: 'face.smiling' },
              tags: ['trabalho', 'conquista', 'natureza'],
            },
            {
              id: '2',
              date: 'Ontem, 21:45',
              title: 'Ansiedade antes da apresentação',
              preview: 'Estou me sentindo nervoso com a apresentação de amanhã. Sei que estou preparado, mas não consigo evitar a ansiedade. Fiz alguns exercícios de respiração que ajudaram...',
              mood: { label: 'Neutro', color: '#FF9800', bg: '#FFF3E0', icon: 'face.dashed' },
              tags: ['ansiedade', 'trabalho', 'respiração'],
            },
            {
              id: '3',
              date: '3 dias atrás, 08:15',
              title: 'Manhã de gratidão',
              preview: 'Acordei hoje com uma sensação de gratidão. Decidi listar cinco coisas pelas quais sou grato: 1. Minha saúde, 2. Minha família, 3. Meu trabalho...',
              mood: { label: 'Bem', color: '#4CAF50', bg: '#E8F5E9', icon: 'face.smiling' },
              tags: ['gratidão', 'manhã', 'reflexão'],
            },
            {
              id: '4',
              date: '1 semana atrás, 19:20',
              title: 'Dia difícil',
              preview: 'Hoje foi um dia realmente desafiador. Tive uma discussão com um colega de trabalho e depois recebi uma notícia não muito boa sobre o projeto...',
              mood: { label: 'Mal', color: '#F44336', bg: '#FFEBEE', icon: 'face.frowning' },
              tags: ['estresse', 'conflito', 'aprendizado'],
            },
          ];

 const promptsSections = [
            {
              icon: 'lightbulb.fill',
              iconColor: '#2196F3',
              iconBg: '#E3F2FD',
              title: 'Momento de Clareza',
              text: 'Descreva um momento recente em que você teve uma percepção importante ou uma nova compreensão sobre algo em sua vida.',
            },
            {
              icon: 'heart.fill',
              iconColor: '#4CAF50',
              iconBg: '#E8F5E9',
              title: 'Gratidão Diária',
              text: 'Liste três coisas pelas quais você é grato hoje e explique por que elas são significativas para você.',
            },
            {
              icon: 'figure.walk',
              iconColor: '#FF9800',
              iconBg: '#FFF3E0',
              title: 'Próximos Passos',
              text: 'Quais são três pequenas ações que você pode realizar amanhã para se aproximar de seus objetivos?',
            },
          ];         

export default function JournalScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  const handleEntryPress = (entryId) => {
    router.push({
      pathname: '/journal-entry',
      params: { id: entryId }
    });
  };

  const handleNewEntry = () => {
    router.push('/journal-entry');
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + 60 }]}>
      <LinearGradient
        colors={['#FFE0B2', '#FFF8E1']}
        style={styles.headerGradient}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
       <SearchAndActionBar
          searchPlaceholder="Pesquisar entradas..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          buttonLabel="Nova Entrada"
          onButtonPress={handleNewEntry}
          style={{ marginBottom: 20 }}
        />

       <Card style={styles.statsCard}>
          <StatsBar
            stats={[
              { value: 28, label: 'Entradas' },
              { value: 14, label: 'Dias' },
              { value: '70%', label: 'Positivas' },
            ]}
          />
        </Card>

        <JournalEntriesList
          entries={journals}
          onEntryPress={handleEntryPress}
        />
        <PromptsSection
          prompts={promptsSections}
        />

       <TipsSection
          title="Dicas para um diário eficaz"
          tips={[
            'Escreva regularmente, mesmo que por apenas 5 minutos',
            'Seja honesto com seus sentimentos e pensamentos',
            'Não se preocupe com gramática ou estrutura',
            'Revise entradas antigas para observar padrões e crescimento',
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
  statsCard: {
    padding: 15,
    marginBottom: 20,
  },
  tipsCard: {
    padding: 20,
    marginBottom: 20,
  },
});