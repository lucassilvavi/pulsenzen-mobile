import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StyleSheet, TouchableOpacity } from 'react-native';

export default function SupportSection() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>Suporte</ThemedText>
      <TouchableOpacity style={styles.button}>
        <ThemedText style={styles.buttonText}>Fale conosco</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button}>
        <ThemedText style={styles.buttonText}>Enviar feedback</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { margin: 16, padding: 16, backgroundColor: '#F5F5F5', borderRadius: 12 },
  title: { marginBottom: 8 },
  button: { paddingVertical: 10 },
  buttonText: { color: '#2196F3', fontWeight: '600' },
});