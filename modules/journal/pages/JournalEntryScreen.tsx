import Button from '@/components/base/Button';
import CustomTextInput from '@/components/base/CustomTextInput';
import ScreenContainer from '@/components/base/ScreenContainer';
import { ThemedText } from '@/components/ThemedText';
import { colors } from '@/constants/theme';
import { CBTAnalysisModal } from '@/modules/cbt';
import { useCBTAnalysis } from '@/modules/cbt/hooks/useCBTAnalysis';
import { ProfileService } from '@/modules/profile';
import { fontSize, spacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import from the journal module
import { LinearGradient } from 'expo-linear-gradient';
import { JournalEntryView, PromptSelector, SelectedPromptDisplay } from '../components';
import { JournalService } from '../services';
import { JournalServiceProvider } from '../services/JournalServiceProvider';
import { JournalPrompt, MoodTag } from '../types';

const { width, height } = Dimensions.get('window');

// Default mood tags for selection

const DEFAULT_MOOD_TAGS: MoodTag[] = [
  { id: '1', label: 'Feliz', emoji: '😊', category: 'positive', intensity: 3, hexColor: '#4CAF50' },
  { id: '2', label: 'Triste', emoji: '😢', category: 'negative', intensity: 3, hexColor: '#F44336' },
  { id: '3', label: 'Ansioso', emoji: '😰', category: 'negative', intensity: 4, hexColor: '#FF9800' },
  { id: '4', label: 'Calmo', emoji: '😌', category: 'positive', intensity: 2, hexColor: '#2196F3' },
  { id: '5', label: 'Motivado', emoji: '💪', category: 'positive', intensity: 4, hexColor: '#9C27B0' },
  { id: '6', label: 'Cansado', emoji: '😴', category: 'neutral', intensity: 3, hexColor: '#607D8B' },
  { id: '7', label: 'Grato', emoji: '🙏', category: 'positive', intensity: 5, hexColor: '#8BC34A' },
  { id: '8', label: 'Irritado', emoji: '😠', category: 'negative', intensity: 4, hexColor: '#E91E63' },
];


export default function JournalEntryScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams();
    const [selectedPrompt, setSelectedPrompt] = useState<JournalPrompt | null>(
        null
    );
    const [entryText, setEntryText] = useState('');
    const [selectedMoodTags, setSelectedMoodTags] = useState<MoodTag[]>([]);
    const [isCustomPrompt, setIsCustomPrompt] = useState(false);
    const [customPrompt, setCustomPrompt] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [journalPrompts, setJournalPrompts] = useState<JournalPrompt[]>([]);
    const [viewEntry, setViewEntry] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [customPromptModal, setCustomPromptModal] = useState(false);
    const [customPromptDraft, setCustomPromptDraft] = useState('');
    const [analysisVisible, setAnalysisVisible] = useState(false);
    const { result: cbtResult, runAnalysis, loading: cbtLoading, reset: resetCBT, setExternal: setCBTResult } = useCBTAnalysis();

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
                if (draftData.cbtAnalysis) {
                    setCBTResult(draftData.cbtAnalysis);
                } else {
                    resetCBT();
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
                cbtAnalysis: cbtResult,
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
        // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        try {
            const promptText = isCustomPrompt ? customPrompt : selectedPrompt?.question || '';
            
            const entry = {
                id: Date.now().toString(),
                content: entryText,
                prompt: promptText,
                promptCategory: isCustomPrompt ? 'Personalizado' : selectedPrompt?.category || 'Reflexão Pessoal',
                moodTags: selectedMoodTags,
                createdAt: new Date().toISOString(),
                wordCount: entryText.trim().split(/\s+/).length,
                privacy: 'private' as const,
            };

            // Salva usando o service
            await JournalServiceProvider.createEntry(entry);

            console.log('✅ Entry saved successfully:', entry);

            // Clear draft
            await AsyncStorage.removeItem('journalDraft');

            // Update user stats
            await updateUserStats();

            // Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

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

    const toggleMoodTag = (tag: MoodTag) => {
        setSelectedMoodTags(prev =>
            prev.some(t => t.id === tag.id)
                ? prev.filter(t => t.id !== tag.id)
                : [...prev, tag]
        );
        // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const selectPrompt = (prompt: JournalPrompt) => {
        setSelectedPrompt(prompt);
        setIsCustomPrompt(false);
        setCustomPrompt('');
        // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
                    {/* Close Button - NEW POSITION TEST */}
                    <TouchableOpacity 
                        style={{
                            position: 'absolute',
                            top: 60, // Much lower position for testing
                            right: 20,
                            width: 50, // Larger for testing
                            height: 50,
                            borderRadius: 25,
                            backgroundColor: '#FF0000', // Red for testing - very visible
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 9999,
                        }}
                        onPress={() => { setModalVisible(false); router.back(); }}
                        activeOpacity={0.7}
                        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                    >
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>
                    
                    {/* Modern Header */}
                    <View style={styles.modalHeader}>
                        <View style={styles.dragIndicator} />
                    </View>
                    
                    {/* Content with Improved Spacing */}
                    <View style={styles.modalInnerContent}>
                        {viewEntry && (
                            <JournalEntryView
                                entry={{
                                    id: viewEntry.id || 'temp',
                                    content: viewEntry.content || viewEntry.text || '',
                                    promptCategory: viewEntry.promptCategory || 'Geral',
                                    moodTags: viewEntry.moodTags || [],
                                    createdAt: viewEntry.createdAt || viewEntry.date || new Date().toISOString(),
                                    updatedAt: viewEntry.updatedAt || new Date().toISOString(),
                                    wordCount: viewEntry.wordCount || 0,
                                    readingTimeMinutes: viewEntry.readingTimeMinutes || 1,
                                    isFavorite: viewEntry.isFavorite || false,
                                    privacy: viewEntry.privacy || 'private',
                                    selectedPrompt: viewEntry.prompt ? {
                                        id: 'custom',
                                        question: viewEntry.prompt,
                                        category: viewEntry.promptCategory || 'Geral',
                                        icon: 'help-circle',
                                        difficulty: 'beginner' as const,
                                        tags: []
                                    } : undefined
                                }}
                                onBack={() => { setModalVisible(false); router.back(); }}
                            />
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );

    // Modal para criar pergunta personalizada
    const renderCustomPromptModal = () => (
        <Modal
            visible={customPromptModal}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleCustomPromptCancel}
        >
            <View style={styles.customPromptContainer}>
                <LinearGradient
                    colors={['#A8D5BA', '#F2F9F5']}
                    style={styles.modalHeaderGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                />
                {/* Header */}
                <View style={styles.pageSheetHeader}>
                    <TouchableOpacity
                        onPress={handleCustomPromptCancel}
                        style={styles.headerButton}
                    >
                        <Ionicons name="close" size={24} color={colors.journal.text.secondary} />
                    </TouchableOpacity>
                    
                    <ThemedText style={styles.pageSheetTitle}>Crie sua pergunta</ThemedText>
                    
                    <TouchableOpacity
                        onPress={() => {
                            if (customPromptDraft.trim()) {
                                handleCustomPromptConfirm();
                                setCustomPromptModal(false);
                                setIsCustomPrompt(true);
                            }
                        }}
                        style={[
                            styles.headerButton,
                            styles.saveHeaderButton,
                            { opacity: customPromptDraft.trim() ? 1 : 0.5 }
                        ]}
                        disabled={!customPromptDraft.trim()}
                    >
                        <Ionicons name="checkmark" size={24} color={colors.journal.surface} />
                    </TouchableOpacity>
                </View>
                
                {/* Content */}
                <ScrollView style={styles.customPromptScrollView} contentContainerStyle={styles.customPromptContent}>
                    <ThemedText style={styles.customPromptDescription}>
                        Crie uma pergunta personalizada para guiar sua reflexão de hoje.{'\n'}
                        Uma boa pergunta deve ser específica e inspirar uma resposta reflexiva.
                    </ThemedText>
                    
                    <View style={styles.inputContainer}>
                        <CustomTextInput
                            placeholder="Ex: O que mais me deixou grato hoje e por quê?"
                            value={customPromptDraft}
                            onChangeText={setCustomPromptDraft}
                            inputStyle={styles.customPromptTextInput}
                            multiline
                            autoFocus
                        />
                    </View>
                    
                    {/* Exemplo de perguntas */}
                    <View style={styles.examplePromptsSection}>
                        <ThemedText style={styles.examplePromptsTitle}>💡 Exemplos de perguntas:</ThemedText>
                        {[
                            "Qual foi o momento mais significativo do meu dia?",
                            "O que aprendi sobre mim mesmo hoje?",
                            "Como posso melhorar meu bem-estar amanhã?",
                            "Que desafio enfrentei e como me senti sobre isso?"
                        ].map((example, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.examplePromptItem}
                                onPress={() => setCustomPromptDraft(example)}
                            >
                                <ThemedText style={styles.examplePromptText}>{example}</ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
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
             <ScreenContainer style={{ ...styles.container, paddingTop: insets.top + 40 }}>
                      <LinearGradient
                            colors={['#A8D5BA', '#F2F9F5']}
                            style={styles.headerGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                            />
                        {/* Header */}
                        <View style={styles.customHeader}>
                            <TouchableOpacity
                                onPress={() => router.back()}
                                style={styles.backButton}
                            >
                            <Ionicons name="chevron-back" size={24} color={colors.primary.main} />
                            </TouchableOpacity>
                            
                            <ThemedText style={styles.headerTitle}>
                                {viewEntry ? 'Visualizar Entrada' : 'Nova Entrada'}
                            </ThemedText>
                            
                            <View style={styles.headerRight} />
                        </View>
                        
                        <ScrollView
                            style={styles.contentContainer}
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                            accessible={true}
                            accessibilityRole="scrollbar"
                            accessibilityLabel="Conteúdo da página de respiração"
                            accessibilityHint="Role para ver as técnicas de respiração, benefícios e dicas"
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
                                <CustomTextInput
                                    placeholder="Comece a escrever seus pensamentos..."
                                    value={entryText}
                                    onChangeText={setEntryText}
                                    inputStyle={styles.entryTextArea}
                                    multiline
                                    numberOfLines={8}
                                    textAlignVertical="top"
                                />
                                <ThemedText style={styles.wordCount}>
                                    {entryText.trim().split(/\s+/).filter(word => word.length > 0).length} palavras
                                </ThemedText>
                            </View>
                        )}

                        {/* Analisar Pensamento Button */}
                        {(selectedPrompt || (isCustomPrompt && customPrompt.trim())) && entryText.trim().length >= 30 && (
                            <View style={{ marginTop: spacing.md }}>
                                <Button
                                    label={cbtResult ? "Ver Análise Cognitiva" : cbtLoading ? "Analisando..." : "Analisar Pensamento (Beta)"}
                                    variant="outline"
                                    size="large"
                                    fullWidth
                                    onPress={() => { if (!cbtResult && !cbtLoading) { runAnalysis(entryText); } setAnalysisVisible(true); }}
                                    disabled={cbtLoading}
                                    style={{ borderColor: colors.primary.main }}
                                    labelStyle={{ color: colors.primary.main }}
                                />
                            </View>
                        )}

                        {cbtResult && cbtResult.distortions.length > 0 && (
                            <View style={{ flexDirection:'row', flexWrap:'wrap', marginTop: spacing.sm }}>
                                {cbtResult.distortions.map(d => (
                                    <View key={d.id} style={{ backgroundColor:'#F1F5F9', borderRadius:16, paddingHorizontal:12, paddingVertical:6, marginRight:8, marginBottom:8 }}>
                                        <ThemedText style={{ fontSize: fontSize.xs, fontFamily:'Inter-SemiBold', color: colors.primary.main }}>{d.label}</ThemedText>
                                    </View>
                                ))}
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
                                            key={tag.id}
                                            label={`${tag.emoji} ${tag.label}`}
                                            variant={selectedMoodTags.some(selected => selected.id === tag.id) ? "primary" : "outline"}
                                            size="small"
                                            onPress={() => toggleMoodTag(tag)}
                                            style={selectedMoodTags.some(selected => selected.id === tag.id) ? StyleSheet.flatten([styles.moodTag, { backgroundColor: colors.journal.accent }]) : styles.moodTag}
                                            labelStyle={{
                                                color: selectedMoodTags.some(selected => selected.id === tag.id) ? colors.neutral.white : colors.journal.accent,
                                                fontSize: fontSize.sm,
                                            }}
                                        />
                                    ))}
                                </View>
                            </View>
                        )}
            <CBTAnalysisModal visible={analysisVisible} onClose={() => setAnalysisVisible(false)} text={entryText} />
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
                
            </ScreenContainer>
        </KeyboardAvoidingView>
            <CBTAnalysisModal visible={analysisVisible} onClose={() => setAnalysisVisible(false)} text={entryText} />
        </>
    );
}

const styles = StyleSheet.create({
    keyboardContainer: {
        flex: 1,
    },
 headerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 300,
    zIndex: 0,
  },
    container: {
        flex: 1,
    },
    customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    zIndex: 1,

    },
backButton: {
    padding: spacing.xs,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.journal.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.journal.border.light,
  },
    headerTitle: {
        fontSize: fontSize.lg,
        fontFamily: 'Inter-SemiBold',
        color: colors.journal.text.primary,
    },
    headerRight: {
          width: 40,
          height: 40,
    },
    closeButton: {
        backgroundColor: colors.journal.surface,
        borderRadius: 20,
        width: 40,
        height: 40,
        borderWidth: 1,
        borderColor: colors.journal.border.light,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContent: {
        flex: 1,
        alignItems: 'center',
    },
    headerDate: {
        fontSize: fontSize.sm,
        color: colors.journal.text.secondary,
        marginTop: 4,
    },
    saveButton: {
        backgroundColor: colors.journal.accent,
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.journal.accent,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    contentContainer: {
        flex: 1,
    
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 30,
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
        color: colors.journal.text.secondary,
        marginBottom: 4,
    },
    promptQuestion: {
        fontSize: fontSize.md,
        fontFamily: 'Inter-Medium',
        color: colors.journal.text.primary,
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
        backgroundColor: colors.journal.surface,
        borderRadius: 12,
        padding: spacing.md,
        elevation: 2,
        borderWidth: 1,
        borderColor: colors.journal.border.light,
    },
    customPromptInput: {
        minHeight: 100,
        maxHeight: 150,
        borderColor: colors.journal.border.light,
        borderWidth: 1,
        borderRadius: 12,
        padding: spacing.sm,
        marginBottom: spacing.md,
        backgroundColor: colors.journal.surface,
        color: colors.journal.text.primary,
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
        backgroundColor: colors.journal.surface,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
        borderWidth: 1,
        borderColor: colors.journal.border.light,
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
        color: colors.journal.surface,
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
        color: colors.journal.text.primary,
        padding: spacing.md,
    },
    entrySection: {
        marginBottom: spacing.xl,
    },
    entryTextArea: {
        minHeight: 120,
        maxHeight: 200,
        borderColor: colors.journal.border.light,
        borderWidth: 1,
        borderRadius: 12,
        padding: spacing.sm,
        backgroundColor: colors.journal.surface,
        color: colors.journal.text.primary,
        fontSize: fontSize.md,
        lineHeight: 22,
    },
    wordCount: {
        fontSize: fontSize.sm,
        color: colors.journal.text.muted,
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
        backgroundColor: colors.journal.surface,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 16,
    },
    modalHeader: {
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
        paddingHorizontal: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.journal.border.light,
        backgroundColor: colors.journal.surface,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
    },
    dragIndicator: {
        alignSelf: 'center',
        width: 48,
        height: 5,
        borderRadius: 3,
        backgroundColor: colors.journal.border.medium,
        marginBottom: spacing.sm,
    },
    modernCloseButton: {
        position: 'absolute',
        top: 20, // Fixed distance from top of modal
        right: 20, // Fixed distance from right of modal
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.journal.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.journal.border.light,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 6,
        zIndex: 999,
    },
    modalInnerContent: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
    },

    // Custom Prompt Modal Styles
    customPromptModalContent: {
        width: '100%',
        backgroundColor: colors.journal.surface,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        maxHeight: '70%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 16,
    },
    customPromptHeader: {
        paddingTop: spacing.md,
        paddingBottom: spacing.md,
        paddingHorizontal: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.journal.border.light,
    },
    customPromptTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    customPromptIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: `${colors.journal.accent}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    customPromptTitle: {
        fontSize: fontSize.lg,
        color: colors.journal.accent,
        fontFamily: 'Inter-Bold',
        letterSpacing: 0.3,
    },
    customPromptContent: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.xl,
    },
    customPromptDescription: {
        fontSize: fontSize.md,
        color: colors.journal.text.body,
        lineHeight: 22,
        marginBottom: spacing.xl,
        textAlign: 'center',
    },
    customPromptTextInput: {
        minHeight: 120,
        maxHeight: 180,
        borderRadius: 12,
        padding: spacing.md,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        fontSize: fontSize.md,
        lineHeight: 22,
        color: colors.journal.text.primary,
        textAlignVertical: 'top',
        fontFamily: 'Inter-Regular',
    },
    customPromptActionCancel: {
        flex: 1,
        marginRight: spacing.sm,
        borderColor: colors.journal.border.light,
        backgroundColor: colors.journal.secondary,
    },
    customPromptActionConfirm: {
        flex: 1,
        marginLeft: spacing.sm,
    },
    
    // New styles for pageSheet modal
    customPromptContainer: {
        flex: 1,
        backgroundColor: colors.journal.surface,
    },
    
    modalHeaderGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: 300,
        zIndex: 0,
    },
    
    modalCloseButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.journal.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.journal.border.light,
    },
    
    modalSaveButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.journal.accent,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.journal.accent,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
    },
    
    customPromptScrollView: {
        flex: 1,
    },
    
    examplePromptsSection: {
        marginTop: spacing.lg,
    },
    
    examplePromptsTitle: {
        fontSize: fontSize.md,
        fontWeight: '600',
        color: colors.journal.text.primary,
        marginBottom: spacing.md,
        textAlign: 'left',
    },
    
    examplePromptItem: {
        padding: spacing.md,  
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 12,
        marginBottom: spacing.sm,
        // iOS - sombras nativas
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 3,
            },
            // Android - elevation muito sutil
            android: {
                elevation: 0.5,
            },
        }),
    },
    
    examplePromptText: {
        fontSize: fontSize.sm,
        color: colors.journal.text.body,
        lineHeight: 20,
    },
    
    pageSheetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.journal.border.light,
        backgroundColor: 'transparent',
        minHeight: 70,
        zIndex: 1,
    },
    
    pageSheetTitle: {
        fontSize: fontSize.lg,
        fontWeight: '600',
        color: colors.journal.text.primary,
        flex: 1,
        textAlign: 'center',
        marginHorizontal: spacing.sm,
        fontFamily: 'Inter-SemiBold',
    },
    
    inputContainer: {
        marginVertical: spacing.md,
    },
    
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        // Platform-specific shadows
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 3,
            },
            android: {
                elevation: 0.5,
            },
        }),
    },
    
    saveHeaderButton: {
        backgroundColor: colors.journal.accent,
        // Platform-specific shadows for accent button
        ...Platform.select({
            ios: {
                shadowColor: colors.journal.accent,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.12,
                shadowRadius: 4,
            },
            android: {
                elevation: 1,
            },
        }),
    },
});
