import { Alert, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import * as Notifications from 'expo-notifications';
import { ThemedText } from '@/components/ThemedText';
import ScreenContainer from '@/components/base/ScreenContainer';
import Button from '@/components/base/Button';
import Card from '@/components/base/Card';
import { colors } from '@/constants/theme';
import { fontSize, spacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';

interface Permission {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  required: boolean;
  granted: boolean;
}

export default function PermissionsScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: 'notifications',
      title: 'Notificações',
      description: 'Receba lembretes para exercícios de respiração e check-ins de humor',
      icon: 'notifications-outline',
      required: false,
      granted: false,
    },
    {
      id: 'health',
      title: 'Dados de Saúde',
      description: 'Integre com o app Saúde para sincronizar dados de bem-estar (opcional)',
      icon: 'fitness-outline',
      required: false,
      granted: false,
    },
    {
      id: 'biometric',
      title: 'Autenticação Biométrica',
      description: 'Use Touch ID/Face ID para acesso rápido e seguro ao app',
      icon: 'finger-print-outline',
      required: false,
      granted: false,
    },
  ]);

  const requestNotificationPermission = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const handlePermissionRequest = async (permissionId: string) => {
    setIsLoading(true);
    
    try {
      let granted = false;
      
      switch (permissionId) {
        case 'notifications':
          granted = await requestNotificationPermission();
          break;
        case 'health':
          // TODO: Implement HealthKit permission request
          Alert.alert(
            'Integração com Saúde',
            'Esta funcionalidade será implementada em breve.',
            [{ text: 'OK' }]
          );
          break;
        case 'biometric':
          // TODO: Implement biometric permission request
          Alert.alert(
            'Autenticação Biométrica',
            'Configure a autenticação biométrica nas configurações do app.',
            [{ text: 'OK' }]
          );
          break;
      }

      setPermissions(prev => 
        prev.map(p => 
          p.id === permissionId 
            ? { ...p, granted } 
            : p
        )
      );
    } catch (error) {
      console.error(`Error requesting ${permissionId} permission:`, error);
      Alert.alert(
        'Erro',
        'Não foi possível solicitar a permissão. Tente novamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    // Navigate to main app or complete onboarding
    (router as any).replace('/(app)');
  };

  const handleSkip = () => {
    Alert.alert(
      'Pular Configuração?',
      'Você pode configurar as permissões a qualquer momento nas configurações do app.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Pular', onPress: handleContinue }
      ]
    );
  };

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name="shield-checkmark-outline" 
            size={60} 
            color={colors.primary.main} 
          />
        </View>
        <ThemedText style={styles.title}>Configurar Permissões</ThemedText>
        <ThemedText style={styles.subtitle}>
          Para a melhor experiência, o PulseZen precisa de algumas permissões. 
          Todas são opcionais e você pode alterá-las depois.
        </ThemedText>
      </View>

      <View style={styles.permissionsList}>
        {permissions.map((permission) => (
          <Card key={permission.id} style={styles.permissionCard}>
            <View style={styles.permissionContent}>
              <View style={styles.permissionLeft}>
                <View style={[
                  styles.permissionIcon,
                  permission.granted && styles.permissionIconGranted
                ]}>
                  <Ionicons 
                    name={permission.granted ? 'checkmark' : permission.icon}
                    size={24} 
                    color={permission.granted ? colors.success.main : colors.primary.main}
                  />
                </View>
                <View style={styles.permissionText}>
                  <ThemedText style={styles.permissionTitle}>
                    {permission.title}
                    {permission.required && (
                      <ThemedText style={styles.requiredText}> *</ThemedText>
                    )}
                  </ThemedText>
                  <ThemedText style={styles.permissionDescription}>
                    {permission.description}
                  </ThemedText>
                </View>
              </View>
              
              <Button
                label={permission.granted ? 'Concedida' : 'Permitir'}
                onPress={() => handlePermissionRequest(permission.id)}
                style={permission.granted ? styles.grantedButton : styles.permissionButton}
                labelStyle={permission.granted ? styles.grantedButtonText : styles.permissionButtonText}
                disabled={permission.granted || isLoading}
              />
            </View>
          </Card>
        ))}
      </View>

      <View style={styles.footer}>
        <Button
          label="Continuar"
          onPress={handleContinue}
          style={styles.continueButton}
        />
        
        <Button
          label="Pular por Agora"
          onPress={handleSkip}
          style={styles.skipButton}
          labelStyle={styles.skipButtonText}
          variant="outline"
        />
      </View>

      <View style={styles.note}>
        <ThemedText style={styles.noteText}>
          💡 Você pode alterar essas configurações a qualquer momento nas configurações do aplicativo.
        </ThemedText>
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
    paddingHorizontal: spacing.md,
  },
  permissionsList: {
    flex: 1,
    gap: spacing.md,
  },
  permissionCard: {
    marginBottom: spacing.sm,
  },
  permissionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  permissionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },
  permissionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  permissionIconGranted: {
    backgroundColor: colors.success.light,
  },
  permissionText: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.neutral.text.primary,
    marginBottom: spacing.xs,
  },
  requiredText: {
    color: colors.error.main,
  },
  permissionDescription: {
    fontSize: fontSize.sm,
    color: colors.neutral.text.secondary,
    lineHeight: fontSize.sm * 1.4,
  },
  permissionButton: {
    minWidth: 100,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  permissionButtonText: {
    fontSize: fontSize.sm,
  },
  grantedButton: {
    backgroundColor: colors.success.light,
  },
  grantedButtonText: {
    color: colors.success.main,
  },
  footer: {
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  continueButton: {
    backgroundColor: colors.primary.main,
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.neutral.divider,
  },
  skipButtonText: {
    color: colors.neutral.text.secondary,
  },
  note: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  noteText: {
    fontSize: fontSize.sm,
    color: colors.neutral.text.disabled,
    textAlign: 'center',
    lineHeight: fontSize.sm * 1.4,
  },
});