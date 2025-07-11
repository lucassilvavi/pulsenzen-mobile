import Button from '@/components/base/Button';
import FeatureCard from '@/components/base/FeatureCard';
import ScreenContainer from '@/components/base/ScreenContainer';
import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';

const { height } = Dimensions.get('window');

const features = [
    {
        icon: '🫁',
        title: 'Exercícios de Respiração',
        description: 'Técnicas guiadas de respiração para reduzir ansiedade e promover relaxamento.',
        color: colors.breathing.primary,
        gradient: colors.gradients.breathing,
    },
    {
        icon: '😴',
        title: 'Histórias para Dormir',
        description: 'Narrativas relaxantes e sons da natureza para uma noite de sono tranquila.',
        color: colors.sleep.primary,
        gradient: colors.gradients.sleep,
    },
    {
        icon: '🆘',
        title: 'Modo SOS',
        description: 'Alívio rápido para momentos de crise, ansiedade ou ataques de pânico.',
        color: colors.sos.primary,
        gradient: colors.gradients.sos,
    },
    {
        icon: '📝',
        title: 'Diário Pessoal',
        description: 'Registre seus pensamentos, sentimentos e reflexões diárias.',
        color: colors.journal.primary,
        gradient: colors.gradients.journal,
    },
    {
        icon: '📊',
        title: 'Rastreamento de Humor',
        description: 'Monitore seu bem-estar emocional e identifique padrões.',
        color: colors.profile.primary,
        gradient: colors.gradients.profile,
    },
    {
        icon: '🏆',
        title: 'Conquistas e Progresso',
        description: 'Acompanhe sua jornada com estatísticas e conquistas motivacionais.',
        color: colors.primary.light,
        gradient: colors.gradients.primary,
    },
];

export default function FeaturesScreen() {
    const router = useRouter();

    const handleNext = () => {
        router.push('/onboarding/setup');
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <ScreenContainer
            gradientColors={colors.gradients.journal}
            gradientHeight={height * 0.3}
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <ThemedText style={styles.title}>
                        Funcionalidades Principais
                    </ThemedText>
                    <ThemedText style={styles.subtitle}>
                        Tudo que você precisa para cuidar do seu bem-estar mental
                    </ThemedText>
                </View>

                {/* Features List */}
                <ScrollView
                    style={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.featuresGrid}>
                        {features.map((feature, index) => (
                            <FeatureCard
                                key={index}
                                title={feature.title}
                                description={feature.description}
                                icon={feature.icon}
                                style={StyleSheet.flatten([
                                    styles.featureCard,
                                    { backgroundColor: feature.color }
                                ])}
                                onPress={() => { }}
                            />
                        ))}
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
                            label="Continuar"
                            variant="primary"
                            size="large"
                            onPress={handleNext}
                            style={styles.nextButton}
                        />
                    </View>

                    {/* Progress Indicator */}
                    <View style={styles.progressContainer}>
                        <View style={styles.progressDot} />
                        <View style={styles.progressDot} />
                        <View style={[styles.progressDot, styles.activeDot]} />
                        <View style={styles.progressDot} />
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
    featuresGrid: {
        gap: spacing.md,
    },
    featureCard: {
        marginBottom: spacing.sm,
        borderRadius: 16,
        shadowColor: colors.neutral.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
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
        borderColor: colors.journal.accent,
    },
    nextButton: {
        flex: 1,
        backgroundColor: colors.journal.accent,
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
        backgroundColor: colors.journal.accent,
    },
});

