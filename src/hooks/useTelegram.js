// src/hooks/useTelegram.js
import { useEffect, useState, useCallback } from 'react';

export const useTelegram = () => {
  const [tg, setTg] = useState(null);
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);  // ← ← ← Отдельное состояние!
  const [themeParams, setThemeParams] = useState({});

  useEffect(() => {
    console.log('[useTelegram] Инициализация...');
    
    const telegram = window.Telegram?.WebApp;
    
    if (telegram) {
      console.log('[useTelegram] Запущено внутри Telegram');
      setTg(telegram);
      telegram.expand(); 
      
      if (telegram.initDataUnsafe?.user) {
        console.log('[useTelegram] User из Telegram:', telegram.initDataUnsafe.user);
        setUser(telegram.initDataUnsafe.user);
        setUserId(telegram.initDataUnsafe.user.id?.toString());  // ← ← ←
      }

      setThemeParams(telegram.themeParams);
      telegram.ready();
    } else {
      console.warn('[useTelegram] Telegram WebApp not found. Running in browser mode.');
      const testUser = { 
        id: 389741116, 
        first_name: 'Mark', 
        username: 'christianpastor',
        last_name: ''
      };
      console.log('[useTelegram] Используем тестового пользователя:', testUser);
      setUser(testUser);
      setUserId(testUser.id?.toString());  // ← ← ← Устанавливаем userId сразу!
    }
  }, []);

  const hapticFeedback = useCallback((type = 'medium') => {
    const telegram = window.Telegram?.WebApp;
    if (telegram?.HapticFeedback) {
      telegram.HapticFeedback.impactOccurred(type);
    }
  }, []);

  const showPopup = useCallback((params, callback) => {
    const telegram = window.Telegram?.WebApp;
    if (telegram?.showPopup) {
      telegram.showPopup(params, callback);
    } else {
      alert(params.message);
      if (callback) callback('ok');
    }
  }, []);

  const closeApp = useCallback(() => {
    const telegram = window.Telegram?.WebApp;
    if (telegram?.close) telegram.close();
  }, []);

  return {
    tg,
    user,
    userId,  // ← ← ← Теперь это отдельное состояние!
    themeParams,
    hapticFeedback,
    showPopup,
    closeApp,
    isDark: themeParams.bg_color && parseInt(themeParams.bg_color.replace('#', ''), 16) < 0xffffff,
  };
};