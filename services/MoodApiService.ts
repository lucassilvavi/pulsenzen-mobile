import { appConfig } from '@/config/appConfig';
import { MoodResponse } from '@/context/MoodContext';
import { networkManager } from '@/utils/simpleNetworkManager';
import { MoodStatusService } from './moodStatusService';

export class MoodApiService {
  /**
   * Submit mood response to API
   */
  static async submitMood(response: MoodResponse): Promise<{ success: boolean; message?: string; moodStatus?: any }> {
    try {
      const result = await networkManager.post<any>(
        appConfig.getApiUrl('/mood/entries'),
        {
          mood_level: response.mood,
          period: response.period,
          notes: response.notes,
          timestamp: new Date().toISOString(),
        },
        {
          timeout: 10000,
          retries: 1,
          priority: 'high',
          tags: ['mood', 'submit'],
        }
      );

      if (result.success) {
        // Atualizar localStorage com o período que acabou de ser respondido
        if (response.period) {
          await MoodStatusService.updatePeriod(response.period, true);
        }
        
        return { 
          success: true,
          moodStatus: result.data?.moodStatus // Pass through updated mood status
        };
      } else {
        // Handle different error types more specifically
        if (result.status === 429) {
          return {
            success: false,
            message: 'Você está enviando muitos humores rapidamente. Aguarde um momento e tente novamente.'
          };
        } else if (result.status === 0) {
          return {
            success: false,
            message: 'Sem conexão com o servidor. Verifique sua internet e tente novamente.'
          };
        } else if (result.status >= 500) {
          return {
            success: false,
            message: 'Problema no servidor. Tente novamente em alguns minutos.'
          };
        } else if (result.status >= 400) {
          return {
            success: false,
            message: 'Dados inválidos. Tente novamente.'
          };
        }
        
        return { 
          success: false, 
          message: result.error || 'Erro inesperado ao enviar mood' 
        };
      }
    } catch (error: any) {
      console.error('🎯 MoodApiService: Erro capturado:', error);
      
      // Handle different error types
      if (error.message?.includes('timeout')) {
        return {
          success: false,
          message: 'Timeout: O servidor demorou muito para responder. Tente novamente.'
        };
      } else if (error.message?.includes('Network Error') || error.message?.includes('network')) {
        return {
          success: false,
          message: 'Erro de rede. Verifique sua conexão com a internet.'
        };
      } else {
        return { 
          success: false, 
          message: 'Erro de conexão. Verifique sua internet e tente novamente.' 
        };
      }
    }
  }
}