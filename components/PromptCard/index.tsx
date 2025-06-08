import Card from '@/components/base/Card';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { StyleSheet, ViewStyle } from 'react-native';

type PromptCardProps = {
  icon: string;
  iconColor: string;
  iconBg: string;
  title: string;
  text: string;
  style?: ViewStyle;
};

export default function PromptCard({
  icon,
  iconColor,
  iconBg,
  title,
  text,
  style,
}: PromptCardProps) {
  return (
    <Card style={[styles.card, style]}>
      <ThemedView style={[styles.icon, { backgroundColor: iconBg }]}>
        <IconSymbol name={icon} size={24} color={iconColor} />
      </ThemedView>
      <ThemedText style={styles.title}>{title}</ThemedText>
      <ThemedText style={styles.text}>{text}</ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 220,
    padding: 15,
    marginRight: 15,
    alignItems: 'center',
  },
  icon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});