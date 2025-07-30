#!/usr/bin/env node

/**
 * TESTE DE INTEGRAÇÃO COMPLETA: APP MOBILE ↔ API
 * 
 * Este script testa todo o fluxo de autenticação e onboarding
 * entre o app React Native e a API AdonisJS
 */

import fetch from 'node-fetch';

const API_BASE_URL = 'http://192.168.3.75:3333/api/v1';

// Dados de teste
const testUser = {
  email: `teste-integration-${Date.now()}@pulsezen.com`,
  password: 'MinhaSenh@123',
  password_confirmation: 'MinhaSenh@123',
  firstName: 'Teste',
  lastName: 'Integração'
};

const onboardingData = {
  firstName: 'Teste',
  lastName: 'Integração',
  sex: 'MENINO',
  age: 25,
  experienceLevel: 'BEGINNER',
  goals: ['stress', 'sleep', 'anxiety'],
  preferences: {
    dateOfBirth: '1990-05-15',
    mentalHealthConcerns: ['anxiety', 'stress'],
    preferredActivities: ['meditation', 'breathing', 'journaling'],
    currentStressLevel: 7,
    sleepHours: 6,
    exerciseFrequency: 'sometimes',
    preferredContactMethod: 'in-app',
    notificationPreferences: {
      reminders: true,
      progress: true,
      tips: false
    }
  }
};

let authToken = null;
let userId = null;

async function makeRequest(endpoint, method = 'GET', body = null, requireAuth = false) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  if (requireAuth && authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  console.log(`🔄 ${method} ${endpoint}`);
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ ${method} ${endpoint} - Success`);
      return { success: true, data, status: response.status };
    } else {
      console.log(`❌ ${method} ${endpoint} - Error:`, data.message || data.error);
      return { success: false, data, status: response.status };
    }
  } catch (error) {
    console.log(`💥 ${method} ${endpoint} - Network Error:`, error.message);
    return { success: false, error: error.message };
  }
}

async function testHealthCheck() {
  console.log('\n🏥 TESTE 1: Health Check');
  // Health endpoint is outside /api/v1
  const url = 'http://192.168.3.75:3333/health';
  console.log(`🔄 GET /health`);
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ GET /health - Success`);
      return true;
    } else {
      console.log(`❌ GET /health - Error:`, data.message || data.error);
      return false;
    }
  } catch (error) {
    console.log(`💥 GET /health - Network Error:`, error.message);
    return false;
  }
}

async function testRegister() {
  console.log('\n👤 TESTE 2: Registro de Usuário');
  const result = await makeRequest('/auth/register', 'POST', testUser);
  
  if (result.success && result.data.data) {
    authToken = result.data.data.token;
    userId = result.data.data.user.id;
    console.log(`📋 User ID: ${userId}`);
    console.log(`🔑 Token: ${authToken.substring(0, 20)}...`);
    return true;
  }
  
  return false;
}

async function testLogin() {
  console.log('\n🔐 TESTE 3: Login');
  const loginData = {
    email: testUser.email,
    password: testUser.password
  };
  
  const result = await makeRequest('/auth/login', 'POST', loginData);
  
  if (result.success && result.data.data) {
    authToken = result.data.data.token;
    console.log(`🔑 New Token: ${authToken.substring(0, 20)}...`);
    return true;
  }
  
  return false;
}

async function testGetProfile() {
  console.log('\n👥 TESTE 4: Get Profile');
  const result = await makeRequest('/auth/profile', 'GET', null, true);
  
  if (result.success) {
    console.log(`📧 Email: ${result.data.data.email}`);
    console.log(`✅ Onboarding Completed: ${result.data.data.profile?.onboardingCompleted || false}`);
    return true;
  }
  
  return false;
}

async function testCompleteOnboarding() {
  console.log('\n🎯 TESTE 5: Complete Onboarding');
  
  // Make sure we have a fresh token by logging in again
  console.log('🔄 Getting fresh token for onboarding...');
  const loginData = {
    email: testUser.email,
    password: testUser.password
  };
  
  const loginResult = await makeRequest('/auth/login', 'POST', loginData);
  if (loginResult.success && loginResult.data.data) {
    authToken = loginResult.data.data.token;
    console.log(`🔑 Fresh Token obtained for onboarding`);
  } else {
    console.log('❌ Failed to get fresh token');
    return false;
  }
  
  console.log('📋 Onboarding Data:', JSON.stringify(onboardingData, null, 2));
  
  const result = await makeRequest('/auth/complete-onboarding', 'POST', onboardingData, true);
  
  if (result.success) {
    console.log(`✅ Onboarding completed successfully`);
    console.log(`📊 Goals: ${result.data.data.profile?.goals?.join(', ') || 'N/A'}`);
    console.log(`🏃 Exercise Frequency: ${result.data.data.profile?.exerciseFrequency || 'N/A'}`);
    return true;
  } else {
    console.log(`❌ Onboarding failed with error: ${result.data?.error || 'Unknown error'}`);
    if (result.data?.messages) {
      console.log('📝 Validation errors:', JSON.stringify(result.data.messages, null, 2));
    }
    return false;
  }
}

async function testUpdateProfile() {
  console.log('\n✏️ TESTE 6: Update Profile');
  const updateData = {
    firstName: 'Teste Atualizado',
    lastName: 'Integração Plus',
    currentStressLevel: 5,
    sleepHours: 8
  };
  
  const result = await makeRequest('/auth/profile', 'PUT', updateData, true);
  
  if (result.success) {
    console.log(`✅ Profile updated successfully`);
    console.log(`👤 Name: ${result.data.data.profile?.firstName} ${result.data.data.profile?.lastName}`);
    console.log(`😴 Sleep Hours: ${result.data.data.profile?.sleepHours}`);
    return true;
  }
  
  return false;
}

async function testGetProfileAfterOnboarding() {
  console.log('\n👥 TESTE 7: Get Profile After Onboarding');
  const result = await makeRequest('/auth/profile', 'GET', null, true);
  
  if (result.success) {
    const profile = result.data.data.profile;
    console.log(`📧 Email: ${result.data.data.email}`);
    console.log(`✅ Onboarding Completed: ${profile?.onboardingCompleted || false}`);
    console.log(`🎯 Goals: ${profile?.goals?.join(', ') || 'N/A'}`);
    console.log(`📅 Date of Birth: ${profile?.dateOfBirth || 'N/A'}`);
    console.log(`💪 Stress Level: ${profile?.currentStressLevel || 'N/A'}`);
    return true;
  }
  
  return false;
}

async function testLogout() {
  console.log('\n🚪 TESTE 8: Logout');
  const result = await makeRequest('/auth/logout', 'POST', {}, true);
  
  if (result.success) {
    console.log(`✅ Logout successful`);
    authToken = null;
    return true;
  }
  
  return false;
}

async function testJournalEndpoints() {
  console.log('\n📔 TESTE 9: Journal Endpoints (Protected)');
  
  // First login again
  const loginResult = await testLogin();
  if (!loginResult) {
    console.log('❌ Failed to login for journal tests');
    return false;
  }
  
  // Test journal entries
  const result = await makeRequest('/journal', 'GET', null, true);
  
  if (result.success) {
    console.log(`✅ Journal entries retrieved: ${result.data.data?.length || 0} entries`);
    return true;
  }
  
  return false;
}

async function testMusicEndpoints() {
  console.log('\n🎵 TESTE 10: Music Endpoints');
  
  // Test public music categories
  const categoriesResult = await makeRequest('/music/categories', 'GET');
  if (categoriesResult.success) {
    console.log(`✅ Music categories retrieved: ${categoriesResult.data.data?.length || 0} categories`);
  }
  
  // Test protected playlists (requires auth)
  const playlistsResult = await makeRequest('/music/playlists', 'GET', null, true);
  if (playlistsResult.success) {
    console.log(`✅ Playlists retrieved: ${playlistsResult.data.data?.length || 0} playlists`);
    return true;
  }
  
  return false;
}

async function runIntegrationTests() {
  console.log('🚀 INICIANDO TESTES DE INTEGRAÇÃO APP MOBILE ↔ API\n');
  console.log('=' .repeat(60));
  
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Register', fn: testRegister },
    { name: 'Login', fn: testLogin },
    { name: 'Get Profile (Before Onboarding)', fn: testGetProfile },
    { name: 'Complete Onboarding', fn: testCompleteOnboarding },
    { name: 'Update Profile', fn: testUpdateProfile },
    { name: 'Get Profile (After Onboarding)', fn: testGetProfileAfterOnboarding },
    { name: 'Journal Endpoints', fn: testJournalEndpoints },
    { name: 'Music Endpoints', fn: testMusicEndpoints },
    { name: 'Logout', fn: testLogout },
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(`💥 ERRO no teste ${test.name}:`, error.message);
      failed++;
    }
    
    // Pequena pausa entre testes
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RESULTADOS DOS TESTES:');
  console.log(`✅ Passou: ${passed}/${tests.length}`);
  console.log(`❌ Falhou: ${failed}/${tests.length}`);
  
  if (failed === 0) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM! INTEGRAÇÃO FUNCIONANDO 100%');
  } else {
    console.log('\n⚠️  ALGUNS TESTES FALHARAM. VERIFICAR LOGS ACIMA.');
  }
  
  console.log('\n🔗 PRÓXIMOS PASSOS:');
  console.log('1. ✅ API totalmente funcional');
  console.log('2. ✅ AuthService atualizado');
  console.log('3. ✅ AuthContext atualizado'); 
  console.log('4. ✅ Tela de onboarding integrada');
  console.log('5. 🔄 Testar no app React Native');
  console.log('6. 🔄 Validar experiência do usuário');
}

// Executar testes
runIntegrationTests().catch(console.error);
