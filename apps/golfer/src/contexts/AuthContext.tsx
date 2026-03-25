/**
 * Auth Context for AK Golf Mobile App
 *
 * Handles authentication state with secure token storage
 * and automatic token refresh.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

// Types
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  playerId?: string;
  tenantId: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: '@ak_golf_access_token',
  REFRESH_TOKEN: '@ak_golf_refresh_token',
  USER: '@ak_golf_user',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Load stored auth on mount
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [accessToken, refreshToken, userJson] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER),
      ]);

      if (accessToken && userJson) {
        const user = JSON.parse(userJson);
        setState({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });

        // Set token in API client
        api.setAuthToken(accessToken);
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Failed to load stored auth:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.auth.login(email, password);
      const { accessToken, refreshToken, user } = response.data;

      // Store tokens and user
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
        AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)),
      ]);

      // Set token in API client
      api.setAuthToken(accessToken);

      setState({
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Innlogging feilet';
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      // Call logout API
      await api.auth.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear storage
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.USER),
      ]);

      // Clear API token
      api.setAuthToken(null);

      setState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const refreshTokens = useCallback(async () => {
    if (!state.refreshToken) return false;

    try {
      const response = await api.auth.refresh(state.refreshToken);
      const { accessToken, refreshToken: newRefreshToken } = response.data;

      // Store new tokens
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
        AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken),
      ]);

      // Update API client
      api.setAuthToken(accessToken);

      setState(prev => ({
        ...prev,
        accessToken,
        refreshToken: newRefreshToken,
      }));

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
      return false;
    }
  }, [state.refreshToken]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        refreshTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
