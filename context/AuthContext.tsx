import AuthService, { OnboardingData, User, UserProfile } from '@/services/authService';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (userData: {
    email: string;
    password: string;
    password_confirmation: string;
    firstName: string;
    lastName: string;
  }) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  completeOnboarding: (onboardingData: OnboardingData) => Promise<{ success: boolean; message: string }>;
  updateProfile: (profileData: any) => Promise<{ success: boolean; message: string }>;
  markOnboardingComplete: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const isAuth = await AuthService.isAuthenticated();
      
      if (isAuth) {
        const currentUser = await AuthService.getCurrentUser();
        setUser(currentUser);
        
        // Also load user profile
        const profile = await AuthService.getProfile();
        setUserProfile(profile);
      } else {
        setUser(null);
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Check auth status error:', error);
      setUser(null);
      setUserProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const result = await AuthService.login({ email, password });
      
      if (result.success && result.data) {
        setUser(result.data.user);
        return { success: true, message: 'Login realizado com sucesso!' };
      } else {
        return { success: false, message: result.message || 'Erro no login' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Erro de conexão' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    password_confirmation: string;
    firstName: string;
    lastName: string;
  }) => {
    try {
      setIsLoading(true);
      const result = await AuthService.register(userData);
      
      if (result.success && result.data) {
        setUser(result.data.user);
        return { success: true, message: 'Conta criada com sucesso!' };
      } else {
        return { success: false, message: result.message || 'Erro no registro' };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: 'Erro de conexão' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await AuthService.logout();
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    try {
      if (user) {
        const profile = await AuthService.getProfile();
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Refresh profile error:', error);
    }
  };

  const completeOnboarding = async (onboardingData: OnboardingData) => {
    try {
      setIsLoading(true);
      const result = await AuthService.completeOnboarding(onboardingData);
      
      if (result.success && result.data) {
        setUserProfile(result.data);
        // Update user to mark onboarding as complete
        if (user) {
          setUser({ ...user, onboardingComplete: true });
        }
        return { success: true, message: 'Onboarding concluído com sucesso!' };
      } else {
        return { success: false, message: result.message || 'Erro ao concluir onboarding' };
      }
    } catch (error) {
      console.error('Complete onboarding error:', error);
      return { success: false, message: 'Erro de conexão' };
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData: any) => {
    try {
      setIsLoading(true);
      const result = await AuthService.updateProfile(profileData);
      
      if (result.success && result.data) {
        setUserProfile(result.data);
        return { success: true, message: 'Perfil atualizado com sucesso!' };
      } else {
        return { success: false, message: result.message || 'Erro ao atualizar perfil' };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, message: 'Erro de conexão' };
    } finally {
      setIsLoading(false);
    }
  };

  const markOnboardingComplete = async () => {
    try {
      if (user) {
        await AuthService.markOnboardingComplete(user.id);
        setUser({ ...user, onboardingComplete: true });
      }
    } catch (error) {
      console.error('Mark onboarding complete error:', error);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value = {
    user,
    userProfile,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    checkAuthStatus,
    refreshProfile,
    completeOnboarding,
    updateProfile,
    markOnboardingComplete,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
