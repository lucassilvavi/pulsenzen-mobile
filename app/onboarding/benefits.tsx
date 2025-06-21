import Button from '@/components/base/Button';
import Card from '@/components/base/Card';
import ScreenContainer from '@/components/base/ScreenContainer';
import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');

const benefits = [
    {
        icon: '🧠',
        title: 'Reduz o Estresse',
        description: 'Técnicas comprovadas para diminuir os níveis de cortisol e promover relaxamento profundo.'
    },
    {
        icon: '😴',
        title: 'Melhora o Sono',
        description: 'Histórias e sons relaxantes que ajudam você a adormecer mais rapidamente.'
    },
    {
        icon: '💪',
        title: 'Aumenta o Foco',
        description: 'Exercícios de mindfulness que melhoram sua concentração e produtividade.'
    },
    {
        icon: '❤️',
        title: 'Bem-estar Emocional',
        description: 'Ferramentas para gerenciar ansiedade e cultivar uma mentalidade positiva.'
    },
    {
        icon: '⚡',
        title: 'Mais Energia',
        description: 'Técnicas de respiração que revitalizam seu corpo e mente naturalmente.'
    },
    {
        icon: '🎯',
        title: 'Autoconhecimento',
        description: 'Diário e rastreamento de humor para entender melhor suas emoções.'
    }
];

export default function BenefitsScreen() {
    const router = useRouter();

    const handleNext = () => {
        router.push('/onboarding/features');
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <ScreenContainer
            gradientColors={colors.gradients.breathing}
            gradientHeight={height * 0.3}
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <ThemedText style={styles.title}>
                        Por que escolher o PulseZen?
                    </ThemedText>
                    <ThemedText style={styles.subtitle}>
                        Descubra os benefícios que milhares de usuários já experimentam
                    </ThemedText>
                </View>

                {/* Benefits List */}
                <ScrollView
                    style={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.benefitsGrid}>
                        {benefits.map((benefit, index) => (
                            <Card key={index} style={styles.benefitCard}>
                                <View style={styles.benefitContent}>
                                    <View style={styles.iconContainer}>
                                        <ThemedText style={styles.benefitIcon}>
                                            {benefit.icon}
                                        </ThemedText>
                                    </View>
                                    <View style={styles.textContent}>
                                        <ThemedText style={styles.benefitTitle}>
                                            {benefit.title}
                                        </ThemedText>
                                        <ThemedText style={styles.benefitDescription}>
                                            {benefit.description}
                                        </ThemedText>
                                    </View>
                                </View>
                            </Card>
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
                        <View style={[styles.progressDot, styles.activeDot]} />
                        <View style={styles.progressDot} />
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
    benefitsGrid: {
        gap: spacing.md,
    },
    benefitCard: {
        marginBottom: 0,
        backgroundColor: colors.neutral.white,
        borderRadius: 16,
        padding: spacing.lg,
        shadowColor: colors.neutral.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    benefitContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.breathing.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    benefitIcon: {
        fontSize: 24,
    },
    textContent: {
        flex: 1,
    },
    benefitTitle: {
        fontSize: fontSize.lg,
        fontFamily: 'Inter-SemiBold',
        color: colors.neutral.text.primary,
        marginBottom: spacing.xs,
    },
    benefitDescription: {
        fontSize: fontSize.sm,
        fontFamily: 'Inter-Regular',
        color: colors.neutral.text.secondary,
        lineHeight: fontSize.sm * 1.4,
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
        borderColor: colors.breathing.accent,
    },
    nextButton: {
        flex: 1,
        backgroundColor: colors.breathing.accent,
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
        backgroundColor: colors.breathing.accent,
    },
});

