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
  onTechniquePress: (key: string) => void;
  style?: object;
};

const techniques: Technique[] = [
  {
    key: '4-7-8',
    icon: { name: 'wind', color: '#2196F3', bg: '#E3F2FD' },
    title: 'Respiração 4-7-8',
    duration: '5 minutos • Relaxamento',
    description: 'Inspire por 4 segundos, segure por 7 segundos e expire por 8 segundos. Ideal para reduzir ansiedade e ajudar a adormecer.',
  },
  {
    key: 'box',
    icon: { name: 'square', color: '#4CAF50', bg: '#E8F5E9' },
    title: 'Respiração Quadrada',
    duration: '4 minutos • Foco',
    description: 'Inspire, segure, expire e segure novamente, cada etapa por 4 segundos. Excelente para melhorar a concentração e equilíbrio.',
  },
  {
    key: 'deep',
    icon: { name: 'lungs', color: '#FF9800', bg: '#FFF3E0' },
    title: 'Respiração Profunda',
    duration: '3 minutos • Calmante',
    description: 'Inspire lentamente pelo nariz, expandindo o abdômen, e expire pela boca. Ajuda a reduzir o estresse e acalmar o sistema nervoso.',
  },
  {
    key: 'alternate',
    icon: { name: 'arrow.left.and.right', color: '#03A9F4', bg: '#E1F5FE' },
    title: 'Respiração Alternada',
    duration: '7 minutos • Equilíbrio',
    description: 'Alterne a respiração entre as narinas. Técnica do yoga que equilibra os hemisférios cerebrais e promove clareza mental.',
  },
];

export default function BreathingTechniquesSection({ onTechniquePress, style }: Props) {
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
          onPress={() => onTechniquePress(technique.key)}
        />
      ))}
    </ThemedView>
  );
}