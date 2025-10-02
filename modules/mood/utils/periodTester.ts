/**
 * Utilities for testing mood period logic
 * Usado para validar se os períodos estão funcionando corretamente
 */

import { MoodPeriod } from '../types';

interface PeriodTestCase {
  hour: number;
  expectedPeriod: MoodPeriod;
  description: string;
}

/**
 * Determina o período baseado na hora (para testes)
 */
export function getPeriodForHour(hour: number): MoodPeriod {
  // Manhã: 05:00 - 11:59
  if (hour >= 5 && hour < 12) {
    return 'manha';
  } 
  // Tarde: 12:00 - 17:59
  else if (hour >= 12 && hour < 18) {
    return 'tarde';
  } 
  // Noite: 18:00 - 23:59 E 00:00 - 04:59
  else {
    return 'noite';
  }
}

/**
 * Casos de teste para validar a lógica dos períodos
 */
export const PERIOD_TEST_CASES: PeriodTestCase[] = [
  // Manhã
  { hour: 5, expectedPeriod: 'manha', description: 'Início da manhã (05:00)' },
  { hour: 8, expectedPeriod: 'manha', description: 'Meio da manhã (08:00)' },
  { hour: 11, expectedPeriod: 'manha', description: 'Final da manhã (11:00)' },
  
  // Tarde
  { hour: 12, expectedPeriod: 'tarde', description: 'Início da tarde (12:00)' },
  { hour: 15, expectedPeriod: 'tarde', description: 'Meio da tarde (15:00)' },
  { hour: 17, expectedPeriod: 'tarde', description: 'Final da tarde (17:00)' },
  
  // Noite (18:00 - 23:59)
  { hour: 18, expectedPeriod: 'noite', description: 'Início da noite (18:00)' },
  { hour: 21, expectedPeriod: 'noite', description: 'Meio da noite (21:00)' },
  { hour: 23, expectedPeriod: 'noite', description: 'Final da noite (23:00)' },
  
  // Noite (00:00 - 04:59) - madrugada
  { hour: 0, expectedPeriod: 'noite', description: 'Meia-noite (00:00)' },
  { hour: 2, expectedPeriod: 'noite', description: 'Madrugada (02:00)' },
  { hour: 4, expectedPeriod: 'noite', description: 'Fim da madrugada (04:00)' },
];

/**
 * Executa todos os testes de período
 */
export function runPeriodTests(): { passed: number; failed: number; errors: string[] } {
  let passed = 0;
  let failed = 0;
  const errors: string[] = [];

  console.log('🧪 Executando testes de período...\n');

  for (const testCase of PERIOD_TEST_CASES) {
    const actualPeriod = getPeriodForHour(testCase.hour);
    const isCorrect = actualPeriod === testCase.expectedPeriod;

    if (isCorrect) {
      passed++;
      console.log(`✅ ${testCase.description}: ${actualPeriod}`);
    } else {
      failed++;
      const error = `❌ ${testCase.description}: esperado '${testCase.expectedPeriod}', recebido '${actualPeriod}'`;
      errors.push(error);
      console.log(error);
    }
  }

  console.log(`\n📊 Resultados: ${passed} passaram, ${failed} falharam`);
  
  if (errors.length > 0) {
    console.log('\n🚨 Erros encontrados:');
    errors.forEach(error => console.log(error));
  }

  return { passed, failed, errors };
}

/**
 * Simula como seria o período em uma hora específica
 */
export function simulatePeriodAt(hour: number, minute: number = 0): {
  period: MoodPeriod;
  timeString: string;
  isTransition: boolean;
} {
  const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  const period = getPeriodForHour(hour);
  
  // Verifica se está próximo de uma transição (30 min antes ou depois)
  const isTransition = (
    (hour === 4 && minute >= 30) ||  // Aproximando manhã
    (hour === 5 && minute < 30) ||   // Início da manhã
    (hour === 11 && minute >= 30) || // Aproximando tarde
    (hour === 12 && minute < 30) ||  // Início da tarde
    (hour === 17 && minute >= 30) || // Aproximando noite
    (hour === 18 && minute < 30)     // Início da noite
  );

  return {
    period,
    timeString,
    isTransition
  };
}

/**
 * Debug helper para entender o período atual
 */
export function debugCurrentPeriod(): void {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const result = simulatePeriodAt(hour, minute);
  
  console.log('🔍 Debug do período atual:');
  console.log(`Horário: ${result.timeString}`);
  console.log(`Período: ${result.period}`);
  console.log(`Em transição: ${result.isTransition ? 'Sim' : 'Não'}`);
  
  if (result.isTransition) {
    console.log('⚠️  Você está próximo de uma mudança de período!');
  }
}