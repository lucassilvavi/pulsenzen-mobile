import Card from '@/components/base/Card';
import { ThemedText } from '@/components/ThemedText';
import { StyleSheet } from 'react-native';

type SectionIntroProps = {
  title: string;
  children: React.ReactNode;
  style?: object;
};

export default function SectionIntro({ title, children, style }: SectionIntroProps) {
  return (
    <Card style={[styles.card, style]}>
      <ThemedText type="subtitle">{title}</ThemedText>
      <ThemedText style={styles.text}>{children}</ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    marginBottom: 20,
  },
  text: {
    marginTop: 10,
    lineHeight: 22,
  },
});