import { AvatarPicker } from '@/components/AvatarPicker';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Button from '@/components/base/Button';
import { colors } from '@/constants/theme';
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
import { ProfileService } from '../services/ProfileService';
import { UserProfile } from '../types';

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
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  useEffect(() => {
    if (visible && currentProfile) {
      setName(currentProfile.name || '');
      setEmail(currentProfile.email || '');
      loadUserAvatar();
    }
  }, [visible, currentProfile]);

  const loadUserAvatar = async () => {
    try {
      const savedAvatar = await ProfileService.getUserAvatar();
      setAvatarUri(savedAvatar);
    } catch (error) {
      console.error('Erro ao carregar avatar:', error);
    }
  };

  const validateForm = () => {
    const newErrors: { name?: string; email?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Save avatar separately
      await ProfileService.saveUserAvatar(avatarUri);

      // Create updated profile
      const updatedProfile: UserProfile = {
        ...currentProfile,
        name: name.trim(),
        email: email.trim(),
        avatar: avatarUri || undefined,
        updatedAt: new Date().toISOString(),
      };

      // Save profile
      const success = await ProfileService.saveUserProfile(updatedProfile);
      
      if (success) {
        onProfileUpdated(updatedProfile);
        onClose();
      } else {
        throw new Error('Falha ao salvar perfil');
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      // You might want to show an alert here
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setName(currentProfile?.name || '');
    setEmail(currentProfile?.email || '');
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
                    errors.name && styles.inputError
                  ]}
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (errors.name) {
                      setErrors(prev => ({ ...prev, name: undefined }));
                    }
                  }}
                  placeholder="Digite seu nome"
                  placeholderTextColor={colors.neutral.text.disabled}
                  maxLength={50}
                />
                {errors.name && (
                  <ThemedText style={styles.errorText}>{errors.name}</ThemedText>
                )}
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
                      setErrors(prev => ({ ...prev, email: undefined }));
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
});