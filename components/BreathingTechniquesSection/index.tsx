import BreathingTechniqueCard from '@/components/BreathingTechniqueCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

type Technique = {
  key: string;
  icon: { name: string; color: string; bg: string };
  title: string;
  duration: string;
  description: string;
};

type Props = {
  onTechniquePress: (data: Technique) => void;
  techniques: Technique[]
  style?: object;
};

export default function BreathingTechniquesSection({ onTechniquePress, techniques, style }: Props) {
  return (
    <ThemedView style={style}>
      <ThemedText type="subtitle" style={{ marginBottom: 15 }}>Técnicas de Respiração</ThemedText>
      {techniques.map((technique) => (
        <BreathingTechniqueCard
          key={technique.key}
          icon={technique.icon}
          title={technique.title}
          duration={technique.duration}
          description={technique.description}
          onPress={() => onTechniquePress(technique)}
        />
      ))}
    </ThemedView>
  );
}