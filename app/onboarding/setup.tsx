import Button from '@/components/base/Button';
import Card from '@/components/base/Card';
import CustomTextInput from '@/components/base/CustomTextInput';
import ScreenContainer from '@/components/base/ScreenContainer';
import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { fontSize, spacing } from '@/utils/responsive';
import { logger } from '@/utils/secureLogger';
import { secureStorage } from '@/utils/secureStorage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');

const goals = [
    { id: 'stress', label: 'Reduzir estresse', icon: '🧘‍♀️' },
    { id: 'sleep', label: 'Melhorar o sono', icon: '😴' },
    { id: 'anxiety', label: 'Controlar ansiedade', icon: '💚' },
    { id: 'focus', label: 'Aumentar foco', icon: '🎯' },
    { id: 'mood', label: 'Melhorar humor', icon: '😊' },
    { id: 'energy', label: 'Ter mais energia', icon: '⚡' },
];

const experienceLevels = [
    { id: 'beginner', label: 'Iniciante', description: 'Nunca pratiquei meditação' },
    { id: 'intermediate', label: 'Intermediário', description: 'Já pratiquei algumas vezes' },
    { id: 'advanced', label: 'Avançado', description: 'Pratico regularmente' },
];

export default function SetupScreen() {
    const router = useRouter();
    const { user, isAuthenticated, markOnboardingComplete, completeOnboarding, updateProfile } = useAuth();
    const [name, setName] = useState('');
    const [sex, setSex] = useState('');
    const [age, setAge] = useState('');
    const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
    const [selectedExperience, setSelectedExperience] = useState<string>('');

    const handleGoalToggle = (goalId: string) => {
        setSelectedGoals(prev =>
            prev.includes(goalId)
                ? prev.filter(id => id !== goalId)
                : [...prev, goalId]
        );
    };

    const forceNavigateToHome = () => {
        logger.info("OnboardingSetup", 'Navigating to home screen...');
        
        // Simple and direct navigation to home screen
        try {
            router.replace('/');
        } catch (e) {
            logger.info("OnboardingSetup", 'router.replace failed, trying push:', e);
            // Fallback: use push if replace fails
            router.push('/');
        }
    };

    const handleFinish = async () => {
        // Check if user is authenticated
        if (!isAuthenticated || !user) {
            Alert.alert('Erro', 'Você precisa fazer login primeiro.');
            router.replace('/onboarding/auth');
            return;
        }

        if (!name.trim()) {
            Alert.alert('Nome obrigatório', 'Por favor, digite seu nome para continuar.');
            return;
        }
        if (!sex) {
            Alert.alert('Sexo obrigatório', 'Por favor, selecione se você é MENINO ou MENINA.');
            return;
        }
        if (!age.trim() || isNaN(Number(age)) || Number(age) <= 0) {
            Alert.alert('Idade obrigatória', 'Por favor, informe uma idade válida.');
            return;
        }
        if (selectedGoals.length === 0) {
            Alert.alert('Objetivos obrigatórios', 'Selecione pelo menos um objetivo.');
            return;
        }
        if (!selectedExperience) {
            Alert.alert('Experiência obrigatória', 'Selecione seu nível de experiência.');
            return;
        }
        
        try {
            logger.info("OnboardingSetup", 'Starting onboarding completion...');
            logger.info("OnboardingSetup", 'User authenticated:', isAuthenticated);
            logger.info("OnboardingSetup", 'User data:', user);

            // Calculate date of birth from age
            const currentYear = new Date().getFullYear();
            const birthYear = currentYear - parseInt(age);
            const dateOfBirth = `${birthYear}-01-01`; // Default to January 1st

            // Create onboarding data object
            const onboardingData = {
                dateOfBirth,
                goals: selectedGoals,
                mentalHealthConcerns: [], // Can be added later in a more detailed form
                preferredActivities: selectedGoals, // Use goals as preferred activities for now
                currentStressLevel: selectedExperience === 'beginner' ? 7 : selectedExperience === 'intermediate' ? 5 : 3,
                sleepHours: 8, // Default value
                exerciseFrequency: selectedExperience === 'beginner' ? 'rarely' : selectedExperience === 'intermediate' ? 'sometimes' : 'regularly',
                preferredContactMethod: 'in-app',
                notificationPreferences: {
                    reminders: true,
                    progress: true,
                    tips: true,
                },
            };

            logger.info("OnboardingSetup", 'Onboarding data prepared:', onboardingData);

            // Complete onboarding through API
            const result = await completeOnboarding(onboardingData);
            
            logger.info("OnboardingSetup", 'Complete onboarding result:', result);
            
            if (result.success) {
                logger.info("OnboardingSetup", 'Onboarding API call successful, updating profile...');
                
                // Also update profile with additional info
                const profileResult = await updateProfile({
                    firstName: name.trim(),
                    // Add other profile fields if needed
                });
                
                logger.info("OnboardingSetup", 'Profile update result:', profileResult);

                // Mark onboarding as complete to trigger navigation
                await markOnboardingComplete();

                // Verify onboarding was marked as complete
                const onboardingCheck = await secureStorage.getItem<string>('onboardingDone');
                logger.info("OnboardingSetup", 'Onboarding status after completion:', onboardingCheck);

                logger.info("OnboardingSetup", 'Onboarding completed successfully, navigating to home...');

                // Force navigation using our robust method
                forceNavigateToHome();
                
            } else {
                logger.error('OnboardingSetup', 'Onboarding failed', new Error(result.message || 'Unknown error'));
                
                // If the error is related to authentication, try to mark onboarding as complete locally
                if (result.message?.includes('401') || result.message?.includes('authorization') || result.message?.includes('Authentication failed') || result.message?.includes('Failed to complete onboarding')) {
                    logger.info("OnboardingSetup", 'Authentication/API issue detected, completing onboarding locally...');
                    
                    // Update profile locally
                    try {
                        await updateProfile({
                            firstName: name.trim(),
                        });
                    } catch (profileError) {
                        logger.info("OnboardingSetup", 'Profile update failed, but continuing with local completion');
                    }
                    
                    // Mark onboarding as complete locally even if API call failed
                    await markOnboardingComplete();
                    
                    // Verify onboarding was marked as complete locally
                    const onboardingCheck = await secureStorage.getItem<string>('onboardingDone');
                    logger.info("OnboardingSetup", 'Local onboarding status after completion:', onboardingCheck);
                    
                    // Navigate to home
                    forceNavigateToHome();
                    
                    // Show a success message since the user completed all steps
                    setTimeout(() => {
                        Alert.alert('Bem-vindo!', 'Seu perfil foi configurado. Você pode sincronizar seus dados mais tarde nas configurações.');
                    }, 1000);
                } else {
                    Alert.alert('Erro', result.message || 'Não foi possível completar o onboarding. Tente novamente.');
                }
            }
        } catch (error) {
            logger.error('OnboardingSetup', 'Error completing onboarding', error instanceof Error ? error : new Error(String(error)));
            Alert.alert('Erro', 'Não foi possível salvar suas preferências. Tente novamente.');
        }
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <ScreenContainer
            gradientColors={colors.gradients.profile}
            gradientHeight={height * 0.3}
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <ThemedText style={styles.title}>
                        Vamos personalizar sua experiência
                    </ThemedText>
                    <ThemedText style={styles.subtitle}>
                        Algumas informações para criar o melhor plano para você
                    </ThemedText>
                </View>

                {/* Setup Form */}
                <ScrollView
                    style={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Name Input */}
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>
                            Como podemos te chamar?
                        </ThemedText>
                        <CustomTextInput
                            placeholder="Digite seu nome"
                            value={name}
                            onChangeText={setName}
                            inputStyle={styles.nameInput}
                        />
                    </View>

                    {/* Sex Input */}
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>
                            Você é MENINO ou MENINA?
                        </ThemedText>
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <Button
                                label="MENINO"
                                variant={sex === 'MENINO' ? 'primary' : 'outline'}
                                size="large"
                                onPress={() => setSex('MENINO')}
                                style={{ flex: 1 }}
                            />
                            <Button
                                label="MENINA"
                                variant={sex === 'MENINA' ? 'primary' : 'outline'}
                                size="large"
                                onPress={() => setSex('MENINA')}
                                style={{ flex: 1 }}
                            />
                        </View>
                    </View>

                    {/* Age Input */}
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>
                            Qual a sua idade?
                        </ThemedText>
                        <CustomTextInput
                            placeholder="Digite sua idade"
                            value={age}
                            onChangeText={setAge}
                            keyboardType="numeric"
                            inputStyle={styles.nameInput}
                        />
                    </View>

                    {/* Goals Selection */}
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>
                            Quais são seus principais objetivos?
                        </ThemedText>
                        <ThemedText style={styles.sectionSubtitle}>
                            Selecione todos que se aplicam
                        </ThemedText>
                        <View style={styles.goalsGrid}>
                            {goals.map((goal, idx) => (
                                <View key={goal.id} style={{ width: '45%', marginRight: idx % 2 === 0 ? '4%' : 0, marginBottom: spacing.sm }}>
                                    <Card
                                        style={{
                                            ...(styles.goalCard as object),
                                            ...(selectedGoals.includes(goal.id) ? styles.selectedGoalCard : {}),
                                        }}
                                        onPress={() => handleGoalToggle(goal.id)}
                                    >
                                        <View style={styles.goalContent}>
                                            <ThemedText style={styles.goalIcon}>
                                                {goal.icon}
                                            </ThemedText>
                                            <ThemedText style={[
                                                styles.goalLabel,
                                                selectedGoals.includes(goal.id) && styles.selectedGoalLabel
                                            ]}>
                                                {goal.label}
                                            </ThemedText>
                                        </View>
                                    </Card>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Experience Level */}
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>
                            Qual seu nível de experiência?
                        </ThemedText>
                        <View style={styles.experienceList}>
                            {experienceLevels.map((level) => (
                                <Card
                                    key={level.id}
                                    style={{
                                        ...(styles.experienceCard as object),
                                        ...(selectedExperience === level.id ? styles.selectedExperienceCard : {}),
                                    }}
                                    onPress={() => setSelectedExperience(level.id)}
                                >
                                    <View style={styles.experienceContent}>
                                        <View style={styles.experienceHeader}>
                                            <ThemedText style={[
                                                styles.experienceLabel,
                                                selectedExperience === level.id && styles.selectedExperienceLabel
                                            ]}>
                                                {level.label}
                                            </ThemedText>
                                            <View style={[
                                                styles.radioButton,
                                                selectedExperience === level.id && styles.selectedRadioButton
                                            ]} />
                                        </View>
                                        <ThemedText style={styles.experienceDescription}>
                                            {level.description}
                                        </ThemedText>
                                    </View>
                                </Card>
                            ))}
                        </View>
                    </View>
                </ScrollView>

                {/* Bottom Actions */}
                <View style={styles.bottomContainer}>
                    <View style={styles.buttonRow}>
                        <Button
                            label="Voltar"
                            variant="outline"
                            size="large"
                            onPress={handleBack}
                            style={styles.backButton}
                        />
                        <Button
                            label="Finalizar"
                            variant="primary"
                            size="large"
                            onPress={handleFinish}
                            style={styles.finishButton}
                        />
                    </View>

                    {/* Progress Indicator */}
                    <View style={styles.progressContainer}>
                        <View style={styles.progressDot} />
                        <View style={styles.progressDot} />
                        <View style={styles.progressDot} />
                        <View style={[styles.progressDot, styles.activeDot]} />
                    </View>
                </View>
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
        paddingTop: spacing.xl,
        paddingBottom: spacing.lg,
        alignItems: 'center',
    },
    title: {
        fontSize: fontSize.xl,
        fontFamily: 'Inter-Bold',
        color: colors.neutral.text.primary,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: fontSize.md,
        fontFamily: 'Inter-Regular',
        color: colors.neutral.text.secondary,
        textAlign: 'center',
        lineHeight: fontSize.md * 1.4,
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: spacing.lg,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontFamily: 'Inter-SemiBold',
        color: colors.neutral.text.primary,
        marginBottom: spacing.sm,
    },
    sectionSubtitle: {
        fontSize: fontSize.sm,
        fontFamily: 'Inter-Regular',
        color: colors.neutral.text.secondary,
        marginBottom: spacing.md,
    },
    nameInput: {
        backgroundColor: colors.neutral.white,
        borderColor: colors.neutral.divider,
    },
    goalsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    goalCard: {
        width: (width - spacing.lg * 2 - spacing.sm) / 2,
        marginBottom: 0,
        backgroundColor: colors.neutral.white,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedGoalCard: {
        borderColor: colors.profile.accent,
        backgroundColor: colors.profile.secondary,
    },
    goalContent: {
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    goalIcon: {
        fontSize: 24,
        marginBottom: spacing.xs,
    },
    goalLabel: {
        fontSize: fontSize.sm,
        fontFamily: 'Inter-Medium',
        color: colors.neutral.text.primary,
        textAlign: 'center',
    },
    selectedGoalLabel: {
        color: colors.profile.accent,
    },
    experienceList: {
        gap: spacing.sm,
    },
    experienceCard: {
        marginBottom: 0,
        backgroundColor: colors.neutral.white,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedExperienceCard: {
        borderColor: colors.profile.accent,
        backgroundColor: colors.profile.secondary,
    },
    experienceContent: {
        paddingVertical: spacing.sm,
    },
    experienceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    experienceLabel: {
        fontSize: fontSize.md,
        fontFamily: 'Inter-SemiBold',
        color: colors.neutral.text.primary,
    },
    selectedExperienceLabel: {
        color: colors.profile.accent,
    },
    experienceDescription: {
        fontSize: fontSize.sm,
        fontFamily: 'Inter-Regular',
        color: colors.neutral.text.secondary,
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.neutral.divider,
        backgroundColor: colors.neutral.white,
    },
    selectedRadioButton: {
        borderColor: colors.profile.accent,
        backgroundColor: colors.profile.accent,
    },
    bottomContainer: {
        paddingBottom: spacing.xl,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    backButton: {
        flex: 1,
        borderColor: colors.profile.accent,
    },
    finishButton: {
        flex: 1,
        backgroundColor: colors.profile.accent,
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.neutral.divider,
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: colors.profile.accent,
    },
});

