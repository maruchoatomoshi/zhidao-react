// src/hooks/useStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { userApi, settingsApi } from '../api/client';

const initialState = {
  user: null,
  points: 0,
  implants: [],
  cards: [],
  inventory: [],
  theme: 'netwatch-dark',
  isLoading: true,
  error: null,
  blackWall: false,
};

export const useStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      fetchProfile: async (telegramId) => {
        if (!telegramId) {
          console.log('[useStore] Нет telegramId');
          return;
        }
        set({ isLoading: true, error: null });
        try {
          console.log('[useStore] Запрос профиля для:', telegramId);
          const profile = await userApi.getProfile(telegramId);
          const settings = await settingsApi.getGlobalSettings();
          
          set({
            user: profile,
            points: profile.points,
            implants: profile.implants || [],
            cards: profile.cards || [],
            blackWall: settings.blackwall || false,
            isLoading: false,
          });
          console.log('[useStore] Профиль загружен:', profile);
        } catch (err) {
          console.error('[useStore] Ошибка:', err);
          set({ error: err.message, isLoading: false });
        }
      },

      updatePoints: (newPoints) => set({ points: newPoints }),
      setTheme: (newTheme) => set({ theme: newTheme }),
      reset: () => set(initialState),
    }),
    {
      name: 'zhidao-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);