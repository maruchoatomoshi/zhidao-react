// src/hooks/useTelegram.js
import { create } from 'zustand';

export const useTelegram = create((set, get) => ({
  tg: null,
  user: null,
  userId: null,
  themeParams: {},

  initTelegram: () => {
    console.log('[useTelegram] Инициализация...');
    const telegram = window.Telegram?.WebApp;

    if (telegram) {
      console.log('[useTelegram] Запущено внутри Telegram');
      telegram.expand();
      telegram.ready();

      set({
        tg: telegram,
        user: telegram.initDataUnsafe?.user || null,
        userId: telegram.initDataUnsafe?.user?.id?.toString() || null,
        themeParams: telegram.themeParams || {},
      });
    } else {
      console.warn('[useTelegram] Telegram WebApp not found. Running in browser mode.');
      const testUser = {
        id: 389741116,
        first_name: 'Mark',
        username: 'christianpastor',
        last_name: '',
      };
      console.log('[useTelegram] Используем тестового пользователя:', testUser);
      set({
        user: testUser,
        userId: testUser.id.toString(),
      });
    }
  },

  hapticFeedback: (type = 'medium') => {
    const telegram = window.Telegram?.WebApp;
    if (telegram?.HapticFeedback) {
      telegram.HapticFeedback.impactOccurred(type);
    }
  },

  showPopup: (params, callback) => {
    const telegram = window.Telegram?.WebApp;
    if (telegram?.showPopup) {
      telegram.showPopup(params, callback);
    } else {
      alert(params.message);
      if (callback) callback('ok');
    }
  },

  closeApp: () => {
    const telegram = window.Telegram?.WebApp;
    if (telegram?.close) telegram.close();
  },
}));