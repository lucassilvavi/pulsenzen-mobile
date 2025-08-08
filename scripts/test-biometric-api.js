/**
 * Script de teste para autenticação biométrica
 * Testa o fluxo completo de login biométrico
 */

const API_BASE_URL = 'http://192.168.3.73:3333/api/v1';

const testCredentials = {
  email: 'lucas@ig.com',
  password: '12345678'
};

// Simula dados que viriam do mobile
const mockBiometricData = {
  deviceFingerprint: 'android-2311drk48g-1754616579829-jqh0sxsfojj', // Use o fingerprint do dispositivo mais recente
  biometricType: 'fingerprint',
  biometricSignature: 'mock_signature_123',
  challengeResponse: 'mock_challenge_response',
  ipAddress: '192.168.3.56',
  userAgent: 'okhttp/4.12.0',
  geolocation: {
    latitude: -23.5505,
    longitude: -46.6333
  },
  deviceInfo: {
    userAgent: 'okhttp/4.12.0',
    platform: 'android',
    version: '35',
    model: '2311DRK48G',
    manufacturer: 'Xiaomi',
    isJailbroken: false,
    os: 'android 35'
  }
};

/**
 * Faz uma requisição HTTP com headers apropriados
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    },
    ...options
  };

  console.log(`\n🔍 ${config.method || 'GET'} ${url}`);
  
  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📄 Response:`, JSON.stringify(data, null, 2));
    
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    console.log(`❌ Error:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Registra um novo usuário de teste se necessário
 */
async function registerTestUser() {
  console.log('\n📝 === REGISTERING TEST USER ===');
  
  const userData = {
    email: testCredentials.email,
    password: testCredentials.password,
    name: 'Test User',
    birthDate: '1990-01-01'
  };
  
  const result = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
  
  if (result.success) {
    console.log('✅ User registered successfully');
    return result.data?.data?.token || null;
  } else if (result.status === 409) {
    console.log('ℹ️ User already exists, trying to login');
    return null;
  } else {
    console.log('❌ User registration failed');
    return null;
  }
}

/**
 * Faz login tradicional e retorna o token
 */
async function login() {
  console.log('\n🔐 === TESTING TRADITIONAL LOGIN ===');
  const result = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(testCredentials)
  });
  
  if (result.success && result.data?.data?.token) {
    console.log('🎉 Login successful!');
    return result.data.data.token;
  } else {
    console.log('❌ Login failed');
    return null;
  }
}

/**
 * Testa login biométrico SEM userId (simulando cenário real)
 */
async function testBiometricLoginWithoutUser() {
  console.log('\n👆 === TESTING BIOMETRIC LOGIN (Without userId) ===');
  
  // Não incluir userId - simula situação real onde usuário fez logout
  const biometricLoginData = {
    deviceFingerprint: mockBiometricData.deviceFingerprint,
    biometricType: mockBiometricData.biometricType,
    biometricSignature: mockBiometricData.biometricSignature,
    challengeResponse: mockBiometricData.challengeResponse,
    ipAddress: mockBiometricData.ipAddress,
    userAgent: mockBiometricData.userAgent,
    geolocation: mockBiometricData.geolocation,
    deviceInfo: mockBiometricData.deviceInfo
  };
  
  console.log('📱 Sending biometric login data (without userId):');
  console.log(JSON.stringify(biometricLoginData, null, 2));
  
  const result = await apiRequest('/auth/biometric/login', {
    method: 'POST',
    body: JSON.stringify(biometricLoginData)
  });
  
  return result;
}

/**
 * Testa se o device está registrado
 */
async function checkDeviceRegistration(token) {
  console.log('\n📱 === CHECKING DEVICE REGISTRATION ===');
  
  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  };

  const result = await apiRequest('/auth/devices', {
    headers: authHeaders
  });
  
  if (result.success && result.data?.data?.devices) {
    console.log(`📱 Found ${result.data.data.devices.length} registered devices`);
    
    const targetDevice = result.data.data.devices.find(
      device => device.fingerprint === mockBiometricData.deviceFingerprint
    );
    
    if (targetDevice) {
      console.log('✅ Target device found:', {
        id: targetDevice.id,
        fingerprint: targetDevice.fingerprint,
        biometricEnabled: targetDevice.biometricEnabled,
        trustScore: targetDevice.trustScore
      });
      return targetDevice;
    } else {
      console.log('❌ Target device not found');
      return null;
    }
  }
  
  return null;
}

/**
 * Função principal de teste
 */
async function runBiometricTests() {
  console.log('🚀 Starting Biometric API Tests...');
  console.log(`📧 Testing with: ${testCredentials.email}`);
  console.log(`🕐 Test time: ${new Date().toISOString()}`);
  console.log(`📱 Target device: ${mockBiometricData.deviceFingerprint}`);
  
  try {
    // 1. Fazer login tradicional para obter token e verificar dispositivos
    console.log('\n='.repeat(60));
    const token = await login();
    if (!token) {
      console.log('❌ Cannot proceed without valid token');
      return;
    }
    
    // 2. Verificar se o device está registrado e habilitado para biometria
    console.log('\n='.repeat(60));
    const device = await checkDeviceRegistration(token);
    
    if (device && !device.biometricEnabled) {
      console.log('⚠️ Device found but biometric authentication not enabled');
      console.log('💡 This explains why biometric login will fail');
    }
    
    // 3. Testar login biométrico SEM userId (cenário real)
    console.log('\n='.repeat(60));
    const biometricResult = await testBiometricLoginWithoutUser();
    
    // 4. Analisar resultado
    console.log('\n='.repeat(60));
    console.log('🔬 === ANALYSIS ===');
    
    if (biometricResult.success) {
      console.log('🎉 SUCCESS: Biometric login worked without userId!');
      console.log('✅ The backend successfully identified user by deviceFingerprint');
      
      if (biometricResult.data?.data?.token) {
        console.log('🔑 New access token received');
        console.log('👤 User authenticated successfully');
      }
    } else {
      console.log('❌ FAILED: Biometric login failed');
      console.log(`📊 Status: ${biometricResult.status}`);
      
      if (biometricResult.data?.error) {
        console.log(`💬 Error: ${biometricResult.data.error}`);
      }
      
      if (biometricResult.data?.message) {
        console.log(`📝 Message: ${biometricResult.data.message}`);
      }
      
      // Diagnóstico
      if (biometricResult.status === 500) {
        console.log('💊 DIAGNOSIS: Internal server error - check backend logs');
      } else if (biometricResult.status === 401) {
        console.log('💊 DIAGNOSIS: Authentication failed - check biometric token or device trust');
      } else if (biometricResult.status === 400) {
        console.log('💊 DIAGNOSIS: Bad request - check required fields');
      }
    }
    
    console.log('\n🎯 === TEST COMPLETED ===');
    
  } catch (error) {
    console.log('💥 Test failed:', error.message);
  }
}

// Executar os testes
runBiometricTests();
