import Card from '@/components/base/Card';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { StyleSheet } from 'react-native';

type BreathingTechniqueCardProps = {
  icon: { name: string; color: string; bg: string };
  title: string;
  duration: string;
  description: string;
  onPress: () => void;
};

export default function BreathingTechniqueCard({
  icon,
  title,
  duration,
  description,
  onPress,
}: BreathingTechniqueCardProps) {
  return (
    <Card style={styles.card} onPress={onPress}>
      <ThemedView style={styles.header}>
        <ThemedView style={[styles.iconCircle, { backgroundColor: icon.bg }]}>
          <IconSymbol name={icon.name} size={24} color={icon.color} />
        </ThemedView>
        <ThemedView style={styles.info}>
          <ThemedText style={styles.title}>{title}</ThemedText>
          <ThemedText style={styles.duration}>{duration}</ThemedText>
        </ThemedView>
        <IconSymbol name="chevron.right" size={20} color="#757575" />
      </ThemedView>
      <ThemedText style={styles.description}>{description}</ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: 15, marginBottom: 15 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  iconCircle: {
    width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center',
  },
  info: { flex: 1, marginLeft: 15 },
  title: { fontWeight: '600', fontSize: 16 },
  duration: { fontSize: 12, opacity: 0.7, marginTop: 2 },
  description: { fontSize: 14, lineHeight: 20 },
});