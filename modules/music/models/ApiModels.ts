/**
 * Music API Models
 * Models para integração com API externa
 */

export interface ApiMusicTrack {
  id: string;
  title: string;
  artist?: string;
  categoryId: string;
  duration: number; // em segundos
  audioUrl: string; // URL do arquivo de áudio
  imageUrl?: string; // URL da capa/imagem
  description?: string;
  metadata?: {
    genre?: string;
    mood?: string;
    tags?: string[];
    bpm?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiMusicCategory {
  id: string;
  title: string;
  description: string;
  iconName: string; // Nome do ícone para consistência
  colorCode: string; // Código de cor hex
  sortOrder?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiPlaylist {
  id: string;
  name: string;
  description?: string;
  trackIds: string[]; // IDs das tracks
  userId?: string; // Para playlists personalizadas
  isPublic: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Responses da API
export interface ApiTracksResponse {
  tracks: ApiMusicTrack[];
  totalCount: number;
  hasMore: boolean;
  nextPage?: number;
}

export interface ApiCategoriesResponse {
  categories: ApiMusicCategory[];
}

export interface ApiPlaylistsResponse {
  playlists: ApiPlaylist[];
  totalCount: number;
  hasMore: boolean;
  nextPage?: number;
}

// Filtros e parâmetros de busca
export interface MusicSearchParams {
  query?: string;
  categoryId?: string;
  mood?: string;
  duration?: {
    min?: number;
    max?: number;
  };
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'duration' | 'createdAt' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

// Mapeadores para converter API models para tipos internos
export class MusicModelMapper {
  static apiTrackToMusicTrack(apiTrack: ApiMusicTrack, categoryTitle: string): import('../types').MusicTrack {
    return {
      id: apiTrack.id,
      title: apiTrack.title,
      artist: apiTrack.artist || 'PulseZen Sounds',
      category: apiTrack.categoryId,
      categoryTitle,
      duration: apiTrack.duration,
      durationFormatted: this.formatDuration(apiTrack.duration),
      uri: apiTrack.audioUrl as any, // Em produção, seria a URL
      icon: this.getIconForCategory(apiTrack.categoryId),
      description: apiTrack.description
    };
  }

  static apiCategoryToMusicCategory(apiCategory: ApiMusicCategory, tracks: import('../types').MusicTrack[]): import('../types').MusicCategory {
    return {
      id: apiCategory.id,
      title: apiCategory.title,
      description: apiCategory.description,
      icon: this.getIconForCategory(apiCategory.id),
      color: apiCategory.colorCode,
      tracks
    };
  }

  static apiPlaylistToPlaylist(apiPlaylist: ApiPlaylist, tracks: import('../types').MusicTrack[]): import('../types').Playlist {
    return {
      id: apiPlaylist.id,
      name: apiPlaylist.name,
      description: apiPlaylist.description,
      tracks,
      createdAt: new Date(apiPlaylist.createdAt),
      updatedAt: new Date(apiPlaylist.updatedAt)
    };
  }

  private static formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  private static getIconForCategory(categoryId: string): string {
    const iconMap: Record<string, string> = {
      'stories': '📚',
      'sounds': '🎵',
      'meditation': '🧘',
      'nature': '🌿',
      'sleep': '😴',
      'focus': '🎯'
    };
    return iconMap[categoryId] || '🎵';
  }
}
