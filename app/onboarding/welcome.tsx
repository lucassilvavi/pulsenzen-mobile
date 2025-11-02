import Button from '@/components/base/Button';
import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image, StyleSheet, View } from 'react-native';

export default function WelcomeScreen() {
    const router = useRouter();

    const handleGetStarted = async () => {
        router.push('/onboarding/auth?mode=login');
    };

    return (
        <>
            <StatusBar style="light" />
            <LinearGradient
                colors={['#64B5F6', '#FFFFFF']} 
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            >
                <View style={styles.container}>
                {/* Main Content */}
                <View style={styles.contentContainer}>
                    {/* Logo/Illustration */}
                    <View style={styles.illustrationContainer}>
                        <Image 
                            source={require('@/assets/images/adaptive-icon.png')}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Welcome Text */}
                    <View style={styles.textContainer}>
                        <ThemedText style={styles.title}>
                            Bem-vindo ao Acalmar
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
            </LinearGradient>
        </>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
        paddingTop: 50, // Espaço para status bar
    },
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
        gap: spacing.lg, // Usa gap para espaçamento consistente
    },
    illustrationContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoImage: {
        width: 320, // Reduz um pouco o tamanho para melhor proporção
        height: 320,
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

