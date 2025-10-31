import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import AuthService from '../services/authService';
import { logger } from '../utils/logger';

interface BiometricAuthState {
  isAvailable: boolean;
  isEnabled: boolean;
  isLoading: boolean;
  isChecking: boolean;
  isSettingUp: boolean;
  error: string | null;
}

interface UseBiometricAuthReturn extends BiometricAuthState {
  // State methods
  refreshState: () => Promise<void>;
  clearError: () => void;
  
  // Authentication methods
  setupBiometric: () => Promise<boolean>;
  loginWithBiometric: () => Promise<boolean>;
  disableBiometric: () => Promise<boolean>;
  
  // Backup codes methods
  generateBackupCodes: () => Promise<string[] | null>;
  getBackupCodes: () => Promise<any[] | null>;
}

export const useBiometricAuth = (): UseBiometricAuthReturn => {
  const [state, setState] = useState<BiometricAuthState>({
    isAvailable: false,
    isEnabled: false,
    isLoading: false,
    isChecking: true,
    isSettingUp: false,
    error: null,
  });

  /**
   * Update state with partial updates
   */
  const updateState = useCallback((updates: Partial<BiometricAuthState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  /**
   * Check biometric availability and enabled status
   */
  const refreshState = useCallback(async () => {
    try {
      updateState({ isChecking: true, error: null });
      
      const [isAvailable, isEnabled] = await Promise.all([
        AuthService.isBiometricAvailable(),
        AuthService.isBiometricEnabled(),
      ]);

      updateState({
        isAvailable,
        isEnabled,
        isChecking: false,
      });

      logger.debug('useBiometricAuth', 'State refreshed', {
        isAvailable,
        isEnabled,
      });

    } catch (error) {
      logger.error('useBiometricAuth', 'Error refreshing state', error as Error);
      updateState({
        isChecking: false,
        error: 'Falha ao verificar status biométrico',
      });
    }
  }, [updateState]);

  /**
   * Setup biometric authentication
   */
  const setupBiometric = useCallback(async (): Promise<boolean> => {
    try {
      updateState({ isSettingUp: true, error: null });

      if (!state.isAvailable) {
        updateState({
          isSettingUp: false,
          error: 'Autenticação biométrica não disponível neste dispositivo',
        });
        return false;
      }

      const result = await AuthService.setupBiometricAuth();

      if (result.success) {
        updateState({
          isEnabled: true,
          isSettingUp: false,
        });

        Alert.alert(
          '✅ Sucesso',
          'A autenticação biométrica foi habilitada com sucesso!',
          [{ text: 'OK' }]
        );

        logger.info('useBiometricAuth', 'Biometric setup successful');
        return true;
      } else {
        const errorMessage = result.error || 'Falha ao configurar autenticação biométrica';
        updateState({
          isSettingUp: false,
          error: errorMessage,
        });

        Alert.alert(
          '❌ Falha na Configuração',
          errorMessage,
          [{ text: 'OK' }]
        );

        return false;
      }
    } catch (error) {
      logger.error('useBiometricAuth', 'Biometric setup error', error as Error);
      const errorMessage = 'Ocorreu um erro inesperado durante a configuração';
      
      updateState({
        isSettingUp: false,
        error: errorMessage,
      });

      Alert.alert(
        '❌ Erro',
        errorMessage,
        [{ text: 'OK' }]
      );

      return false;
    }
  }, [state.isAvailable, updateState]);

  /**
   * Login with biometric authentication
   */
  const loginWithBiometric = useCallback(async (): Promise<boolean> => {
    try {
      updateState({ isLoading: true, error: null });

      if (!state.isEnabled) {
        updateState({
          isLoading: false,
          error: 'Autenticação biométrica não está habilitada',
        });
        return false;
      }

      const result = await AuthService.loginWithBiometric();

      if (result.success) {
        updateState({ isLoading: false });
        logger.info('useBiometricAuth', 'Biometric login successful');
        return true;
      } else {
        const errorMessage = result.error || 'Falha na autenticação biométrica';
        updateState({
          isLoading: false,
          error: errorMessage,
        });

        // Don't show alert for user cancellation
        if (!errorMessage.toLowerCase().includes('cancel')) {
          Alert.alert(
            '❌ Falha na Autenticação',
            errorMessage,
            [{ text: 'OK' }]
          );
        }

        return false;
      }
    } catch (error) {
      logger.error('useBiometricAuth', 'Biometric login error', error as Error);
      const errorMessage = 'Ocorreu um erro inesperado durante a autenticação';
      
      updateState({
        isLoading: false,
        error: errorMessage,
      });

      Alert.alert(
        '❌ Erro',
        errorMessage,
        [{ text: 'OK' }]
      );

      return false;
    }
  }, [state.isEnabled, updateState]);

  /**
   * Disable biometric authentication
   */
  const disableBiometric = useCallback(async (): Promise<boolean> => {
    try {
      updateState({ isLoading: true, error: null });

      // Show confirmation alert
      return new Promise((resolve) => {
        Alert.alert(
          '⚠️ Desabilitar Autenticação Biométrica',
          'Tem certeza que deseja desabilitar a autenticação biométrica? Você pode reabilitá-la depois nas configurações.',
          [
            {
              text: 'Cancelar',
              style: 'cancel',
              onPress: () => {
                updateState({ isLoading: false });
                resolve(false);
              },
            },
            {
              text: 'Desabilitar',
              style: 'destructive',
              onPress: async () => {
                try {
                  const result = await AuthService.disableBiometricAuth();

                  if (result.success) {
                    updateState({
                      isEnabled: false,
                      isLoading: false,
                    });

                    Alert.alert(
                      '✅ Desabilitada',
                      'A autenticação biométrica foi desabilitada',
                      [{ text: 'OK' }]
                    );

                    logger.info('useBiometricAuth', 'Biometric disabled successfully');
                    resolve(true);
                  } else {
                    const errorMessage = result.error || 'Falha ao desabilitar autenticação biométrica';
                    updateState({
                      isLoading: false,
                      error: errorMessage,
                    });

                    Alert.alert(
                      '❌ Falhou',
                      errorMessage,
                      [{ text: 'OK' }]
                    );

                    resolve(false);
                  }
                } catch (error) {
                  logger.error('useBiometricAuth', 'Disable biometric error', error as Error);
                  const errorMessage = 'Ocorreu um erro inesperado';
                  
                  updateState({
                    isLoading: false,
                    error: errorMessage,
                  });

                  Alert.alert(
                    '❌ Erro',
                    errorMessage,
                    [{ text: 'OK' }]
                  );

                  resolve(false);
                }
              },
            },
          ]
        );
      });
    } catch (error) {
      logger.error('useBiometricAuth', 'Disable biometric error', error as Error);
      updateState({
        isLoading: false,
        error: 'Falha ao desabilitar autenticação biométrica',
      });
      return false;
    }
  }, [updateState]);

  /**
   * Generate backup codes
   */
  const generateBackupCodes = useCallback(async (): Promise<string[] | null> => {
    try {
      updateState({ isLoading: true, error: null });

      const result = await AuthService.generateBiometricBackupCodes();

      updateState({ isLoading: false });

      if (result.success && result.codes) {
        logger.info('useBiometricAuth', 'Backup codes generated successfully');
        return result.codes;
      } else {
        const errorMessage = result.error || 'Falha ao gerar códigos de backup';
        updateState({ error: errorMessage });

        Alert.alert(
          '❌ Falhou',
          errorMessage,
          [{ text: 'OK' }]
        );

        return null;
      }
    } catch (error) {
      logger.error('useBiometricAuth', 'Generate backup codes error', error as Error);
      const errorMessage = 'Ocorreu um erro inesperado';
      
      updateState({
        isLoading: false,
        error: errorMessage,
      });

      Alert.alert(
        '❌ Erro',
        errorMessage,
        [{ text: 'OK' }]
      );

      return null;
    }
  }, [updateState]);

  /**
   * Get existing backup codes
   */
  const getBackupCodes = useCallback(async (): Promise<any[] | null> => {
    try {
      updateState({ isLoading: true, error: null });

      const result = await AuthService.getBiometricBackupCodes();

      updateState({ isLoading: false });

      if (result.success && result.codes) {
        logger.info('useBiometricAuth', 'Backup codes retrieved successfully');
        return result.codes;
      } else {
        const errorMessage = result.error || 'Falha ao obter códigos de backup';
        updateState({ error: errorMessage });
        return null;
      }
    } catch (error) {
      logger.error('useBiometricAuth', 'Get backup codes error', error as Error);
      updateState({
        isLoading: false,
        error: 'Falha ao obter códigos de backup',
      });
      return null;
    }
  }, [updateState]);

  /**
   * Initialize state on mount
   */
  useEffect(() => {
    refreshState();
  }, [refreshState]);

  return {
    // State
    ...state,

    // Methods
    refreshState,
    clearError,
    setupBiometric,
    loginWithBiometric,
    disableBiometric,
    generateBackupCodes,
    getBackupCodes,
  };
};

export default useBiometricAuth;
