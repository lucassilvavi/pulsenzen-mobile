#!/usr/bin/env node

/**
 * Crisis Prediction Engine Integration Test
 * Tests the API client integration with backend
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Testing Crisis Prediction Engine Integration...\n');

// Test scenarios
const tests = [
  {
    name: 'API Client Compilation',
    description: 'Check TypeScript compilation of CrisisPredictionApiClient',
    command: 'npx',
    args: ['tsc', '--noEmit', 'modules/prediction/services/CrisisPredictionApiClient.ts'],
  },
  {
    name: 'Context Integration',
    description: 'Check PredictionContext compilation with new API client',
    command: 'npx',
    args: ['tsc', '--noEmit', 'modules/prediction/context/PredictionContext.tsx'],
  },
  {
    name: 'API Configuration',
    description: 'Verify API endpoints configuration',
    command: 'node',
    args: ['-e', `
      const { API_CONFIG } = require('./config/api');
      console.log('✅ Crisis Prediction endpoints:', API_CONFIG.ENDPOINTS.CRISIS_PREDICTION);
      process.exit(0);
    `],
  }
];

async function runTest(test) {
  return new Promise((resolve) => {
    console.log(`🔍 ${test.name}: ${test.description}`);
    
    const proc = spawn(test.command, test.args, {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${test.name} - PASSED`);
        if (stdout) console.log(`   Output: ${stdout.trim()}`);
      } else {
        console.log(`❌ ${test.name} - FAILED (exit code: ${code})`);
        if (stderr) console.log(`   Error: ${stderr.trim()}`);
      }
      console.log('');
      resolve(code === 0);
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      proc.kill();
      console.log(`⏰ ${test.name} - TIMEOUT`);
      console.log('');
      resolve(false);
    }, 30000);
  });
}

async function main() {
  const results = [];
  
  for (const test of tests) {
    const success = await runTest(test);
    results.push({ name: test.name, success });
  }

  // Summary
  console.log('📊 Test Results Summary:');
  console.log('========================');
  
  let passedCount = 0;
  results.forEach(result => {
    const status = result.success ? '✅ PASSED' : '❌ FAILED';
    console.log(`${status} - ${result.name}`);
    if (result.success) passedCount++;
  });

  const totalTests = results.length;
  const successRate = (passedCount / totalTests * 100).toFixed(1);
  
  console.log('');
  console.log(`📈 Integration Status: ${passedCount}/${totalTests} tests passed (${successRate}%)`);
  
  if (passedCount === totalTests) {
    console.log('🎉 Crisis Prediction Integration is READY!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Start the backend API server');
    console.log('2. Set environment to production/staging');
    console.log('3. Test with real Crisis Prediction Engine™ data');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please fix issues before proceeding.');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('💥 Test runner error:', error);
  process.exit(1);
});
