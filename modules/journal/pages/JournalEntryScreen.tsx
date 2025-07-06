import Button from '@/components/base/Button';
import ScreenContainer from '@/components/base/ScreenContainer';
import TextInput from '@/components/base/TextInput';
import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { ProfileService } from '@/modules/profile';
import { fontSize, spacing } from '@/utils/responsive';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import from the journal module
import { JournalEntryView, PromptSelector, SelectedPromptDisplay } from '../components';
import { DEFAULT_MOOD_TAGS } from '../constants';
import { JournalService } from '../services';
import { JournalPrompt } from '../types';

const { width, height } = Dimensions.get('window');


export default function JournalEntryScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams();
    const [selectedPrompt, setSelectedPrompt] = useState<JournalPrompt | null>(
        null
    );
    const [entryText, setEntryText] = useState('');
    const [selectedMoodTags, setSelectedMoodTags] = useState<string[]>([]);
    const [isCustomPrompt, setIsCustomPrompt] = useState(false);
    const [customPrompt, setCustomPrompt] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [journalPrompts, setJournalPrompts] = useState<JournalPrompt[]>([]);
    const [viewEntry, setViewEntry] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [customPromptModal, setCustomPromptModal] = useState(false);
    const [customPromptDraft, setCustomPromptDraft] = useState('');

    useEffect(() => {
        // Load prompts from service
        JournalService.getPrompts().then(setJournalPrompts);
    }, []);

    useEffect(() => {
        if (params.id) {
            // Busca a entrada pelo id para visualização
            JournalService.getEntries().then(entries => {
                const found = entries.find((e: any) => e.id === params.id);
                if (found) {
                    setViewEntry(found);
                    setModalVisible(true);
                }
            });
            loadDraft();
        } else {
            setViewEntry(null);
            setModalVisible(false);
            setSelectedPrompt(null);
            setIsCustomPrompt(false);
            setCustomPrompt('');
            setEntryText('');
            setSelectedMoodTags([]);
        }
    }, [params.id]);

    const loadDraft = async () => {
        try {
            const draft = await AsyncStorage.getItem('journalDraft');
            if (draft) {
                const draftData = JSON.parse(draft);
                setEntryText(draftData.text || '');
                setSelectedMoodTags(draftData.moodTags || []);
                if (draftData.customPrompt) {
                    setCustomPrompt(draftData.customPrompt);
                    setIsCustomPrompt(true);
                }
            }
        } catch (error) {
            console.error('Error loading draft:', error);
        }
    };

    const saveDraft = async () => {
        try {
            const draftData = {
                text: entryText,
                moodTags: selectedMoodTags,
                customPrompt: isCustomPrompt ? customPrompt : null,
                timestamp: new Date().toISOString(),
            };
            await AsyncStorage.setItem('journalDraft', JSON.stringify(draftData));
        } catch (error) {
            console.error('Error saving draft:', error);
        }
    };

    const saveEntry = async () => {
        if (!entryText.trim()) {
            Alert.alert('Entrada vazia', 'Por favor, escreva algo antes de salvar.');
            return;
        }

        setIsSaving(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        try {
            const entry = {
                id: Date.now().toString(),
                text: entryText.trim(),
                prompt: isCustomPrompt ? customPrompt : selectedPrompt?.question || '',
                promptCategory: isCustomPrompt ? 'Personalizado' : selectedPrompt?.category || '',
                moodTags: selectedMoodTags,
                date: new Date().toISOString(),
                wordCount: entryText.trim().split(/\s+/).length,
            };

            // Salva usando o service
            await JournalService.saveEntry(entry);

            // Clear draft
            await AsyncStorage.removeItem('journalDraft');

            // Update user stats
            await updateUserStats();

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            Alert.alert(
                'Entrada salva!',
                'Sua reflexão foi salva com sucesso.',
                [
                    { text: 'Nova entrada', onPress: () => resetForm() },
                    { text: 'Voltar', onPress: () => router.back() },
                ]
            );
        } catch (error) {
            console.error('Error saving entry:', error);
            Alert.alert('Erro', 'Não foi possível salvar sua entrada. Tente novamente.');
        } finally {
            setIsSaving(false);
        }
    };

    const updateUserStats = async () => {
        try {
            await ProfileService.incrementUserStats({
                totalJournalEntries: 1,
            });
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    };

    const resetForm = () => {
        setEntryText('');
        setSelectedMoodTags([]);
        setSelectedPrompt(null);
        setIsCustomPrompt(false);
        setCustomPrompt('');
    };

    const toggleMoodTag = (tag: string) => {
        setSelectedMoodTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const selectPrompt = (prompt: JournalPrompt) => {
        setSelectedPrompt(prompt);
        setIsCustomPrompt(false);
        setCustomPrompt('');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const useCustomPrompt = () => {
        setCustomPromptDraft('');
        setCustomPromptModal(true);
    };

    const handleCustomPromptConfirm = () => {
        setCustomPrompt(customPromptDraft.trim());
        setIsCustomPrompt(true);
        setSelectedPrompt(null);
        setCustomPromptModal(false);
    };

    const handleCustomPromptCancel = () => {
        setCustomPromptDraft('');
        setCustomPromptModal(false);
    };

    // Auto-save draft periodically
    useEffect(() => {
        const timer = setTimeout(() => {
            if (entryText.trim() || selectedMoodTags.length > 0) {
                saveDraft();
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [entryText, selectedMoodTags, customPrompt]);

    // Modal de visualização de entrada
    const renderEntryModal = () => (
        <Modal
            visible={modalVisible && !!viewEntry}
            animationType="slide"
            transparent={true}
            onRequestClose={() => {
                setModalVisible(false);
                router.back();
            }}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.dragBar} />
                    <Pressable style={styles.closeModalButton} onPress={() => { setModalVisible(false); router.back(); }}>
                        <ThemedText style={styles.closeModalText}>×</ThemedText>
                    </Pressable>
                    {viewEntry && (
                        <JournalEntryView
                            prompt={viewEntry.prompt}
                            promptCategory={viewEntry.promptCategory}
                            moodTags={viewEntry.moodTags}
                            text={viewEntry.text}
                            date={new Date(viewEntry.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' })}
                            onBack={() => { setModalVisible(false); router.back(); }}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );

    // Modal para criar pergunta personalizada
    const renderCustomPromptModal = () => (
        <Modal
            visible={customPromptModal}
            animationType="slide"
            transparent={true}
            onRequestClose={handleCustomPromptCancel}
        >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.18)', justifyContent: 'flex-end', alignItems: 'center' }}>
                <View style={{ width: '100%', backgroundColor: colors.neutral.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 24, paddingBottom: 32, paddingHorizontal: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 16 }}>
                    <ThemedText style={{ fontSize: fontSize.md, color: colors.journal.accent, fontFamily: 'Inter-Bold', marginBottom: spacing.md }}>Crie sua pergunta</ThemedText>
                    <TextInput
                        placeholder="Digite sua pergunta personalizada..."
                        value={customPromptDraft}
                        onChangeText={setCustomPromptDraft}
                        style={{ minHeight: 60, borderColor: colors.neutral.divider, borderWidth: 1, borderRadius: 12, padding: spacing.sm, backgroundColor: colors.neutral.white, marginBottom: spacing.md }}
                        multiline
                        autoFocus
                    />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Button
                            label="Cancelar"
                            variant="outline"
                            onPress={handleCustomPromptCancel}
                            style={{ flex: 1, marginRight: spacing.xs }}
                        />
                        <Button
                            label="Usar pergunta"
                            variant="primary"
                            onPress={handleCustomPromptConfirm}
                            disabled={!customPromptDraft.trim()}
                            style={{ flex: 1, marginLeft: spacing.xs }}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );

    return (
        <>
            {renderEntryModal()}
            {renderCustomPromptModal()}
            <KeyboardAvoidingView
                style={styles.keyboardContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScreenContainer
                    gradientColors={colors.gradients.journal}
                    gradientHeight={height * 0.34}
                >
                    <View style={[styles.container, { paddingTop: insets.top + 60 }]}>  
                        <ScrollView
                            style={styles.contentContainer}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.scrollContent}
                        >
                        {/* Prompt Selection */}
                        {!selectedPrompt && !isCustomPrompt && (
                            <PromptSelector
                                prompts={journalPrompts}
                                onSelect={selectPrompt}
                                onCustomPrompt={useCustomPrompt}
                            />
                        )}

                        {/* Selected Prompt Display */}
                        {(selectedPrompt || (isCustomPrompt && customPrompt.trim())) && (
                            <SelectedPromptDisplay
                                category={isCustomPrompt ? 'Personalizado' : selectedPrompt?.category || ''}
                                question={isCustomPrompt ? customPrompt : selectedPrompt?.question || ''}
                                onEdit={() => {
                                    setSelectedPrompt(null);
                                    setIsCustomPrompt(false);
                                    setCustomPrompt('');
                                }}
                            />
                        )}

                        {/* Entry Text Area */}
                        {(selectedPrompt || (isCustomPrompt && customPrompt.trim())) && (
                            <View style={styles.entrySection}>
                                <ThemedText style={styles.sectionTitle}>
                                    Sua reflexão:
                                </ThemedText>
                                <TextInput
                                    placeholder="Comece a escrever seus pensamentos..."
                                    value={entryText}
                                    onChangeText={setEntryText}
                                    style={styles.entryTextArea}
                                    multiline
                                    numberOfLines={8}
                                    textAlignVertical="top"
                                />
                                <ThemedText style={styles.wordCount}>
                                    {entryText.trim().split(/\s+/).filter(word => word.length > 0).length} palavras
                                </ThemedText>
                            </View>
                        )}

                        {/* Mood Tags */}
                        {entryText.trim() && (
                            <View style={styles.moodSection}>
                                <ThemedText style={styles.sectionTitle}>
                                    Como você está se sentindo?
                                </ThemedText>
                                <View style={styles.moodTagsGrid}>
                                    {DEFAULT_MOOD_TAGS.map((tag) => (
                                        <Button
                                            key={tag}
                                            label={tag}
                                            variant={selectedMoodTags.includes(tag) ? "primary" : "outline"}
                                            size="small"
                                            onPress={() => toggleMoodTag(tag)}
                                            style={selectedMoodTags.includes(tag) ? StyleSheet.flatten([styles.moodTag, { backgroundColor: colors.journal.accent }]) : styles.moodTag}
                                            labelStyle={{
                                                color: selectedMoodTags.includes(tag) ? colors.neutral.white : colors.journal.accent,
                                                fontSize: fontSize.sm,
                                            }}
                                        />
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Save Button */}
                        {entryText.trim() && (
                            <View style={styles.saveSection}>
                                <Button
                                    label={isSaving ? "Salvando..." : "Salvar Entrada"}
                                    variant="primary"
                                    size="large"
                                    fullWidth
                                    onPress={saveEntry}
                                    disabled={isSaving}
                                    style={StyleSheet.flatten([styles.saveEntryButton, { backgroundColor: colors.journal.accent }])}
                                />
                            </View>
                        )}
                    </ScrollView>
                </View>
            </ScreenContainer>
        </KeyboardAvoidingView>
        </>
    );
}

const styles = StyleSheet.create({
    keyboardContainer: {
        flex: 1,
    },
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
        backgroundColor: 'rgba(255, 152, 0, 0.2)',
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
        color: colors.journal.accent,
        textAlign: 'center',
    },
    headerDate: {
        fontSize: fontSize.sm,
        color: colors.neutral.text.secondary,
        marginTop: 4,
    },
    saveButton: {
        backgroundColor: 'rgba(255, 152, 0, 0.2)',
        borderRadius: 20,
        width: 40,
        height: 40,
    },
    contentContainer: {
        flex: 1,
        paddingBottom: spacing.xl,
    },
    scrollContent: {
        paddingBottom: spacing.xl,
    },
    promptSection: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: fontSize.md,
        fontFamily: 'Inter-Bold',
        color: colors.journal.accent,
        marginBottom: spacing.sm,
    },
    promptsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    promptCard: {
        flexBasis: '48%',
        marginBottom: spacing.sm,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
    },
    promptContent: {
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
    },
    promptIcon: {
        fontSize: 28,
        marginRight: spacing.md,
    },
    promptInfo: {
        flex: 1,
    },
    promptCategory: {
        fontSize: fontSize.sm,
        color: colors.neutral.text.secondary,
        marginBottom: 4,
    },
    promptQuestion: {
        fontSize: fontSize.md,
        fontFamily: 'Inter-Medium',
        color: colors.neutral.text.primary,
    },
    customPromptButton: {
        borderWidth: 1,
        borderColor: colors.journal.accent,
        borderRadius: 12,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    customPromptSection: {
        marginBottom: spacing.xl,
        backgroundColor: colors.neutral.white,
        borderRadius: 12,
        padding: spacing.md,
        elevation: 2,
    },
    customPromptInput: {
        minHeight: 100,
        maxHeight: 150,
        borderColor: colors.neutral.divider,
        borderWidth: 1,
        borderRadius: 12,
        padding: spacing.sm,
        marginBottom: spacing.md,
        backgroundColor: colors.neutral.white,
    },
    customPromptActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    customPromptAction: {
        flex: 1,
        marginHorizontal: spacing.xs,
    },
    selectedPromptSection: {
        marginBottom: spacing.xl,
    },
    selectedPromptCard: {
        backgroundColor: colors.neutral.card,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
    },
    selectedPromptHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
        backgroundColor: colors.journal.accent,
    },
    selectedPromptCategory: {
        fontSize: fontSize.sm,
        color: colors.neutral.white,
        fontFamily: 'Inter-Bold',
    },
    editPromptButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedPromptText: {
        fontSize: fontSize.md,
        color: colors.neutral.text.primary,
        padding: spacing.md,
    },
    entrySection: {
        marginBottom: spacing.xl,
    },
    entryTextArea: {
        minHeight: 120,
        maxHeight: 200,
        borderColor: colors.neutral.divider,
        borderWidth: 1,
        borderRadius: 12,
        padding: spacing.sm,
        backgroundColor: colors.neutral.white,
    },
    wordCount: {
        fontSize: fontSize.sm,
        color: colors.neutral.text.secondary,
        textAlign: 'right',
        marginTop: 4,
    },
    moodSection: {
        marginBottom: spacing.xl,
    },
    moodTagsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    moodTag: {
        flexBasis: '48%',
        marginBottom: spacing.sm,
    },
    saveSection: {
        paddingTop: spacing.md,
        paddingBottom: spacing.xl,
    },
    saveEntryButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.18)',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    modalContent: {
        width: '100%',
        minHeight: '100%',
        maxHeight: '100%',
        backgroundColor: colors.neutral.white,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingTop: 24,
        paddingBottom: 32,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 16,
        alignItems: 'stretch',
    },
    closeModalButton: {
        position: 'absolute',
        top: 18,
        right: 18,
        zIndex: 10,
        backgroundColor: 'rgba(255, 152, 0, 0.10)',
        borderRadius: 20,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    closeModalText: {
        fontSize: 28,
        color: colors.journal.accent,
        fontWeight: 'bold',
        lineHeight: 32,
    },
    // Barra de arraste no topo
    dragBar: {
        alignSelf: 'center',
        width: 48,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#E0E0E0',
        marginBottom: 18,
    },
});
