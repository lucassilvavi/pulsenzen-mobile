import Button from '@/components/base/Button';
import Card from '@/components/base/Card';
import IconButton from '@/components/base/IconButton';
import ScreenContainer from '@/components/base/ScreenContainer';
import TextInput from '@/components/base/TextInput';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

interface MoodOption {
    id: string;
    emoji: string;
    label: string;
    value: number; // 1-5 scale
    color: string;
}

const moodOptions: MoodOption[] = [
    { id: 'terrible', emoji: '😢', label: 'Péssimo', value: 1, color: '#F44336' },
    { id: 'bad', emoji: '😞', label: 'Ruim', value: 2, color: '#FF9800' },
    { id: 'okay', emoji: '😐', label: 'Ok', value: 3, color: '#FFC107' },
    { id: 'good', emoji: '😊', label: 'Bem', value: 4, color: '#8BC34A' },
    { id: 'great', emoji: '😄', label: 'Ótimo', value: 5, color: '#4CAF50' },
];

const activityOptions = [
    '💼 Trabalho', '🏠 Casa', '👥 Amigos', '👨‍👩‍👧‍👦 Família',
    '🏃‍♂️ Exercício', '📚 Estudo', '🎵 Música', '🎬 Filmes',
    '🍳 Cozinhar', '🛒 Compras', '🚗 Viagem', '🧘‍♀️ Meditação',
    '🎨 Arte', '🎮 Jogos', '📱 Redes Sociais', '💤 Descanso'
];

const emotionOptions = [
    '😊 Feliz', '😌 Calmo', '😰 Ansioso', '😢 Triste',
    '😠 Irritado', '🤗 Grato', '💪 Motivado', '🤯 Estressado',
    '😍 Apaixonado', '🙄 Entediado', '😎 Confiante', '😴 Cansado',
    '🤔 Pensativo', '😤 Frustrado', '🥳 Animado', '😔 Melancólico'
];

export default function MoodEntryScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
    const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
    const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // Load any existing draft
        loadDraft();
    }, []);

    const loadDraft = async () => {
        try {
            const draft = await AsyncStorage.getItem('moodDraft');
            if (draft) {
                const draftData = JSON.parse(draft);
                if (draftData.mood) {
                    setSelectedMood(moodOptions.find(m => m.id === draftData.mood) || null);
                }
                setSelectedActivities(draftData.activities || []);
                setSelectedEmotions(draftData.emotions || []);
                setNotes(draftData.notes || '');
            }
        } catch (error) {
            console.error('Error loading draft:', error);
        }
    };

    const saveDraft = async () => {
        try {
            const draftData = {
                mood: selectedMood?.id,
                activities: selectedActivities,
                emotions: selectedEmotions,
                notes: notes,
                timestamp: new Date().toISOString(),
            };
            await AsyncStorage.setItem('moodDraft', JSON.stringify(draftData));
        } catch (error) {
            console.error('Error saving draft:', error);
        }
    };

    const saveMoodEntry = async () => {
        if (!selectedMood) {
            Alert.alert('Humor obrigatório', 'Por favor, selecione como você está se sentindo.');
            return;
        }

        setIsSaving(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        try {
            const entry = {
                id: Date.now().toString(),
                mood: selectedMood,
                activities: selectedActivities,
                emotions: selectedEmotions,
                notes: notes.trim(),
                date: new Date().toISOString(),
                timestamp: Date.now(),
            };

            // Get existing entries
            const existingEntries = await AsyncStorage.getItem('moodEntries');
            const entries = existingEntries ? JSON.parse(existingEntries) : [];

            // Add new entry
            entries.unshift(entry);

            // Keep only last 365 entries (1 year)
            if (entries.length > 365) {
                entries.splice(365);
            }

            // Save updated entries
            await AsyncStorage.setItem('moodEntries', JSON.stringify(entries));

            // Clear draft
            await AsyncStorage.removeItem('moodDraft');

            // Update user stats
            await updateUserStats();

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            Alert.alert(
                'Humor registrado!',
                'Obrigado por compartilhar como você está se sentindo.',
                [
                    { text: 'Nova entrada', onPress: () => resetForm() },
                    { text: 'Voltar', onPress: () => router.back() },
                ]
            );
        } catch (error) {
            console.error('Error saving mood entry:', error);
            Alert.alert('Erro', 'Não foi possível salvar seu registro. Tente novamente.');
        } finally {
            setIsSaving(false);
        }
    };

    const updateUserStats = async () => {
        try {
            const stats = await AsyncStorage.getItem('userStats');
            const currentStats = stats ? JSON.parse(stats) : {};

            const today = new Date().toDateString();
            const updatedStats = {
                ...currentStats,
                totalMoodEntries: (currentStats.totalMoodEntries || 0) + 1,
                lastMoodEntry: today,
                moodStreak: currentStats.lastMoodEntry === today
                    ? currentStats.moodStreak || 1
                    : (currentStats.moodStreak || 0) + 1,
                averageMood: calculateAverageMood(currentStats.averageMood, selectedMood?.value || 3),
            };

            await AsyncStorage.setItem('userStats', JSON.stringify(updatedStats));
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    };

    const calculateAverageMood = (currentAverage: number = 3, newMood: number) => {
        // Simple moving average calculation
        return currentAverage ? (currentAverage + newMood) / 2 : newMood;
    };

    const resetForm = () => {
        setSelectedMood(null);
        setSelectedActivities([]);
        setSelectedEmotions([]);
        setNotes('');
    };

    const selectMood = (mood: MoodOption) => {
        setSelectedMood(mood);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };

    const toggleActivity = (activity: string) => {
        setSelectedActivities(prev =>
            prev.includes(activity)
                ? prev.filter(a => a !== activity)
                : [...prev, activity]
        );
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const toggleEmotion = (emotion: string) => {
        setSelectedEmotions(prev =>
            prev.includes(emotion)
                ? prev.filter(e => e !== emotion)
                : [...prev, emotion]
        );
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    // Auto-save draft periodically
    useEffect(() => {
        const timer = setTimeout(() => {
            if (selectedMood || selectedActivities.length > 0 || selectedEmotions.length > 0 || notes.trim()) {
                saveDraft();
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [selectedMood, selectedActivities, selectedEmotions, notes]);

    return (
        <ScreenContainer
            gradientColors={colors.gradients.profile}
            gradientHeight={height * 0.3}
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <IconButton
                        icon={<IconSymbol name="xmark" size={24} color={colors.profile.accent} />}
                        onPress={() => router.back()}
                        style={styles.closeButton}
                    />
                    <View style={styles.headerContent}>
                        <ThemedText style={styles.headerTitle}>
                            Como você está?
                        </ThemedText>
                        <ThemedText style={styles.headerDate}>
                            {new Date().toLocaleDateString('pt-BR', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long'
                            })}
                        </ThemedText>
                    </View>
                    <IconButton
                        icon={<IconSymbol name="square.and.arrow.down" size={24} color={colors.profile.accent} />}
                        onPress={saveDraft}
                        style={styles.saveButton}
                    />
                </View>

                <ScrollView
                    style={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Mood Selection */}
                    <View style={styles.moodSection}>
                        <ThemedText style={styles.sectionTitle}>
                            Como você está se sentindo hoje?
                        </ThemedText>
                        <View style={styles.moodGrid}>
                            {moodOptions.map((mood) => (
                                <TouchableOpacity
                                    key={mood.id}
                                    style={[
                                        styles.moodOption,
                                        selectedMood?.id === mood.id && styles.selectedMoodOption,
                                        { borderColor: mood.color }
                                    ]}
                                    onPress={() => selectMood(mood)}
                                >
                                    <ThemedText style={styles.moodEmoji}>
                                        {mood.emoji}
                                    </ThemedText>
                                    <ThemedText style={[
                                        styles.moodLabel,
                                        selectedMood?.id === mood.id && { color: mood.color }
                                    ]}>
                                        {mood.label}
                                    </ThemedText>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Activities Section */}
                    {selectedMood && (
                        <View style={styles.activitiesSection}>
                            <ThemedText style={styles.sectionTitle}>
                                O que você fez hoje?
                            </ThemedText>
                            <ThemedText style={styles.sectionSubtitle}>
                                Selecione todas as atividades que se aplicam
                            </ThemedText>
                            <View style={styles.optionsGrid}>
                                {activityOptions.map((activity) => (
                                    <Button
                                        key={activity}
                                        label={activity}
                                        variant={selectedActivities.includes(activity) ? "primary" : "outline"}
                                        size="small"
                                        onPress={() => toggleActivity(activity)}
                                        style={[
                                            styles.optionButton,
                                            selectedActivities.includes(activity) && { backgroundColor: colors.profile.accent }
                                        ]}
                                        labelStyle={{
                                            color: selectedActivities.includes(activity) ? colors.neutral.white : colors.profile.accent,
                                            fontSize: fontSize.sm,
                                        }}
                                    />
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Emotions Section */}
                    {selectedMood && (
                        <View style={styles.emotionsSection}>
                            <ThemedText style={styles.sectionTitle}>
                                Que emoções você sentiu?
                            </ThemedText>
                            <ThemedText style={styles.sectionSubtitle}>
                                Identifique as emoções específicas do seu dia
                            </ThemedText>
                            <View style={styles.optionsGrid}>
                                {emotionOptions.map((emotion) => (
                                    <Button
                                        key={emotion}
                                        label={emotion}
                                        variant={selectedEmotions.includes(emotion) ? "primary" : "outline"}
                                        size="small"
                                        onPress={() => toggleEmotion(emotion)}
                                        style={[
                                            styles.optionButton,
                                            selectedEmotions.includes(emotion) && { backgroundColor: colors.profile.accent }
                                        ]}
                                        labelStyle={{
                                            color: selectedEmotions.includes(emotion) ? colors.neutral.white : colors.profile.accent,
                                            fontSize: fontSize.sm,
                                        }}
                                    />
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Notes Section */}
                    {selectedMood && (
                        <View style={styles.notesSection}>
                            <ThemedText style={styles.sectionTitle}>
                                Observações adicionais
                            </ThemedText>
                            <ThemedText style={styles.sectionSubtitle}>
                                Algo específico que influenciou seu humor hoje? (opcional)
                            </ThemedText>
                            <TextInput
                                placeholder="Ex: Tive uma reunião importante, recebi boas notícias..."
                                value={notes}
                                onChangeText={setNotes}
                                style={styles.notesInput}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>
                    )}

                    {/* Summary Card */}
                    {selectedMood && (
                        <Card style={styles.summaryCard}>
                            <ThemedText style={styles.summaryTitle}>
                                Resumo do seu dia
                            </ThemedText>
                            <View style={styles.summaryContent}>
                                <View style={styles.summaryMood}>
                                    <ThemedText style={styles.summaryMoodEmoji}>
                                        {selectedMood.emoji}
                                    </ThemedText>
                                    <ThemedText style={[styles.summaryMoodLabel, { color: selectedMood.color }]}>
                                        {selectedMood.label}
                                    </ThemedText>
                                </View>
                                {selectedActivities.length > 0 && (
                                    <View style={styles.summarySection}>
                                        <ThemedText style={styles.summarySubtitle}>
                                            Atividades: {selectedActivities.length}
                                        </ThemedText>
                                    </View>
                                )}
                                {selectedEmotions.length > 0 && (
                                    <View style={styles.summarySection}>
                                        <ThemedText style={styles.summarySubtitle}>
                                            Emoções: {selectedEmotions.length}
                                        </ThemedText>
                                    </View>
                                )}
                            </View>
                        </Card>
                    )}

                    {/* Save Button */}
                    {selectedMood && (
                        <View style={styles.saveSection}>
                            <Button
                                label={isSaving ? "Salvando..." : "Salvar Registro"}
                                variant="primary"
                                size="large"
                                fullWidth
                                onPress={saveMoodEntry}
                                disabled={isSaving}
                                style={[styles.saveButton, { backgroundColor: colors.profile.accent }]}
                            />
                        </View>
                    )}
                </ScrollView>
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
        backgroundColor: 'rgba(3, 169, 244, 0.2)',
        borderRadius: 20,
        width: 40,
        height: 40,
    },
    headerContent: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: fontSize.lg,
        fontFamily: 'Inter-Bold',
        color: colors.profile.accent,
        textAlign: 'center',
    },
    headerDate: {
        fontSize: fontSize.sm,
        fontFamily: 'Inter-Regular',
        color: colors.neutral.text.secondary,
        textAlign: 'center',
        marginTop: spacing.xs,
    },
    saveButton: {
        backgroundColor: 'rgba(3, 169, 244, 0.2)',
        borderRadius: 20,
        width: 40,
        height: 40,
    },
    contentContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: spacing.xl,
    },
    moodSection: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontFamily: 'Inter-SemiBold',
        color: colors.neutral.text.primary,
        marginBottom: spacing.sm,

    },
});