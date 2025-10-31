import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { useBiometricAuth } from '../../hooks/useBiometricAuth';
import { logger } from '../../utils/logger';

interface BiometricSetupProps {
  visible: boolean;
  onClose: () => void;
  onSetupComplete?: () => void;
}

const BiometricSetup: React.FC<BiometricSetupProps> = ({
  visible,
  onClose,
  onSetupComplete,
}) => {
  const {
    isAvailable,
    isEnabled,
    isLoading,
    isSettingUp,
    error,
    setupBiometric,
    generateBackupCodes,
  } = useBiometricAuth();

  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [step, setStep] = useState<'intro' | 'setup' | 'backup' | 'complete'>('intro');

  /**
   * Handle biometric setup
   */
  const handleSetup = async () => {
    try {
      setStep('setup');
      const success = await setupBiometric();

      if (success) {
        // Generate backup codes automatically after successful setup
        const codes = await generateBackupCodes();
        if (codes && codes.length > 0) {
          setBackupCodes(codes);
          setStep('backup');
        } else {
          setStep('complete');
        }
      } else {
        setStep('intro');
      }
    } catch (error) {
      logger.error('BiometricSetup', 'Setup error', error as Error);
      setStep('intro');
    }
  };

  /**
   * Handle backup codes acknowledgment
   */
  const handleBackupCodesAck = () => {
    setShowBackupCodes(false);
    setStep('complete');
  };

  /**
   * Copy backup codes to clipboard
   */
  const copyBackupCodes = async () => {
    try {
      await Clipboard.setStringAsync(backupCodes.join('\n'));
      Alert.alert('✅ Copiado', 'Códigos de backup copiados para a área de transferência');
    } catch (error) {
      logger.error('BiometricSetup', 'Copy error', error as Error);
      Alert.alert('❌ Erro', 'Falha ao copiar códigos de backup');
    }
  };

  /**
   * Complete setup
   */
  const handleComplete = () => {
    onSetupComplete?.();
    onClose();
    setStep('intro');
    setBackupCodes([]);
    setShowBackupCodes(false);
  };

  /**
   * Render setup intro
   */
  const renderIntro = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="finger-print" size={64} color={Colors.primary[600]} />
      </View>

      <Text style={styles.title}>Configurar Autenticação Biométrica</Text>
      
      <Text style={styles.description}>
        Proteja sua conta com impressão digital ou reconhecimento facial para um acesso rápido e seguro.
      </Text>

      <View style={styles.benefitsContainer}>
        <View style={styles.benefitItem}>
          <Ionicons name="shield-checkmark" size={24} color={Colors.green[800]} />
          <Text style={styles.benefitText}>Segurança Aprimorada</Text>
        </View>
        
        <View style={styles.benefitItem}>
          <Ionicons name="flash" size={24} color={Colors.primary[600]} />
          <Text style={styles.benefitText}>Acesso Rápido</Text>
        </View>
        
        <View style={styles.benefitItem}>
          <Ionicons name="lock-closed" size={24} color={Colors.purple[600]} />
          <Text style={styles.benefitText}>Proteção de Privacidade</Text>
        </View>
      </View>

      {!isAvailable && (
        <View style={styles.warningContainer}>
          <Ionicons name="warning" size={24} color={Colors.orange[800]} />
          <Text style={styles.warningText}>
            Autenticação biométrica não está disponível neste dispositivo
          </Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={onClose}
          disabled={isSettingUp}
        >
          <Text style={styles.secondaryButtonText}>Talvez Depois</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.primaryButton,
            !isAvailable && styles.disabledButton
          ]}
          onPress={handleSetup}
          disabled={!isAvailable || isSettingUp}
        >
          {isSettingUp ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.primaryButtonText}>Configurar Agora</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  /**
   * Render setup in progress
   */
  const renderSetup = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <ActivityIndicator size="large" color={Colors.primary[600]} />
      </View>

      <Text style={styles.title}>Configurando...</Text>
      
      <Text style={styles.description}>
        Por favor, siga as instruções para configurar a autenticação biométrica.
      </Text>

      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionText}>
          • Coloque seu dedo no sensor ou olhe para a câmera
        </Text>
        <Text style={styles.instructionText}>
          • Siga quaisquer instruções adicionais do seu dispositivo
        </Text>
        <Text style={styles.instructionText}>
          • Isso pode levar alguns instantes
        </Text>
      </View>
    </View>
  );

  /**
   * Render backup codes step
   */
  const renderBackup = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="key" size={64} color={Colors.purple[600]} />
      </View>

      <Text style={styles.title}>Salve Seus Códigos de Backup</Text>
      
      <Text style={styles.description}>
        Estes códigos permitirão que você acesse sua conta se a autenticação biométrica estiver indisponível.
      </Text>

      <View style={styles.warningContainer}>
        <Ionicons name="warning" size={20} color={Colors.orange[800]} />
        <Text style={styles.warningText}>
          Salve estes códigos em um local seguro. Você não os verá novamente.
        </Text>
      </View>

      <View style={styles.backupCodesContainer}>
        {backupCodes.map((code, index) => (
          <View key={index} style={styles.backupCodeItem}>
            <Text style={styles.backupCodeText}>{code}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.copyButton} onPress={copyBackupCodes}>
        <Ionicons name="copy" size={20} color={Colors.primary[600]} />
        <Text style={styles.copyButtonText}>Copiar Códigos</Text>
      </TouchableOpacity>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleBackupCodesAck}
        >
          <Text style={styles.primaryButtonText}>Salvei Meus Códigos</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  /**
   * Render setup complete
   */
  const renderComplete = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="checkmark-circle" size={64} color={Colors.green[800]} />
      </View>

      <Text style={styles.title}>Configuração Completa!</Text>
      
      <Text style={styles.description}>
        A autenticação biométrica está ativada. Agora você pode usá-la para entrar de forma rápida e segura.
      </Text>

      <View style={styles.benefitsContainer}>
        <View style={styles.benefitItem}>
          <Ionicons name="checkmark" size={20} color={Colors.green[800]} />
          <Text style={styles.benefitText}>Login rápido e seguro</Text>
        </View>
        
        <View style={styles.benefitItem}>
          <Ionicons name="checkmark" size={20} color={Colors.green[800]} />
          <Text style={styles.benefitText}>Códigos de backup gerados</Text>
        </View>
        
        <View style={styles.benefitItem}>
          <Ionicons name="checkmark" size={20} color={Colors.green[800]} />
          <Text style={styles.benefitText}>Segurança da conta aprimorada</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleComplete}
        >
          <Text style={styles.primaryButtonText}>Concluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  /**
   * Render current step
   */
  const renderCurrentStep = () => {
    switch (step) {
      case 'intro':
        return renderIntro();
      case 'setup':
        return renderSetup();
      case 'backup':
        return renderBackup();
      case 'complete':
        return renderComplete();
      default:
        return renderIntro();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.light.text} />
          </TouchableOpacity>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressDots}>
              <View style={[styles.dot, step !== 'intro' && styles.activeDot]} />
              <View style={[styles.dot, ['backup', 'complete'].includes(step) && styles.activeDot]} />
              <View style={[styles.dot, step === 'complete' && styles.activeDot]} />
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {renderCurrentStep()}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  closeButton: {
    padding: 8,
  },
  progressContainer: {
    flex: 1,
    alignItems: 'center',
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gray[300],
  },
  activeDot: {
    backgroundColor: Colors.primary[600],
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  stepContainer: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.gray[600],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  benefitsContainer: {
    gap: 16,
    marginBottom: 32,
    width: '100%',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  instructionsContainer: {
    gap: 8,
    marginTop: 20,
  },
  instructionText: {
    fontSize: 14,
    color: Colors.gray[600],
    textAlign: 'center',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.orange[100],
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 14,
    color: Colors.orange[800],
    flex: 1,
  },
  errorContainer: {
    backgroundColor: Colors.red[100],
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: Colors.red[700],
    textAlign: 'center',
  },
  backupCodesContainer: {
    gap: 8,
    marginBottom: 16,
    width: '100%',
  },
  backupCodeItem: {
    backgroundColor: Colors.gray[50],
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  backupCodeText: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: Colors.light.text,
    textAlign: 'center',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    marginBottom: 24,
  },
  copyButtonText: {
    fontSize: 16,
    color: Colors.primary[600],
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  primaryButton: {
    backgroundColor: Colors.primary[600],
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.gray[300],
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default BiometricSetup;
