import { ThemedText } from '@/components/ThemedText';
import Button from '@/components/base/Button';
import Card from '@/components/base/Card';
import CustomTextInput from '@/components/base/CustomTextInput';
import ScreenContainer from '@/components/base/ScreenContainer';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

export default function UserInfoScreen() {
  const router = useRouter();
  
  const [userInfo, setUserInfo] = useState({
    dateOfBirth: '',
    profession: '',
    stressLevel: '5',
    goals: [] as string[],
    mentalHealthHistory: '',
    currentMedications: '',
    emergencyContact: '',
    preferredTime: 'morning',
  });

  const stressLevels = [
    { value: '1', label: 'Muito Baixo', color: colors.success.main },
    { value: '2', label: 'Baixo', color: colors.success.light },
    { value: '3', label: 'Moderado', color: colors.warning.light },
    { value: '4', label: 'Alto', color: colors.warning.main },
    { value: '5', label: 'Muito Alto', color: colors.error.main },
  ];

  const wellnessGoals = [
    'Reduzir ansiedade',
    'Melhorar sono',
    'Aumentar foco',
    'Gerenciar estresse',
    'Desenvolver mindfulness',
    'Controlar humor',
    'Aumentar autoestima',
    'Melhorar relacionamentos',
  ];

  const preferredTimes = [
    { value: 'morning', label: 'Manhã (6h-12h)' },
    { value: 'afternoon', label: 'Tarde (12h-18h)' },
    { value: 'evening', label: 'Noite (18h-22h)' },
    { value: 'night', label: 'Madrugada (22h-6h)' },
  ];

  const toggleGoal = (goal: string) => {
    setUserInfo(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const handleContinue = () => {
    if (userInfo.goals.length === 0) {
      Alert.alert(
        'Objetivos Necessários',
        'Por favor, selecione pelo menos um objetivo de bem-estar.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Save user info and navigate to permissions
    (router as any).push('/onboarding/permissions');
  };

  const handleSkip = () => {
    Alert.alert(
      'Pular Configuração?',
      'Essas informações nos ajudam a personalizar sua experiência. Você pode configurá-las depois no seu perfil.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Pular', onPress: () => (router as any).push('/onboarding/permissions') }
      ]
    );
  };

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name="person-outline" 
            size={40} 
            color={colors.primary.main} 
          />
        </View>
        <ThemedText style={styles.title}>Conte-nos sobre você</ThemedText>
        <ThemedText style={styles.subtitle}>
          Essas informações nos ajudam a personalizar sua experiência no PulseZen
        </ThemedText>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Info */}
        <Card style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Informações Básicas</ThemedText>
          
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Data de Nascimento (opcional)</ThemedText>
            <CustomTextInput
              value={userInfo.dateOfBirth}
              onChangeText={(text) => setUserInfo(prev => ({ ...prev, dateOfBirth: text }))}
              placeholder="DD/MM/AAAA"
              containerStyle={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Profissão (opcional)</ThemedText>
            <CustomTextInput
              value={userInfo.profession}
              onChangeText={(text) => setUserInfo(prev => ({ ...prev, profession: text }))}
              placeholder="Ex: Estudante, Desenvolvedor, Professor..."
              containerStyle={styles.input}
            />
          </View>
        </Card>

        {/* Stress Level */}
        <Card style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Nível de Estresse Atual</ThemedText>
          <ThemedText style={styles.description}>
            Como você avalia seu nível de estresse no dia a dia?
          </ThemedText>
          
          <View style={styles.stressLevels}>
            {stressLevels.map((level) => (
              <Button
                key={level.value}
                label={`${level.value} - ${level.label}`}
                onPress={() => setUserInfo(prev => ({ ...prev, stressLevel: level.value }))}
                style={userInfo.stressLevel === level.value ? 
                  { ...styles.stressButton, backgroundColor: level.color } : 
                  styles.stressButton
                }
                labelStyle={userInfo.stressLevel === level.value ? 
                  { ...styles.stressButtonText, color: colors.neutral.white } : 
                  styles.stressButtonText
                }
              />
            ))}
          </View>
        </Card>

        {/* Wellness Goals */}
        <Card style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Objetivos de Bem-estar *</ThemedText>
          <ThemedText style={styles.description}>
            Selecione os objetivos que você gostaria de alcançar (múltipla escolha)
          </ThemedText>
          
          <View style={styles.goalsGrid}>
            {wellnessGoals.map((goal) => (
              <Button
                key={goal}
                label={goal}
                onPress={() => toggleGoal(goal)}
                style={userInfo.goals.includes(goal) ? styles.goalButtonSelected : styles.goalButton}
                labelStyle={userInfo.goals.includes(goal) ? styles.goalButtonTextSelected : styles.goalButtonText}
              />
            ))}
          </View>
        </Card>

        {/* Preferred Time */}
        <Card style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Horário Preferido</ThemedText>
          <ThemedText style={styles.description}>
            Quando você prefere fazer exercícios de bem-estar?
          </ThemedText>
          
          <View style={styles.timeButtons}>
            {preferredTimes.map((time) => (
              <Button
                key={time.value}
                label={time.label}
                onPress={() => setUserInfo(prev => ({ ...prev, preferredTime: time.value }))}
                style={userInfo.preferredTime === time.value ? styles.timeButtonSelected : styles.timeButton}
                labelStyle={userInfo.preferredTime === time.value ? styles.timeButtonTextSelected : styles.timeButtonText}
              />
            ))}
          </View>
        </Card>

        {/* Health Info */}
        <Card style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Informações de Saúde (opcional)</ThemedText>
          
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Histórico de saúde mental</ThemedText>
            <CustomTextInput
              value={userInfo.mentalHealthHistory}
              onChangeText={(text) => setUserInfo(prev => ({ ...prev, mentalHealthHistory: text }))}
              placeholder="Ex: Ansiedade, depressão, terapia em andamento..."
              containerStyle={styles.input}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Medicações atuais</ThemedText>
            <CustomTextInput
              value={userInfo.currentMedications}
              onChangeText={(text) => setUserInfo(prev => ({ ...prev, currentMedications: text }))}
              placeholder="Ex: Antidepressivos, ansiolíticos..."
              containerStyle={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Contato de emergência</ThemedText>
            <CustomTextInput
              value={userInfo.emergencyContact}
              onChangeText={(text) => setUserInfo(prev => ({ ...prev, emergencyContact: text }))}
              placeholder="Nome e telefone de contato"
              containerStyle={styles.input}
            />
          </View>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Continuar"
          onPress={handleContinue}
          style={styles.continueButton}
        />
        
        <Button
          label="Pular por Agora"
          onPress={handleSkip}
          style={styles.skipButton}
          labelStyle={styles.skipButtonText}
          variant="outline"
        />
      </View>

      <View style={styles.note}>
        <ThemedText style={styles.noteText}>
          🔒 Todas as informações são confidenciais e protegidas
        </ThemedText>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  iconContainer: {
    backgroundColor: colors.primary.light,
    padding: spacing.md,
    borderRadius: 30,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.sm,
    color: colors.primary.main,
  },
  subtitle: {
    fontSize: fontSize.md,
    textAlign: 'center',
    color: colors.neutral.text.secondary,
    lineHeight: fontSize.md * 1.5,
    paddingHorizontal: spacing.md,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.primary.main,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.neutral.text.secondary,
    marginBottom: spacing.md,
    lineHeight: fontSize.sm * 1.4,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.neutral.text.primary,
    marginBottom: spacing.xs,
  },
  input: {
    marginBottom: 0,
  },
  stressLevels: {
    gap: spacing.sm,
  },
  stressButton: {
    backgroundColor: colors.neutral.background,
    borderWidth: 1,
    borderColor: colors.neutral.divider,
    paddingVertical: spacing.md,
  },
  stressButtonText: {
    color: colors.neutral.text.primary,
    fontSize: fontSize.sm,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  goalButton: {
    backgroundColor: colors.neutral.background,
    borderWidth: 1,
    borderColor: colors.neutral.divider,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minWidth: '45%',
    flexGrow: 0,
  },
  goalButtonSelected: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  goalButtonText: {
    color: colors.neutral.text.primary,
    fontSize: fontSize.sm,
  },
  goalButtonTextSelected: {
    color: colors.neutral.white,
  },
  timeButtons: {
    gap: spacing.sm,
  },
  timeButton: {
    backgroundColor: colors.neutral.background,
    borderWidth: 1,
    borderColor: colors.neutral.divider,
    paddingVertical: spacing.md,
  },
  timeButtonSelected: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  timeButtonText: {
    color: colors.neutral.text.primary,
    fontSize: fontSize.sm,
  },
  timeButtonTextSelected: {
    color: colors.neutral.white,
  },
  footer: {
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  continueButton: {
    backgroundColor: colors.primary.main,
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.neutral.divider,
  },
  skipButtonText: {
    color: colors.neutral.text.secondary,
  },
  note: {
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  noteText: {
    fontSize: fontSize.sm,
    color: colors.neutral.text.disabled,
    textAlign: 'center',
  },
});