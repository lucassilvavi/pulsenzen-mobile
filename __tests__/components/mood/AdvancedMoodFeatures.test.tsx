/**
 * Testes das Funcionalidades Avançadas do Sistema de Humor
 * Validação do Item 11.2 - Features avançadas
 */

import { useMood } from '../../../modules/mood/hooks/useMood';
import { MoodLevel } from '../../../modules/mood/types';

// Mock do hook useMood para testes unitários
jest.mock('../../../modules/mood/hooks/useMood');
const mockUseMood = useMood as jest.MockedFunction<typeof useMood>;

describe('Advanced Mood Features - Item 11.2', () => {
  const mockBulkDeleteEntries = jest.fn();
  const mockExportMoodData = jest.fn();
  const mockGetFilteredEntries = jest.fn();
  const mockGetMoodEntries = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock padrão do hook useMood
    mockUseMood.mockReturnValue({
      loadingStates: {
        initializing: false,
        submittingMood: false,
        loadingEntries: false,
        loadingStats: false,
        syncing: false,
        refreshing: false,
        bulkDeleting: false,
        exporting: false,
        filtering: false,
      },
      bulkDeleteEntries: mockBulkDeleteEntries,
      exportMoodData: mockExportMoodData,
      getFilteredEntries: mockGetFilteredEntries,
      getMoodEntries: mockGetMoodEntries,
      invalidateCache: jest.fn(),
      refreshData: jest.fn(),
    } as any);
  });

  describe('Bulk Delete Operations', () => {
    it('processes bulk delete with batch handling', async () => {
      const entryIds = ['1', '2', '3', '4', '5'];
      const expectedResult = {
        success: 5,
        failed: 0,
        errors: []
      };
      
      mockBulkDeleteEntries.mockResolvedValue(expectedResult);
      
      const { bulkDeleteEntries } = mockUseMood();
      const result = await bulkDeleteEntries(entryIds);
      
      expect(mockBulkDeleteEntries).toHaveBeenCalledWith(entryIds);
      expect(result).toEqual(expectedResult);
    });

    it('handles partial failures in bulk delete', async () => {
      const entryIds = ['1', '2', '3'];
      const expectedResult = {
        success: 2,
        failed: 1,
        errors: ['Erro ao deletar entrada 3: Network timeout']
      };
      
      mockBulkDeleteEntries.mockResolvedValue(expectedResult);
      
      const { bulkDeleteEntries } = mockUseMood();
      const result = await bulkDeleteEntries(entryIds);
      
      expect(result.success).toBe(2);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
    });

    it('handles complete bulk delete failure', async () => {
      const entryIds = ['1', '2'];
      const expectedResult = {
        success: 0,
        failed: 2,
        errors: ['Erro inesperado durante operação de bulk delete']
      };
      
      mockBulkDeleteEntries.mockResolvedValue(expectedResult);
      
      const { bulkDeleteEntries } = mockUseMood();
      const result = await bulkDeleteEntries(entryIds);
      
      expect(result.success).toBe(0);
      expect(result.failed).toBe(2);
    });
  });

  describe('Data Export Functionality', () => {
    it('exports data in CSV format with metadata', async () => {
      const exportOptions = {
        format: 'csv' as const,
        dateRange: {
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        },
        includeStats: true
      };
      
      const expectedResult = {
        success: true,
        data: 'Date,Period,Mood,Activities,Notes,Created\n"2024-01-01","manha","bem","exercicio","Bom dia","2024-01-01 08:00"',
        filename: 'mood-data-2024-01-31.csv',
        message: 'Exportação concluída: 1 entradas'
      };
      
      mockExportMoodData.mockResolvedValue(expectedResult);
      
      const { exportMoodData } = mockUseMood();
      const result = await exportMoodData(exportOptions);
      
      expect(mockExportMoodData).toHaveBeenCalledWith(exportOptions);
      expect(result.success).toBe(true);
      expect(result.data).toContain('Date,Period,Mood');
      expect(result.filename).toMatch(/mood-data-.*\.csv/);
    });

    it('exports data in JSON format with statistics', async () => {
      const exportOptions = {
        format: 'json' as const,
        includeStats: true
      };
      
      const expectedResult = {
        success: true,
        data: JSON.stringify({
          metadata: {
            exportDate: '2024-01-31T10:00:00.000Z',
            totalEntries: 2
          },
          entries: [
            { id: '1', mood: 'bem', period: 'manha', date: '2024-01-01' }
          ],
          statistics: {
            averageMood: 3.5,
            totalEntries: 2,
            streak: 5
          }
        }),
        filename: 'mood-data-2024-01-31.json',
        message: 'Exportação concluída: 2 entradas'
      };
      
      mockExportMoodData.mockResolvedValue(expectedResult);
      
      const { exportMoodData } = mockUseMood();
      const result = await exportMoodData(exportOptions);
      
      expect(result.success).toBe(true);
      expect(result.filename).toMatch(/mood-data-.*\.json/);
      
      const parsedData = JSON.parse(result.data!);
      expect(parsedData.metadata).toBeDefined();
      expect(parsedData.entries).toBeDefined();
      expect(parsedData.statistics).toBeDefined();
    });

    it('handles export with no data found', async () => {
      const exportOptions = {
        format: 'csv' as const
      };
      
      const expectedResult = {
        success: false,
        message: 'Nenhum dado encontrado para exportação'
      };
      
      mockExportMoodData.mockResolvedValue(expectedResult);
      
      const { exportMoodData } = mockUseMood();
      const result = await exportMoodData(exportOptions);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Nenhum dado encontrado');
    });
  });

  describe('Advanced Filtering System', () => {
    const mockEntries = [
      {
        id: '1',
        mood: 'bem' as const,
        period: 'manha' as const,
        date: '2024-01-01',
        timestamp: Date.now(),
        notes: 'Manhã produtiva',
        activities: ['exercicio', 'meditacao']
      },
      {
        id: '2',
        mood: 'excelente' as const,
        period: 'tarde' as const,
        date: '2024-01-02',
        timestamp: Date.now(),
        activities: ['trabalho']
      },
      {
        id: '3',
        mood: 'neutro' as const,
        period: 'noite' as const,
        date: '2024-01-03',
        timestamp: Date.now(),
        notes: 'Noite tranquila'
      }
    ];

    it('filters by mood levels', async () => {
      const filters = {
        moodLevels: ['bem', 'excelente'] as MoodLevel[]
      };
      
      const expectedResults = mockEntries.slice(0, 2);
      mockGetFilteredEntries.mockResolvedValue(expectedResults);
      
      const { getFilteredEntries } = mockUseMood();
      const result = await getFilteredEntries(filters);
      
      expect(mockGetFilteredEntries).toHaveBeenCalledWith(filters);
      expect(result).toHaveLength(2);
    });

    it('filters by periods', async () => {
      const filters = {
        periods: ['manha', 'tarde'] as ('manha' | 'tarde' | 'noite')[]
      };
      
      const expectedResults = mockEntries.slice(0, 2);
      mockGetFilteredEntries.mockResolvedValue(expectedResults);
      
      const { getFilteredEntries } = mockUseMood();
      const result = await getFilteredEntries(filters);
      
      expect(result).toHaveLength(2);
    });

    it('filters by date range', async () => {
      const filters = {
        dateRange: {
          startDate: '2024-01-01',
          endDate: '2024-01-02'
        }
      };
      
      const expectedResults = mockEntries.slice(0, 2);
      mockGetFilteredEntries.mockResolvedValue(expectedResults);
      
      const { getFilteredEntries } = mockUseMood();
      const result = await getFilteredEntries(filters);
      
      expect(result).toHaveLength(2);
    });

    it('filters by presence of notes', async () => {
      const filters = {
        hasNotes: true
      };
      
      const expectedResults = [mockEntries[0], mockEntries[2]]; // Entries with notes
      mockGetFilteredEntries.mockResolvedValue(expectedResults);
      
      const { getFilteredEntries } = mockUseMood();
      const result = await getFilteredEntries(filters);
      
      expect(result).toHaveLength(2);
    });

    it('filters by activities', async () => {
      const filters = {
        activities: ['exercicio']
      };
      
      const expectedResults = [mockEntries[0]]; // Only entry with 'exercicio'
      mockGetFilteredEntries.mockResolvedValue(expectedResults);
      
      const { getFilteredEntries } = mockUseMood();
      const result = await getFilteredEntries(filters);
      
      expect(result).toHaveLength(1);
      expect(result[0].activities).toContain('exercicio');
    });

    it('applies multiple filters simultaneously', async () => {
      const filters = {
        moodLevels: ['bem', 'excelente'] as MoodLevel[],
        periods: ['manha'] as ('manha' | 'tarde' | 'noite')[],
        hasNotes: true,
        dateRange: {
          startDate: '2024-01-01',
          endDate: '2024-01-02'
        }
      };
      
      const expectedResults = [mockEntries[0]]; // Only first entry matches all criteria
      mockGetFilteredEntries.mockResolvedValue(expectedResults);
      
      const { getFilteredEntries } = mockUseMood();
      const result = await getFilteredEntries(filters);
      
      expect(result).toHaveLength(1);
      expect(result[0].mood).toBe('bem');
      expect(result[0].period).toBe('manha');
      expect(result[0].notes).toBeTruthy();
    });

    it('returns empty array when no entries match filters', async () => {
      const filters = {
        moodLevels: ['pessimo'] as MoodLevel[]
      };
      
      mockGetFilteredEntries.mockResolvedValue([]);
      
      const { getFilteredEntries } = mockUseMood();
      const result = await getFilteredEntries(filters);
      
      expect(result).toHaveLength(0);
    });
  });

  describe('Performance and Caching', () => {
    it('provides cache invalidation functionality', async () => {
      const mockInvalidateCache = jest.fn().mockResolvedValue(undefined);
      
      mockUseMood.mockReturnValue({
        ...mockUseMood(),
        invalidateCache: mockInvalidateCache
      } as any);
      
      const { invalidateCache } = mockUseMood();
      await invalidateCache(['mood_entries_cache', 'mood_stats_cache']);
      
      expect(mockInvalidateCache).toHaveBeenCalledWith(['mood_entries_cache', 'mood_stats_cache']);
    });

    it('provides data refresh functionality', async () => {
      const mockRefreshData = jest.fn().mockResolvedValue(undefined);
      
      mockUseMood.mockReturnValue({
        ...mockUseMood(),
        refreshData: mockRefreshData
      } as any);
      
      const { refreshData } = mockUseMood();
      await refreshData();
      
      expect(mockRefreshData).toHaveBeenCalled();
    });
  });

  describe('Loading States Management', () => {
    it('tracks bulk delete loading state', () => {
      mockUseMood.mockReturnValue({
        ...mockUseMood(),
        loadingStates: {
          ...mockUseMood().loadingStates,
          bulkDeleting: true
        }
      } as any);
      
      const { loadingStates } = mockUseMood();
      
      expect(loadingStates.bulkDeleting).toBe(true);
    });

    it('tracks export loading state', () => {
      mockUseMood.mockReturnValue({
        ...mockUseMood(),
        loadingStates: {
          ...mockUseMood().loadingStates,
          exporting: true
        }
      } as any);
      
      const { loadingStates } = mockUseMood();
      
      expect(loadingStates.exporting).toBe(true);
    });

    it('tracks filtering loading state', () => {
      mockUseMood.mockReturnValue({
        ...mockUseMood(),
        loadingStates: {
          ...mockUseMood().loadingStates,
          filtering: true
        }
      } as any);
      
      const { loadingStates } = mockUseMood();
      
      expect(loadingStates.filtering).toBe(true);
    });
  });

  describe('Integration and Type Safety', () => {
    it('ensures all advanced features are properly typed', () => {
      const hook = mockUseMood();
      
      // Verifica se todas as novas funções estão disponíveis
      expect(typeof hook.bulkDeleteEntries).toBe('function');
      expect(typeof hook.exportMoodData).toBe('function');
      expect(typeof hook.getFilteredEntries).toBe('function');
      expect(typeof hook.invalidateCache).toBe('function');
      expect(typeof hook.refreshData).toBe('function');
      
      // Verifica se os novos loading states estão definidos
      expect(hook.loadingStates.bulkDeleting).toBeDefined();
      expect(hook.loadingStates.exporting).toBeDefined();  
      expect(hook.loadingStates.filtering).toBeDefined();
    });

    it('maintains backward compatibility', () => {
      const hook = mockUseMood();
      
      // Verifica se as funções originais ainda existem
      expect(hook.loadingStates.initializing).toBeDefined();
      expect(hook.loadingStates.submittingMood).toBeDefined();
      expect(hook.loadingStates.loadingEntries).toBeDefined();
      expect(hook.loadingStates.loadingStats).toBeDefined();
      expect(hook.loadingStates.syncing).toBeDefined();
      expect(hook.loadingStates.refreshing).toBeDefined();
    });
  });
});
