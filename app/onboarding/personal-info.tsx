import { ThemedText } from '@/components/ThemedText';
import Button from '@/components/base/Button';
import Card from '@/components/base/Card';
import ScreenContainer from '@/components/base/ScreenContainer';
import { colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { fontSize, spacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

const GENDER_OPTIONS = [
  { id: 'MENINO', label: 'Ele/Dele', icon: 'male' as const },
  { id: 'MENINA', label: 'Ela/Dela', icon: 'female' as const },
];

export default function PersonalInfoScreen() {
  const router = useRouter();
  const { updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [dateInput, setDateInput] = useState('');
  
  const [formData, setFormData] = useState({
    sex: '' as 'MENINO' | 'MENINA' | '',
  });

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
      setErrors({ ...errors, dateOfBirth: '' });
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
      const birthDate = parseDateFromInput(dateInput);
      if (!birthDate) {
        Alert.alert('Erro', 'Data de nascimento inválida');
        setIsLoading(false);
        return;
      }

      const age = calculateAge(birthDate);
      
      // Format date to ISO string for backend
      const profileData = {
        dateOfBirth: birthDate.toISOString().split('T')[0], // YYYY-MM-DD format
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

  const selectGender = (genderId: 'MENINO' | 'MENINA') => {
    setFormData({ ...formData, sex: genderId });
    if (errors.sex) {
      setErrors({ ...errors, sex: '' });
    }
  };

  const getUserAge = (): number | null => {
    if (dateInput.length === 10) {
      const birthDate = parseDateFromInput(dateInput);
      if (birthDate) {
        return calculateAge(birthDate);
      }
    }
    return null;
  };

  const userAge = getUserAge();

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
            {/* Date of Birth Input */}
            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel}>Quando você nasceu?</ThemedText>
              <View style={[styles.dateInputContainer, errors.dateOfBirth && styles.errorInput]}>
                <Ionicons name="calendar-outline" size={20} color={colors.primary.main} style={styles.inputIcon} />
                <TextInput
                  style={styles.dateInput}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor={colors.neutral.text.disabled}
                  value={dateInput}
                  onChangeText={handleDateInputChange}
                  keyboardType="numeric"
                  maxLength={10}
                />
                {userAge !== null && (
                  <ThemedText style={styles.ageText}>
                    {userAge} anos
                  </ThemedText>
                )}
              </View>
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
});