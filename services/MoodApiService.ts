import { appConfig } from '@/config/appConfig';
import { MoodResponse } from '@/context/MoodContext';
import { networkManager } from '@/utils/simpleNetworkManager';
import AuthService from './authService';

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

      console.log('✅ MoodApiService: Resposta completa da API:', JSON.stringify(result, null, 2));

      if (result.success) {
        // A resposta da API vem como: { success, data: { id, mood_level, ... }, token, message }
        // Mas o networkManager normaliza para: { success, data: { success, data: {...}, token, message } }
        // Então precisamos acessar result.data (que contém a resposta original da API)
        const apiResponse = result.data as any;
        const newToken = apiResponse?.token;
        
        if (newToken) {
          console.log('🔄 Novo token encontrado, atualizando...');
          await AuthService.updateToken(newToken);
          console.log('✅ Token atualizado com sucesso após submissão de mood');
        } else {
          console.warn('⚠️ Nenhum token encontrado na resposta da API');
        }
        
        return { 
          success: true,
          moodStatus: apiResponse?.moodStatus // Pass through updated mood status
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