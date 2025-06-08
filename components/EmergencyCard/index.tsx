import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Button from '@/components/base/Button';
import Card from '@/components/base/Card';
import { IconSymbol } from '@/components/ui/IconSymbol';
import * as Haptics from 'expo-haptics';
import { StyleSheet } from 'react-native';

type EmergencyCardProps = {
  onPressEmergency?: () => void;
  style?: any;
};

export default function EmergencyCard({ onPressEmergency, style }: EmergencyCardProps) {
  return (
    <Card style={[styles.emergencyCard, style]}>
      <ThemedView style={styles.emergencyHeader}>
        <IconSymbol name="exclamationmark.triangle.fill" size={24} color="#F44336" />
        <ThemedText type="subtitle" style={styles.emergencyTitle}>
          Precisa de ajuda imediata?
        </ThemedText>
      </ThemedView>
      <ThemedText style={styles.emergencyText}>
        Se você está em uma situação de emergência ou crise, considere entrar em contato com um profissional ou serviço de emergência.
      </ThemedText>
      <Button
        label="Ligar para Emergência"
        variant="primary"
        style={styles.emergencyButton}
        labelStyle={styles.emergencyButtonLabel}
        backgroundColor="#F44336"
        onPress={() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          if (onPressEmergency) onPressEmergency();
          // Implementar chamada de emergência
        }}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  emergencyCard: {
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  emergencyTitle: {
    marginLeft: 10,
    color: '#D32F2F',
  },
  emergencyText: {
    marginBottom: 15,
    lineHeight: 22,
  },
  emergencyButton: {
    marginTop: 5,
  },
  emergencyButtonLabel: {
    color: 'white',
  },
});