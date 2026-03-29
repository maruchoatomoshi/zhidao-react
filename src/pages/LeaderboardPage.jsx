// src/pages/LeaderboardPage.jsx
import React, { useEffect, useState } from 'react';
import { useStore } from '../hooks/useStore';
import { useTelegram } from '../hooks/useTelegram';
import { userApi } from '../api/client';
import { IconStar, IconTrophy, IconRefresh } from '@tabler/icons-react';

// Получаем "главный" имплант игрока (API может вернуть implant или implants)
const getMainImplant = (player) => {
  if (player.implant) return player.implant;
  if (Array.isArray(player.implants) && player.implants.length > 0) {
    const ids = player.implants.map(i => i.implant_id || i);
    if (ids.includes('implant_red_dragon')) return 'implant_red_dragon';
    if (ids.includes('implant_guanxi')) return 'implant_guanxi';
    if (ids.includes('implant_terracota')) return 'implant_terracota';
    return ids[0];
  }
  return null;
};

const MEDAL = ['🥇', '🥈', '🥉'];

const IMPLANT_BADGES = {
  implant_red_dragon: { emoji: '🐉', label: '红龙' },
  implant_guanxi: { emoji: '🤝', label: '关系' },
  implant_terracota: { emoji: '🗿', label: '兵马俑' },
};

// Цветной ник в зависимости от импланта
const PlayerName = ({ player, large = false }) => {
  const implant = getMainImplant(player);
  let cls = large ? 'lb-name lb-name-large' : 'lb-name';
  if (implant === 'implant_red_dragon') cls += ' lb-name-red';
  else if (implant === 'implant_guanxi' || implant === 'implant_terracota') cls += ' lb-name-purple';

  return (
    <span className={cls}>
      {player.full_name}
      {player.has_title && <span className="lb-crown">👑</span>}
    </span>
  );
};

const ImplantBadge = ({ implant }) => {
  if (!implant || !IMPLANT_BADGES[implant]) return null;
  const { emoji, label } = IMPLANT_BADGES[implant];
  return <span className="lb-implant-badge" title={label}>{emoji} {label}</span>;
};

const LeaderboardPage = () => {
  const { userId } = useTelegram();
  const { user } = useStore();
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await userApi.getLeaderboard();
      setLeaderboard(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // Определяем позицию текущего пользователя
  const myTid = userId || user?.telegram_id?.toString();
  const myIndex = leaderboard.findIndex(p => p.telegram_id?.toString() === myTid);
  const myEntry = myIndex !== -1 ? leaderboard[myIndex] : null;

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="loading-spinner">
          <div className="dragon-loader"></div>
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
          <button onClick={fetchLeaderboard}>Повторить</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container leaderboard-page">

      {/* ЗАГОЛОВОК */}
      <div className="lb-header">
        <h2 className="section-title lb-title">
          <IconTrophy size={22} className="star-icon" />
          РЕЙТИНГ
          <span className="cn-subtitle">排名 pái míng</span>
        </h2>
        <button className="lb-refresh-btn" onClick={fetchLeaderboard} title="Обновить">
          <IconRefresh size={18} />
        </button>
      </div>

      {/* КАРТОЧКА МОЙ РАНГ */}
      {myEntry ? (
        <div className={`lb-my-rank ${getMainImplant(myEntry) === 'implant_red_dragon' ? 'lb-my-rank-red' : ''}`}>
          <div className="lb-my-rank-label">МОЙ РАНГ // 我的排名</div>
          <div className="lb-my-rank-row">
            <div className="lb-my-rank-pos">
              {myIndex < 3 ? MEDAL[myIndex] : `#${myIndex + 1}`}
            </div>
            <div className="lb-my-rank-info">
              <PlayerName player={myEntry} large />
              <ImplantBadge implant={getMainImplant(myEntry)} />
            </div>
            <div className="lb-my-rank-pts">
              <span className="lb-pts-num">{myEntry.points}</span>
              <IconStar size={15} className="star-icon" />
            </div>
          </div>
        </div>
      ) : (
        <div className="lb-my-rank lb-my-rank-unknown">
          <div className="lb-my-rank-label">МОЙ РАНГ // 我的排名</div>
          <div className="lb-my-rank-row">
            <div className="lb-my-rank-pos">—</div>
            <div className="lb-my-rank-info">
              <span className="lb-name">Не найдено в рейтинге</span>
            </div>
          </div>
        </div>
      )}

      {/* СПИСОК ИГРОКОВ */}
      <div className="lb-list">
        {leaderboard.map((player, index) => {
          const isMe = player.telegram_id?.toString() === myTid;
          const implant = getMainImplant(player);

          return (
            <div
              key={player.telegram_id}
              className={[
                'lb-item',
                isMe ? 'lb-item-me' : '',
                index === 0 ? 'lb-item-gold' : '',
                index === 1 ? 'lb-item-silver' : '',
                index === 2 ? 'lb-item-bronze' : '',
              ].filter(Boolean).join(' ')}
            >
              {/* РАНГ/МЕДАЛЬ */}
              <div className="lb-item-rank">
                {index < 3
                  ? <span className="lb-medal">{MEDAL[index]}</span>
                  : <span className="lb-rank-num">#{index + 1}</span>
                }
              </div>

              {/* ИМЯ + ИМПЛАНТ */}
              <div className="lb-item-info">
                <PlayerName player={player} />
                {implant && IMPLANT_BADGES[implant] && (
                  <span className="lb-item-implant-emoji" title={IMPLANT_BADGES[implant].label}>
                    {IMPLANT_BADGES[implant].emoji}
                  </span>
                )}
              </div>

              {/* ОЧКИ */}
              <div className="lb-item-pts">
                <span>{player.points}</span>
                <IconStar size={12} className="star-icon" />
              </div>
            </div>
          );
        })}

        {leaderboard.length === 0 && (
          <div className="empty-state">
            <p>Рейтинг пуст</p>
            <span className="hint">暂无排名数据</span>
          </div>
        )}
      </div>

      <div className="bg-decoration">排</div>
    </div>
  );
};

export default LeaderboardPage;
