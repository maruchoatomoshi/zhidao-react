// src/pages/HomePage.jsx
import React, { useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import { useTelegram } from '../hooks/useTelegram';
import { Link } from 'react-router-dom';
import { IconStar, IconLock, IconRefresh } from '@tabler/icons-react';

const IMG = {
  logo: 'https://raw.githubusercontent.com/maruchoatomoshi/zhidao-protocol/main/logo.png',
  implantGuanxi: 'https://raw.githubusercontent.com/maruchoatomoshi/zhidao-protocol/main/guanxi_implant.png',
  implantTerracota: 'https://raw.githubusercontent.com/maruchoatomoshi/zhidao-protocol/main/armor.png',
  implantRedDragon: 'https://raw.githubusercontent.com/maruchoatomoshi/zhidao-protocol/main/honglong_implant.png',
};

const HomePage = () => {
  const { userId, hapticFeedback } = useTelegram();
  const { user, points, implants, isLoading, error, fetchProfile } = useStore();

  useEffect(() => {
    if (userId && !user) fetchProfile(userId);
  }, [userId, user, fetchProfile]);

  useEffect(() => {
    if (!isLoading && user) hapticFeedback('light');
  }, [isLoading, user, hapticFeedback]);

  if (isLoading) {
    return (
      <div className="page-container home-page">
        <div className="header-section">
          <img src={IMG.logo} alt="ZHIDAO" className="dragon-logo" />
        </div>
        <div className="loading-spinner">
          <p>Загрузка...</p>
          <p className="cn-text">正在加载...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container home-page">
        <div className="error-box">
          <h3>⚠️ Ошибка</h3>
          <p>{error}</p>
          <button onClick={() => userId && fetchProfile(userId)}>Повторить</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container home-page">
      {/* HEADER */}
      <div className="header-section">
        <img src={IMG.logo} alt="ZHIDAO" className="dragon-logo" />
        <h1 className="protocol-title">ZHIDAO</h1>
        <p className="protocol-subtitle">ADVANCED COGNITIVE SOLUTIONS</p>
        <p className="chinese-slogan">智能电子解决方案</p>
        <div className="protocol-badge">
          <span>🏮</span> PROTOCOL v1.4 // ACTIVE <span>🏮</span>
        </div>
      </div>

      {/* STATS */}
      <div className="stats-section">
        <div className="stat-row">
          <span className="stat-label">信用</span>
          <span className="stat-value">
            {points} <IconStar size={12} className="star-icon" /> // кредиты
          </span>
        </div>
        <div className="stat-row">
          <span className="stat-label">状态</span>
          <span className="stat-value status-active">
            ● АКТИВЕН
          </span>
        </div>
      </div>

      {/* NETWORK */}
      <div className="network-section">
        <div className="section-divider">
          <span>🏮</span> 网络链接 нейролинк <span>🏮</span>
        </div>
        <div className="network-card">
          <div className="network-info">
            <div className="network-username">{user?.marzban_username || 'hk_mark'}</div>
            <div className="network-details">HK NODE // 1.81 GB</div>
            <div className="traffic-bar">
              <div className="traffic-fill" style={{ width: '45%' }}></div>
            </div>
            <div className="traffic-label">
              <span>ТРАФИК 1.81 GB</span>
            </div>
          </div>
          <div className="network-actions">
            <button className="btn-config">获取<br/>КОНФИГ</button>
            <button className="btn-help">?</button>
          </div>
        </div>
      </div>

      {/* ADMIN BUTTON */}
      <div className="admin-contact">
        <button className="btn-admin">
          [ 联系管理员 // НАПИСАТЬ АДМИНИСТРАТОРУ ]
        </button>
      </div>

      {/* IMPLANTS */}
      <div className="implants-section">
        <h3 className="section-title">
          ИМПЛАНТЫ <span className="cn-subtitle">我的植入物</span>
        </h3>
        {implants?.length > 0 ? (
          <div className="items-grid">
            {implants.map((item, i) => (
              <div key={i} className="item-card">
                <img
                  src={
                    item.implant_id === 'implant_guanxi' ? IMG.implantGuanxi :
                    item.implant_id === 'implant_terracota' ? IMG.implantTerracota :
                    item.implant_id === 'implant_red_dragon' ? IMG.implantRedDragon :
                    IMG.implantGuanxi
                  }
                  alt={item.implant_id}
                  className="item-image"
                />
                <div className="item-name">
                  {item.implant_id === 'implant_guanxi' && '关系 ГУАНЬСИ'}
                  {item.implant_id === 'implant_terracota' && '兵马俑 ТЕРРАКОТА'}
                  {item.implant_id === 'implant_red_dragon' && '红龙 КРАСНЫЙ ДРАКОН'}
                </div>
                <div className="item-durability">Прочность: {item.durability}/3</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <IconLock size={24} />
            <p>Импланты не установлены</p>
            <span className="hint">Открывай фиолетовые и чёрные кейсы!</span>
          </div>
        )}
      </div>

      {/* NAVIGATION */}
      <div className="bottom-nav">
        <Link to="/">主页</Link>
        <Link to="/leaderboard">排名</Link>
        <Link to="/schedule">日程</Link>
        <Link to="/shop">商店</Link>
        <Link to="/casino">箱子</Link>
        <Link to="/implants">植入物</Link>
        <Link to="/more">更多</Link>
      </div>

      {/* BG DECOR */}
      <div className="bg-decoration">道</div>
    </div>
  );
};

export default HomePage;