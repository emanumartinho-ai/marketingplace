import { create } from 'zustand';
import { setAuthTokenGetter } from '@workspace/api-client-react';

interface AuthState {
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ token: null });
  },
}));

// Configure the API client to use the token
setAuthTokenGetter(() => {
  return useAuthStore.getState().token;
});
