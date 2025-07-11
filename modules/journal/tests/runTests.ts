/**
 * Test Runner for Journal Module
 * Execute with: npx ts-node runTests.ts
 */

import JournalModuleTests from './JournalModuleTests';

async function runTests() {
  const testSuite = new JournalModuleTests();
  
  try {
    const results = await testSuite.runAllTests();
    
    console.log('\n' + '='.repeat(50));
    console.log('🎯 FINAL TEST RESULTS');
    console.log('='.repeat(50));
    
    if (results.failed === 0) {
      console.log('🎉 ALL TESTS PASSED! Module is ready for production.');
    } else {
      console.log(`⚠️  ${results.failed} tests failed. Review and fix issues before deployment.`);
    }
    
    // Get detailed results
    const detailedResults = testSuite.getResults();
    const failedTests = detailedResults.filter(r => r.status === 'FAIL');
    
    if (failedTests.length > 0) {
      console.log('\n❌ FAILED TESTS:');
      failedTests.forEach(test => {
        console.log(`   • ${test.test}: ${test.message || 'No details'}`);
      });
    }
    
    console.log('\n📝 Next Steps:');
    console.log('1. Fix any failed automated tests');
    console.log('2. Run manual testing with: node manualTests.js --instructions');
    console.log('3. Complete the validation checklist');
    console.log('4. Generate final production report');
    
  } catch (error) {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  }
}

// Execute tests
runTests();
