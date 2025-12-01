import { AvatarPicker } from '@/components/AvatarPicker';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Button from '@/components/base/Button';
import { colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useUserDataNew } from '@/context/UserDataContext';
import { fontSize, spacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [sex, setSex] = useState<'MENINO' | 'MENINA' | ''>('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Format date input with mask DD/MM/YYYY
  const formatDateInput = (text: string) => {
    // Remove all non-numeric characters
    const cleaned = text.replace(/\D/g, '');
    
    // If empty, return empty
    if (cleaned.length === 0) {
      return '';
    }
    
    // Apply mask progressively
    let formatted = cleaned.slice(0, 2); // DD
    
    if (cleaned.length >= 3) {
      formatted += '/' + cleaned.slice(2, 4); // DD/MM
    }
    
    if (cleaned.length >= 5) {
      formatted += '/' + cleaned.slice(4, 8); // DD/MM/YYYY
    }
    
    return formatted;
  };

  const handleDateInputChange = (text: string) => {
    // If user is deleting and hits a '/', remove the character before it too
    if (text.length < dateInput.length && text.endsWith('/')) {
      text = text.slice(0, -1);
    }
    
    const formatted = formatDateInput(text);
    setDateInput(formatted);
    
    // Clear error when user starts typing
    if (errors.dateOfBirth) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.dateOfBirth;
        return newErrors;
      });
    }
  };

  const parseDateFromInput = (dateStr: string): Date | null => {
    // Expected format: DD/MM/YYYY
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    if (day < 1 || day > 31) return null;
    if (month < 1 || month > 12) return null;
    if (year < 1900 || year > new Date().getFullYear()) return null;
    
    // Create date (month is 0-indexed in JS)
    const date = new Date(year, month - 1, day);
    
    // Validate that the date is valid (e.g., not Feb 31)
    if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
      return null;
    }
    
    return date;
  };

  const formatDateToInput = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    if (visible && currentProfile) {
      setName(currentProfile.name || '');
      setEmail(currentProfile.email || '');
      
      // Split name into first and last name if available
      const nameParts = (currentProfile.name || '').split(' ');
      const extractedFirstName = nameParts[0] || '';
      const extractedLastName = nameParts.slice(1).join(' ') || '';
      
      setFirstName(extractedFirstName);
      setLastName(extractedLastName);
      
      // Set sex if available
      setSex((currentProfile.sex as 'MENINO' | 'MENINA') || '');
      
      // Handle date of birth - priority: actual dateOfBirth from API, then calculate from age
      if (currentProfile.dateOfBirth) {
        // Use actual dateOfBirth from API
        // Parse only the date part to avoid timezone issues
        const dateStr = currentProfile.dateOfBirth.split('T')[0]; // Get YYYY-MM-DD
        const [year, month, day] = dateStr.split('-').map(Number);
        const birthDate = new Date(year, month - 1, day); // Create date in local timezone
        setDateInput(formatDateToInput(birthDate));
      } else if (currentProfile.age) {
        // Fallback: calculate from age
        const currentYear = new Date().getFullYear();
        const birthYear = currentYear - currentProfile.age;
        const estimatedDate = new Date(birthYear, 0, 1);
        setDateInput(formatDateToInput(estimatedDate));
      } else {
        setDateInput('');
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

    // Date validation
    if (!dateInput.trim()) {
      newErrors.dateOfBirth = 'Data de nascimento é obrigatória';
    } else if (dateInput.length !== 10) {
      newErrors.dateOfBirth = 'Data incompleta. Use o formato DD/MM/AAAA';
    } else {
      const birthDate = parseDateFromInput(dateInput);
      if (!birthDate) {
        newErrors.dateOfBirth = 'Data inválida';
      } else {
        const age = calculateAge(birthDate);
        if (age < 13) {
          newErrors.dateOfBirth = 'Você deve ter pelo menos 13 anos';
        } else if (age > 120) {
          newErrors.dateOfBirth = 'Data inválida';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      const birthDate = parseDateFromInput(dateInput);
      if (!birthDate) {
        setErrors({ ...errors, dateOfBirth: 'Data inválida' });
        setIsLoading(false);
        return;
      }

      // Save avatar separately (user-specific)
      await ProfileService.saveUserAvatar(avatarUri, user?.id);

      // Prepare profile data for API
      // Format date without timezone conversion to avoid day shift
      const year = birthDate.getFullYear();
      const month = String(birthDate.getMonth() + 1).padStart(2, '0');
      const day = String(birthDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`; // YYYY-MM-DD format
      
      const profileData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: formattedDate,
        sex: sex, // MENINO or MENINA
      };

      // Calculate age for local profile
      const age = calculateAge(birthDate);
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

      // 1. Update UserDataContext FIRST for immediate UI sync
      await updateUserData({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      // 2. Create updated profile for local storage
      const updatedProfile: UserProfile = {
        ...currentProfile,
        name: fullName,
        email: email.trim(),
        sex: sex || undefined,
        age: age,
        avatar: avatarUri || undefined,
        updatedAt: new Date().toISOString(),
      };

      // 3. Save locally BEFORE API call to ensure data persistence
      await ProfileService.saveUserProfile(updatedProfile);

      // 4. Update profile via AuthContext (API call)
      const result = await updateAuthProfile(profileData);
      
      if (!result.success) {
        console.warn('⚠️ API update failed, but local data saved:', result.message);
      }

      // 5. Always update parent component with local data
      onProfileUpdated(updatedProfile);
      onClose();

    } catch (error) {
      console.error('💥 Error saving profile:', error);
      
      // Fallback: ensure local data is saved even on errors
      try {
        const birthDate = parseDateFromInput(dateInput);
        if (!birthDate) {
          throw new Error('Invalid birth date');
        }
        
        const age = calculateAge(birthDate);
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
        await updateUserData({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        });
        
        onProfileUpdated(localProfile);
        onClose();
      } catch (localError) {
        console.error('💥 Critical error in fallback:', localError);
        // You might want to show an alert here
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    if (currentProfile) {
      setName(currentProfile.name || '');
      setEmail(currentProfile.email || '');
      
      // Reset to original values
      const nameParts = (currentProfile.name || '').split(' ');
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      setSex((currentProfile.sex as 'MENINO' | 'MENINA') || '');
      
      if (currentProfile.dateOfBirth) {
        // Parse only the date part to avoid timezone issues
        const dateStr = currentProfile.dateOfBirth.split('T')[0]; // Get YYYY-MM-DD
        const [year, month, day] = dateStr.split('-').map(Number);
        const birthDate = new Date(year, month - 1, day); // Create date in local timezone
        setDateInput(formatDateToInput(birthDate));
      } else if (currentProfile.age) {
        const currentYear = new Date().getFullYear();
        const birthYear = currentYear - currentProfile.age;
        const estimatedDate = new Date(birthYear, 0, 1);
        setDateInput(formatDateToInput(estimatedDate));
      } else {
        setDateInput('');
      }
    } else {
      // Fallback defaults
      setName('');
      setEmail('');
      setFirstName('');
      setLastName('');
      setSex('');
      setDateInput('');
    }
    
    setErrors({});
    setIsLoading(false);
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
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
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
                <View style={[styles.dateInputContainer, errors.dateOfBirth && styles.inputError]}>
                  <Ionicons 
                    name="calendar-outline" 
                    size={22} 
                    color={colors.primary.main}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.dateInput}
                    placeholder="DD/MM/AAAA"
                    placeholderTextColor={colors.neutral.text.disabled}
                    value={dateInput}
                    onChangeText={handleDateInputChange}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                  {dateInput.length === 10 && parseDateFromInput(dateInput) && (
                    <ThemedText style={styles.ageText}>
                      {calculateAge(parseDateFromInput(dateInput)!)} anos
                    </ThemedText>
                  )}
                </View>
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
          <View style={[
            styles.actions,
            { 
              paddingBottom: Math.max(insets.bottom, spacing.lg),
            }
          ]}>
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
    paddingBottom: spacing.xxl * 2, // Extra space at the bottom
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
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.divider,
    backgroundColor: colors.neutral.background,
  },
  cancelButton: {
    flex: 1,
    minHeight: 48,
  },
  saveButton: {
    flex: 1,
    minHeight: 48,
  },
  // Date picker styles
  dateButton: {
    borderWidth: 1,
    borderColor: colors.neutral.divider,
    borderRadius: 12,
    padding: spacing.lg,
    backgroundColor: colors.neutral.white,
  },
  dateButtonAndroid: {
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
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
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral.divider,
    borderRadius: 12,
    padding: spacing.lg,
    backgroundColor: colors.neutral.white,
    gap: spacing.sm,
  },
  inputIcon: {
    marginRight: spacing.xs,
  },
  dateInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.neutral.text.primary,
    fontWeight: '500',
  },
  ageText: {
    fontSize: fontSize.sm,
    color: colors.neutral.text.secondary,
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
});