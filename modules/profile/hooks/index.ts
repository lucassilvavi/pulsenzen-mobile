import { useEffect, useState } from 'react';
import { ProfileService } from '../services/ProfileService';
import { Achievement, UserProfile, UserStats } from '../types';

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const userProfile = await ProfileService.getUserProfile();
      setProfile(userProfile);
    } catch (err) {
      setError('Erro ao carregar perfil do usuário');
      console.error('Error loading user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!profile) return false;
      const updatedProfile = { ...profile, ...updates };
      const success = await ProfileService.saveUserProfile(updatedProfile);
      if (success) {
        setProfile(updatedProfile);
      }
      return success;
    } catch (err) {
      setError('Erro ao atualizar perfil');
      console.error('Error updating profile:', err);
      return false;
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    reload: loadProfile,
  };
};

export const useUserStats = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const userStats = await ProfileService.getUserStats();
      setStats(userStats);
    } catch (err) {
      setError('Erro ao carregar estatísticas');
      console.error('Error loading user stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const incrementStats = async (increments: Partial<UserStats>) => {
    try {
      const success = await ProfileService.incrementUserStats(increments);
      if (success) {
        await loadStats(); // Reload to get updated stats
      }
      return success;
    } catch (err) {
      setError('Erro ao atualizar estatísticas');
      console.error('Error incrementing stats:', err);
      return false;
    }
  };

  return {
    stats,
    loading,
    error,
    incrementStats,
    reload: loadStats,
  };
};

export const useUserAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      setError(null);
      const userAchievements = await ProfileService.getUserAchievements();
      setAchievements(userAchievements);
    } catch (err) {
      setError('Erro ao carregar conquistas');
      console.error('Error loading achievements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAchievements();
  }, []);

  return {
    achievements,
    loading,
    error,
    reload: loadAchievements,
  };
};
