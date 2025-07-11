import AuthService, { User } from '@/services/authService';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
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
  markOnboardingComplete: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const isAuth = await AuthService.isAuthenticated();
      
      if (isAuth) {
        const currentUser = await AuthService.getCurrentUser();
        setUser(currentUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Check auth status error:', error);
      setUser(null);
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
    } catch (error) {
      console.error('Logout error:', error);
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
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    checkAuthStatus,
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
