import { ThemedView } from '@/components/ThemedView';
import { StyleSheet, ViewStyle } from 'react-native';
import { BreathingTechnique } from '../types';
import BreathingTechniqueCard from './BreathingTechniqueCard';

type Props = {
  onTechniquePress: (technique: BreathingTechnique) => void;
  techniques: BreathingTechnique[];
  style?: ViewStyle;
};

export default function BreathingTechniquesSection({ onTechniquePress, techniques, style }: Props) {
  return (
    <ThemedView style={[styles.container, style]}>
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
});
