# 📱 PLANO DE IMPLEMENTAÇÃO MOBILE - AUTENTICAÇÃO BIOMÉTRICA
**PulseZen: Implementação Passo a Passo com Testes**

---

## 🎯 VISÃO GERAL

### **📊 Status Atual**
- ✅ **AuthService**: Sistema completo de login/register
- ✅ **AuthContext**: Context com hooks funcionais
- ✅ **NetworkManager**: Gerencia tokens automaticamente
- ✅ **Onboarding**: Fluxo completo implementado
- ✅ **Navigation**: Sistema inteligente de redirecionamento

### **🎯 Objetivo Final**
- 🚀 **Login Biométrico**: < 2 segundos para 70% usuários
- 🔄 **Fallbacks Inteligentes**: 4 cenários cobertos
- 📱 **Suporte Universal**: iOS, Android, devices antigos
- 🛡️ **Segurança Robusta**: Trust scoring + recovery

---

## 📋 PLANO DE IMPLEMENTAÇÃO - 4 FASES

### **🔧 FASE 1: CONFIGURAÇÃO BASE (Semana 1)**

#### **📦 1.1 Instalação de Dependências**
```bash
# Instalar biometria
npx expo install expo-local-authentication

# Verificar instalação
npx expo install --check
```

#### **⚙️ 1.2 Configuração do app.json**
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSFaceIDUsageDescription": "Use Face ID para acessar seu PulseZen de forma rápida e segura",
        "NSBiometricUsageDescription": "Use sua biometria para acessar o app rapidamente"
      }
    },
    "android": {
      "permissions": [
        "android.permission.USE_FINGERPRINT",
        "android.permission.USE_BIOMETRIC"
      ]
    },
    "plugins": [
      [
        "expo-local-authentication",
        {
          "faceIDPermission": "Use Face ID para acessar seu PulseZen"
        }
      ]
    ]
  }
}
```

#### **🧪 1.3 Teste de Configuração**
```typescript
// __tests__/setup/biometric-config.test.ts
import * as LocalAuthentication from 'expo-local-authentication';

describe('Biometric Configuration', () => {
  test('expo-local-authentication deve estar instalado', async () => {
    expect(LocalAuthentication).toBeDefined();
    expect(LocalAuthentication.hasHardwareAsync).toBeDefined();
  });

  test('deve detectar hardware biométrico', async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    expect(typeof hasHardware).toBe('boolean');
  });
});
```

---

### **🏗️ FASE 2: SERVICES E MANAGERS (Semana 1-2)**

#### **📁 2.1 Criar BiometricAuthManager**
```typescript
// services/biometricAuthManager.ts
// (Código já pronto no arquivo BIOMETRIC_AUTH_IMPLEMENTATION_CODE.md)

// Principais métodos:
// - detectDeviceCapabilities(): Promise<DeviceCapabilities>
// - authenticateWithBestMethod(): Promise<AuthResult>
// - authenticateWithBiometrics(): Promise<AuthResult>
// - getDeviceId(): Promise<string>
// - saveBiometricToken(): Promise<void>
```

#### **🔧 2.2 Estender AuthService**
```typescript
// services/authService.ts - Adicionar métodos:

class AuthService {
  // ... métodos existentes mantidos ...

  /**
   * Registrar com verificação biométrica
   */
  static async registerWithEmailVerification(email: string): Promise<AuthResponse> {
    try {
      const response = await networkManager.post<any>(
        appConfig.getApiUrl('/auth/verify-email'),
        { email },
        { timeout: 15000, priority: 'high', tags: ['auth'] }
      );

      if (response.success && response.data) {
        return {
          success: true,
          message: 'Código de verificação enviado',
          data: response.data
        };
      }

      return {
        success: false,
        error: response.error || 'Falha ao enviar código',
        message: 'Não foi possível enviar o código de verificação'
      };
    } catch (error) {
      logger.error('AuthService', 'Email verification error', error as Error);
      return {
        success: false,
        error: 'Network error',
        message: 'Erro de conexão. Tente novamente.'
      };
    }
  }

  /**
   * Confirmar email e configurar device
   */
  static async confirmEmailAndSetupDevice(
    email: string, 
    code: string, 
    deviceInfo: any
  ): Promise<AuthResponse> {
    try {
      const response = await networkManager.post<any>(
        appConfig.getApiUrl('/auth/confirm-email'),
        { email, code, deviceInfo },
        { timeout: 15000, priority: 'high', tags: ['auth'] }
      );

      if (response.success && response.data) {
        // Salvar dados de auth
        await this.saveAuthData(
          response.data.token,
          response.data.refreshToken,
          response.data.user
        );

        return {
          success: true,
          data: response.data,
          message: 'Email confirmado com sucesso'
        };
      }

      return {
        success: false,
        error: response.error || 'Código inválido',
        message: 'Código de verificação inválido'
      };
    } catch (error) {
      logger.error('AuthService', 'Email confirmation error', error as Error);
      return {
        success: false,
        error: 'Network error',
        message: 'Erro de conexão. Tente novamente.'
      };
    }
  }

  /**
   * Configurar token biométrico
   */
  static async setupBiometricToken(
    deviceId: string,
    biometricType: string,
    biometricProof?: string
  ): Promise<{ success: boolean; token?: string; message: string }> {
    try {
      const authHeader = await this.getAuthHeader();
      
      const response = await networkManager.post<any>(
        appConfig.getApiUrl('/auth/setup-biometric'),
        { deviceId, biometricType, biometricProof },
        { 
          timeout: 15000, 
          priority: 'high', 
          tags: ['auth', 'biometric'],
          headers: authHeader
        }
      );

      if (response.success && response.data) {
        return {
          success: true,
          token: response.data.biometricToken,
          message: 'Biometria configurada com sucesso'
        };
      }

      return {
        success: false,
        message: response.error || 'Falha ao configurar biometria'
      };
    } catch (error) {
      logger.error('AuthService', 'Biometric setup error', error as Error);
      return {
        success: false,
        message: 'Erro ao configurar biometria'
      };
    }
  }

  /**
   * Login com biometria
   */
  static async loginWithBiometric(
    deviceId: string,
    biometricToken: string,
    biometricType: string
  ): Promise<AuthResponse> {
    try {
      const response = await networkManager.post<any>(
        appConfig.getApiUrl('/auth/biometric-login'),
        { deviceId, biometricToken, biometricType },
        { timeout: 15000, priority: 'high', tags: ['auth', 'biometric'] }
      );

      if (response.success && response.data) {
        // Salvar novos tokens
        await this.saveAuthData(
          response.data.token,
          response.data.refreshToken,
          response.data.user
        );

        return {
          success: true,
          data: response.data,
          message: 'Login biométrico realizado'
        };
      }

      return {
        success: false,
        error: response.error || 'Falha na autenticação',
        message: 'Falha na autenticação biométrica'
      };
    } catch (error) {
      logger.error('AuthService', 'Biometric login error', error as Error);
      return {
        success: false,
        error: 'Network error',
        message: 'Erro de conexão'
      };
    }
  }
}
```

#### **🧪 2.3 Testes dos Services**
```typescript
// __tests__/services/biometricAuthManager.test.ts
import { biometricAuthManager } from '../../services/biometricAuthManager';

describe('BiometricAuthManager', () => {
  test('deve detectar capacidades do dispositivo', async () => {
    const capabilities = await biometricAuthManager.detectDeviceCapabilities();
    
    expect(capabilities).toHaveProperty('hasHardware');
    expect(capabilities).toHaveProperty('isEnrolled');
    expect(capabilities).toHaveProperty('recommendedMethod');
    expect(typeof capabilities.hasHardware).toBe('boolean');
  });

  test('deve gerar device ID único', async () => {
    const deviceId1 = await biometricAuthManager.getDeviceId();
    const deviceId2 = await biometricAuthManager.getDeviceId();
    
    expect(deviceId1).toBeDefined();
    expect(deviceId1).toBe(deviceId2); // Deve ser persistente
    expect(deviceId1.length).toBeGreaterThan(10);
  });

  test('deve escolher melhor método baseado no device', async () => {
    const result = await biometricAuthManager.authenticateWithBestMethod();
    
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('method');
    expect(typeof result.success).toBe('boolean');
  });
});

// __tests__/services/authService.biometric.test.ts
import AuthService from '../../services/authService';

describe('AuthService Biometric Methods', () => {
  test('deve enviar código de verificação por email', async () => {
    const result = await AuthService.registerWithEmailVerification('test@example.com');
    
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('message');
  });

  test('deve validar formato do device ID', async () => {
    const deviceId = 'test-device-id';
    const result = await AuthService.setupBiometricToken(deviceId, 'fingerprint');
    
    expect(result).toHaveProperty('success');
    expect(typeof result.success).toBe('boolean');
  });
});
```

---

### **🎨 FASE 3: COMPONENTES DE UI (Semana 2)**

#### **🧩 3.1 Componentes Base**

```typescript
// components/auth/AuthMethodSelector.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Button from '@/components/base/Button';
import { ThemedText } from '@/components/ThemedText';
import Card from '@/components/base/Card';

interface AuthMethodSelectorProps {
  onSelectEmail: () => void;
  onSelectBiometric: () => void;
  biometricAvailable: boolean;
  biometricType?: string;
}

export default function AuthMethodSelector({
  onSelectEmail,
  onSelectBiometric,
  biometricAvailable,
  biometricType = 'biometria'
}: AuthMethodSelectorProps) {
  return (
    <Card style={styles.container}>
      <ThemedText style={styles.title}>Como você quer acessar?</ThemedText>
      
      {biometricAvailable && (
        <Button
          label={`Usar ${biometricType}`}
          onPress={onSelectBiometric}
          style={styles.biometricButton}
          icon="fingerprint" // ou face-id
        />
      )}
      
      <Button
        label="Usar Email"
        onPress={onSelectEmail}
        variant={biometricAvailable ? "outline" : "primary"}
        style={styles.emailButton}
      />
      
      {biometricAvailable && (
        <ThemedText style={styles.hint}>
          {biometricType} é mais rápido e seguro
        </ThemedText>
      )}
    </Card>
  );
}

// components/auth/BiometricPrompt.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import Button from '@/components/base/Button';
import { ThemedText } from '@/components/ThemedText';
import { biometricAuthManager } from '@/services/biometricAuthManager';

interface BiometricPromptProps {
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
  onFallback: () => void;
  deviceCapabilities: any;
}

export default function BiometricPrompt({
  onSuccess,
  onError,
  onFallback,
  deviceCapabilities
}: BiometricPromptProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleBiometricAuth = async () => {
    setIsAuthenticating(true);
    
    try {
      const result = await biometricAuthManager.authenticateWithBestMethod();
      
      if (result.success) {
        onSuccess(result);
      } else {
        if (result.error === 'app_pin_required') {
          onFallback();
        } else {
          onError(result.error || 'Falha na autenticação');
        }
      }
    } catch (error) {
      onError('Erro inesperado na autenticação');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const getBiometricIcon = () => {
    if (deviceCapabilities.availableTypes.includes('face_id')) return 'face-id';
    if (deviceCapabilities.availableTypes.includes('fingerprint')) return 'fingerprint';
    return 'lock';
  };

  const getBiometricText = () => {
    if (deviceCapabilities.availableTypes.includes('face_id')) return 'Face ID';
    if (deviceCapabilities.availableTypes.includes('fingerprint')) return 'Digital';
    return 'PIN do dispositivo';
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {/* Ícone do tipo de biometria */}
      </View>
      
      <ThemedText style={styles.title}>
        Acesse com {getBiometricText()}
      </ThemedText>
      
      <ThemedText style={styles.subtitle}>
        Toque no botão abaixo para autenticar
      </ThemedText>
      
      <Button
        label={`Usar ${getBiometricText()}`}
        onPress={handleBiometricAuth}
        loading={isAuthenticating}
        style={styles.authButton}
        icon={getBiometricIcon()}
      />
      
      <Button
        label="Usar outro método"
        onPress={onFallback}
        variant="ghost"
        style={styles.fallbackButton}
      />
    </View>
  );
}

// components/auth/PinInputModal.tsx
import React, { useState } from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import Button from '@/components/base/Button';
import { ThemedText } from '@/components/ThemedText';
import CustomTextInput from '@/components/base/CustomTextInput';

interface PinInputModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (pin: string) => void;
  title: string;
  subtitle?: string;
}

export default function PinInputModal({
  visible,
  onClose,
  onConfirm,
  title,
  subtitle
}: PinInputModalProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (pin.length < 4) {
      setError('PIN deve ter pelo menos 4 dígitos');
      return;
    }

    if (pin !== confirmPin) {
      setError('PINs não coincidem');
      return;
    }

    onConfirm(pin);
    setPin('');
    setConfirmPin('');
    setError('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ThemedText style={styles.title}>{title}</ThemedText>
          {subtitle && (
            <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
          )}
          
          <CustomTextInput
            value={pin}
            onChangeText={setPin}
            placeholder="Digite seu PIN (4-6 dígitos)"
            keyboardType="numeric"
            secureTextEntry
            maxLength={6}
            style={styles.input}
          />
          
          <CustomTextInput
            value={confirmPin}
            onChangeText={setConfirmPin}
            placeholder="Confirme seu PIN"
            keyboardType="numeric"
            secureTextEntry
            maxLength={6}
            style={styles.input}
          />
          
          {error && (
            <ThemedText style={styles.error}>{error}</ThemedText>
          )}
          
          <View style={styles.buttons}>
            <Button
              label="Cancelar"
              onPress={onClose}
              variant="outline"
              style={styles.cancelButton}
            />
            
            <Button
              label="Confirmar"
              onPress={handleConfirm}
              style={styles.confirmButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
```

#### **🧪 3.2 Testes de Componentes**
```typescript
// __tests__/components/auth/AuthMethodSelector.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AuthMethodSelector from '../../../components/auth/AuthMethodSelector';

describe('AuthMethodSelector', () => {
  test('deve mostrar opção biométrica quando disponível', () => {
    const mockOnSelectEmail = jest.fn();
    const mockOnSelectBiometric = jest.fn();
    
    const { getByText } = render(
      <AuthMethodSelector
        onSelectEmail={mockOnSelectEmail}
        onSelectBiometric={mockOnSelectBiometric}
        biometricAvailable={true}
        biometricType="Face ID"
      />
    );
    
    expect(getByText('Usar Face ID')).toBeDefined();
    expect(getByText('Usar Email')).toBeDefined();
  });

  test('deve chamar callback ao selecionar biometria', () => {
    const mockOnSelectBiometric = jest.fn();
    
    const { getByText } = render(
      <AuthMethodSelector
        onSelectEmail={jest.fn()}
        onSelectBiometric={mockOnSelectBiometric}
        biometricAvailable={true}
      />
    );
    
    fireEvent.press(getByText('Usar biometria'));
    expect(mockOnSelectBiometric).toHaveBeenCalled();
  });
});
```

---

### **🛣️ FASE 4: INTEGRAÇÃO E ONBOARDING (Semana 2-3)**

#### **📱 4.1 Atualizar AuthContext**
```typescript
// context/AuthContext.tsx - Adicionar ao contexto existente:

interface AuthContextType {
  // ... propriedades existentes ...
  
  // ✨ NOVAS PROPRIEDADES BIOMÉTRICAS
  biometricEnabled: boolean;
  deviceCapabilities: DeviceCapabilities | null;
  
  // ✨ NOVOS MÉTODOS
  setupBiometric: () => Promise<boolean>;
  loginWithBiometric: () => Promise<AuthResponse>;
  checkDeviceCapabilities: () => Promise<void>;
  registerWithEmail: (email: string) => Promise<AuthResponse>;
  confirmEmailCode: (email: string, code: string) => Promise<AuthResponse>;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // ... estado existente ...
  
  // ✨ NOVO ESTADO BIOMÉTRICO
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [deviceCapabilities, setDeviceCapabilities] = useState<DeviceCapabilities | null>(null);

  // ✨ VERIFICAR CAPACIDADES DO DISPOSITIVO
  const checkDeviceCapabilities = useStableCallback(async () => {
    try {
      const capabilities = await biometricAuthManager.detectDeviceCapabilities();
      setDeviceCapabilities(capabilities);
      
      const isEnabled = await biometricAuthManager.isBiometricEnabled();
      setBiometricEnabled(isEnabled);
    } catch (error) {
      console.error('Error checking device capabilities:', error);
    }
  });

  // ✨ CONFIGURAR BIOMETRIA
  const setupBiometric = useStableCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Gerar device ID e fingerprint
      const deviceId = await biometricAuthManager.getDeviceId();
      const deviceFingerprint = await biometricAuthManager.generateDeviceFingerprint();
      
      // Configurar no backend
      const result = await AuthService.setupBiometricToken(
        deviceId,
        deviceCapabilities?.recommendedMethod || 'fingerprint'
      );
      
      if (result.success && result.token) {
        // Salvar token biométrico localmente
        await biometricAuthManager.saveBiometricToken(
          result.token,
          deviceCapabilities?.recommendedMethod || 'fingerprint'
        );
        
        setBiometricEnabled(true);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Setup biometric error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  });

  // ✨ LOGIN COM BIOMETRIA
  const loginWithBiometric = useStableCallback(async (): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      
      // Autenticar com biometria do device
      const authResult = await biometricAuthManager.authenticateWithBestMethod();
      
      if (!authResult.success) {
        return {
          success: false,
          message: authResult.error || 'Falha na autenticação biométrica'
        };
      }
      
      // Obter tokens salvos
      const deviceId = await biometricAuthManager.getDeviceId();
      const biometricToken = await biometricAuthManager.getBiometricToken();
      
      if (!biometricToken) {
        return {
          success: false,
          message: 'Token biométrico não encontrado'
        };
      }
      
      // Login no backend
      const loginResult = await AuthService.loginWithBiometric(
        deviceId,
        biometricToken,
        authResult.method || 'biometric'
      );
      
      if (loginResult.success && loginResult.data) {
        setUser(loginResult.data.user);
        return {
          success: true,
          message: 'Login biométrico realizado com sucesso!'
        };
      }
      
      return {
        success: false,
        message: loginResult.message || 'Falha no login biométrico'
      };
    } catch (error) {
      console.error('Biometric login error:', error);
      return {
        success: false,
        message: 'Erro no login biométrico'
      };
    } finally {
      setIsLoading(false);
    }
  });

  // ✨ REGISTRO COM EMAIL APENAS
  const registerWithEmail = useStableCallback(async (email: string): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      return await AuthService.registerWithEmailVerification(email);
    } catch (error) {
      console.error('Register with email error:', error);
      return {
        success: false,
        message: 'Erro no registro'
      };
    } finally {
      setIsLoading(false);
    }
  });

  // ✨ CONFIRMAR CÓDIGO DO EMAIL
  const confirmEmailCode = useStableCallback(async (email: string, code: string): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      
      // Gerar informações do device
      const deviceInfo = {
        deviceId: await biometricAuthManager.getDeviceId(),
        deviceFingerprint: await biometricAuthManager.generateDeviceFingerprint(),
        platform: Platform.OS,
        capabilities: deviceCapabilities
      };
      
      const result = await AuthService.confirmEmailAndSetupDevice(email, code, deviceInfo);
      
      if (result.success && result.data) {
        setUser(result.data.user);
      }
      
      return result;
    } catch (error) {
      console.error('Confirm email error:', error);
      return {
        success: false,
        message: 'Erro na confirmação'
      };
    } finally {
      setIsLoading(false);
    }
  });

  // ✨ VERIFICAR CAPACIDADES NO MOUNT
  useEffect(() => {
    checkDeviceCapabilities();
  }, []);

  // ✨ ATUALIZAR CONTEXT VALUE
  const contextValue = useMemoizedContextValue({
    // ... valores existentes ...
    biometricEnabled,
    deviceCapabilities,
    setupBiometric,
    loginWithBiometric,
    checkDeviceCapabilities,
    registerWithEmail,
    confirmEmailCode,
  });

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
```

#### **📺 4.2 Nova Tela de Setup Biométrico**
```typescript
// app/onboarding/biometric-setup.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenContainer from '@/components/base/ScreenContainer';
import { ThemedText } from '@/components/ThemedText';
import Button from '@/components/base/Button';
import { useAuth } from '@/context/AuthContext';
import BiometricPrompt from '@/components/auth/BiometricPrompt';
import PinInputModal from '@/components/auth/PinInputModal';

export default function BiometricSetupScreen() {
  const router = useRouter();
  const { deviceCapabilities, setupBiometric, isLoading } = useAuth();
  const [showPinModal, setShowPinModal] = useState(false);
  const [setupStep, setSetupStep] = useState<'intro' | 'biometric' | 'pin' | 'complete'>('intro');

  useEffect(() => {
    if (!deviceCapabilities) {
      // Voltar se não conseguir detectar capacidades
      router.back();
    }
  }, [deviceCapabilities]);

  const handleSetupBiometric = async () => {
    setSetupStep('biometric');
    
    const success = await setupBiometric();
    
    if (success) {
      setSetupStep('complete');
      setTimeout(() => {
        router.replace('/onboarding/benefits');
      }, 2000);
    } else {
      Alert.alert(
        'Erro na Configuração',
        'Não foi possível configurar a biometria. Tente novamente.',
        [
          { text: 'Tentar Novamente', onPress: () => setSetupStep('intro') },
          { text: 'Pular', onPress: () => router.replace('/onboarding/benefits') }
        ]
      );
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Pular Configuração?',
      'Você pode configurar a biometria mais tarde nas configurações.',
      [
        { text: 'Configurar Agora', style: 'default' },
        { text: 'Pular', style: 'destructive', onPress: () => router.replace('/onboarding/benefits') }
      ]
    );
  };

  const getContent = () => {
    switch (setupStep) {
      case 'intro':
        return (
          <View style={styles.content}>
            <ThemedText style={styles.title}>
              Configure seu Acesso Rápido
            </ThemedText>
            
            <ThemedText style={styles.subtitle}>
              {deviceCapabilities?.hasHardware 
                ? `Use ${deviceCapabilities.recommendedMethod === 'face_id' ? 'Face ID' : 'sua digital'} para entrar em segundos`
                : 'Configure um PIN personalizado para acesso rápido'
              }
            </ThemedText>

            <View style={styles.benefits}>
              <ThemedText style={styles.benefit}>✨ Login em menos de 2 segundos</ThemedText>
              <ThemedText style={styles.benefit}>🔒 Mais seguro que senhas</ThemedText>
              <ThemedText style={styles.benefit}>🚀 Acesso mesmo offline</ThemedText>
            </View>

            <Button
              label={deviceCapabilities?.hasHardware ? 'Configurar Biometria' : 'Configurar PIN'}
              onPress={deviceCapabilities?.hasHardware ? handleSetupBiometric : () => setShowPinModal(true)}
              loading={isLoading}
              style={styles.setupButton}
            />

            <Button
              label="Configurar depois"
              onPress={handleSkip}
              variant="ghost"
              style={styles.skipButton}
            />
          </View>
        );

      case 'biometric':
        return (
          <BiometricPrompt
            deviceCapabilities={deviceCapabilities!}
            onSuccess={handleSetupBiometric}
            onError={(error) => {
              Alert.alert('Erro', error);
              setSetupStep('intro');
            }}
            onFallback={() => setShowPinModal(true)}
          />
        );

      case 'complete':
        return (
          <View style={styles.content}>
            <ThemedText style={styles.title}>🎉 Tudo Pronto!</ThemedText>
            <ThemedText style={styles.subtitle}>
              Sua biometria foi configurada com sucesso.
              Agora você pode entrar de forma super rápida!
            </ThemedText>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScreenContainer>
      {getContent()}
      
      <PinInputModal
        visible={showPinModal}
        onClose={() => setShowPinModal(false)}
        onConfirm={async (pin) => {
          // Implementar lógica de PIN customizado
          setShowPinModal(false);
          router.replace('/onboarding/benefits');
        }}
        title="Configure seu PIN"
        subtitle="Escolha um PIN de 4-6 dígitos para acesso rápido"
      />
    </ScreenContainer>
  );
}
```

#### **📱 4.3 Atualizar Tela de Auth Principal**
```typescript
// app/onboarding/auth.tsx - Atualizar para suportar biometria:

export default function AuthScreen() {
  const router = useRouter();
  const { 
    register, 
    loginWithBiometric, 
    registerWithEmail,
    confirmEmailCode,
    deviceCapabilities,
    biometricEnabled,
    isLoading 
  } = useAuth();
  
  const [authMode, setAuthMode] = useState<'select' | 'email' | 'biometric' | 'verify'>('select');
  const [emailForVerification, setEmailForVerification] = useState('');
  // ... resto do estado existente ...

  // ✨ VERIFICAR SE PODE USAR BIOMETRIA DIRETAMENTE
  useEffect(() => {
    if (biometricEnabled && deviceCapabilities?.hasHardware) {
      // Usuário já configurou biometria, mostrar como opção principal
      setAuthMode('biometric');
    }
  }, [biometricEnabled, deviceCapabilities]);

  // ✨ LOGIN BIOMÉTRICO DIRETO
  const handleBiometricLogin = async () => {
    const result = await loginWithBiometric();
    
    if (result.success) {
      // NavigationHandler irá redirecionar automaticamente
    } else {
      Alert.alert('Erro', result.message);
      setAuthMode('select'); // Voltar para seleção
    }
  };

  // ✨ REGISTRO COM EMAIL APENAS  
  const handleEmailRegistration = async () => {
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      Alert.alert('Erro', 'Digite um email válido');
      return;
    }

    const result = await registerWithEmail(formData.email);
    
    if (result.success) {
      setEmailForVerification(formData.email);
      setAuthMode('verify');
    } else {
      Alert.alert('Erro', result.message);
    }
  };

  // ✨ CONFIRMAR CÓDIGO DE VERIFICAÇÃO
  const handleCodeVerification = async () => {
    const result = await confirmEmailCode(emailForVerification, formData.verificationCode);
    
    if (result.success) {
      // Redirecionar para setup biométrico ou benefits
      if (deviceCapabilities?.hasHardware) {
        router.replace('/onboarding/biometric-setup');
      } else {
        router.replace('/onboarding/benefits');
      }
    } else {
      Alert.alert('Erro', result.message);
    }
  };

  const renderContent = () => {
    switch (authMode) {
      case 'select':
        return (
          <AuthMethodSelector
            onSelectEmail={() => setAuthMode('email')}
            onSelectBiometric={() => setAuthMode('biometric')}
            biometricAvailable={deviceCapabilities?.hasHardware || false}
            biometricType={
              deviceCapabilities?.availableTypes.includes('face_id') 
                ? 'Face ID' 
                : 'Digital'
            }
          />
        );

      case 'biometric':
        return (
          <BiometricPrompt
            deviceCapabilities={deviceCapabilities!}
            onSuccess={handleBiometricLogin}
            onError={(error) => {
              Alert.alert('Erro', error);
              setAuthMode('select');
            }}
            onFallback={() => setAuthMode('email')}
          />
        );

      case 'verify':
        return (
          <EmailVerificationForm
            email={emailForVerification}
            onCodeSubmit={handleCodeVerification}
            onResend={() => registerWithEmail(emailForVerification)}
            onBack={() => setAuthMode('email')}
          />
        );

      case 'email':
      default:
        return (
          <EmailAuthForm
            // ... props do formulário original ...
            onRegister={handleEmailRegistration}
            onBackToSelect={() => setAuthMode('select')}
          />
        );
    }
  };

  return (
    <ScreenContainer gradientColors={colors.gradients.primary}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>
            {authMode === 'biometric' 
              ? 'Acesso Rápido' 
              : authMode === 'verify'
              ? 'Verificar Email'
              : 'Entrar ou Criar Conta'
            }
          </ThemedText>
        </View>

        <Card style={styles.formCard}>
          {renderContent()}
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}
```

#### **🧪 4.4 Testes de Integração**
```typescript
// __tests__/integration/biometric-auth-flow.test.ts
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AuthProvider } from '../../context/AuthContext';
import AuthScreen from '../../app/onboarding/auth';

describe('Biometric Authentication Flow', () => {
  test('deve mostrar opção biométrica quando disponível', async () => {
    // Mock device capabilities
    jest.mocked(biometricAuthManager.detectDeviceCapabilities).mockResolvedValue({
      hasHardware: true,
      isEnrolled: true,
      availableTypes: ['fingerprint'],
      recommendedMethod: 'fingerprint'
    });

    const { getByText } = render(
      <AuthProvider>
        <AuthScreen />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByText('Usar Digital')).toBeDefined();
    });
  });

  test('deve realizar login biométrico completo', async () => {
    // Mock successful biometric auth
    jest.mocked(biometricAuthManager.authenticateWithBestMethod).mockResolvedValue({
      success: true,
      method: 'fingerprint'
    });

    jest.mocked(AuthService.loginWithBiometric).mockResolvedValue({
      success: true,
      data: { user: { id: '1', email: 'test@example.com' }, token: 'token123' },
      message: 'Success'
    });

    const { getByText } = render(
      <AuthProvider>
        <AuthScreen />
      </AuthProvider>
    );

    fireEvent.press(getByText('Usar Digital'));

    await waitFor(() => {
      // Verificar se o login foi realizado com sucesso
      expect(AuthService.loginWithBiometric).toHaveBeenCalled();
    });
  });
});
```

---

### **🚀 FASE 5: TESTES E OTIMIZAÇÃO (Semana 3-4)**

#### **📊 5.1 Testes de Performance**
```typescript
// __tests__/performance/biometric-auth.performance.test.ts
import { performance } from 'react-native-performance';

describe('Biometric Auth Performance', () => {
  test('login biométrico deve ser < 2 segundos', async () => {
    const startTime = performance.now();
    
    const result = await biometricAuthManager.authenticateWithBestMethod();
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(2000); // 2 segundos
    expect(result.success).toBe(true);
  });

  test('detecção de capacidades deve ser < 500ms', async () => {
    const startTime = performance.now();
    
    const capabilities = await biometricAuthManager.detectDeviceCapabilities();
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(500); // 500ms
    expect(capabilities).toBeDefined();
  });
});
```

#### **🧪 5.2 Testes de Cenários Críticos**
```typescript
// __tests__/scenarios/critical-scenarios.test.ts
describe('Critical Device Scenarios', () => {
  test('Cenário 1: Device sem senha/PIN', async () => {
    // Mock device inseguro
    jest.mocked(LocalAuthentication.getEnrolledLevelAsync).mockResolvedValue(
      LocalAuthentication.SecurityLevel.NONE
    );

    const capabilities = await biometricAuthManager.detectDeviceCapabilities();
    
    expect(capabilities.securityLevel).toBe('none');
    expect(capabilities.recommendedMethod).toBe('app_pin');
  });

  test('Cenário 2: Device sem hardware biométrico', async () => {
    // Mock hardware indisponível
    jest.mocked(LocalAuthentication.hasHardwareAsync).mockResolvedValue(false);

    const capabilities = await biometricAuthManager.detectDeviceCapabilities();
    
    expect(capabilities.hasHardware).toBe(false);
    expect(capabilities.recommendedMethod).toBe('app_pin');
  });

  test('Cenário 3: Fallback para PIN do device', async () => {
    // Mock biometria não configurada
    jest.mocked(LocalAuthentication.isEnrolledAsync).mockResolvedValue(false);
    jest.mocked(LocalAuthentication.hasHardwareAsync).mockResolvedValue(true);

    const result = await biometricAuthManager.authenticateWithBestMethod();
    
    expect(result.method).toBe('device_pin');
  });

  test('Cenário 4: Recovery de token biométrico', async () => {
    // Simular token expirado
    jest.mocked(AuthService.loginWithBiometric).mockResolvedValue({
      success: false,
      error: 'Token expired',
      message: 'Token expirado'
    });

    // Deve tentar refresh ou fallback
    const result = await biometricAuthManager.authenticateWithBestMethod();
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('app_pin_required');
  });
});
```

#### **📈 5.3 Métricas e Analytics**
```typescript
// utils/biometricAnalytics.ts
export class BiometricAnalytics {
  static trackDeviceCapabilities(capabilities: DeviceCapabilities) {
    logger.analytics('BiometricAnalytics', 'Device capabilities detected', {
      hasHardware: capabilities.hasHardware,
      isEnrolled: capabilities.isEnrolled,
      securityLevel: capabilities.securityLevel,
      recommendedMethod: capabilities.recommendedMethod,
      availableTypes: capabilities.availableTypes
    });
  }

  static trackAuthAttempt(method: string, success: boolean, duration: number) {
    logger.analytics('BiometricAnalytics', 'Auth attempt', {
      method,
      success,
      duration,
      timestamp: Date.now()
    });
  }

  static trackSetupFlow(step: string, success: boolean) {
    logger.analytics('BiometricAnalytics', 'Setup flow', {
      step,
      success,
      timestamp: Date.now()
    });
  }

  static trackFallbackUsage(fromMethod: string, toMethod: string) {
    logger.analytics('BiometricAnalytics', 'Fallback used', {
      fromMethod,
      toMethod,
      timestamp: Date.now()
    });
  }
}
```

---

## 🎯 CRONOGRAMA DETALHADO

### **📅 Semana 1 (Dias 1-7)**
- **Dia 1**: Instalar dependências e configurar app.json
- **Dia 2**: Implementar BiometricAuthManager
- **Dia 3**: Estender AuthService com métodos biométricos
- **Dia 4**: Criar componentes base (AuthMethodSelector, BiometricPrompt)
- **Dia 5**: Testes unitários dos services e componentes

### **📅 Semana 2 (Dias 8-14)**
- **Dia 8**: Atualizar AuthContext com métodos biométricos
- **Dia 9**: Criar tela de setup biométrico
- **Dia 10**: Atualizar tela de auth principal
- **Dia 11**: Implementar componente PinInputModal
- **Dia 12**: Testes de integração dos fluxos
- **Dia 13**: Ajustes de UX e navegação
- **Dia 14**: Revisão e refatoração

### **📅 Semana 3 (Dias 15-21)**
- **Dia 15**: Testes de todos os cenários críticos
- **Dia 16**: Implementar analytics e métricas
- **Dia 17**: Testes de performance
- **Dia 18**: Otimizações baseadas nos testes
- **Dia 19**: Documentação e guides
- **Dia 20**: Testes em devices reais
- **Dia 21**: Preparação para deploy

### **📅 Semana 4 (Dias 22-28)**
- **Dia 22**: Deploy em ambiente de teste
- **Dia 23**: Testes com usuários beta
- **Dia 24**: Correções baseadas no feedback
- **Dia 25**: Validação final de todos os cenários
- **Dia 26**: Preparação para produção
- **Dia 27**: Deploy em produção
- **Dia 28**: Monitoramento e ajustes pós-deploy

---

## ✅ CHECKLIST DE VALIDAÇÃO

### **🔧 Técnico**
- [ ] expo-local-authentication instalado e configurado
- [ ] BiometricAuthManager implementado e testado
- [ ] AuthService estendido com métodos biométricos
- [ ] AuthContext atualizado com estado biométrico
- [ ] Componentes de UI criados e testados
- [ ] Telas de onboarding atualizadas
- [ ] Navegação entre fluxos funcionando
- [ ] Todos os testes passando (unitários + integração)

### **📱 Funcional**
- [ ] Detecção automática de capacidades funciona
- [ ] Login biométrico < 2 segundos
- [ ] Fallbacks funcionam em todos os cenários
- [ ] Setup biométrico intuitivo e rápido
- [ ] Recovery de tokens funciona
- [ ] Migração de usuários existentes
- [ ] Performance adequada em devices antigos

### **🧪 Testes**
- [ ] Cenário 1: Device sem proteção - ✅ Email + SMS
- [ ] Cenário 2: Device sem biometria - ✅ PIN customizado
- [ ] Cenário 3: Troca de device - ✅ Recovery funciona
- [ ] Cenário 4: Biometria desabilitada - ✅ PIN do device
- [ ] Performance: Login < 2s em 70% dos casos
- [ ] Segurança: Tokens invalidados corretamente
- [ ] UX: Fluxo intuitivo para todos os usuários

### **📊 Métricas**
- [ ] Analytics de capacidades dos devices
- [ ] Métricas de tempo de autenticação
- [ ] Taxa de adoção por método
- [ ] Taxa de sucesso dos fallbacks
- [ ] Logs estruturados de todos os eventos

---

## 🚀 COMANDOS DE EXECUÇÃO

### **📦 Setup Inicial**
```bash
# Instalar dependências
npx expo install expo-local-authentication

# Executar testes
npm run test

# Executar com coverage
npm run test:coverage

# Executar no iOS
npm run ios

# Executar no Android  
npm run android
```

### **🧪 Testes Específicos**
```bash
# Testes de biometria
npm test -- --testPathPattern=biometric

# Testes de performance  
npm test -- --testPathPattern=performance

# Testes de cenários críticos
npm test -- --testPathPattern=scenarios

# Testes de integração
npm test -- --testPathPattern=integration
```

---

Este plano implementa a autenticação biométrica de forma **gradual**, **testada** e **robusta**, cobrindo todos os cenários críticos e garantindo uma experiência excelente para 100% dos usuários! 🎯

**Estimativa**: 3-4 semanas para implementação completa e testada.
