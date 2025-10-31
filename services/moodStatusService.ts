/**
 * MoodStatusService
 * 
 * Gerencia o status de humor do usuário no localStorage
 * Armazena quais períodos já foram preenchidos hoje: manhã, tarde, noite
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const MOOD_STATUS_KEY = 'mood_status';

export interface MoodStatus {
  manha: boolean;
  tarde: boolean;
  noite: boolean;
}

export class MoodStatusService {
  /**
   * Salva o status de humor no localStorage
   */
  static async saveMoodStatus(status: MoodStatus): Promise<void> {
    try {
      await AsyncStorage.setItem(MOOD_STATUS_KEY, JSON.stringify(status));
    } catch (error) {
      console.error('[MoodStatusService] Erro ao salvar mood status:', error);
      throw error;
    }
  }

  /**
   * Busca o status de humor do localStorage
   * Se não existir, retorna status vazio (todos false)
   */
  static async getMoodStatus(): Promise<MoodStatus> {
    try {
      const data = await AsyncStorage.getItem(MOOD_STATUS_KEY);
      
      if (!data) {
        return { manha: false, tarde: false, noite: false };
      }

      return JSON.parse(data);
    } catch (error) {
      console.error('[MoodStatusService] Erro ao buscar mood status:', error);
      return { manha: false, tarde: false, noite: false };
    }
  }

  /**
   * Atualiza um período específico
   */
  static async updatePeriod(period: 'manha' | 'tarde' | 'noite', answered: boolean): Promise<void> {
    try {
      const currentStatus = await this.getMoodStatus();
      currentStatus[period] = answered;
      await this.saveMoodStatus(currentStatus);
    } catch (error) {
      console.error('[MoodStatusService] Erro ao atualizar período:', error);
      throw error;
    }
  }

  /**
   * Limpa o mood status (útil para logout ou reset)
   */
  static async clearMoodStatus(): Promise<void> {
    try {
      await AsyncStorage.removeItem(MOOD_STATUS_KEY);
    } catch (error) {
      console.error('[MoodStatusService] Erro ao limpar mood status:', error);
      throw error;
    }
  }

  /**
   * Verifica se todos os períodos foram respondidos
   */
  static async hasAnsweredAll(): Promise<boolean> {
    const status = await this.getMoodStatus();
    return status.manha && status.tarde && status.noite;
  }

  /**
   * Verifica se um período específico foi respondido
   */
  static async hasAnsweredPeriod(period: 'manha' | 'tarde' | 'noite'): Promise<boolean> {
    const status = await this.getMoodStatus();
    return status[period];
  }
}
