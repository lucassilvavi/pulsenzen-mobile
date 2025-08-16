// Debug test for AutoSyncService
import { autoSyncService } from '../modules/mood/services/AutoSyncService';

// Mock MoodApiClient
jest.mock('../modules/mood/services/MoodApiClient', () => ({
  moodApiClient: {
    createMoodEntry: jest.fn(),
    updateMoodEntry: jest.fn(),
    deleteMoodEntry: jest.fn(),
  },
}));

describe('AutoSyncService Debug', () => {
  const mockEntry = {
    id: 'test-entry-1',
    mood: 'bem' as const,
    period: 'tarde' as const,
    date: '2024-01-15',
    timestamp: Date.now(),
    activities: ['test'],
    emotions: ['test'],
    notes: 'Test entry'
  };

  beforeEach(async () => {
    await autoSyncService.initialize();
    await autoSyncService.clearSyncQueue();
    
    // Reset all mocks
    const mockMoodApiClient = require('../modules/mood/services/MoodApiClient');
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await autoSyncService.shutdown();
  });

  it('debug - deve mostrar o que está acontecendo com mocks', async () => {
    const mockMoodApiClient = require('../modules/mood/services/MoodApiClient');
    
    console.log('=== BEFORE MOCK SETUP ===');
    console.log('createMoodEntry:', mockMoodApiClient.moodApiClient.createMoodEntry);
    
    // Setup mock to fail
    mockMoodApiClient.moodApiClient.createMoodEntry.mockRejectedValueOnce(new Error('Test error'));
    
    console.log('=== AFTER MOCK SETUP ===');
    console.log('createMoodEntry calls expected:', mockMoodApiClient.moodApiClient.createMoodEntry.mock.calls);
    
    // Add to queue
    await autoSyncService.addToSyncQueue(mockEntry, 'create');
    
    console.log('=== BEFORE SYNC ===');
    console.log('createMoodEntry calls before sync:', mockMoodApiClient.moodApiClient.createMoodEntry.mock.calls);
    
    // Perform sync
    const result = await autoSyncService.performSync();
    
    console.log('=== AFTER SYNC ===');
    console.log('Sync result:', result);
    console.log('createMoodEntry calls after sync:', mockMoodApiClient.moodApiClient.createMoodEntry.mock.calls);
    console.log('createMoodEntry call count:', mockMoodApiClient.moodApiClient.createMoodEntry.mock.calls.length);
    
    // Check if mock was called
    expect(mockMoodApiClient.moodApiClient.createMoodEntry).toHaveBeenCalled();
  });
});
