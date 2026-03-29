// src/pages/LeaderboardPage.jsx
import React, { useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import { userApi } from '../api/client';
import { IconTrophy, IconCrown, IconStar } from '@tabler/icons-react';

const LeaderboardPage = () => {
  const { theme } = useStore();
  const [leaderboard, setLeaderboard] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        const data = await userApi.getLeaderboard();
        setLeaderboard(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Загрузка рейтинга...</p>
          <p className="cn-text">正在加载排名...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-box">
          <h3>⚠️ Ошибка</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container leaderboard-page">
      <h2 className="section-title">
        🏆 РЕЙТИНГ
        <span className="cn-subtitle">排名 pái míng</span>
      </h2>

      <div className="leaderboard-list">
        {leaderboard.map((player, index) => (
          <div 
            key={player.telegram_id} 
            className={`leaderboard-item ${index < 3 ? 'top-three' : ''} ${player.implant === 'implant_red_dragon' ? 'has-red-dragon' : ''}`}
          >
            <div className="rank">
              {index === 0 && <IconCrown size={20} className="crown-icon" />}
              {index < 3 ? `#${index + 1}` : `#${index + 1}`}
            </div>
            
            <div className="player-info">
              <span className={`player-name ${player.implant === 'implant_red_dragon' ? 'red-name' : ''}`}>
                {player.full_name}
                {player.has_title && <span className="title-badge">👑</span>}
              </span>
              {player.implant && (
                <span className="implant-badge">
                  {player.implant === 'implant_red_dragon' && '🐉'}
                  {player.implant === 'implant_guanxi' && '🤝'}
                  {player.implant === 'implant_terracota' && '🗿'}
                </span>
              )}
            </div>
            
            <div className="player-points">
              <IconStar size={16} className="star-icon" />
              <span>{player.points}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-decoration">排名</div>
    </div>
  );
};

export default LeaderboardPage;