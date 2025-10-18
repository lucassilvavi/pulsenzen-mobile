import { AvatarPicker } from '@/components/AvatarPicker';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Button from '@/components/base/Button';
import { colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useUserDataNew } from '@/context/UserDataContext';
import { fontSize, spacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ProfileService } from '../services/ProfileService';
import { UserProfile } from '../types';

const GENDER_OPTIONS = [
  { id: 'MENINO', label: 'Ele/Dele', icon: 'male' as const },
  { id: 'MENINA', label: 'Ela/Dela', icon: 'female' as const },
];

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  currentProfile: UserProfile | null;
  onProfileUpdated: (updatedProfile: UserProfile) => void;
}

export function EditProfileModal({
  visible,
  onClose,
  currentProfile,
  onProfileUpdated,
}: EditProfileModalProps) {
  const { updateProfile: updateAuthProfile, user } = useAuth();
  const { updateUserData } = useUserDataNew();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date(2000, 0, 1));
  const [sex, setSex] = useState<'MENINO' | 'MENINA' | ''>('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (visible && currentProfile) {
      setName(currentProfile.name || '');
      setEmail(currentProfile.email || '');
      
      // Split name into first and last name if available
      const nameParts = (currentProfile.name || '').split(' ');
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      
      // Set sex if available
      setSex((currentProfile.sex as 'MENINO' | 'MENINA') || '');
      
      // Handle date of birth - priority: actual dateOfBirth from API, then calculate from age
      if (currentProfile.dateOfBirth) {
        // Use actual dateOfBirth from API
        const birthDate = new Date(currentProfile.dateOfBirth);
        setDateOfBirth(birthDate);
      } else if (currentProfile.age) {
        // Fallback: calculate from age
        const currentYear = new Date().getFullYear();
        const birthYear = currentYear - currentProfile.age;
        setDateOfBirth(new Date(birthYear, 0, 1));
      }
      
      loadUserAvatar();
    }
  }, [visible, currentProfile]);

  const loadUserAvatar = async () => {
    try {
      const savedAvatar = await ProfileService.getUserAvatar(user?.id);
      setAvatarUri(savedAvatar);
    } catch (error) {
      console.error('Erro ao carregar avatar:', error);
    }
  };

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'Nome é obrigatório';
    }

    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    // Age validation
    const age = calculateAge(dateOfBirth);
    if (age < 13) {
      newErrors.dateOfBirth = 'Você deve ter pelo menos 13 anos';
    } else if (age > 120) {
      newErrors.dateOfBirth = 'Data inválida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    // No Android, sempre fecha o modal
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate && event.type !== 'dismissed') {
      setDateOfBirth(selectedDate);
      if (errors.dateOfBirth) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.dateOfBirth;
          return newErrors;
        });
      }
    }
  };

  const selectGender = (genderId: 'MENINO' | 'MENINA') => {
    setSex(genderId);
    if (errors.sex) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.sex;
        return newErrors;
      });
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Save avatar separately (user-specific)
      await ProfileService.saveUserAvatar(avatarUri, user?.id);

      // Prepare profile data for API
      const profileData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: dateOfBirth.toISOString().split('T')[0], // YYYY-MM-DD format
        sex: sex, // MENINO or MENINA
      };

      // Update profile via AuthContext (this will sync with API and update global state)
      const result = await updateAuthProfile(profileData);
      
      if (result.success) {
        // ✨ Update UserDataContext for immediate UI synchronization
        await updateUserData({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        });

        // Create updated profile for local state
        const age = calculateAge(dateOfBirth);
        const updatedProfile: UserProfile = {
          ...currentProfile,
          name: `${firstName.trim()} ${lastName.trim()}`.trim(),
          email: email.trim(),
          sex: sex || undefined,
          age: age,
          avatar: avatarUri || undefined,
          updatedAt: new Date().toISOString(),
        };

        // Save profile locally for persistence
        const localSaveSuccess = await ProfileService.saveUserProfile(updatedProfile);
        
        // Update parent component
        onProfileUpdated(updatedProfile);
        onClose();
      } else {
        throw new Error(result.message || 'Falha ao salvar perfil');
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      
      // Even if API fails, save locally
      try {
        const age = calculateAge(dateOfBirth);
        const localProfile: UserProfile = {
          ...currentProfile,
          name: `${firstName.trim()} ${lastName.trim()}`.trim(),
          email: email.trim(),
          sex: sex || undefined,
          age: age,
          avatar: avatarUri || undefined,
          updatedAt: new Date().toISOString(),
        };
        
        await ProfileService.saveUserProfile(localProfile);
        
        // ✨ Update UserDataContext even on API failure
        await updateUserData({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        });
        
        console.log('💾 Dados salvos localmente como fallback');
        onProfileUpdated(localProfile);
        onClose();
      } catch (localError) {
        console.error('💥 Erro ao salvar localmente:', localError);
        // You might want to show an alert here
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setName(currentProfile?.name || '');
    setEmail(currentProfile?.email || '');
    setFirstName('');
    setLastName('');
    setDateOfBirth(new Date(2000, 0, 1));
    setSex('');
    setShowDatePicker(false);
    setErrors({});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.neutral.text.primary} />
          </TouchableOpacity>
          <ThemedText style={styles.title}>Editar Perfil</ThemedText>
          <View style={styles.headerRight} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <AvatarPicker
                currentImage={avatarUri || undefined}
                onImageSelected={setAvatarUri}
                size={120}
                showEditButton={true}
              />
              <ThemedText style={styles.avatarHint}>
                Toque na foto para alterar
              </ThemedText>
            </View>

            {/* Form Fields */}
            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Nome *</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    errors.firstName && styles.inputError
                  ]}
                  value={firstName}
                  onChangeText={(text) => {
                    setFirstName(text);
                    setName(`${text} ${lastName}`.trim()); // Keep name in sync
                    if (errors.firstName) {
                      setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.firstName;
                        return newErrors;
                      });
                    }
                  }}
                  placeholder="Digite seu nome"
                  placeholderTextColor={colors.neutral.text.disabled}
                  maxLength={50}
                />
                {errors.firstName && (
                  <ThemedText style={styles.errorText}>{errors.firstName}</ThemedText>
                )}
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Sobrenome</ThemedText>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={(text) => {
                    setLastName(text);
                    setName(`${firstName} ${text}`.trim()); // Keep name in sync
                  }}
                  placeholder="Digite seu sobrenome"
                  placeholderTextColor={colors.neutral.text.disabled}
                  maxLength={50}
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Email *</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    errors.email && styles.inputError
                  ]}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) {
                      setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.email;
                        return newErrors;
                      });
                    }
                  }}
                  placeholder="Digite seu email"
                  placeholderTextColor={colors.neutral.text.disabled}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  maxLength={100}
                />
                {errors.email && (
                  <ThemedText style={styles.errorText}>{errors.email}</ThemedText>
                )}
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Data de Nascimento</ThemedText>
                <TouchableOpacity 
                  style={[styles.dateButton, errors.dateOfBirth && styles.inputError]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <View style={styles.dateButtonContent}>
                    <Ionicons name="calendar-outline" size={20} color={colors.primary.main} />
                    <View style={styles.dateTextContainer}>
                      <ThemedText style={styles.dateButtonText}>
                        {formatDate(dateOfBirth)}
                      </ThemedText>
                      <ThemedText style={styles.ageText}>
                        {calculateAge(dateOfBirth)} anos
                      </ThemedText>
                    </View>
                    <Ionicons name="chevron-down-outline" size={16} color={colors.neutral.text.secondary} />
                  </View>
                </TouchableOpacity>
                {errors.dateOfBirth && (
                  <ThemedText style={styles.errorText}>{errors.dateOfBirth}</ThemedText>
                )}
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Como você se identifica?</ThemedText>
                <View style={styles.genderOptions}>
                  {GENDER_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.genderButton,
                        sex === option.id && styles.genderButtonSelected
                      ]}
                      onPress={() => selectGender(option.id as any)}
                    >
                      <Ionicons 
                        name={option.icon} 
                        size={24} 
                        color={sex === option.id ? colors.primary.main : colors.neutral.text.secondary}
                      />
                      <ThemedText style={[
                        styles.genderButtonText,
                        sex === option.id && styles.genderButtonTextSelected
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
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button
              label="Cancelar"
              variant="outline"
              onPress={handleClose}
              style={styles.cancelButton}
              disabled={isLoading}
            />
            <Button
              label="Salvar"
              onPress={handleSave}
              style={styles.saveButton}
              loading={isLoading}
              disabled={isLoading}
            />
          </View>
        </KeyboardAvoidingView>

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
                    value={dateOfBirth}
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
                    Idade calculada: <ThemedText style={styles.modalFooterAge}>{calculateAge(dateOfBirth)} anos</ThemedText>
                  </ThemedText>
                </View>
              </View>
            </View>
          </Modal>
        )}
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingTop: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.divider,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-SemiBold',
    color: colors.neutral.text.primary,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarHint: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: colors.neutral.text.secondary,
    marginTop: spacing.md,
  },
  formSection: {
    gap: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Medium',
    color: colors.neutral.text.primary,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.neutral.divider,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    fontFamily: 'Inter-Regular',
    color: colors.neutral.text.primary,
    backgroundColor: colors.neutral.white,
  },
  inputError: {
    borderColor: colors.error.main,
  },
  errorText: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Regular',
    color: colors.error.main,
    marginTop: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  // Date picker styles
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
  // Gender selection styles
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
  // Date picker modal styles
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
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.neutral.text.primary,
    textAlign: 'center',
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
  datePicker: {
    backgroundColor: colors.neutral.background,
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