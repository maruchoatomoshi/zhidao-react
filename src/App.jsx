// src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useStore } from './hooks/useStore';
import { useTelegram } from './hooks/useTelegram';
import { IconHome, IconTrophy, IconCalendar, IconShoppingCart, IconCpu, IconDice } from '@tabler/icons-react';

import HomePage from './pages/HomePage';
import LeaderboardPage from './pages/LeaderboardPage';
import SchedulePage from './pages/SchedulePage';
import ShopPage from './pages/ShopPage';
import ImplantsPage from './pages/ImplantsPage';
import CasinoPage from './pages/CasinoPage';

const NavBar = () => {
  const location = useLocation();
  const { theme } = useStore();

  const navItems = [
    { path: '/', icon: IconHome, label: 'Главная' },
    { path: '/leaderboard', icon: IconTrophy, label: 'Рейтинг' },
    { path: '/schedule', icon: IconCalendar, label: 'Расписание' },
    { path: '/shop', icon: IconShoppingCart, label: 'Магазин' },
    { path: '/implants', icon: IconCpu, label: 'Импланты' },
    { path: '/casino', icon: IconDice, label: 'Казино' },
  ];

  return (
    <nav className={`nav-bar ${theme === 'genshin' ? 'nav-genshin' : 'nav-netwatch'}`}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link key={item.path} to={item.path} className={`nav-item ${isActive ? 'active' : ''}`}>
            <Icon size={20} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

function App() {
  const { initTelegram, userId } = useTelegram();
  const { fetchProfile } = useStore();

  // 1️⃣ Инициализация Telegram (один раз при монтировании)
  useEffect(() => {
    console.log('[App] initTelegram');
    initTelegram();
  }, []);

  // 2️⃣ Загрузка профиля (когда userId появится)
  useEffect(() => {
    console.log('[App] userId изменился:', userId);
    
    if (userId && typeof fetchProfile === 'function') {
      console.log('[App] Вызываем fetchProfile для:', userId);
      fetchProfile(userId);
    } else {
      console.warn('[App] Ждём userId или fetchProfile:', { userId, fetchProfile: typeof fetchProfile });
    }
  }, [userId]);  // ← ← ← Только userId!

  return (
    <Router basename="/zhidao-react">
      <div className="app">
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/implants" element={<ImplantsPage />} />
            <Route path="/casino" element={<CasinoPage />} />
          </Routes>
        </main>
        <NavBar />
      </div>
    </Router>
  );
}

export default App;