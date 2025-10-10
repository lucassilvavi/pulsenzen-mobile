import Button from '@/components/base/Button';
import ScreenContainer from '@/components/base/ScreenContainer';
import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import { useRouter } from 'expo-router';
import { Dimensions, StyleSheet, View } from 'react-native';

const { height } = Dimensions.get('window');

export default function WelcomeScreen() {
    const router = useRouter();

    const handleGetStarted = async () => {
        router.push('/onboarding/auth?mode=login');
    };

    return (
        <ScreenContainer
            gradientColors={colors.gradients.primary}
            gradientHeight={height * 0.4}
        >
            <View style={styles.container}>
                {/* Main Content */}
                <View style={styles.contentContainer}>
                    {/* Logo/Illustration */}
                    <View style={styles.illustrationContainer}>
                        <View style={styles.logoPlaceholder}>
                            <ThemedText style={styles.logoText}>🧘‍♀️</ThemedText>
                        </View>
                    </View>

                    {/* Welcome Text */}
                    <View style={styles.textContainer}>
                        <ThemedText style={styles.title}>
                            Bem-vindo ao PulseZen
                        </ThemedText>
                        <ThemedText style={styles.subtitle}>
                            Sua jornada para o bem-estar mental começa aqui
                        </ThemedText>
                        <ThemedText style={styles.description}>
                            Descubra técnicas de respiração, meditação e mindfulness
                            que vão transformar seu dia a dia e trazer mais equilíbrio
                            para sua vida.
                        </ThemedText>
                    </View>
                </View>

                {/* Bottom Actions */}
                <View style={[styles.bottomContainer, {position: 'relative', bottom: undefined, left: undefined, right: undefined, alignItems: 'center', justifyContent: 'center'}]}> 
                    <Button
                        label="Começar"
                        variant="primary"
                        size="large"
                        fullWidth
                        onPress={handleGetStarted}
                        style={styles.getStartedButton}
                    />

                    {/* Progress Indicator */}
                    <View style={styles.progressContainer}>
                        <View style={[styles.progressDot, styles.activeDot]} />
                        <View style={styles.progressDot} />
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
        backgroundColor: 'transparent', // Garante gradiente visível
    },
    skipContainer: {
        alignItems: 'flex-end',
        paddingTop: spacing.md,
        paddingBottom: spacing.lg,
        zIndex: 2,
        position: 'absolute',
        right: 0,
        top: 0,
        width: '100%',
    },
    skipButton: {
        paddingHorizontal: spacing.md,
        color: colors.primary.main, // cor principal do tema para contraste
        opacity: 1,
        fontWeight: 'bold',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 80,
    },
    illustrationContainer: {
        marginBottom: spacing.xl * 2,
    },
    logoPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.neutral.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.neutral.black,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
    },
    logoText: {
        fontSize: 28,
    },
    textContainer: {
        alignItems: 'center',
        paddingHorizontal: spacing.md,
    },
    title: {
        fontSize: fontSize.xxl * 1.2,
        fontFamily: 'Inter-Bold',
        color: colors.primary.main, // cor principal do tema
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    subtitle: {
        fontSize: fontSize.lg,
        fontFamily: 'Inter-SemiBold',
        color: colors.primary.main, // cor principal do tema
        textAlign: 'center',
        marginBottom: spacing.lg,
        opacity: 0.9,
    },
    description: {
        fontSize: fontSize.md,
        fontFamily: 'Inter-Regular',
        color: colors.primary.main, // cor principal do tema
        textAlign: 'center',
        lineHeight: fontSize.md * 1.5,
        opacity: 0.8,
        marginBottom: spacing.xl,
    },
    bottomContainer: {
        paddingBottom: spacing.xl,
        width: '100%',
        alignItems: 'center',
        backgroundColor: 'transparent',
        position: 'relative',
    },
    getStartedButton: {
        backgroundColor: colors.primary.main,
        marginBottom: spacing.lg,
        width: '90%',
        alignSelf: 'center',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.md,
    },
    progressDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary.main, // cor de destaque do tema
        opacity: 0.3,
        marginHorizontal: 4,
    },
    activeDot: {
        opacity: 1,
        backgroundColor: colors.primary.main, // cor de destaque do tema
    },
});

