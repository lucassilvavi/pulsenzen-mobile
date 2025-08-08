import { useMemoizedContextValue, useStableCallback } from '@/hooks/usePerformanceOptimization';
import AuthService, { OnboardingData, User, UserProfile } from '@/services/authService';
import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; isInformational?: boolean }>;
  register: (userData: {
    email: string;
    password: string;
    password_confirmation: string;
    firstName: string;
    lastName: string;
  }) => Promise<{ success: boolean; message: string; isInformational?: boolean }>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  completeOnboarding: (onboardingData: OnboardingData) => Promise<{ success: boolean; message: string }>;
  updateProfile: (profileData: any) => Promise<{ success: boolean; message: string }>;
  markOnboardingComplete: () => Promise<void>;
  setOnAuthStateChangeCallback?: (callback: (() => void) | undefined) => void; // Function to set callback
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [onAuthStateChange, setOnAuthStateChange] = useState<(() => void) | undefined>();

  const isAuthenticated = useMemo(() => !!user, [user]);

  const checkAuthStatus = useStableCallback(async () => {
    try {
      setIsLoading(true);
      console.log('AuthContext: checkAuthStatus iniciado');
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
        console.log('AuthContext: user set to null, should trigger navigation');
      }
    } catch (error) {
      console.error('Check auth status error:', error);
      setUser(null);
      setUserProfile(null);
    } finally {
      setIsLoading(false);
      console.log('AuthContext: checkAuthStatus finalizado, isLoading false');
    }
  });

  const login = useStableCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const result = await AuthService.login({ email, password });
      
      if (result.success && result.data) {
        setUser(result.data.user);
        
        // Notify navigation hook to refresh onboarding status
        if (onAuthStateChange) {
          onAuthStateChange();
        }
        
        return { success: true, message: 'Login realizado com sucesso!' };
      } else {
        return { 
          success: false, 
          message: result.message || 'Erro no login',
          isInformational: result.isInformational
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Erro de conexão' };
    } finally {
      setIsLoading(false);
    }
  });

  const register = useStableCallback(async (userData: {
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
        return { 
          success: false, 
          message: result.message || 'Erro no registro',
          isInformational: result.isInformational
        };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: 'Erro de conexão' };
    } finally {
      setIsLoading(false);
    }
  });

  const logout = useStableCallback(async () => {
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
  });

  const refreshProfile = useStableCallback(async () => {
    try {
      if (user) {
        const profile = await AuthService.getProfile();
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Refresh profile error:', error);
    }
  });

  const completeOnboarding = useStableCallback(async (onboardingData: OnboardingData) => {
    try {
      setIsLoading(true);
      const result = await AuthService.completeOnboarding(onboardingData);
      
      if (result.success && result.data) {
        setUserProfile(result.data);
        // Update user to mark onboarding as complete
        if (user) {
          setUser({ ...user, onboardingComplete: true });
        }
        
        // Trigger navigation re-evaluation
        if (onAuthStateChange) {
          onAuthStateChange();
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
  });

  const updateProfile = useStableCallback(async (profileData: any) => {
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
  });

  const markOnboardingComplete = useStableCallback(async () => {
    try {
      if (user) {
        await AuthService.markOnboardingComplete(user.id);
        setUser({ ...user, onboardingComplete: true });
        
        // Notify navigation hook to refresh onboarding status
        if (onAuthStateChange) {
          onAuthStateChange();
        }
      }
    } catch (error) {
      console.error('Mark onboarding complete error:', error);
    }
  });

  // useEffect(() => {
  //   checkAuthStatus();
  // }, [checkAuthStatus]);

  // Optimize context value with memoization
  const contextValue = useMemoizedContextValue({
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
    setOnAuthStateChangeCallback: setOnAuthStateChange,
  });

  return (
    <AuthContext.Provider value={contextValue}>
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
