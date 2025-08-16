// Comprehensive test suite for Journal Module
// This file contains all automated tests for the journal functionality

import { mockJournalEntries, mockJournalPrompts } from '../services/JournalMock';
import { JournalService } from '../services/JournalService';
import { JournalStatsService } from '../services/JournalStatsService';
import { JournalEntry, JournalPrompt } from '../types';

/**
 * Test Suite for Journal Module
 * Covers all core functionality and edge cases
 */

export class JournalModuleTests {
  private testResults: { test: string; status: 'PASS' | 'FAIL'; message?: string }[] = [];

  // Test Service Layer
  async testJournalService() {
    console.log('🧪 Testing Journal Service...');
    
    // Test 1: Get Prompts
    try {
      const prompts = await JournalService.getPrompts();
      this.addResult('JournalService.getPrompts', 
        Array.isArray(prompts) && prompts.length > 0 ? 'PASS' : 'FAIL',
        `Expected array with prompts, got ${prompts?.length || 0} items`
      );
    } catch (error) {
      this.addResult('JournalService.getPrompts', 'FAIL', `Error: ${error}`);
    }

    // Test 2: Get Entries
    try {
      const entries = await JournalService.getEntries();
      this.addResult('JournalService.getEntries', 
        Array.isArray(entries) ? 'PASS' : 'FAIL',
        `Expected array, got ${typeof entries}`
      );
    } catch (error) {
      this.addResult('JournalService.getEntries', 'FAIL', `Error: ${error}`);
    }

    // Test 3: Save Entry
    try {
      const newEntry: JournalEntry = {
        id: 'test-entry-' + Date.now(),
        content: 'This is a test journal entry for validation.',
        promptCategory: 'Reflexão',
        moodTags: [
          { id: 'grateful', label: 'Grato', emoji: '🤗', category: 'positive', intensity: 4, hexColor: '#4CAF50' },
          { id: 'focused', label: 'Focado', emoji: '🎯', category: 'neutral', intensity: 3, hexColor: '#FF9800' }
        ],
        createdAt: new Date().toISOString(),
        wordCount: 8,
        privacy: 'private'
      };

      await JournalService.saveEntry(newEntry);
      const entries = await JournalService.getEntries();
      const savedEntry = entries.find(e => e.id === newEntry.id);
      
      this.addResult('JournalService.saveEntry', 
        savedEntry ? 'PASS' : 'FAIL',
        savedEntry ? 'Entry saved successfully' : 'Entry not found after save'
      );
    } catch (error) {
      this.addResult('JournalService.saveEntry', 'FAIL', `Error: ${error}`);
    }

    // Test 4: Get Stats
    try {
      const stats = await JournalService.getStats();
      this.addResult('JournalService.getStats', 
        stats && typeof stats.totalEntries === 'number' ? 'PASS' : 'FAIL',
        `Stats object: ${JSON.stringify(stats)}`
      );
    } catch (error) {
      this.addResult('JournalService.getStats', 'FAIL', `Error: ${error}`);
    }

    // Test 5: Search Entries
    try {
      const searchResults = await JournalService.searchEntries('gratidão');
      this.addResult('JournalService.searchEntries', 
        Array.isArray(searchResults) ? 'PASS' : 'FAIL',
        `Search returned ${searchResults?.length || 0} results`
      );
    } catch (error) {
      this.addResult('JournalService.searchEntries', 'FAIL', `Error: ${error}`);
    }

    // Test 6: Get Random Prompt
    try {
      const randomPrompt = await JournalService.getRandomPrompt();
      this.addResult('JournalService.getRandomPrompt', 
        randomPrompt && randomPrompt.id ? 'PASS' : 'FAIL',
        `Random prompt: ${randomPrompt?.question || 'undefined'}`
      );
    } catch (error) {
      this.addResult('JournalService.getRandomPrompt', 'FAIL', `Error: ${error}`);
    }
  }

  // Test Stats Service
  testJournalStatsService() {
    console.log('📊 Testing Journal Stats Service...');

    try {
      const stats = JournalStatsService.calculateStats(mockJournalEntries);
      
      // Test stats calculation
      this.addResult('JournalStatsService.calculateStats', 
        stats && typeof stats.totalEntries === 'number' ? 'PASS' : 'FAIL',
        `Stats: ${JSON.stringify(stats)}`
      );

      // Test unique days calculation (from stats object)
      this.addResult('JournalStatsService.uniqueDays calculation', 
        typeof stats.uniqueDays === 'number' && stats.uniqueDays >= 0 ? 'PASS' : 'FAIL',
        `Unique days: ${stats.uniqueDays}`
      );

      // Test percentage calculation
      this.addResult('JournalStatsService.percentPositive calculation', 
        typeof stats.percentPositive === 'number' && stats.percentPositive >= 0 && stats.percentPositive <= 100 ? 'PASS' : 'FAIL',
        `Percent positive: ${stats.percentPositive}%`
      );

    } catch (error) {
      this.addResult('JournalStatsService tests', 'FAIL', `Error: ${error}`);
    }
  }

  // Test Data Integrity
  testDataIntegrity() {
    console.log('🔍 Testing Data Integrity...');

    // Test mock data structure
    this.addResult('Mock Journal Entries Structure',
      this.validateJournalEntries(mockJournalEntries) ? 'PASS' : 'FAIL',
      `Validated ${mockJournalEntries.length} entries`
    );

    this.addResult('Mock Journal Prompts Structure',
      this.validateJournalPrompts(mockJournalPrompts) ? 'PASS' : 'FAIL',
      `Validated ${mockJournalPrompts.length} prompts`
    );
  }

  // Test Edge Cases
  testEdgeCases() {
    console.log('⚠️ Testing Edge Cases...');

    // Test empty search
    try {
      JournalService.searchEntries('').then(results => {
        this.addResult('Empty search query',
          Array.isArray(results) ? 'PASS' : 'FAIL',
          `Empty search returned ${results?.length || 0} results`
        );
      });
    } catch (error) {
      this.addResult('Empty search query', 'FAIL', `Error: ${error}`);
    }

    // Test null/undefined inputs
    try {
      const stats = JournalStatsService.calculateStats([]);
      this.addResult('Stats with empty array',
        stats.totalEntries === 0 ? 'PASS' : 'FAIL',
        `Empty array stats: ${JSON.stringify(stats)}`
      );
    } catch (error) {
      this.addResult('Stats with empty array', 'FAIL', `Error: ${error}`);
    }
  }

  // Helper Methods
  private validateJournalEntries(entries: JournalEntry[]): boolean {
    return entries.every(entry => 
      entry.id && 
      entry.content && 
      entry.createdAt &&
      Array.isArray(entry.moodTags) &&
      typeof entry.wordCount === 'number' &&
      entry.privacy
    );
  }

  private validateJournalPrompts(prompts: JournalPrompt[]): boolean {
    return prompts.every(prompt => 
      prompt.id && 
      prompt.question && 
      prompt.category &&
      prompt.icon
    );
  }

  private addResult(test: string, status: 'PASS' | 'FAIL', message?: string) {
    this.testResults.push({ test, status, message });
    const emoji = status === 'PASS' ? '✅' : '❌';
    console.log(`${emoji} ${test}: ${status}${message ? ' - ' + message : ''}`);
  }

  // Run All Tests
  async runAllTests(): Promise<{ passed: number; failed: number; total: number }> {
    console.log('🚀 Starting Journal Module Test Suite...\n');
    
    this.testDataIntegrity();
    await this.testJournalService();
    this.testJournalStatsService();
    this.testEdgeCases();

    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const total = this.testResults.length;

    console.log('\n📋 Test Summary:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${total}`);
    console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    return { passed, failed, total };
  }

  // Get detailed results
  getResults() {
    return this.testResults;
  }
}

// Export for use in testing
export default JournalModuleTests;
