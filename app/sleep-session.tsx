import Button from '@/components/base/Button';
import Card from '@/components/base/Card';
import IconButton from '@/components/base/IconButton';
import ScreenContainer from '@/components/base/ScreenContainer';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import { Sound } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, ScrollView, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');

interface SleepContent {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  type: 'story' | 'sound' | 'meditation';
  category: string;
}

const sleepContent: SleepContent[] = [
  {
    id: 'forest-story',
    title: 'Caminhada na Floresta',
    description: 'Uma jornada relaxante por uma floresta encantada',
    duration: 15,
    type: 'story',
    category: 'Histórias',
  },
  {
    id: 'ocean-story',
    title: 'Praia ao Luar',
    description: 'Uma noite tranquila à beira do oceano',
    duration: 20,
    type: 'story',
    category: 'Histórias',
  },
  {
    id: 'rain-sound',
    title: 'Chuva Suave',
    description: 'Som relaxante de chuva caindo',
    duration: 60,
    type: 'sound',
    category: 'Sons',
  },
  {
    id: 'ocean-waves',
    title: 'Ondas do Mar',
    description: 'Som das ondas quebrando na praia',
    duration: 45,
    type: 'sound',
    category: 'Sons',
  },
  {
    id: 'body-scan',
    title: 'Relaxamento Corporal',
    description: 'Meditação guiada para relaxar todo o corpo',
    duration: 25,
    type: 'meditation',
    category: 'Meditações',
  },
  {
    id: 'breathing-sleep',
    title: 'Respiração para Dormir',
    description: 'Técnica de respiração para induzir o sono',
    duration: 10,
    type: 'meditation',
    category: 'Meditações',
  },
];

const sleepTimers = [15, 30, 45, 60, 90]; // minutes

export default function SleepSessionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentContent, setCurrentContent] = useState<SleepContent | null>(
    sleepContent.find(c => c.id === params.content) || null
  );
  const [selectedTimer, setSelectedTimer] = useState<number>(30);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.7);
  const [sound, setSound] = useState<Sound | null>(null);

  // Animation values
  const waveAnimation = useRef(new Animated.Value(0)).current;
  const starAnimation = useRef(new Animated.Value(0)).current;

  // Timer ref
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Start ambient animations
    startAmbientAnimations();
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (sound) {
        sound.unload();
      }
    };
  }, [sound]);

  const startAmbientAnimations = () => {
    // Wave animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnimation, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnimation, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Star twinkling animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(starAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(starAnimation, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startSession = async (content: SleepContent) => {
    setCurrentContent(content);
    setIsPlaying(true);
    setTimeRemaining(selectedTimer * 60); // Convert to seconds
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Tocar música
    try {
      if (sound) {
        await sound.unload();
        setSound(null);
      }
      const newSound = await Sound.createAsync(
        require('../assets/music/music.mp3'),
        { shouldPlay: true, volume }
      );
      setSound(newSound.sound ?? newSound);
    } catch (e) {
      // erro ao carregar áudio
    }

    // Start countdown timer
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          stopSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopSession = async () => {
    setIsPlaying(false);
    setTimeRemaining(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (sound) {
      await sound.stop();
      await sound.unload();
      setSound(null);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const pauseSession = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
    if (sound) {
      await sound.pause();
    }
  };

  const resumeSession = async () => {
    setIsPlaying(true);
    if (sound) {
      await sound.play();
    }
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          stopSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getContentByCategory = (category: string) => {
    return sleepContent.filter(content => content.category === category);
  };

  const renderContentCard = (content: SleepContent) => (
    <Card
      key={content.id}
      style={[
        styles.contentCard,
        currentContent?.id === content.id && styles.selectedContentCard
      ]}
      onPress={() => !isPlaying && setCurrentContent(content)}
    >
      <View style={styles.contentInfo}>
        <View style={styles.contentHeader}>
          <ThemedText style={styles.contentTitle}>
            {content.title}
          </ThemedText>
          <ThemedText style={styles.contentDuration}>
            {content.duration} min
          </ThemedText>
        </View>
        <ThemedText style={styles.contentDescription}>
          {content.description}
        </ThemedText>
        <View style={styles.contentTypeIndicator}>
          <View style={[
            styles.typeIcon,
            { backgroundColor: getTypeColor(content.type) }
          ]}>
            <ThemedText style={styles.typeEmoji}>
              {getTypeEmoji(content.type)}
            </ThemedText>
          </View>
        </View>
      </View>
    </Card>
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'story': return colors.sleep.primary;
      case 'sound': return colors.breathing.primary;
      case 'meditation': return colors.journal.primary;
      default: return colors.neutral.divider;
    }
  };

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'story': return '📖';
      case 'sound': return '🎵';
      case 'meditation': return '🧘‍♀️';
      default: return '💤';
    }
  };

  return (
    <ScreenContainer 
      gradientColors={['#2C1810', '#1A0E0A']}
      gradientHeight={height}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <IconButton
            icon={<IconSymbol name="xmark" size={24} color={colors.neutral.white} />}
            onPress={() => router.back()}
            style={styles.closeButton}
          />
          <ThemedText style={styles.headerTitle}>
            Sessão de Sono
          </ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        {/* Ambient Animation */}
        <View style={styles.ambientContainer}>
          <Animated.View
            style={[
              styles.waveCircle,
              {
                opacity: waveAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 0.7],
                }),
                transform: [{
                  scale: waveAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1.2],
                  }),
                }],
              },
            ]}
          />
          <View style={styles.starsContainer}>
            {[...Array(5)].map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.star,
                  {
                    opacity: starAnimation,
                    left: `${20 + index * 15}%`,
                    top: `${10 + (index % 2) * 20}%`,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Current Session Info */}
        {isPlaying && currentContent && (
          <View style={styles.currentSessionContainer}>
            <Card style={styles.currentSessionCard}>
              <View style={styles.currentSessionInfo}>
                <ThemedText style={styles.currentSessionTitle}>
                  {currentContent.title}
                </ThemedText>
                <ThemedText style={styles.currentSessionTimer}>
                  {formatTime(timeRemaining)}
                </ThemedText>
              </View>
              
              {/* Volume Control */}
              <View style={styles.volumeContainer}>
                <IconSymbol name="speaker.wave.1" size={16} color={colors.neutral.white} />
                <View style={styles.volumeSlider}>
                  <View 
                    style={[
                      styles.volumeFill,
                      { width: `${volume * 100}%` }
                    ]} 
                  />
                </View>
                <IconSymbol name="speaker.wave.3" size={16} color={colors.neutral.white} />
              </View>
              
              {/* Playback Controls */}
              <View style={styles.playbackControls}>
                <IconButton
                  icon={<IconSymbol name="backward.fill" size={24} color={colors.neutral.white} />}
                  onPress={() => {}}
                  style={styles.controlButton}
                />
                <IconButton
                  icon={
                    <IconSymbol 
                      name={isPlaying ? "pause.fill" : "play.fill"} 
                      size={32} 
                      color={colors.neutral.white} 
                    />
                  }
                  onPress={isPlaying ? pauseSession : resumeSession}
                  style={[styles.controlButton, styles.playButton]}
                />
                <IconButton
                  icon={<IconSymbol name="forward.fill" size={24} color={colors.neutral.white} />}
                  onPress={() => {}}
                  style={styles.controlButton}
                />
              </View>
              
              <Button
                label="Parar Sessão"
                variant="outline"
                onPress={stopSession}
                style={styles.stopButton}
                labelStyle={{ color: colors.neutral.white }}
              />
            </Card>
          </View>
        )}

        {/* Content Selection */}
        {!isPlaying && (
          <ScrollView 
            style={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Timer Selection */}
            <View style={styles.timerSection}>
              <ThemedText style={styles.sectionTitle}>
                Timer de Sono
              </ThemedText>
              <View style={styles.timerOptions}>
                {sleepTimers.map((timer) => (
                  <Button
                    key={timer}
                    label={`${timer} min`}
                    variant={selectedTimer === timer ? "primary" : "outline"}
                    size="small"
                    onPress={() => setSelectedTimer(timer)}
                    style={[
                      styles.timerButton,
                      selectedTimer === timer && { backgroundColor: colors.sleep.accent }
                    ]}
                    labelStyle={{
                      color: selectedTimer === timer ? colors.neutral.white : colors.neutral.white
                    }}
                  />
                ))}
              </View>
            </View>

            {/* Content Categories */}
            {['Histórias', 'Sons', 'Meditações'].map((category) => (
              <View key={category} style={styles.categorySection}>
                <ThemedText style={styles.sectionTitle}>
                  {category}
                </ThemedText>
                <View style={styles.contentGrid}>
                  {getContentByCategory(category).map(renderContentCard)}
                </View>
              </View>
            ))}

            {/* Start Session Button */}
            {currentContent && (
              <View style={styles.startSessionContainer}>
                <Button
                  label={`Iniciar: ${currentContent.title}`}
                  variant="primary"
                  size="large"
                  fullWidth
                  onPress={() => startSession(currentContent)}
                  style={[styles.startButton, { backgroundColor: colors.sleep.accent }]}
                />
              </View>
            )}
          </ScrollView>
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-SemiBold',
    color: colors.neutral.white,
  },
  headerSpacer: {
    width: 40,
  },
  ambientContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.sleep.primary,
    position: 'absolute',
  },
  starsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  star: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.neutral.white,
  },
  currentSessionContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  currentSessionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: 'center',
  },
  currentSessionInfo: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  currentSessionTitle: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-SemiBold',
    color: colors.neutral.white,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  currentSessionTimer: {
    fontSize: fontSize.xxl * 1.5,
    fontFamily: 'Inter-Bold',
    color: colors.neutral.white,
    textAlign: 'center',
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.lg,
  },
  volumeSlider: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginHorizontal: spacing.md,
    overflow: 'hidden',
  },
  volumeFill: {
    height: '100%',
    backgroundColor: colors.neutral.white,
    borderRadius: 2,
  },
  playbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  controlButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    width: 50,
    height: 50,
    marginHorizontal: spacing.sm,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.sleep.accent,
  },
  stopButton: {
    borderColor: colors.neutral.white,
    borderWidth: 1,
  },
  contentContainer: {
    flex: 1,
  },
  timerSection: {
    marginBottom: spacing.xl,
  },
});