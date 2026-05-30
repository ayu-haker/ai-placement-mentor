import { create } from "zustand";
import { api } from "@/lib/api";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  init: async () => {
    const token = api.getToken();
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      const res: any = await api.auth.getProfile();
      set({ user: res.user, isAuthenticated: true, isLoading: false });
    } catch {
      api.clearToken();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const res: any = await api.auth.login({ email, password });
      api.setToken(res.token);
      set({
        user: res.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({ isLoading: false, error: error.message || "Login failed" });
      throw error;
    }
  },

  register: async (email: string, password: string, name: string) => {
    set({ isLoading: true, error: null });
    try {
      const res: any = await api.auth.register({ email, password, name });
      api.setToken(res.token);
      set({
        user: res.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({ isLoading: false, error: error.message || "Registration failed" });
      throw error;
    }
  },

  logout: async () => {
    api.clearToken();
    set({ user: null, isAuthenticated: false });
  },

  updateUserProfile: async (data: Partial<User>) => {
    try {
      const res: any = await api.auth.updateProfile(data);
      set({ user: res.user });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
