import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { StyleSheet } from 'react-native';

type Benefit = {
  icon: { name: string; color: string; bg: string };
  text: string;
};

type BenefitsSectionProps = {
  title: string;
  benefits: Benefit[];
  style?: object;
};

export default function BenefitsSection({ title, benefits, style }: BenefitsSectionProps) {
  return (
    <ThemedView style={style}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>{title}</ThemedText>
      <ThemedView style={styles.benefitsContainer}>
        {benefits.map((benefit, idx) => (
          <ThemedView style={styles.benefitItem} key={idx}>
            <ThemedView style={[styles.benefitIcon, { backgroundColor: benefit.icon.bg }]}>
              <IconSymbol name={benefit.icon.name} size={20} color={benefit.icon.color} />
            </ThemedView>
            <ThemedText style={styles.benefitText}>{benefit.text}</ThemedText>
          </ThemedView>
        ))}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { marginBottom: 15 },
  benefitsContainer: { marginBottom: 20 },
  benefitItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  benefitIcon: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center', marginRight: 15,
  },
  benefitText: { flex: 1 },
});