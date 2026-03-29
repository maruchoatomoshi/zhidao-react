// src/pages/HomePage.jsx
import React, { useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import { useTelegram } from '../hooks/useTelegram';
import { IconUser, IconStar, IconShieldCheck, IconLock, IconServer, IconActivity } from '@tabler/icons-react';

const HomePage = () => {
  const { userId, hapticFeedback } = useTelegram();
  const { user, points, implants, cards, theme, isLoading, error, fetchProfile } = useStore();

  useEffect(() => {
    if (userId && !user) {
      fetchProfile(userId);
    }
  }, [userId, user, fetchProfile]);

  useEffect(() => {
    if (!isLoading && user) {
      hapticFeedback('light');
    }
  }, [isLoading, user, hapticFeedback]);

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="loading-spinner">
          <div className="dragon-loader"></div>
          <p>Загрузка протокола...</p>
          <p className="cn-text">正在加载...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-box">
          <h3>⚠️ Ошибка соединения</h3>
          <p>{error}</p>
          <button onClick={() => userId && fetchProfile(userId)}>Повторить</button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-container">
        <p>Нет данных пользователя.</p>
      </div>
    );
  }

  return (
    <div className="page-container home-page">
      {/* Логотип и заголовок */}
      <div className="header-section">
        <div className="logo-container">
          <div className="dragon-logo">
            <div className="dragon-ring"></div>
            <div className="dragon-head">🐉</div>
            <div className="dragon-ring dragon-ring-outer"></div>
          </div>
          <h1 className="protocol-title">ZHIDAO</h1>
          <p className="protocol-subtitle">ADVANCED COGNITIVE SOLUTIONS</p>
        </div>
        <p className="chinese-slogan">智能电子解决方案</p>
        
        <div className="protocol-badge">
          <span className="badge-icon">🔴</span>
          PROTOCOL v1.4 // ACTIVE
          <span className="badge-icon">🔴</span>
        </div>
      </div>

      {/* Карточки с баллами и статусом */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-label">信用</div>
          <div className="stat-value">
            <span className="points-number">{points}</span>
            <span className="points-label">// кредиты</span>
            <IconStar size={16} className="star-icon" />
          </div>
        </div>
        
        <div className="stat-card secondary">
          <div className="stat-label">状态</div>
          <div className="stat-value status-active">
            <span className="status-dot"></span>
            АКТИВЕН
          </div>
          <div className="stat-subvalue">{points} <IconStar size={12} /></div>
        </div>
      </div>

      {/* Секция нейросети */}
      <div className="network-section">
        <div className="section-divider">
          <span className="divider-icon">🔴</span>
          网络链接 нейролинк
          <span className="divider-icon">🔴</span>
        </div>

        <div className="network-card">
          <div className="network-info">
            <div className="network-username">{user.marzban_username || 'hk_mark'}</div>
            <div className="network-details">
              HK NODE // 1.81 GB
            </div>
            <div className="traffic-bar">
              <div className="traffic-fill" style={{ width: '45%' }}></div>
            </div>
            <div className="traffic-label">
              ТРАФИК <span className="traffic-value">1.81 GB</span>
            </div>
          </div>
          
          <div className="network-actions">
            <button className="btn-config">
              获取<br/>КОНФИГ
            </button>
            <button className="btn-help">?</button>
          </div>
        </div>
      </div>

      {/* Кнопка связи с админом */}
      <div className="admin-contact">
        <button className="btn-admin">
          [ 联系管理员 // НАПИСАТЬ АДМИНИСТРАТОРУ ]
        </button>
      </div>

      {/* Секция имплантов */}
      <div className="implants-section">
        <h3 className="section-title">
          МОИ ИМПЛАНТЫ
          <span className="cn-subtitle">我的植入物</span>
        </h3>
        
        {implants && implants.length > 0 ? (
          <div className="items-grid">
            {implants.map((item, index) => (
              <div key={index} className="item-card">
                <div className="item-name">{item.implant_id}</div>
                <div className="item-durability">
                  Прочность: {item.durability}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <IconLock size={24} />
            <p>Пока ничего нет</p>
            <span className="hint">Открывай кейсы или совершай молитвы!</span>
          </div>
        )}
      </div>

      {/* Фоновый декор */}
      <div className="bg-decoration">道</div>
    </div>
  );
};

export default HomePage;