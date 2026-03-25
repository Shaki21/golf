import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, playersAPI, coachesAPI } from '../services/api';

// =============================================================================
// Types
// =============================================================================

export type UserRole = 'admin' | 'coach' | 'player' | 'parent';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId: string;
  playerId?: string;
  coachId?: string;
  profileImageUrl?: string;
  onboardingComplete?: boolean;
  sportId?: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: User;
}

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<AuthResult>;
  updateUserProfile: (updates: Partial<User>) => Promise<AuthResult>;
  isAuthenticated: boolean;
  isPlayer: boolean;
  isCoach: boolean;
  isAdmin: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName: string;
  role: UserRole;
}

interface AuthProviderProps {
  children: ReactNode;
}

interface AuthResponse {
  accessToken: string;
  user: User;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

// =============================================================================
// Context
// =============================================================================

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// =============================================================================
// Provider
// =============================================================================

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing token on mount
  useEffect(() => {
    const initAuth = async (): Promise<void> => {
      const token = localStorage.getItem('accessToken');
      const userData = localStorage.getItem('userData');

      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData) as User;
          setUser(parsedUser);
        } catch (err) {
          console.error('Failed to parse user data:', err);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('userData');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      setError(null);
      setLoading(true);

      // Use real API authentication for all users
      const response = await authAPI.login(email, password);
      // API returns { success: true, data: { accessToken, user, ... } }
      const { accessToken, user: userData } = response.data.data as AuthResponse;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('userData', JSON.stringify(userData));

      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.response?.data?.message || 'Login failed. Backend may not be running.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear local state regardless of API call success
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userData');
      setUser(null);
      setError(null);
    }
  };

  const register = async (userData: RegisterData): Promise<AuthResult> => {
    try {
      setError(null);
      setLoading(true);

      const response = await authAPI.register(userData);
      // API returns { success: true, data: { accessToken, user, ... } }
      const { accessToken, user: newUser } = response.data.data as AuthResponse;

      // Store token and user data
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('userData', JSON.stringify(newUser));

      setUser(newUser);
      return { success: true };
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (updates: Partial<User>): Promise<AuthResult> => {
    if (!user) return { success: false, error: 'No user logged in' };

    try {
      setError(null);

      // Update based on user role
      let response;
      if (user.role === 'player') {
        response = await playersAPI.update(user.id, updates);
      } else if (user.role === 'coach') {
        response = await coachesAPI.update(user.id, updates);
      } else {
        return { success: false, error: 'Profile update not supported for this role' };
      }

      const updatedUser = { ...user, ...response.data } as User;
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      setUser(updatedUser);

      return { success: true };
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.response?.data?.message || 'Update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const value: AuthContextValue = {
    user,
    loading,
    error,
    login,
    logout,
    register,
    updateUserProfile,
    isAuthenticated: !!user,
    isPlayer: user?.role === 'player',
    isCoach: user?.role === 'coach',
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
