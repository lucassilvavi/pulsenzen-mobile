import DailyQuote from '@/components/DailyQuote';
import HeaderSection from '@/components/HeaderSection';
import MoodSelector from '@/components/MoodSelector';
import QuickAccess from '@/components/QuickAccess';
import RecommendedSection from '@/components/RecommendedSection';
import StreakSection from '@/components/StreakSection';
import { ThemedView } from '@/components/ThemedView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    (async () => {
      const name = await AsyncStorage.getItem('userName');
      setUserName(name || '');
    })();
  }, []);

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
      >
        <HeaderSection userName={userName} />
        <MoodSelector />
        <DailyQuote />
        <QuickAccess />
        <StreakSection />
        <RecommendedSection />
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
    paddingBottom: 30,
  },
});
