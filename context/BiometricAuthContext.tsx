import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
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

interface BiometricAuthContextValue extends BiometricAuthState {
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

const BiometricAuthContext = createContext<BiometricAuthContextValue | undefined>(undefined);

// Cache for state checks to avoid redundant API calls
let stateCache: { isAvailable: boolean; isEnabled: boolean; timestamp: number } | null = null;
const CACHE_TTL = 5000; // 5 seconds cache

export const BiometricAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
   * Check biometric availability and enabled status with caching
   */
  const refreshState = useCallback(async () => {
    try {
      // Use cache if available and fresh
      if (stateCache && Date.now() - stateCache.timestamp < CACHE_TTL) {
        updateState({
          isAvailable: stateCache.isAvailable,
          isEnabled: stateCache.isEnabled,
          isChecking: false,
        });
        logger.debug('BiometricAuthContext', 'Using cached state', stateCache);
        return;
      }

      updateState({ isChecking: true, error: null });
      
      const [isAvailable, isEnabled] = await Promise.all([
        AuthService.isBiometricAvailable(),
        AuthService.isBiometricEnabled(),
      ]);

      // Update cache
      stateCache = {
        isAvailable,
        isEnabled,
        timestamp: Date.now(),
      };

      updateState({
        isAvailable,
        isEnabled,
        isChecking: false,
      });

      logger.debug('BiometricAuthContext', 'State refreshed and cached', {
        isAvailable,
        isEnabled,
      });

    } catch (error) {
      logger.error('BiometricAuthContext', 'Error refreshing state', error as Error);
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
        // Invalidate cache
        stateCache = null;
        
        updateState({
          isEnabled: true,
          isSettingUp: false,
        });

        // Refresh state to ensure sync
        await refreshState();

        Alert.alert(
          '✅ Sucesso',
          'A autenticação biométrica foi habilitada com sucesso!',
          [{ text: 'OK' }]
        );

        logger.info('BiometricAuthContext', 'Biometric setup successful');
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
      logger.error('BiometricAuthContext', 'Biometric setup error', error as Error);
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
  }, [state.isAvailable, updateState, refreshState]);

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
        logger.info('BiometricAuthContext', 'Biometric login successful');
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
      logger.error('BiometricAuthContext', 'Biometric login error', error as Error);
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
                    // Invalidate cache
                    stateCache = null;
                    
                    updateState({
                      isEnabled: false,
                      isLoading: false,
                    });

                    // Refresh state to ensure sync
                    await refreshState();

                    Alert.alert(
                      '✅ Desabilitada',
                      'A autenticação biométrica foi desabilitada',
                      [{ text: 'OK' }]
                    );

                    logger.info('BiometricAuthContext', 'Biometric disabled successfully');
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
                  logger.error('BiometricAuthContext', 'Disable biometric error', error as Error);
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
      logger.error('BiometricAuthContext', 'Disable biometric error', error as Error);
      updateState({
        isLoading: false,
        error: 'Falha ao desabilitar autenticação biométrica',
      });
      return false;
    }
  }, [updateState, refreshState]);

  /**
   * Generate backup codes
   */
  const generateBackupCodes = useCallback(async (): Promise<string[] | null> => {
    try {
      updateState({ isLoading: true, error: null });

      const result = await AuthService.generateBackupCodes();

      if (result.success && result.codes) {
        updateState({ isLoading: false });
        logger.info('BiometricAuthContext', 'Backup codes generated');
        return result.codes;
      } else {
        const errorMessage = result.error || 'Falha ao gerar códigos de backup';
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
    } catch (error) {
      logger.error('BiometricAuthContext', 'Generate backup codes error', error as Error);
      updateState({
        isLoading: false,
        error: 'Erro ao gerar códigos de backup',
      });
      return null;
    }
  }, [updateState]);

  /**
   * Get backup codes
   */
  const getBackupCodes = useCallback(async (): Promise<any[] | null> => {
    try {
      updateState({ isLoading: true, error: null });

      const result = await AuthService.getBackupCodes();

      if (result.success && result.codes) {
        updateState({ isLoading: false });
        return result.codes;
      } else {
        updateState({ isLoading: false });
        return null;
      }
    } catch (error) {
      logger.error('BiometricAuthContext', 'Get backup codes error', error as Error);
      updateState({ isLoading: false });
      return null;
    }
  }, [updateState]);

  // Initialize state on mount
  useEffect(() => {
    refreshState();
  }, [refreshState]);

  const value: BiometricAuthContextValue = {
    ...state,
    refreshState,
    clearError,
    setupBiometric,
    loginWithBiometric,
    disableBiometric,
    generateBackupCodes,
    getBackupCodes,
  };

  return (
    <BiometricAuthContext.Provider value={value}>
      {children}
    </BiometricAuthContext.Provider>
  );
};

/**
 * Hook to use biometric auth context
 */
export const useBiometricAuth = (): BiometricAuthContextValue => {
  const context = useContext(BiometricAuthContext);
  if (!context) {
    throw new Error('useBiometricAuth must be used within BiometricAuthProvider');
  }
  return context;
};

export default BiometricAuthContext;
