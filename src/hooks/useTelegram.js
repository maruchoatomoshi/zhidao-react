// src/hooks/useTelegram.js
import { useEffect, useState } from 'react';

export const useTelegram = () => {
  const [tg, setTg] = useState(null);
  const [user, setUser] = useState(null);
  const [themeParams, setThemeParams] = useState({});

  useEffect(() => {
    console.log('[useTelegram] Инициализация...');
    
    // Безопасное получение объекта Telegram WebApp
    const telegram = window.Telegram?.WebApp;
    
    if (telegram) {
      console.log('[useTelegram] Запущено внутри Telegram');
      setTg(telegram);
      
      // Разворачиваем приложение на весь экран
      telegram.expand(); 
      
      // Получаем данные пользователя
      if (telegram.initDataUnsafe?.user) {
        console.log('[useTelegram] User из Telegram:', telegram.initDataUnsafe.user);
        setUser(telegram.initDataUnsafe.user);
      }

      // Получаем цветовую схему от Телеграма
      setThemeParams(telegram.themeParams);

      // Сообщаем Телеграму, что приложение готово
      telegram.ready();
    } else {
      console.warn('[useTelegram] Telegram WebApp not found. Running in browser mode.');
      // Тестовый пользователь для разработки в браузере
      const testUser = { 
        id: 389741116, 
        first_name: 'Mark', 
        username: 'christianpastor',
        last_name: ''
      };
      console.log('[useTelegram] Используем тестового пользователя:', testUser);
      setUser(testUser);
    }
  }, []);

  // Функция для тактильной отдачи (вибрации)
  const hapticFeedback = (type = 'medium') => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred(type);
    }
  };

  // Функция для показа нативного попапа
  const showPopup = (params) => {
    if (tg?.showPopup) {
      tg.showPopup(params);
    } else {
      alert(params.message);
    }
  };

  return {
    tg,
    user,
    userId: user?.id?.toString(),
    themeParams,
    hapticFeedback,
    showPopup,
    isDark: themeParams.bg_color && parseInt(themeParams.bg_color.replace('#', ''), 16) < 0xffffff,
  };
};