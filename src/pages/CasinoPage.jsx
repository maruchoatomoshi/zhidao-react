// src/pages/CasinoPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useStore } from '../hooks/useStore';
import { useTelegram } from '../hooks/useTelegram';
import { casinoApi, genshinApi, settingsApi } from '../api/client';
import { IconStar, IconRefresh, IconLock } from '@tabler/icons-react';

// === ИЗОБРАЖЕНИЯ ===
const IMG = {
  goldCase: 'https://raw.githubusercontent.com/maruchoatomoshi/zhidao-protocol/main/1774509730760.png',
  purpleCase: 'https://raw.githubusercontent.com/maruchoatomoshi/zhidao-protocol/main/purple_case.png',
  legendaryCase: 'https://raw.githubusercontent.com/maruchoatomoshi/zhidao-protocol/main/legendary_case.png',
  cardZhongli: 'https://raw.githubusercontent.com/maruchoatomoshi/zhidao-protocol/main/card_zhongli.png',
  cardStar: 'https://raw.githubusercontent.com/maruchoatomoshi/zhidao-protocol/main/card_star.png',
};

const CASES = [
  {
    type: 'gold',
    name: 'ЗОЛОТОЙ',
    cn: '金箱',
    img: IMG.goldCase,
    chance: '78.9%',
    color: 'gold',
  },
  {
    type: 'purple',
    name: 'ФИОЛЕТОВЫЙ',
    cn: '紫箱',
    img: IMG.purpleCase,
    chance: '20%',
    color: 'purple',
  },
  {
    type: 'black',
    name: 'ЛЕГЕНДАРНЫЙ',
    cn: '黑箱',
    img: IMG.legendaryCase,
    chance: '1%',
    color: 'black',
  },
];

const PRIZE_ICONS = {
  empty: '🍚',
  points30: '⭐',
  points60: '💫',
  freedom30: '🕐',
  laundry: '🧺',
  immunity: '🛡',
  jackpot: '👑',
  implant_guanxi: '🤝',
  implant_terracota: '🗿',
  implant_red_dragon: '🐉',
};

// ── Карточка кейса ─────────────────────────────────────────────────────
const CaseCard = ({ caseData, onOpen, disabled }) => {
  return (
    <div className={`case-card case-card-${caseData.color}`}>
      <div className="case-cn">{caseData.cn}</div>
      <div className="case-img">
        <img src={caseData.img} alt={caseData.type} />
      </div>
      <div className="case-name">{caseData.name}</div>
      <div className={`case-pct case-pct-${caseData.color}`}>{caseData.chance}</div>
      <button
        className="case-open-btn"
        onClick={() => onOpen(caseData.type)}
        disabled={disabled}
      >
        ОТКРЫТЬ
      </button>
    </div>
  );
};

// ── Результат открытия ─────────────────────────────────────────────────
const PrizeResult = ({ prize, onClose }) => {
  if (!prize) return null;

  const icon = PRIZE_ICONS[prize.code] || '🎁';
  const isPositive = prize.points > 0;
  const isSpecial = prize.code.includes('implant');

  return (
    <div className="prize-result show">
      <div className="prize-result-icon">{icon}</div>
      <div className="prize-result-name">{prize.name}</div>
      <div className="prize-result-desc">{prize.desc}</div>
      {prize.points > 0 && (
        <div className={`prize-result-points ${isSpecial ? 'special' : isPositive ? 'positive' : 'negative'}`}>
          {prize.points > 0 ? '+' : ''}{prize.points} ★
        </div>
      )}
      <button className="prize-close-btn" onClick={onClose}>ЗАБРАТЬ</button>
    </div>
  );
};

// ── История открытий ───────────────────────────────────────────────────
const CasinoHistory = ({ log }) => {
  if (!log || log.length === 0) return null;

  return (
    <div className="casino-history">
      <div className="history-title">📜 История</div>
      {log.slice(0, 5).map((item, i) => (
        <div key={item.id || i} className="history-item">
          <span className="history-icon">{PRIZE_ICONS[item.prize_code] || '🎁'}</span>
          <span className="history-name">{item.prize_name}</span>
          <span className="history-time">
            {new Date(item.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      ))}
    </div>
  );
};

// ── Главный компонент ──────────────────────────────────────────────────
const CasinoPage = () => {
  const { userId, hapticFeedback, showPopup } = useTelegram();
  const { points, updatePoints, blackWall, user, theme } = useStore();

  const [tab, setTab] = useState('cases');
  const [opening, setOpening] = useState(false);
  const [prize, setPrize] = useState(null);
  const [remaining, setRemaining] = useState(3);
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadHistory = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await casinoApi.getLog(userId);
      setLog(data);
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  }, [userId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // ── Открытие кейса ───────────────────────────────────────────────────
  const handleOpenCase = async (caseType) => {
    if (!userId) {
      alert('Откройте через Telegram бота');
      return;
    }

    if (blackWall) {
      alert('⛔ BlackWall активен. Доступ запрещён.');
      return;
    }

    if (remaining <= 0) {
      alert('Лимит кейсов на сегодня исчерпан!');
      return;
    }

    const tg = window.Telegram?.WebApp;
    const confirm = () => {
      setOpening(true);
      setError(null);

      casinoApi.openCase(userId)
        .then(data => {
          hapticFeedback('heavy');
          setPrize(data.prize);
          if (data.new_points !== undefined) updatePoints(data.new_points);
          if (data.remaining_today !== undefined) setRemaining(data.remaining_today);
          loadHistory();
        })
        .catch(err => {
          setError(err.message);
          hapticFeedback('error');
        })
        .finally(() => {
          setOpening(false);
        });
    };

    if (tg?.showPopup) {
      tg.showPopup({
        title: `Открыть ${CASES.find(c => c.type === caseType)?.name}?`,
        message: `Осталось кейсов сегодня: ${remaining}`,
        buttons: [{ id: 'ok', type: 'default', text: '✅ Открыть' }, { type: 'cancel' }],
      }, (id) => { if (id === 'ok') confirm(); });
    } else {
      if (window.confirm(`Открыть кейс? Осталось: ${remaining}`)) confirm();
    }
  };

  // ── Молитва Genshin ──────────────────────────────────────────────────
  const handlePray = async () => {
    if (!userId) {
      alert('Откройте через Telegram бота');
      return;
    }

    if (blackWall) {
      alert('⛔ BlackWall активен. Доступ запрещён.');
      return;
    }

    if (remaining <= 0) {
      alert('Лимит молитв на сегодня исчерпан!');
      return;
    }

    const tg = window.Telegram?.WebApp;
    const confirm = () => {
      setOpening(true);
      setError(null);

      genshinApi.pray(userId)
        .then(data => {
          hapticFeedback('heavy');
          setPrize({
            code: data.card_id,
            name: `${data.card_id.replace('card_', '')} ★${data.stars}`,
            desc: `Новая карточка!`,
            points: 0,
            stars: data.stars,
          });
          if (data.new_points !== undefined) updatePoints(data.new_points);
          if (data.remaining_today !== undefined) setRemaining(data.remaining_today);
        })
        .catch(err => {
          setError(err.message);
          hapticFeedback('error');
        })
        .finally(() => {
          setOpening(false);
        });
    };

    if (tg?.showPopup) {
      tg.showPopup({
        title: 'Совершить молитву?',
        message: `Осталось молитв сегодня: ${remaining}`,
        buttons: [{ id: 'ok', type: 'default', text: '🙏 Молиться' }, { type: 'cancel' }],
      }, (id) => { if (id === 'ok') confirm(); });
    } else {
      if (window.confirm(`Совершить молитву? Осталось: ${remaining}`)) confirm();
    }
  };

  const closePrize = () => {
    setPrize(null);
    hapticFeedback('light');
  };

  // ── BlackWall экран ──────────────────────────────────────────────────
  if (blackWall) {
    return (
      <div className="page-container casino-page">
        <div className="blackwall-screen">
          <div className="blackwall-title">BlackWall 已激活</div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontFamily: 'monospace', lineHeight: 2 }}>
            系统访问已受限<br />— NetWatch 网络保安 —
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container casino-page">
      {/* ЗАГОЛОВОК */}
      <div className="page-hdr">
        <div>
          <div className="page-hdr-title">
            КАЗИНО <span className="page-hdr-cn">赌场</span>
          </div>
          <div className="page-hdr-sub">&gt; dǔ chǎng // испытание удачи</div>
        </div>
        <button className="lb-refresh-btn" onClick={loadHistory} title="Обновить">
          <IconRefresh size={18} />
        </button>
      </div>

      {/* БАЛАНС И ЛИМИТ */}
      <div className="casino-balance-bar">
        <div className="casino-balance">
          <span className="casino-balance-label">信用 // БАЛАНС</span>
          <span className="casino-balance-pts">
            {points} <IconStar size={14} className="star-icon" />
          </span>
        </div>
        <div className="casino-limit">
          <span className="casino-limit-label">Осталось:</span>
          <span className="casino-limit-val">{remaining}</span>
        </div>
      </div>

      {/* ВКЛАДКИ */}
      {theme === 'genshin' ? (
        <div className="subtabs">
          <button
            className={`subtab ${tab === 'pray' ? 'active' : ''}`}
            onClick={() => setTab('pray')}
          >
            🙏 МОЛИТВЫ
          </button>
          <button
            className={`subtab ${tab === 'history' ? 'active' : ''}`}
            onClick={() => setTab('history')}
          >
            📜 ИСТОРИЯ
          </button>
        </div>
      ) : (
        <div className="subtabs">
          <button
            className={`subtab ${tab === 'cases' ? 'active' : ''}`}
            onClick={() => setTab('cases')}
          >
            📦 КЕЙСЫ
          </button>
          <button
            className={`subtab ${tab === 'history' ? 'active' : ''}`}
            onClick={() => setTab('history')}
          >
            📜 ИСТОРИЯ
          </button>
        </div>
      )}

      {/* КОНТЕНТ */}
      {error && (
        <div className="error-box" style={{ margin: '15px' }}>
          <h3>⚠️ Ошибка</h3>
          <p>{error}</p>
          <button onClick={() => setError(null)}>Закрыть</button>
        </div>
      )}

      {tab === 'cases' && (
        <div className="cases-grid">
          {CASES.map((c) => (
            <CaseCard
              key={c.type}
              caseData={c}
              onOpen={handleOpenCase}
              disabled={opening || remaining <= 0}
            />
          ))}
        </div>
      )}

      {tab === 'pray' && (
        <div className="pray-section">
          <div className="pray-card">
            <div className="pray-img">
              <img src={IMG.cardStar} alt="pray" />
            </div>
            <div className="pray-name">Молитва</div>
            <div className="pray-cn">祈祷</div>
            <button
              className="pray-btn"
              onClick={handlePray}
              disabled={opening || remaining <= 0}
            >
              🙏 МОЛИТЬСЯ
            </button>
          </div>
        </div>
      )}

      {tab === 'history' && <CasinoHistory log={log} />}

      {/* Результат открытия */}
      {prize && <PrizeResult prize={prize} onClose={closePrize} />}

      <div className="bg-decoration">赌</div>
    </div>
  );
};

export default CasinoPage;