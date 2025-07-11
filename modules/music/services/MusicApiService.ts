/**
 * Music API Service
 * Serviço para comunicação com a API de música
 */

import {
    MusicSearchParams
} from '../models/ApiModels';
import { MusicCategory, MusicTrack, Playlist } from '../types';
import { mockCategories, mockPlaylists, mockTracks } from './MusicMock';

class MusicApiService {
  private baseUrl: string = 'https://api.pulsezen.com/v1/music'; // URL da API
  private apiKey: string = process.env.EXPO_PUBLIC_API_KEY || '';

  private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      // Em caso de erro, usar dados mock como fallback
      throw error;
    }
  }

  // Buscar categorias
  async getCategories(): Promise<MusicCategory[]> {
    try {
      // TODO: Quando API estiver pronta, descomentar:
      // const response = await this.makeRequest<ApiCategoriesResponse>('/categories');
      // return response.categories.map(apiCategory => {
      //   const tracks = this.getTracksByCategory(apiCategory.id);
      //   return MusicModelMapper.apiCategoryToMusicCategory(apiCategory, tracks);
      // });

      // Por enquanto, usar mock com delay simulado
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockCategories;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Fallback para dados mock
      return mockCategories;
    }
  }

  // Buscar tracks por categoria
  async getTracksByCategory(categoryId: string): Promise<MusicTrack[]> {
    try {
      // TODO: Quando API estiver pronta:
      // const response = await this.makeRequest<ApiTracksResponse>(`/tracks?categoryId=${categoryId}`);
      // return response.tracks.map(apiTrack => 
      //   MusicModelMapper.apiTrackToMusicTrack(apiTrack, this.getCategoryTitle(categoryId))
      // );

      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 150));
      return mockTracks.filter(track => track.category === categoryId);
    } catch (error) {
      console.error('Failed to fetch tracks:', error);
      return mockTracks.filter(track => track.category === categoryId);
    }
  }

  // Buscar track específica
  async getTrack(trackId: string): Promise<MusicTrack | null> {
    try {
      // TODO: API call
      // const response = await this.makeRequest<{track: ApiMusicTrack}>(`/tracks/${trackId}`);
      // return MusicModelMapper.apiTrackToMusicTrack(response.track, categoryTitle);

      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 100));
      return mockTracks.find(track => track.id === trackId) || null;
    } catch (error) {
      console.error('Failed to fetch track:', error);
      return mockTracks.find(track => track.id === trackId) || null;
    }
  }

  // Buscar playlists
  async getPlaylists(): Promise<Playlist[]> {
    try {
      // TODO: API call
      // const response = await this.makeRequest<ApiPlaylistsResponse>('/playlists');
      // return response.playlists.map(apiPlaylist => {
      //   const tracks = this.getPlaylistTracks(apiPlaylist.trackIds);
      //   return MusicModelMapper.apiPlaylistToPlaylist(apiPlaylist, tracks);
      // });

      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockPlaylists;
    } catch (error) {
      console.error('Failed to fetch playlists:', error);
      return mockPlaylists;
    }
  }

  // Buscar playlist específica
  async getPlaylist(playlistId: string): Promise<Playlist | null> {
    try {
      // TODO: API call
      // const response = await this.makeRequest<{playlist: ApiPlaylist}>(`/playlists/${playlistId}`);
      // const tracks = await this.getPlaylistTracks(response.playlist.trackIds);
      // return MusicModelMapper.apiPlaylistToPlaylist(response.playlist, tracks);

      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockPlaylists.find(playlist => playlist.id === playlistId) || null;
    } catch (error) {
      console.error('Failed to fetch playlist:', error);
      return mockPlaylists.find(playlist => playlist.id === playlistId) || null;
    }
  }

  // Buscar tracks com parâmetros de busca
  async searchTracks(params: MusicSearchParams): Promise<{tracks: MusicTrack[], hasMore: boolean}> {
    try {
      // TODO: API call
      // const queryParams = new URLSearchParams();
      // if (params.query) queryParams.append('q', params.query);
      // if (params.categoryId) queryParams.append('categoryId', params.categoryId);
      // if (params.page) queryParams.append('page', params.page.toString());
      // if (params.limit) queryParams.append('limit', params.limit.toString());
      // 
      // const response = await this.makeRequest<ApiTracksResponse>(`/tracks/search?${queryParams}`);
      // return {
      //   tracks: response.tracks.map(apiTrack => 
      //     MusicModelMapper.apiTrackToMusicTrack(apiTrack, this.getCategoryTitle(apiTrack.categoryId))
      //   ),
      //   hasMore: response.hasMore
      // };

      // Mock implementation with search logic
      await new Promise(resolve => setTimeout(resolve, 250));
      
      let filteredTracks = [...mockTracks];
      
      if (params.query) {
        const query = params.query.toLowerCase();
        filteredTracks = filteredTracks.filter(track => 
          track.title.toLowerCase().includes(query) ||
          track.artist?.toLowerCase().includes(query) ||
          track.description?.toLowerCase().includes(query)
        );
      }
      
      if (params.categoryId) {
        filteredTracks = filteredTracks.filter(track => track.category === params.categoryId);
      }
      
      // Pagination mock
      const page = params.page || 1;
      const limit = params.limit || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      return {
        tracks: filteredTracks.slice(startIndex, endIndex),
        hasMore: endIndex < filteredTracks.length
      };
    } catch (error) {
      console.error('Failed to search tracks:', error);
      return { tracks: [], hasMore: false };
    }
  }

  // Criar playlist (quando implementarmos funcionalidade de usuário)
  async createPlaylist(name: string, description?: string): Promise<Playlist | null> {
    try {
      // TODO: API call
      // const body = { name, description };
      // const response = await this.makeRequest<{playlist: ApiPlaylist}>('/playlists', {
      //   method: 'POST',
      //   body: JSON.stringify(body)
      // });
      // return MusicModelMapper.apiPlaylistToPlaylist(response.playlist, []);

      // Mock implementation - não implementado ainda
      throw new Error('Playlist creation not implemented yet');
    } catch (error) {
      console.error('Failed to create playlist:', error);
      return null;
    }
  }

  // Adicionar track à playlist
  async addTrackToPlaylist(playlistId: string, trackId: string): Promise<boolean> {
    try {
      // TODO: API call
      // await this.makeRequest(`/playlists/${playlistId}/tracks`, {
      //   method: 'POST',
      //   body: JSON.stringify({ trackId })
      // });
      // return true;

      // Mock implementation - não implementado ainda
      throw new Error('Adding tracks to playlist not implemented yet');
    } catch (error) {
      console.error('Failed to add track to playlist:', error);
      return false;
    }
  }

  // Helper para obter título da categoria (seria parte da cache local)
  private getCategoryTitle(categoryId: string): string {
    const category = mockCategories.find(cat => cat.id === categoryId);
    return category?.title || 'Música';
  }
}

// Singleton instance
export default new MusicApiService();
