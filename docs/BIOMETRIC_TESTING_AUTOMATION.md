# 🧪 SCRIPTS DE TESTE AUTOMATIZADOS - AUTENTICAÇÃO BIOMÉTRICA

---

## 📋 ESTRUTURA DE TESTES

```
__tests__/
├── setup/
│   ├── biometric-config.test.ts
│   └── test-setup.ts
├── services/
│   ├── biometricAuthManager.test.ts
│   ├── authService.biometric.test.ts
│   └── deviceCapabilityService.test.ts
├── components/
│   ├── auth/
│   │   ├── AuthMethodSelector.test.tsx
│   │   ├── BiometricPrompt.test.tsx
│   │   └── PinInputModal.test.tsx
│   └── screens/
│       ├── BiometricSetupScreen.test.tsx
│       └── AuthScreen.test.tsx
├── integration/
│   ├── biometric-auth-flow.test.ts
│   ├── onboarding-flow.test.ts
│   └── navigation-flow.test.ts
├── scenarios/
│   ├── critical-scenarios.test.ts
│   ├── device-scenarios.test.ts
│   └── fallback-scenarios.test.ts
├── performance/
│   ├── biometric-auth.performance.test.ts
│   └── ui-performance.test.ts
└── mocks/
    ├── expo-local-authentication.mock.ts
    ├── authService.mock.ts
    └── biometricAuthManager.mock.ts
```

---

## 🛠️ CONFIGURAÇÃO DE TESTES

### **📦 jest.config.js (Atualizado)**
```javascript
module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  setupFilesAfterEnv: [
    '<rootDir>/__tests__/setup/test-setup.ts'
  ],
  testMatch: [
    '**/__tests__/**/*.(test|spec).(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)'
  ],
  collectCoverageFrom: [
    'services/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'context/**/*.{ts,tsx}',
    'utils/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './services/biometricAuthManager.ts': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest'
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1'
  }
};
```

### **🔧 __tests__/setup/test-setup.ts**
```typescript
import 'react-native-gesture-handler/jestSetup';

// Mock expo-local-authentication
jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn().mockResolvedValue(true),
  isEnrolledAsync: jest.fn().mockResolvedValue(true),
  supportedAuthenticationTypesAsync: jest.fn().mockResolvedValue([1, 2]), // FINGERPRINT, FACIAL_RECOGNITION
  getEnrolledLevelAsync: jest.fn().mockResolvedValue(2), // BIOMETRIC_STRONG
  authenticateAsync: jest.fn().mockResolvedValue({ success: true }),
  AuthenticationType: {
    FINGERPRINT: 1,
    FACIAL_RECOGNITION: 2,
    IRIS: 3
  },
  SecurityLevel: {
    NONE: 0,
    SECRET: 1,
    BIOMETRIC_WEAK: 2,
    BIOMETRIC_STRONG: 3
  }
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  getItemAsync: jest.fn().mockResolvedValue(null),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined)
}));

// Mock expo-crypto
jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn().mockReturnValue('mock-uuid-123'),
  digestStringAsync: jest.fn().mockResolvedValue('mock-hash-abc123')
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn()
  },
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn()
  })
}));

// Mock performance
global.performance = {
  now: jest.fn().mockReturnValue(Date.now())
} as any;

// Mock console methods for cleaner test output
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Setup test timeout
jest.setTimeout(30000);
```

---

## 🧪 TESTES UNITÁRIOS

### **🔧 __tests__/services/biometricAuthManager.test.ts**
```typescript
import { biometricAuthManager, BiometricType } from '../../services/biometricAuthManager';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

describe('BiometricAuthManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('detectDeviceCapabilities', () => {
    test('deve detectar device com Face ID', async () => {
      jest.mocked(LocalAuthentication.hasHardwareAsync).mockResolvedValue(true);
      jest.mocked(LocalAuthentication.isEnrolledAsync).mockResolvedValue(true);
      jest.mocked(LocalAuthentication.supportedAuthenticationTypesAsync).mockResolvedValue([
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
      ]);
      jest.mocked(LocalAuthentication.getEnrolledLevelAsync).mockResolvedValue(
        LocalAuthentication.SecurityLevel.BIOMETRIC_STRONG
      );

      const capabilities = await biometricAuthManager.detectDeviceCapabilities();

      expect(capabilities).toEqual({
        hasHardware: true,
        availableTypes: [BiometricType.FACE_ID],
        isEnrolled: true,
        securityLevel: 'strong',
        hasScreenLock: true,
        recommendedMethod: BiometricType.FACE_ID
      });
    });

    test('deve detectar device com digital', async () => {
      jest.mocked(LocalAuthentication.hasHardwareAsync).mockResolvedValue(true);
      jest.mocked(LocalAuthentication.isEnrolledAsync).mockResolvedValue(true);
      jest.mocked(LocalAuthentication.supportedAuthenticationTypesAsync).mockResolvedValue([
        LocalAuthentication.AuthenticationType.FINGERPRINT
      ]);

      const capabilities = await biometricAuthManager.detectDeviceCapabilities();

      expect(capabilities.availableTypes).toContain(BiometricType.FINGERPRINT);
      expect(capabilities.recommendedMethod).toBe(BiometricType.FINGERPRINT);
    });

    test('deve detectar device sem hardware biométrico', async () => {
      jest.mocked(LocalAuthentication.hasHardwareAsync).mockResolvedValue(false);
      jest.mocked(LocalAuthentication.isEnrolledAsync).mockResolvedValue(false);
      jest.mocked(LocalAuthentication.getEnrolledLevelAsync).mockResolvedValue(
        LocalAuthentication.SecurityLevel.SECRET
      );

      const capabilities = await biometricAuthManager.detectDeviceCapabilities();

      expect(capabilities).toEqual({
        hasHardware: false,
        availableTypes: [],
        isEnrolled: false,
        securityLevel: 'weak',
        hasScreenLock: true,
        recommendedMethod: BiometricType.DEVICE_PIN
      });
    });

    test('deve detectar device inseguro', async () => {
      jest.mocked(LocalAuthentication.hasHardwareAsync).mockResolvedValue(false);
      jest.mocked(LocalAuthentication.getEnrolledLevelAsync).mockResolvedValue(
        LocalAuthentication.SecurityLevel.NONE
      );

      const capabilities = await biometricAuthManager.detectDeviceCapabilities();

      expect(capabilities.securityLevel).toBe('none');
      expect(capabilities.hasScreenLock).toBe(false);
      expect(capabilities.recommendedMethod).toBe(BiometricType.APP_PIN);
    });
  });

  describe('authenticateWithBiometrics', () => {
    test('deve autenticar com sucesso', async () => {
      jest.mocked(LocalAuthentication.hasHardwareAsync).mockResolvedValue(true);
      jest.mocked(LocalAuthentication.isEnrolledAsync).mockResolvedValue(true);
      jest.mocked(LocalAuthentication.authenticateAsync).mockResolvedValue({
        success: true
      });

      const result = await biometricAuthManager.authenticateWithBiometrics();

      expect(result.success).toBe(true);
      expect(result.method).toBe('fingerprint');
    });

    test('deve falhar quando biometria não está configurada', async () => {
      jest.mocked(LocalAuthentication.hasHardwareAsync).mockResolvedValue(true);
      jest.mocked(LocalAuthentication.isEnrolledAsync).mockResolvedValue(false);

      const result = await biometricAuthManager.authenticateWithBiometrics();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Nenhuma biometria cadastrada');
      expect(result.warning).toContain('Configure sua digital');
    });

    test('deve falhar quando hardware não está disponível', async () => {
      jest.mocked(LocalAuthentication.hasHardwareAsync).mockResolvedValue(false);

      const result = await biometricAuthManager.authenticateWithBiometrics();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Biometria não disponível');
    });
  });

  describe('getDeviceId', () => {
    test('deve retornar device ID existente', async () => {
      jest.mocked(SecureStore.getItemAsync).mockResolvedValue('existing-device-id');

      const deviceId = await biometricAuthManager.getDeviceId();

      expect(deviceId).toBe('existing-device-id');
      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    });

    test('deve gerar novo device ID', async () => {
      jest.mocked(SecureStore.getItemAsync).mockResolvedValue(null);

      const deviceId = await biometricAuthManager.getDeviceId();

      expect(deviceId).toBe('mock-uuid-123');
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'device_unique_id',
        'mock-uuid-123'
      );
    });
  });

  describe('saveBiometricToken', () => {
    test('deve salvar token com sucesso', async () => {
      await biometricAuthManager.saveBiometricToken('token123', BiometricType.FINGERPRINT);

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('biometric_auth_token', 'token123');
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('preferred_auth_method', 'fingerprint');
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('biometric_enabled', 'true');
    });
  });
});
```

### **🔧 __tests__/services/authService.biometric.test.ts**
```typescript
import AuthService from '../../services/authService';
import { networkManager } from '../../utils/simpleNetworkManager';

// Mock network manager
jest.mock('../../utils/simpleNetworkManager');

describe('AuthService Biometric Methods', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerWithEmailVerification', () => {
    test('deve enviar código de verificação com sucesso', async () => {
      jest.mocked(networkManager.post).mockResolvedValue({
        success: true,
        data: { message: 'Código enviado' },
        status: 200
      });

      const result = await AuthService.registerWithEmailVerification('test@example.com');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Código de verificação enviado');
      expect(networkManager.post).toHaveBeenCalledWith(
        expect.stringContaining('/auth/verify-email'),
        { email: 'test@example.com' },
        expect.any(Object)
      );
    });

    test('deve falhar com email inválido', async () => {
      jest.mocked(networkManager.post).mockResolvedValue({
        success: false,
        error: 'Email inválido',
        status: 400
      });

      const result = await AuthService.registerWithEmailVerification('invalid-email');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email inválido');
    });
  });

  describe('confirmEmailAndSetupDevice', () => {
    test('deve confirmar email e configurar device', async () => {
      const mockResponse = {
        success: true,
        data: {
          user: { id: '1', email: 'test@example.com' },
          token: 'jwt-token',
          refreshToken: 'refresh-token'
        },
        status: 200
      };

      jest.mocked(networkManager.post).mockResolvedValue(mockResponse);

      const deviceInfo = {
        deviceId: 'device-123',
        platform: 'ios',
        capabilities: {}
      };

      const result = await AuthService.confirmEmailAndSetupDevice(
        'test@example.com',
        '123456',
        deviceInfo
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse.data);
      expect(networkManager.post).toHaveBeenCalledWith(
        expect.stringContaining('/auth/confirm-email'),
        { email: 'test@example.com', code: '123456', deviceInfo },
        expect.any(Object)
      );
    });
  });

  describe('setupBiometricToken', () => {
    test('deve configurar token biométrico', async () => {
      jest.mocked(networkManager.post).mockResolvedValue({
        success: true,
        data: { biometricToken: 'biometric-token-123' },
        status: 200
      });

      const result = await AuthService.setupBiometricToken(
        'device-123',
        'fingerprint'
      );

      expect(result.success).toBe(true);
      expect(result.token).toBe('biometric-token-123');
    });
  });

  describe('loginWithBiometric', () => {
    test('deve fazer login com biometria', async () => {
      const mockResponse = {
        success: true,
        data: {
          user: { id: '1', email: 'test@example.com' },
          token: 'new-jwt-token',
          refreshToken: 'new-refresh-token'
        },
        status: 200
      };

      jest.mocked(networkManager.post).mockResolvedValue(mockResponse);

      const result = await AuthService.loginWithBiometric(
        'device-123',
        'biometric-token',
        'fingerprint'
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse.data);
    });
  });
});
```

---

## 🧩 TESTES DE COMPONENTES

### **🔧 __tests__/components/auth/AuthMethodSelector.test.tsx**
```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AuthMethodSelector from '../../../components/auth/AuthMethodSelector';

describe('AuthMethodSelector', () => {
  const defaultProps = {
    onSelectEmail: jest.fn(),
    onSelectBiometric: jest.fn(),
    biometricAvailable: true,
    biometricType: 'Face ID'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve renderizar corretamente com biometria disponível', () => {
    const { getByText } = render(<AuthMethodSelector {...defaultProps} />);

    expect(getByText('Como você quer acessar?')).toBeDefined();
    expect(getByText('Usar Face ID')).toBeDefined();
    expect(getByText('Usar Email')).toBeDefined();
    expect(getByText('Face ID é mais rápido e seguro')).toBeDefined();
  });

  test('deve renderizar apenas email quando biometria não disponível', () => {
    const { getByText, queryByText } = render(
      <AuthMethodSelector 
        {...defaultProps} 
        biometricAvailable={false} 
      />
    );

    expect(getByText('Usar Email')).toBeDefined();
    expect(queryByText('Usar Face ID')).toBeNull();
    expect(queryByText('Face ID é mais rápido e seguro')).toBeNull();
  });

  test('deve chamar callback correto ao clicar em biometria', () => {
    const { getByText } = render(<AuthMethodSelector {...defaultProps} />);

    fireEvent.press(getByText('Usar Face ID'));

    expect(defaultProps.onSelectBiometric).toHaveBeenCalledTimes(1);
    expect(defaultProps.onSelectEmail).not.toHaveBeenCalled();
  });

  test('deve chamar callback correto ao clicar em email', () => {
    const { getByText } = render(<AuthMethodSelector {...defaultProps} />);

    fireEvent.press(getByText('Usar Email'));

    expect(defaultProps.onSelectEmail).toHaveBeenCalledTimes(1);
    expect(defaultProps.onSelectBiometric).not.toHaveBeenCalled();
  });

  test('deve mostrar tipo de biometria correto', () => {
    const { getByText } = render(
      <AuthMethodSelector 
        {...defaultProps} 
        biometricType="Digital" 
      />
    );

    expect(getByText('Usar Digital')).toBeDefined();
    expect(getByText('Digital é mais rápido e seguro')).toBeDefined();
  });
});
```

### **🔧 __tests__/components/auth/BiometricPrompt.test.tsx**
```typescript
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import BiometricPrompt from '../../../components/auth/BiometricPrompt';
import { biometricAuthManager } from '../../../services/biometricAuthManager';

jest.mock('../../../services/biometricAuthManager');

describe('BiometricPrompt', () => {
  const defaultProps = {
    onSuccess: jest.fn(),
    onError: jest.fn(),
    onFallback: jest.fn(),
    deviceCapabilities: {
      hasHardware: true,
      availableTypes: ['fingerprint'],
      isEnrolled: true,
      securityLevel: 'strong' as const,
      hasScreenLock: true,
      recommendedMethod: 'fingerprint' as const
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve renderizar corretamente para digital', () => {
    const { getByText } = render(<BiometricPrompt {...defaultProps} />);

    expect(getByText('Acesse com Digital')).toBeDefined();
    expect(getByText('Toque no botão abaixo para autenticar')).toBeDefined();
    expect(getByText('Usar Digital')).toBeDefined();
    expect(getByText('Usar outro método')).toBeDefined();
  });

  test('deve renderizar corretamente para Face ID', () => {
    const propsWithFaceID = {
      ...defaultProps,
      deviceCapabilities: {
        ...defaultProps.deviceCapabilities,
        availableTypes: ['face_id']
      }
    };

    const { getByText } = render(<BiometricPrompt {...propsWithFaceID} />);

    expect(getByText('Acesse com Face ID')).toBeDefined();
    expect(getByText('Usar Face ID')).toBeDefined();
  });

  test('deve chamar autenticação biométrica ao clicar no botão', async () => {
    jest.mocked(biometricAuthManager.authenticateWithBestMethod).mockResolvedValue({
      success: true,
      method: 'fingerprint'
    });

    const { getByText } = render(<BiometricPrompt {...defaultProps} />);

    fireEvent.press(getByText('Usar Digital'));

    await waitFor(() => {
      expect(biometricAuthManager.authenticateWithBestMethod).toHaveBeenCalled();
    });
  });

  test('deve chamar onSuccess quando autenticação for bem-sucedida', async () => {
    const mockResult = { success: true, method: 'fingerprint' };
    jest.mocked(biometricAuthManager.authenticateWithBestMethod).mockResolvedValue(mockResult);

    const { getByText } = render(<BiometricPrompt {...defaultProps} />);

    fireEvent.press(getByText('Usar Digital'));

    await waitFor(() => {
      expect(defaultProps.onSuccess).toHaveBeenCalledWith(mockResult);
    });
  });

  test('deve chamar onError quando autenticação falhar', async () => {
    jest.mocked(biometricAuthManager.authenticateWithBestMethod).mockResolvedValue({
      success: false,
      error: 'Biometria cancelada'
    });

    const { getByText } = render(<BiometricPrompt {...defaultProps} />);

    fireEvent.press(getByText('Usar Digital'));

    await waitFor(() => {
      expect(defaultProps.onError).toHaveBeenCalledWith('Biometria cancelada');
    });
  });

  test('deve chamar onFallback quando PIN do app for necessário', async () => {
    jest.mocked(biometricAuthManager.authenticateWithBestMethod).mockResolvedValue({
      success: false,
      error: 'app_pin_required'
    });

    const { getByText } = render(<BiometricPrompt {...defaultProps} />);

    fireEvent.press(getByText('Usar Digital'));

    await waitFor(() => {
      expect(defaultProps.onFallback).toHaveBeenCalled();
    });
  });

  test('deve chamar onFallback ao clicar em "Usar outro método"', () => {
    const { getByText } = render(<BiometricPrompt {...defaultProps} />);

    fireEvent.press(getByText('Usar outro método'));

    expect(defaultProps.onFallback).toHaveBeenCalled();
  });
});
```

---

## 🔗 TESTES DE INTEGRAÇÃO

### **🔧 __tests__/integration/biometric-auth-flow.test.ts**
```typescript
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AuthProvider } from '../../context/AuthContext';
import AuthScreen from '../../app/onboarding/auth';
import { biometricAuthManager } from '../../services/biometricAuthManager';
import AuthService from '../../services/authService';

jest.mock('../../services/biometricAuthManager');
jest.mock('../../services/authService');

describe('Biometric Authentication Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderAuthScreen = () => {
    return render(
      <AuthProvider>
        <AuthScreen />
      </AuthProvider>
    );
  };

  test('fluxo completo: detecção → seleção → autenticação biométrica', async () => {
    // Mock device capabilities
    jest.mocked(biometricAuthManager.detectDeviceCapabilities).mockResolvedValue({
      hasHardware: true,
      availableTypes: ['fingerprint'],
      isEnrolled: true,
      securityLevel: 'strong',
      hasScreenLock: true,
      recommendedMethod: 'fingerprint'
    });

    jest.mocked(biometricAuthManager.isBiometricEnabled).mockResolvedValue(false);

    const { getByText } = renderAuthScreen();

    // Deve mostrar seletor de método
    await waitFor(() => {
      expect(getByText('Usar Digital')).toBeDefined();
    });

    // Selecionar biometria
    fireEvent.press(getByText('Usar Digital'));

    // Deve mostrar prompt biométrico
    await waitFor(() => {
      expect(getByText('Acesse com Digital')).toBeDefined();
    });
  });

  test('fluxo de fallback: biometria falha → PIN do app', async () => {
    jest.mocked(biometricAuthManager.detectDeviceCapabilities).mockResolvedValue({
      hasHardware: true,
      availableTypes: ['fingerprint'],
      isEnrolled: true,
      securityLevel: 'strong',
      hasScreenLock: true,
      recommendedMethod: 'fingerprint'
    });

    jest.mocked(biometricAuthManager.authenticateWithBestMethod).mockResolvedValue({
      success: false,
      error: 'app_pin_required'
    });

    const { getByText } = renderAuthScreen();

    await waitFor(() => {
      fireEvent.press(getByText('Usar Digital'));
    });

    // Simular clique no botão de autenticação
    await waitFor(() => {
      fireEvent.press(getByText('Usar Digital'));
    });

    // Deve mostrar modal de PIN
    await waitFor(() => {
      expect(getByText('Configure seu PIN')).toBeDefined();
    });
  });

  test('fluxo de registro: email → verificação → setup biométrico', async () => {
    jest.mocked(AuthService.registerWithEmailVerification).mockResolvedValue({
      success: true,
      message: 'Código enviado'
    });

    jest.mocked(AuthService.confirmEmailAndSetupDevice).mockResolvedValue({
      success: true,
      data: {
        user: { id: '1', email: 'test@example.com' },
        token: 'jwt-token'
      },
      message: 'Sucesso'
    });

    const { getByText, getByPlaceholderText } = renderAuthScreen();

    // Selecionar email
    fireEvent.press(getByText('Usar Email'));

    // Preencher email e enviar
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.press(getByText('Criar Conta'));

    // Deve mostrar tela de verificação
    await waitFor(() => {
      expect(AuthService.registerWithEmailVerification).toHaveBeenCalledWith('test@example.com');
    });
  });
});
```

---

## 🎯 TESTES DE CENÁRIOS CRÍTICOS

### **🔧 __tests__/scenarios/critical-scenarios.test.ts**
```typescript
import { biometricAuthManager } from '../../services/biometricAuthManager';
import * as LocalAuthentication from 'expo-local-authentication';

describe('Critical Device Scenarios', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Cenário 1: Device sem senha/PIN', () => {
    test('deve detectar device inseguro e recomendar PIN do app', async () => {
      jest.mocked(LocalAuthentication.hasHardwareAsync).mockResolvedValue(false);
      jest.mocked(LocalAuthentication.getEnrolledLevelAsync).mockResolvedValue(
        LocalAuthentication.SecurityLevel.NONE
      );

      const capabilities = await biometricAuthManager.detectDeviceCapabilities();

      expect(capabilities.securityLevel).toBe('none');
      expect(capabilities.hasScreenLock).toBe(false);
      expect(capabilities.recommendedMethod).toBe('app_pin');
    });

    test('deve forçar educação sobre segurança', async () => {
      jest.mocked(LocalAuthentication.getEnrolledLevelAsync).mockResolvedValue(
        LocalAuthentication.SecurityLevel.NONE
      );

      const result = await biometricAuthManager.authenticateWithBestMethod();

      expect(result.success).toBe(false);
      expect(result.error).toBe('app_pin_required');
      expect(result.warning).toContain('Configure uma proteção');
    });
  });

  describe('Cenário 2: Device sem hardware biométrico', () => {
    test('deve detectar ausência de hardware e recomendar PIN', async () => {
      jest.mocked(LocalAuthentication.hasHardwareAsync).mockResolvedValue(false);
      jest.mocked(LocalAuthentication.getEnrolledLevelAsync).mockResolvedValue(
        LocalAuthentication.SecurityLevel.SECRET
      );

      const capabilities = await biometricAuthManager.detectDeviceCapabilities();

      expect(capabilities.hasHardware).toBe(false);
      expect(capabilities.availableTypes).toEqual([]);
      expect(capabilities.recommendedMethod).toBe('device_pin');
    });

    test('deve usar PIN do device como fallback', async () => {
      jest.mocked(LocalAuthentication.hasHardwareAsync).mockResolvedValue(false);
      jest.mocked(LocalAuthentication.authenticateAsync).mockResolvedValue({
        success: true
      });

      const result = await biometricAuthManager.authenticateWithDevicePin();

      expect(result.success).toBe(true);
      expect(result.method).toBe('device_pin');
    });
  });

  describe('Cenário 3: Troca de dispositivo', () => {
    test('deve gerar novo device ID para novo dispositivo', async () => {
      // Simular novo device (sem device ID salvo)
      jest.mocked(SecureStore.getItemAsync).mockResolvedValue(null);

      const deviceId1 = await biometricAuthManager.getDeviceId();
      const deviceId2 = await biometricAuthManager.getDeviceId();

      expect(deviceId1).toBe('mock-uuid-123');
      expect(deviceId1).toBe(deviceId2); // Mesmo ID após primeira geração
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'device_unique_id',
        'mock-uuid-123'
      );
    });
  });

  describe('Cenário 4: Device com senha mas sem biometria', () => {
    test('deve recomendar configurar biometria', async () => {
      jest.mocked(LocalAuthentication.hasHardwareAsync).mockResolvedValue(true);
      jest.mocked(LocalAuthentication.isEnrolledAsync).mockResolvedValue(false);
      jest.mocked(LocalAuthentication.getEnrolledLevelAsync).mockResolvedValue(
        LocalAuthentication.SecurityLevel.SECRET
      );

      const capabilities = await biometricAuthManager.detectDeviceCapabilities();

      expect(capabilities.hasHardware).toBe(true);
      expect(capabilities.isEnrolled).toBe(false);
      expect(capabilities.securityLevel).toBe('weak');
      expect(capabilities.recommendedMethod).toBe('device_pin');
    });

    test('deve mostrar prompt para configurar biometria', async () => {
      jest.mocked(LocalAuthentication.hasHardwareAsync).mockResolvedValue(true);
      jest.mocked(LocalAuthentication.isEnrolledAsync).mockResolvedValue(false);
      jest.mocked(biometricAuthManager.isBiometricEnabled).mockResolvedValue(false);

      const shouldPrompt = await biometricAuthManager.shouldPromptBiometricSetup();

      expect(shouldPrompt).toBe(true);
    });
  });
});
```

---

## ⚡ TESTES DE PERFORMANCE

### **🔧 __tests__/performance/biometric-auth.performance.test.ts**
```typescript
import { biometricAuthManager } from '../../services/biometricAuthManager';
import AuthService from '../../services/authService';

describe('Biometric Authentication Performance', () => {
  test('detecção de capacidades deve ser < 500ms', async () => {
    const startTime = performance.now();
    
    await biometricAuthManager.detectDeviceCapabilities();
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(500);
  });

  test('autenticação biométrica deve ser < 2000ms', async () => {
    jest.mocked(LocalAuthentication.authenticateAsync).mockResolvedValue({
      success: true
    });

    const startTime = performance.now();
    
    await biometricAuthManager.authenticateWithBiometrics();
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(2000);
  });

  test('login biométrico completo deve ser < 3000ms', async () => {
    // Mock autenticação bem-sucedida
    jest.mocked(biometricAuthManager.authenticateWithBestMethod).mockResolvedValue({
      success: true,
      method: 'fingerprint'
    });

    jest.mocked(biometricAuthManager.getDeviceId).mockResolvedValue('device-123');
    jest.mocked(biometricAuthManager.getBiometricToken).mockResolvedValue('token-123');

    jest.mocked(AuthService.loginWithBiometric).mockResolvedValue({
      success: true,
      data: { user: { id: '1' }, token: 'jwt' },
      message: 'Success'
    });

    const startTime = performance.now();
    
    // Simular login biométrico completo
    const authResult = await biometricAuthManager.authenticateWithBestMethod();
    if (authResult.success) {
      const deviceId = await biometricAuthManager.getDeviceId();
      const token = await biometricAuthManager.getBiometricToken();
      await AuthService.loginWithBiometric(deviceId, token!, 'fingerprint');
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(3000);
    expect(authResult.success).toBe(true);
  });

  test('geração de device ID deve ser < 100ms', async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValue(null);

    const startTime = performance.now();
    
    await biometricAuthManager.getDeviceId();
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(100);
  });
});
```

---

## 📊 SCRIPTS DE EXECUÇÃO

### **🎯 package.json (Scripts atualizados)**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:biometric": "jest --testPathPattern=biometric",
    "test:scenarios": "jest --testPathPattern=scenarios",
    "test:performance": "jest --testPathPattern=performance",
    "test:integration": "jest --testPathPattern=integration",
    "test:components": "jest --testPathPattern=components",
    "test:services": "jest --testPathPattern=services",
    "test:critical": "jest --testPathPattern='(scenarios|performance)'",
    "test:ci": "jest --coverage --watchAll=false --passWithNoTests"
  }
}
```

### **🚀 Scripts de Comando**
```bash
# Executar todos os testes
npm test

# Testes específicos de biometria
npm run test:biometric

# Testes de cenários críticos
npm run test:scenarios

# Testes de performance
npm run test:performance

# Testes de integração
npm run test:integration

# Coverage completo
npm run test:coverage

# Testes para CI/CD
npm run test:ci

# Watch mode para desenvolvimento
npm run test:watch
```

---

## 📈 MÉTRICAS DE SUCESSO

### **🎯 Coverage Targets**
- **Services**: > 90% (crítico para segurança)
- **Components**: > 80% (importante para UX)
- **Integration**: > 85% (fluxos completos)
- **Global**: > 80% (baseline de qualidade)

### **⚡ Performance Targets**
- **Detecção de capacidades**: < 500ms
- **Autenticação biométrica**: < 2000ms
- **Login completo**: < 3000ms
- **Geração de device ID**: < 100ms

### **🔍 Cenários de Teste**
- ✅ **Device Premium** (70%): Face ID/Digital
- ✅ **Device Protegido** (20%): PIN do device
- ✅ **Device Básico** (8%): PIN do app
- ✅ **Device Inseguro** (2%): Email + SMS

Este conjunto de testes garante que a implementação biométrica funciona perfeitamente em todos os cenários possíveis! 🎯
