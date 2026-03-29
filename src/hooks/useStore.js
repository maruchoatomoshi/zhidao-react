// src/hooks/useStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { userApi, settingsApi } from '../api/client';

export const useStore = create(
  persist(
    (set) => ({
      user: null,
      points: 0,
      implants: [],
      cards: [],
      inventory: [],
      theme: 'netwatch-dark',
      isLoading: true,
      error: null,
      blackWall: false,

      fetchProfile: async (telegramId) => {
        if (!telegramId) return;
        set({ isLoading: true, error: null });
        try {
          const profile = await userApi.getProfile(telegramId);
          const settings = await settingsApi.getGlobalSettings();
          set({
            user: profile,
            points: profile.points || 0,
            implants: profile.implants || [],
            cards: profile.cards || [],
            blackWall: settings.blackwall || false,
            isLoading: false,
          });
        } catch (err) {
          set({ error: err.message, isLoading: false });
        }
      },

      updatePoints: (newPoints) => set({ points: newPoints }),
      setTheme: (newTheme) => set({ theme: newTheme }),
      reset: () => set({
        user: null,
        points: 0,
        implants: [],
        cards: [],
        inventory: [],
        theme: 'netwatch-dark',
        isLoading: true,
        error: null,
        blackWall: false,
      }),
    }),
    {
      name: 'zhidao-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);