import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SleepScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + 60 }]}>
          <LinearGradient
                colors={['#4CAF50', '#E8F5E9']}
                style={styles.headerGradient}
              />
              
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              ></ScrollView>
      <ThemedText type="title" style={styles.title}>
        Sono
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        Em breve: acompanhe e melhore sua qualidade de sono!
      </ThemedText>
      {/* Adicione aqui os componentes e funcionalidades relacionados ao sono */}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
 container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
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
 
  title: {
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 20,
  },
});