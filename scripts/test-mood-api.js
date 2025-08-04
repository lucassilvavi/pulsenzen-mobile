/**
 * Script de teste para verificar problema do mood selector
 * Testa API com credenciais específicas para diagnosticar inconsistências
 */

const API_BASE_URL = 'http://localhost:3333/api/v1';

const testCredentials = {
  email: 'lucas1@ig.com',
  password: '12345678'
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
 * Testa a saúde da API
 */
async function testHealth() {
  console.log('\n🏥 === TESTING API HEALTH ===');
  return await apiRequest('/../health'); // Remove prefix for health endpoint
}

/**
 * Faz login e retorna o token
 */
async function login() {
  console.log('\n🔐 === TESTING LOGIN ===');
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
 * Testa endpoints de mood com token de autenticação
 */
async function testMoodEndpoints(token) {
  console.log('\n😊 === TESTING MOOD ENDPOINTS ===');
  
  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  // Testar GET /mood/entries - todas as entradas
  console.log('\n📋 Testing GET /mood/entries (all entries)');
  const allEntries = await apiRequest('/mood/entries', {
    headers: authHeaders
  });

  // Testar GET /mood/entries com filtro de data de hoje
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  console.log(`\n📅 Testing GET /mood/entries for today (${today})`);
  const todayEntries = await apiRequest(`/mood/entries?startDate=${today}&endDate=${today}`, {
    headers: authHeaders
  });

  // Testar validação de período para morning
  console.log('\n✅ Testing GET /mood/validate/morning');
  const validateMorning = await apiRequest(`/mood/validate/morning?date=${today}`, {
    headers: authHeaders
  });

  // Testar validação de período para afternoon
  console.log('\n✅ Testing GET /mood/validate/afternoon');
  const validateAfternoon = await apiRequest(`/mood/validate/afternoon?date=${today}`, {
    headers: authHeaders
  });

  // Testar validação de período para evening
  console.log('\n✅ Testing GET /mood/validate/evening');
  const validateEvening = await apiRequest(`/mood/validate/evening?date=${today}`, {
    headers: authHeaders
  });

  // Resumo dos resultados
  console.log('\n📊 === MOOD TEST SUMMARY ===');
  console.log(`📋 Total entries: ${allEntries.data?.data?.entries?.length || 0}`);
  console.log(`📅 Today entries: ${todayEntries.data?.data?.entries?.length || 0}`);
  console.log(`🌅 Can create morning: ${validateMorning.data?.data?.canCreate}`);
  console.log(`🌞 Can create afternoon: ${validateAfternoon.data?.data?.canCreate}`);
  console.log(`🌙 Can create evening: ${validateEvening.data?.data?.canCreate}`);

  return {
    allEntries,
    todayEntries,
    validateMorning,
    validateAfternoon,
    validateEvening
  };
}

/**
 * Análise detalhada do problema
 */
function analyzeProblem(moodResults) {
  console.log('\n🔬 === PROBLEM ANALYSIS ===');
  
  const { todayEntries, validateMorning, validateAfternoon, validateEvening } = moodResults;
  
  const todayEntriesCount = todayEntries.data?.data?.entries?.length || 0;
  const canCreateAny = [
    validateMorning.data?.data?.canCreate,
    validateAfternoon.data?.data?.canCreate,
    validateEvening.data?.data?.canCreate
  ].some(can => can === true);

  console.log(`\n🎯 DIAGNOSIS:`);
  console.log(`• Today entries count: ${todayEntriesCount}`);
  console.log(`• Can create any period: ${canCreateAny}`);
  
  if (todayEntriesCount === 0 && canCreateAny) {
    console.log(`✅ EXPECTED: No entries today + can create = Should show MoodSelector`);
  } else if (todayEntriesCount > 0 && !canCreateAny) {
    console.log(`✅ EXPECTED: Has entries today + cannot create = Should NOT show MoodSelector`);
  } else if (todayEntriesCount === 0 && !canCreateAny) {
    console.log(`⚠️  ISSUE: No entries today but cannot create periods - Check period validation logic`);
  } else if (todayEntriesCount > 0 && canCreateAny) {
    console.log(`⚠️  ISSUE: Has entries today but can still create - Check validation logic`);
  }

  // Verificar detalhes dos períodos
  console.log(`\n📊 PERIOD DETAILS:`);
  ['morning', 'afternoon', 'evening'].forEach((period, index) => {
    const results = [validateMorning, validateAfternoon, validateEvening][index];
    const canCreate = results.data?.data?.canCreate;
    const reason = results.data?.data?.reason;
    
    console.log(`• ${period}: canCreate=${canCreate}${reason ? `, reason="${reason}"` : ''}`);
  });
}

/**
 * Função principal de teste
 */
async function runTests() {
  console.log('🚀 Starting API Mood Tests...');
  console.log(`📧 Testing with: ${testCredentials.email}`);
  console.log(`🕐 Test time: ${new Date().toISOString()}`);
  
  try {
    // 1. Testar saúde da API
    await testHealth();
    
    // 2. Fazer login
    const token = await login();
    if (!token) {
      console.log('❌ Cannot proceed without valid token');
      return;
    }
    
    // 3. Testar endpoints de mood
    const moodResults = await testMoodEndpoints(token);
    
    // 4. Analisar problema
    analyzeProblem(moodResults);
    
    console.log('\n🎯 === TEST COMPLETED ===');
    
  } catch (error) {
    console.log('💥 Test failed:', error.message);
  }
}

// Executar os testes
runTests();
