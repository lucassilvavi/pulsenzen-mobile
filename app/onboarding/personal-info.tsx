import { ScrollView, StyleSheet, View, TouchableOpacity, Alert, Platform, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ThemedText } from '@/components/ThemedText';
import ScreenContainer from '@/components/base/ScreenContainer';
import Button from '@/components/base/Button';
import Card from '@/components/base/Card';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '@/context/AuthContext';

const GENDER_OPTIONS = [
  { id: 'MENINO', label: 'Ele/Dele', icon: 'male' as const },
  { id: 'MENINA', label: 'Ela/Dela', icon: 'female' as const },
];

export default function PersonalInfoScreen() {
  const router = useRouter();
  const { updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [formData, setFormData] = useState({
    dateOfBirth: new Date(2000, 0, 1), // Default to year 2000
    sex: '' as 'MENINO' | 'MENINA' | '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Age validation
    const age = calculateAge(formData.dateOfBirth);
    if (age < 13) {
      newErrors.dateOfBirth = 'Você deve ter pelo menos 13 anos';
    } else if (age > 120) {
      newErrors.dateOfBirth = 'Data inválida';
    }

    // Gender validation
    if (!formData.sex) {
      newErrors.sex = 'Selecione uma opção';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const age = calculateAge(formData.dateOfBirth);
      
      // Format date to ISO string for backend
      const profileData = {
        dateOfBirth: formData.dateOfBirth.toISOString().split('T')[0], // YYYY-MM-DD format
        sex: formData.sex, // MENINO or MENINA
        age, // Calculate and send age for convenience
      };

      console.log('📝 Salvando informações pessoais...');

      // Send data to backend to update user profile
      const result = await updateProfile(profileData);

      if (result.success) {
        console.log('✅ Profile updated successfully');
        // Navigate to benefits screen
        router.push('/onboarding/benefits');
      } else {
        console.error('❌ Profile update failed:', result.message);
        Alert.alert(
          'Erro',
          result.message || 'Não foi possível salvar suas informações. Tente novamente.',
          [{ text: 'OK' }]
        );
      }
      
    } catch (error) {
      console.error('💥 Error updating profile:', error);
      Alert.alert(
        'Erro',
        'Ocorreu um erro ao salvar suas informações. Verifique sua conexão e tente novamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    // No Android, sempre fecha o modal
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate && event.type !== 'dismissed') {
      setFormData({ ...formData, dateOfBirth: selectedDate });
      if (errors.dateOfBirth) {
        setErrors({ ...errors, dateOfBirth: '' });
      }
    }
  };

  const selectGender = (genderId: 'MENINO' | 'MENINA') => {
    setFormData({ ...formData, sex: genderId });
    if (errors.sex) {
      setErrors({ ...errors, sex: '' });
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  const userAge = calculateAge(formData.dateOfBirth);

  return (
    <ScreenContainer style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name="person-circle-outline" 
              size={60} 
              color={colors.primary.main} 
            />
          </View>
                    <ThemedText style={styles.title}>
            Vamos nos conhecer melhor
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Essas informações nos ajudam a personalizar sua experiência de bem-estar
          </ThemedText>
        </View>

        <Card style={styles.formCard}>
          <View style={styles.form}>
            {/* Date of Birth */}
            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel}>Quando você nasceu?</ThemedText>
              <TouchableOpacity 
                style={[styles.dateButton, errors.dateOfBirth && styles.errorInput]}
                onPress={() => setShowDatePicker(true)}
              >
                <View style={styles.dateButtonContent}>
                  <Ionicons name="calendar-outline" size={20} color={colors.primary.main} />
                  <View style={styles.dateTextContainer}>
                    <ThemedText style={styles.dateButtonText}>
                      {formatDate(formData.dateOfBirth)}
                    </ThemedText>
                    <ThemedText style={styles.ageText}>
                      {userAge} anos
                    </ThemedText>
                  </View>
                  <Ionicons name="chevron-down-outline" size={16} color={colors.neutral.text.secondary} />
                </View>
              </TouchableOpacity>
              {errors.dateOfBirth && (
                <ThemedText style={styles.errorText}>{errors.dateOfBirth}</ThemedText>
              )}
            </View>

            {/* Gender Selection */}
            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel}>Como você se identifica?</ThemedText>
              <View style={styles.genderOptions}>
                {GENDER_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.genderButton,
                      formData.sex === option.id && styles.genderButtonSelected
                    ]}
                    onPress={() => selectGender(option.id as any)}
                  >
                    <Ionicons 
                      name={option.icon} 
                      size={24} 
                      color={formData.sex === option.id ? colors.primary.main : colors.neutral.text.secondary}
                    />
                    <ThemedText style={[
                      styles.genderButtonText,
                      formData.sex === option.id && styles.genderButtonTextSelected
                    ]}>
                      {option.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.sex && (
                <ThemedText style={styles.errorText}>{errors.sex}</ThemedText>
              )}
            </View>
          </View>
        </Card>

        {/* Info about data collection */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary.main} />
            <ThemedText style={styles.infoTitle}>Por que pedimos isso?</ThemedText>
          </View>
          <ThemedText style={styles.infoText}>
            • <ThemedText style={styles.infoBold}>Idade:</ThemedText> Para oferecer exercícios apropriados e garantir conformidade legal
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • <ThemedText style={styles.infoBold}>Identidade:</ThemedText> Para personalizar a linguagem e experiência do app
          </ThemedText>
          <ThemedText style={styles.infoSecure}>
            🔒 Seus dados ficam apenas no seu dispositivo e são protegidos por criptografia
          </ThemedText>
        </View>

        {/* Date Picker Modal */}
        {showDatePicker && (
          <Modal
            visible={showDatePicker}
            transparent={true}
            animationType="slide"
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHandle} />
                <View style={styles.modalHeader}>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(false)}
                    style={styles.modalCancelButton}
                  >
                    <ThemedText style={styles.modalCancelText}>Cancelar</ThemedText>
                  </TouchableOpacity>
                  <View style={styles.modalTitleContainer}>
                    <ThemedText style={styles.modalTitle}>Data de Nascimento</ThemedText>
                    <ThemedText style={styles.modalSubtitle}>Selecione quando você nasceu</ThemedText>
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(false)}
                    style={styles.modalConfirmButton}
                  >
                    <ThemedText style={styles.modalConfirmText}>Confirmar</ThemedText>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.datePickerContainer}>
                  <DateTimePicker
                    value={formData.dateOfBirth}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onDateChange}
                    maximumDate={new Date()}
                    minimumDate={new Date(1900, 0, 1)}
                    style={styles.datePicker}
                    themeVariant="light"
                  />
                </View>
                
                <View style={styles.modalFooter}>
                  <ThemedText style={styles.modalFooterText}>
                    Idade calculada: <ThemedText style={styles.modalFooterAge}>{calculateAge(formData.dateOfBirth)} anos</ThemedText>
                  </ThemedText>
                </View>
              </View>
            </View>
          </Modal>
        )}

        <View style={styles.footer}>
          <Button
            label="Continuar"
            onPress={handleSubmit}
            style={styles.continueButton}
            loading={isLoading}
            disabled={isLoading}
          />
          
          <View style={styles.progressContainer}>
            <View style={styles.progressDot} />
            <View style={[styles.progressDot, styles.activeDot]} />
            <View style={styles.progressDot} />
            <View style={styles.progressDot} />
          </View>
        </View>

        <View style={styles.note}>
          <ThemedText style={styles.noteText}>
            🔒 Suas informações são privadas e usadas apenas para personalizar sua experiência
          </ThemedText>
        </View>
      </ScrollView>
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
    marginBottom: spacing.xl,
  },
  iconContainer: {
    backgroundColor: colors.primary.light,
    padding: spacing.lg,
    borderRadius: 50,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.md,
    color: colors.primary.main,
  },
  subtitle: {
    fontSize: fontSize.md,
    textAlign: 'center',
    color: colors.neutral.text.secondary,
    lineHeight: fontSize.md * 1.5,
    paddingHorizontal: spacing.sm,
  },
  formCard: {
    marginBottom: spacing.xl,
  },
  form: {
    padding: spacing.lg,
  },
  fieldContainer: {
    marginBottom: spacing.xl,
  },
  fieldLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.neutral.text.primary,
    marginBottom: spacing.md,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: colors.neutral.divider,
    borderRadius: 12,
    padding: spacing.lg,
    backgroundColor: colors.neutral.white,
  },
  dateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateTextContainer: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  dateButtonText: {
    fontSize: fontSize.md,
    color: colors.neutral.text.primary,
    fontWeight: '500',
  },
  ageText: {
    fontSize: fontSize.sm,
    color: colors.neutral.text.secondary,
    marginTop: 2,
  },
  dateTextContainer: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  genderOptions: {
    gap: spacing.md,
  },
  genderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral.divider,
    borderRadius: 12,
    backgroundColor: colors.neutral.white,
    gap: spacing.md,
  },
  genderButtonSelected: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.light,
  },
  genderButtonText: {
    fontSize: fontSize.md,
    color: colors.neutral.text.secondary,
    flex: 1,
  },
  genderButtonTextSelected: {
    color: colors.primary.main,
    fontWeight: '600',
  },
  errorInput: {
    borderColor: colors.error.main,
  },
  errorText: {
    color: colors.error.main,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  footer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  continueButton: {
    backgroundColor: colors.primary.main,
    marginBottom: spacing.lg,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral.divider,
  },
  activeDot: {
    backgroundColor: colors.primary.main,
  },
  note: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  noteText: {
    fontSize: fontSize.sm,
    color: colors.neutral.text.disabled,
    textAlign: 'center',
    lineHeight: fontSize.sm * 1.4,
    paddingHorizontal: spacing.md,
  },
  infoCard: {
    backgroundColor: `${colors.primary.main}08`,
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary.main,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.primary.main,
    marginLeft: spacing.sm,
  },
  infoText: {
    fontSize: fontSize.sm,
    color: colors.neutral.text.secondary,
    marginBottom: spacing.xs,
    lineHeight: fontSize.sm * 1.4,
  },
  infoBold: {
    fontWeight: '600',
    color: colors.neutral.text.primary,
  },
  infoSecure: {
    fontSize: fontSize.sm,
    color: colors.success.main,
    fontWeight: '500',
    marginTop: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.neutral.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: spacing.xl,
    maxHeight: '70%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.neutral.divider,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.divider,
    minHeight: 60,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.neutral.text.primary,
    textAlign: 'center',
  },
  modalButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  modalButtonText: {
    fontSize: fontSize.md,
    color: colors.neutral.text.secondary,
  },
  modalButtonConfirm: {
    color: colors.primary.main,
    fontWeight: '600',
  },
  datePicker: {
    backgroundColor: colors.neutral.background,
  },
  // Novos estilos do modal melhorado
  modalCancelButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  modalCancelText: {
    fontSize: fontSize.md,
    color: colors.neutral.text.secondary,
  },
  modalTitleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  modalSubtitle: {
    fontSize: fontSize.sm,
    color: colors.neutral.text.secondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  modalConfirmButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary.main,
    borderRadius: 8,
  },
  modalConfirmText: {
    fontSize: fontSize.md,
    color: colors.neutral.background,
    fontWeight: '600',
  },
  datePickerContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  modalFooter: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.divider,
    alignItems: 'center',
  },
  modalFooterText: {
    fontSize: fontSize.sm,
    color: colors.neutral.text.secondary,
  },
  modalFooterAge: {
    fontWeight: '600',
    color: colors.primary.main,
  },
});