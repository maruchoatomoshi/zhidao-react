// src/pages/ImplantsPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useStore } from '../hooks/useStore';
import { useTelegram } from '../hooks/useTelegram';
import { userApi } from '../api/client';
import { IconRefresh, IconLock } from '@tabler/icons-react';

// === ИЗОБРАЖЕНИЯ ===
const IMG = {
  implantGuanxi: 'https://raw.githubusercontent.com/maruchoatomoshi/zhidao-protocol/main/guanxi_implant.png',
  implantTerracota: 'https://raw.githubusercontent.com/maruchoatomoshi/zhidao-protocol/main/armor.png',
  implantRedDragon: 'https://raw.githubusercontent.com/maruchoatomoshi/zhidao-protocol/main/honglong_implant.png',
  cardZhongli: 'https://raw.githubusercontent.com/maruchoatomoshi/zhidao-protocol/main/card_zhongli.png',
  cardStar: 'https://raw.githubusercontent.com/maruchoatomoshi/zhidao-protocol/main/card_star.png',
  cardPyro: 'https://raw.githubusercontent.com/maruchoatomoshi/zhidao-protocol/main/card_pyro.png',
  cardFox: 'https://raw.githubusercontent.com/maruchoatomoshi/zhidao-protocol/main/card_fox.png',
  cardFairy: 'https://raw.githubusercontent.com/maruchoatomoshi/zhidao-protocol/main/card_fairy.png',
  cardLiterature: 'https://raw.githubusercontent.com/maruchoatomoshi/zhidao-protocol/main/card_literature.png',
  cardForest: 'https://raw.githubusercontent.com/maruchoatomoshi/zhidao-protocol/main/card_forest.png',
  cardSea: 'https://raw.githubusercontent.com/maruchoatomoshi/zhidao-protocol/main/card_sea.png',
  cardMoon: 'https://raw.githubusercontent.com/maruchoatomoshi/zhidao-protocol/main/card_moon.png',
};

const IMPLANT_INFO = {
  implant_guanxi: { name: '关系 ГУАНЬСИ', desc: 'guān xi — связи, отношения', img: IMG.implantGuanxi },
  implant_terracota: { name: '兵马俑 ТЕРРАКОТА', desc: 'bīng mǎ yǒng — армия тьмы', img: IMG.implantTerracota },
  implant_red_dragon: { name: '红龙 КРАСНЫЙ ДРАКОН', desc: 'hóng lóng — легендарный', img: IMG.implantRedDragon },
};

const CARD_INFO = {
  card_zhongli: { name: 'Zhongli', stars: 5, element: 'Geo', img: IMG.cardZhongli },
  card_star: { name: 'Stellar Reunion', stars: 5, element: 'Event', img: IMG.cardStar },
  card_pyro: { name: 'Pyro Sigil', stars: 4, element: 'Pyro', img: IMG.cardPyro },
  card_fox: { name: 'Fox Spirit', stars: 4, element: 'Anemo', img: IMG.cardFox },
  card_fairy: { name: 'Fairy Tale', stars: 4, element: 'Hydro', img: IMG.cardFairy },
  card_literature: { name: 'Literature', stars: 4, element: 'Dendro', img: IMG.cardLiterature },
  card_forest: { name: 'Forest Watch', stars: 4, element: 'Dendro', img: IMG.cardForest },
  card_sea: { name: 'Sea Breeze', stars: 4, element: 'Hydro', img: IMG.cardSea },
  card_moon: { name: 'Moon Chase', stars: 4, element: 'Cryo', img: IMG.cardMoon },
};

const DurabilityDots = ({ durability, max = 3 }) => (
  <div className="dur-dots">
    {Array.from({ length: max }).map((_, i) => (
      <span key={i} className={`dur-dot ${i < durability ? 'dur-dot-on' : 'dur-dot-off'}`} />
    ))}
  </div>
);

const ImplantCard = ({ implant }) => {
  const info = IMPLANT_INFO[implant.implant_id] || IMPLANT_INFO.implant_guanxi;
  return (
    <div className="implant-card">
      <div className="implant-card-img">
        <img src={info.img} alt={implant.implant_id} />
      </div>
      <div className="implant-card-info">
        <div className="implant-card-name">{info.name}</div>
        <div className="implant-card-desc">{info.desc}</div>
        <div className="implant-card-dur">
          <span>Прочность:</span>
          <DurabilityDots durability={implant.durability} />
        </div>
        <div className="implant-card-date">
          {new Date(implant.obtained_at).toLocaleDateString('ru-RU')}
        </div>
      </div>
    </div>
  );
};

const GenshinCard = ({ card }) => {
  const info = CARD_INFO[card.card_id] || CARD_INFO.card_pyro;
  return (
    <div className={`genshin-card genshin-card-${info.stars}`}>
      <div className="genshin-card-img">
        <img src={info.img} alt={card.card_id} />
      </div>
      <div className="genshin-card-info">
        <div className="genshin-card-name">{info.name}</div>
        <div className="genshin-card-stars">{'★'.repeat(info.stars)}</div>
        <div className="genshin-card-element">{info.element}</div>
        <div className="genshin-card-date">
          {new Date(card.obtained_at).toLocaleDateString('ru-RU')}
        </div>
      </div>
    </div>
  );
};

const ImplantsPage = () => {
  const { userId, hapticFeedback } = useTelegram();
  const { theme } = useStore();
  const [tab, setTab] = useState('implants');
  const [implants, setImplants] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadImplants = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await userApi.getImplants(userId);
      setImplants(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const loadCards = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await userApi.getCards(userId);
      setCards(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (tab === 'implants') loadImplants();
    else loadCards();
  }, [tab, loadImplants, loadCards]);

  useEffect(() => {
    if (theme === 'genshin') setTab('cards');
    else setTab('implants');
  }, [theme]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-spinner">
          <div className="dragon-loader"></div>
          <p>Загрузка...</p>
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
          <button onClick={tab === 'implants' ? loadImplants : loadCards}>Повторить</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container implants-page">
      <div className="page-hdr">
        <div>
          <div className="page-hdr-title">
            ИМПЛАНТЫ <span className="page-hdr-cn">植入物</span>
          </div>
          <div className="page-hdr-sub">&gt; zhí rù wù // нейроимпланты протокола</div>
        </div>
        <button className="lb-refresh-btn" onClick={tab === 'implants' ? loadImplants : loadCards}>
          <IconRefresh size={18} />
        </button>
      </div>

      <div className="subtabs">
        <button className={`subtab ${tab === 'implants' ? 'active' : ''}`} onClick={() => setTab('implants')}>
          🤝 ИМПЛАНТЫ
        </button>
        <button className={`subtab ${tab === 'cards' ? 'active' : ''}`} onClick={() => setTab('cards')}>
          🎴 GENSIN
        </button>
      </div>

      {tab === 'implants' ? (
        <div className="implants-list">
          {implants.length > 0 ? (
            implants.map((implant, i) => <ImplantCard key={implant.id || i} implant={implant} />)
          ) : (
            <div className="empty-state">
              <IconLock size={24} />
              <p>Импланты не установлены</p>
              <span className="hint">Открывай фиолетовые и чёрные кейсы!</span>
            </div>
          )}
        </div>
      ) : (
        <div className="genshin-cards-list">
          {cards.length > 0 ? (
            cards.map((card, i) => <GenshinCard key={card.id || i} card={card} />)
          ) : (
            <div className="empty-state">
              <IconLock size={24} />
              <p>Карточек пока нет</p>
              <span className="hint">Делай молитвы в казино!</span>
            </div>
          )}
        </div>
      )}

      <div className="bg-decoration">植</div>
    </div>
  );
};

export default ImplantsPage;