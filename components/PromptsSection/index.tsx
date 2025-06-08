import PromptCard from '@/components/PromptCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StyleSheet, ViewStyle } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

type Prompt = {
  icon: string;
  iconColor: string;
  iconBg: string;
  title: string;
  text: string;
};

type PromptsSectionProps = {
  prompts: Prompt[];
  title?: string;
  style?: ViewStyle;
};

export default function PromptsSection({
  prompts,
  title = 'Inspirações para Escrever',
  style,
}: PromptsSectionProps) {
  return (
    <ThemedView style={[styles.sectionContainer, style]}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>{title}</ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.promptsScroll}
      >
        {prompts.map((prompt, idx) => (
          <PromptCard
            key={prompt.title + idx}
            icon={prompt.icon}
            iconColor={prompt.iconColor}
            iconBg={prompt.iconBg}
            title={prompt.title}
            text={prompt.text}
          />
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    marginBottom: 15,
  },
  promptsScroll: {
    paddingRight: 20,
  },
});