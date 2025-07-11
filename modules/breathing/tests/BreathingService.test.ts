// Breathing Service Tests
// Tests for all service methods and data integrity

import { breathingTechniques } from '../constants';
import { BreathingService } from '../services/BreathingService';
import { BreathingSession } from '../types';

describe('BreathingService', () => {
  describe('getTechniques', () => {
    test('should return all available techniques', async () => {
      const techniques = await BreathingService.getTechniques();
      
      expect(techniques).toBeDefined();
      expect(Array.isArray(techniques)).toBe(true);
      expect(techniques.length).toBe(4);
      expect(techniques).toEqual(breathingTechniques);
    });

    test('should return techniques with valid structure', async () => {
      const techniques = await BreathingService.getTechniques();
      
      techniques.forEach(technique => {
        expect(technique).toMatchObject({
          key: expect.any(String),
          icon: {
            name: expect.any(String),
            color: expect.any(String),
            bg: expect.any(String),
          },
          title: expect.any(String),
          duration: expect.any(String),
          description: expect.any(String),
          inhaleTime: expect.any(Number),
          holdTime: expect.any(Number),
          exhaleTime: expect.any(Number),
          cycles: expect.any(Number),
        });
        
        // Validate timing values are positive
        expect(technique.inhaleTime).toBeGreaterThan(0);
        expect(technique.holdTime).toBeGreaterThanOrEqual(0);
        expect(technique.exhaleTime).toBeGreaterThan(0);
        expect(technique.cycles).toBeGreaterThan(0);
      });
    });
  });

  describe('getTechniqueByKey', () => {
    test('should return correct technique for valid key', async () => {
      const technique = await BreathingService.getTechniqueByKey('4-7-8');
      
      expect(technique).toBeDefined();
      expect(technique?.key).toBe('4-7-8');
      expect(technique?.title).toBe('Respiração 4-7-8');
      expect(technique?.inhaleTime).toBe(4);
      expect(technique?.holdTime).toBe(7);
      expect(technique?.exhaleTime).toBe(8);
    });

    test('should return correct technique for box breathing', async () => {
      const technique = await BreathingService.getTechniqueByKey('box');
      
      expect(technique).toBeDefined();
      expect(technique?.key).toBe('box');
      expect(technique?.title).toBe('Respiração Quadrada');
      expect(technique?.inhaleTime).toBe(4);
      expect(technique?.holdTime).toBe(4);
      expect(technique?.exhaleTime).toBe(4);
    });

    test('should return undefined for invalid key', async () => {
      const technique = await BreathingService.getTechniqueByKey('invalid-key');
      
      expect(technique).toBeUndefined();
    });

    test('should handle empty string key', async () => {
      const technique = await BreathingService.getTechniqueByKey('');
      
      expect(technique).toBeUndefined();
    });
  });

  describe('saveSession', () => {
    test('should save session without errors', async () => {
      const session: BreathingSession = {
        id: 'test-session-1',
        techniqueId: '4-7-8',
        duration: 300, // 5 minutes
        completedCycles: 4,
        date: new Date().toISOString(),
        notes: 'Test session',
      };

      // Should not throw
      await expect(BreathingService.saveSession(session)).resolves.toBeUndefined();
    });

    test('should handle session without notes', async () => {
      const session: BreathingSession = {
        id: 'test-session-2',
        techniqueId: 'box',
        duration: 240,
        completedCycles: 3,
        date: new Date().toISOString(),
      };

      await expect(BreathingService.saveSession(session)).resolves.toBeUndefined();
    });
  });

  describe('getSessions', () => {
    test('should return empty array initially', async () => {
      const sessions = await BreathingService.getSessions();
      
      expect(sessions).toBeDefined();
      expect(Array.isArray(sessions)).toBe(true);
      expect(sessions.length).toBe(0);
    });
  });

  describe('getStats', () => {
    test('should return initial stats structure', async () => {
      const stats = await BreathingService.getStats();
      
      expect(stats).toMatchObject({
        totalSessions: expect.any(Number),
        totalMinutes: expect.any(Number),
        favorTechnique: expect.any(String),
        streak: expect.any(Number),
      });
      
      // Initial stats should be zero/empty
      expect(stats.totalSessions).toBe(0);
      expect(stats.totalMinutes).toBe(0);
      expect(stats.favorTechnique).toBe('');
      expect(stats.streak).toBe(0);
    });
  });

  describe('getSOSTechnique', () => {
    test('should return SOS technique with correct properties', () => {
      const sosTechnique = BreathingService.getSOSTechnique();
      
      expect(sosTechnique).toMatchObject({
        key: 'box-breathing',
        icon: {
          name: 'square',
          color: '#4CAF50',
          bg: '#E8F5E9',
        },
        title: 'Respiração Quadrada',
        duration: '2 minutos • Emergência',
        description: expect.stringContaining('Técnica rápida para momentos de crise'),
        inhaleTime: 4,
        holdTime: 4,
        exhaleTime: 4,
        cycles: 2, // Emergency technique should have fewer cycles
      });
    });

    test('should return consistent SOS technique on multiple calls', () => {
      const sos1 = BreathingService.getSOSTechnique();
      const sos2 = BreathingService.getSOSTechnique();
      
      expect(sos1).toEqual(sos2);
    });
  });

  describe('Technique Data Validation', () => {
    test('all techniques should have unique keys', async () => {
      const techniques = await BreathingService.getTechniques();
      const keys = techniques.map(t => t.key);
      const uniqueKeys = [...new Set(keys)];
      
      expect(keys.length).toBe(uniqueKeys.length);
    });

    test('all techniques should have valid timing ratios', async () => {
      const techniques = await BreathingService.getTechniques();
      
      techniques.forEach(technique => {
        // Total cycle time should be reasonable (between 8-40 seconds)
        const totalTime = technique.inhaleTime + technique.holdTime + technique.exhaleTime;
        expect(totalTime).toBeGreaterThanOrEqual(8);
        expect(totalTime).toBeLessThanOrEqual(40);
        
        // Individual phases should be reasonable (1-15 seconds)
        expect(technique.inhaleTime).toBeGreaterThanOrEqual(1);
        expect(technique.inhaleTime).toBeLessThanOrEqual(15);
        expect(technique.exhaleTime).toBeGreaterThanOrEqual(1);
        expect(technique.exhaleTime).toBeLessThanOrEqual(15);
        expect(technique.holdTime).toBeLessThanOrEqual(15);
        
        // Cycles should be between 2-10 for reasonable session length
        expect(technique.cycles).toBeGreaterThanOrEqual(2);
        expect(technique.cycles).toBeLessThanOrEqual(10);
      });
    });

    test('all techniques should have valid icon colors', async () => {
      const techniques = await BreathingService.getTechniques();
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      
      techniques.forEach(technique => {
        expect(technique.icon.color).toMatch(hexColorRegex);
        expect(technique.icon.bg).toMatch(hexColorRegex);
        expect(technique.icon.name).toBeTruthy();
      });
    });
  });
});
