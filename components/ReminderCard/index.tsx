import { ThemedText } from '@/components/ThemedText';
import Card from '@/components/base/Card';
import { StyleSheet } from 'react-native';

type ReminderCardProps = {
  title?: string;
  message: string;
  style?: any;
  textStyle?: any;
};

export default function ReminderCard({
  title = 'Lembre-se',
  message,
  style,
  textStyle,
}: ReminderCardProps) {
  return (
    <Card style={[styles.reminderCard, style]}>
      <ThemedText type="subtitle">{title}</ThemedText>
      <ThemedText style={[styles.reminderText, textStyle]}>
        {message}
      </ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
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