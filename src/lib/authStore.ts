// lib/authStore.ts
import { create } from "zustand";

interface AuthState {
  user: { id: string; email: string } | null;
  token: string | null;
  login: (user: any, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  login: (user, token) => {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("user", user)
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem("auth_token");
    set({ user: null, token: null });
  },
}));
