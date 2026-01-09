import api from './api';
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types/auth.types';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  async register(credentials: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', credentials);
    return response.data;
  },

  async refresh(): Promise<AuthResponse> {
    // Refresh token is sent automatically via HTTP-only cookie
    const response = await api.post<AuthResponse>('/auth/refresh', {});
    return response.data;
  },

  async me(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  async logout(): Promise<void> {
    // Refresh token in cookie will be sent automatically and cleared by backend
    await api.post('/auth/logout', {});
    localStorage.removeItem('token');
  },
};
