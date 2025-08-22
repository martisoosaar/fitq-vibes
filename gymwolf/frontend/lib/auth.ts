import api from './api';
import { create } from 'zustand';

interface User {
  id: number;
  name: string;
  email: string;
  is_admin?: boolean;
  profile?: {
    bio: string;
    avatar_url: string | null;
    height_cm: number | null;
    weight_kg: number | null;
    unit_system: 'metric' | 'imperial';
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
  refreshUser: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { user, access_token } = response.data;
    
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(user));
    
    set({ user, token: access_token, isLoading: false });
  },

  register: async (name: string, email: string, password: string) => {
    const response = await api.post('/auth/register', {
      name,
      email,
      password,
      password_confirmation: password,
    });
    const { user, access_token } = response.data;
    
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(user));
    
    set({ user, token: access_token, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
    window.location.href = '/login';
  },

  checkAuth: () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, token, isLoading: false });
      } catch {
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },

  refreshUser: async () => {
    try {
      const response = await api.get('/user');
      const user = response.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      set({ user });
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  },

  setUser: (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token: localStorage.getItem('token'), isLoading: false });
  },
}));