import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@/services/auth.service';
import type { User, LoginRequest, RegisterRequest } from '@/types/auth.types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (credentials: RegisterRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');

      if (token) {
        try {
          const userData = await authService.me();
          setUser(userData);
        } catch (error) {
          // Try to refresh token using HTTP-only cookie
          try {
            const { user: userData, token: newToken } = await authService.refresh();
            localStorage.setItem('token', newToken);
            setUser(userData);
          } catch (refreshError) {
            // Invalid refresh token, clear everything
            localStorage.removeItem('token');
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    const { user: userData, token } = await authService.login(credentials);
    // Refresh token is stored in HTTP-only cookie by backend
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const register = async (credentials: RegisterRequest) => {
    const { user: userData, token } = await authService.register(credentials);
    // Refresh token is stored in HTTP-only cookie by backend
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Ignore logout errors
    }
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
