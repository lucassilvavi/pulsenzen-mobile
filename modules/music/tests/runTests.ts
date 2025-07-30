#!/usr/bin/env node

/**
 * Test Runner for Music Module V2
 * 
 * This script runs the comprehensive test suite for the refactored music module.
 * It can be executed from the command line or integrated into CI/CD pipelines.
 */

import { logger } from '../../../utils/logger';
import { MusicModuleV2Tests } from './MusicModuleV2Tests';

async function runTests() {
  logger.info('TestRunner', '🚀 Starting Music Module V2 Test Suite');
  
  const testSuite = new MusicModuleV2Tests();
  
  try {
    await testSuite.runAllTests();
    
    const results = testSuite.getResults();
    
    if (results.failed === 0) {
      logger.info('TestRunner', '✅ All tests passed successfully!');
      process.exit(0);
    } else {
      logger.error('TestRunner', `❌ ${results.failed} test(s) failed`);
      process.exit(1);
    }
    
  } catch (error) {
    logger.error('TestRunner', 'Test suite execution failed', error instanceof Error ? error : undefined);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

export { runTests };
export default runTests;
