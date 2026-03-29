// src/pages/ShopPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useStore } from '../hooks/useStore';
import { useTelegram } from '../hooks/useTelegram';
import { shopApi } from '../api/client';
import { IconStar, IconRefresh } from '@tabler/icons-react';

// Категории и их названия
const CATEGORIES = {
  privilege: { label: '特权 ПРИВИЛЕГИИ', cn: '🏮' },
  social:    { label: '社交 СОЦИАЛЬНОЕ',  cn: '🤝' },
  food:      { label: '食物 ЕДА',         cn: '🍜' },
  vip:       { label: 'VIP 贵宾',          cn: '👑' },
  points:    { label: '积分 БАЛЛЫ',        cn: '⭐' },
};

// ── Строка товара ──────────────────────────────────────────────────────
const ShopItem = ({ item, points, onBuy }) => {
  const canBuy = item.available && points >= item.price;
  const limitLeft = item.daily_limit > 0
    ? item.daily_limit - (item.sold_today || 0)
    : null;

  return (
    <div className={`shop-item ${!item.available ? 'shop-item-unavail' : ''}`}>
      <div className="shop-item-icon">{item.emoji}</div>
      <div className="shop-item-body">
        <div className="shop-item-name">{item.name}</div>
        {item.cn_name && <div className="shop-item-cn">{item.cn_name}</div>}
        <div className="shop-item-desc">{item.desc}</div>
        {limitLeft !== null && (
          <div className="shop-item-limit">
            Осталось: {limitLeft} из {item.daily_limit}
          </div>
        )}
      </div>
      <button
        className="shop-item-buy"
        disabled={!canBuy}
        onClick={() => onBuy(item)}
      >
        {item.price} ★
      </button>
    </div>
  );
};

// ── Строка инвентаря ────────────────────────────────────────────────────
const InventoryItem = ({ item, onUse, onGift, onSell }) => {
  const date = new Date(item.purchased_at).toLocaleDateString('ru-RU');
  return (
    <div className={`inv-item ${item.used ? 'inv-item-used' : ''}`}>
      <div className="inv-item-header">
        <span className="inv-item-icon">{item.icon}</span>
        <div>
          <div className="inv-item-name">{item.item_name}</div>
          <div className="inv-item-date">{date} {item.used && '— использован'}</div>
        </div>
      </div>
      {!item.used && (
        <div className="inv-item-actions">
          <button className="inv-btn inv-btn-use"  onClick={() => onUse(item)}>✅ ИСПОЛЬЗОВАТЬ</button>
          <button className="inv-btn inv-btn-gift" onClick={() => onGift(item)}>🎁 ПОДАРИТЬ</button>
          <button className="inv-btn inv-btn-sell" onClick={() => onSell(item)}>💸 ПРОДАТЬ</button>
        </div>
      )}
    </div>
  );
};

// ── Главный компонент ──────────────────────────────────────────────────
const ShopPage = () => {
  const { userId, hapticFeedback, showPopup } = useTelegram();
  const { points, updatePoints, blackWall, user } = useStore();

  const [tab, setTab] = useState('store');
  const [shopData, setShopData] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStore = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await shopApi.getItems(userId);
      setShopData(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const loadInventory = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await shopApi.getPurchases(userId);
      setInventory(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (tab === 'store') loadStore();
    else loadInventory();
  }, [tab, loadStore, loadInventory]);

  // ── Покупка ──────────────────────────────────────────────────────────
  const handleBuy = (item) => {
    if (!userId) {
      alert('Откройте через Telegram бота');
      return;
    }

    const tg = window.Telegram?.WebApp;
    const confirm = () => {
      shopApi.buyItem(item.id, userId)
        .then(data => {
          hapticFeedback('medium');
          if (data.new_points !== undefined) updatePoints(data.new_points);
          alert(`✅ Куплено: ${item.name}!\nОстаток: ${data.new_points ?? points} ★`);
          loadStore();
        })
        .catch(err => {
          if (err.message === 'Daily limit reached') alert('Этот товар уже разобрали!');
          else if (err.message === 'Not enough points') alert('Недостаточно баллов!');
          else if (err.message === 'Account frozen') alert('⛔ Аккаунт заморожен NetWatch');
          else alert('Ошибка покупки');
        });
    };

    if (tg?.showPopup) {
      tg.showPopup({
        title: `Купить ${item.name}?`,
        message: `Стоимость: ${item.price} ★\nТвой баланс: ${points} ★`,
        buttons: [
          { id: 'confirm', type: 'default', text: '✅ Купить' },
          { type: 'cancel' },
        ],
      }, (btnId) => { if (btnId === 'confirm') confirm(); });
    } else {
      if (window.confirm(`Купить «${item.name}» за ${item.price} ★?`)) confirm();
    }
  };

  // ── Использовать ──────────────────────────────────────────────────────
  const handleUse = (item) => {
    if (!userId) return;
    const tg = window.Telegram?.WebApp;
    const doUse = () => {
      shopApi.useItem(item.id, userId)
        .then(() => {
          hapticFeedback('medium');
          alert(`✅ «${item.item_name}» использован!`);
          loadInventory();
        })
        .catch(() => alert('Ошибка'));
    };
    if (tg?.showPopup) {
      tg.showPopup({
        title: `Использовать «${item.item_name}»?`,
        message: 'Подтвердите действие',
        buttons: [{ id: 'ok', type: 'default', text: '✅ Да' }, { type: 'cancel' }],
      }, (id) => { if (id === 'ok') doUse(); });
    } else {
      if (window.confirm(`Использовать «${item.item_name}»?`)) doUse();
    }
  };

  // ── Подарить ──────────────────────────────────────────────────────────
  const handleGift = (item) => {
    const targetId = window.prompt(`Подарить «${item.item_name}» — введи Telegram ID получателя:`);
    if (!targetId) return;
    shopApi.giftItem(item.id, targetId, userId)
      .then(() => {
        hapticFeedback('medium');
        alert('✅ Подарок отправлен!');
        loadInventory();
      })
      .catch(() => alert('Ошибка'));
  };

  // ── Продать ──────────────────────────────────────────────────────────
  const handleSell = (item) => {
    const tg = window.Telegram?.WebApp;
    const doSell = () => {
      shopApi.sellItem(item.id, userId)
        .then(data => {
          hapticFeedback('light');
          alert(`💸 Продано за ${data.refund ?? '?'} ★`);
          loadInventory();
        })
        .catch(() => alert('Ошибка'));
    };
    if (tg?.showPopup) {
      tg.showPopup({
        title: `Продать «${item.item_name}»?`,
        message: 'Вернут 50% стоимости',
        buttons: [{ id: 'ok', type: 'destructive', text: '💸 Продать' }, { type: 'cancel' }],
      }, (id) => { if (id === 'ok') doSell(); });
    } else {
      if (window.confirm(`Продать «${item.item_name}» за половину цены?`)) doSell();
    }
  };

  // ── Рендер магазина ──────────────────────────────────────────────────
  const renderStore = () => {
    if (blackWall) {
      return (
        <div className="blackwall-screen">
          <div className="blackwall-title">BlackWall 已激活</div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontFamily: 'monospace', lineHeight: 2 }}>
            系统访问已受限<br />— NetWatch 网络保安 —
          </p>
        </div>
      );
    }

    if (!shopData) return null;
    const items = shopData.items || [];

    // Группируем по категориям
    const grouped = {};
    Object.keys(CATEGORIES).forEach(k => { grouped[k] = []; });
    items.forEach(item => {
      if (grouped[item.category]) grouped[item.category].push(item);
    });

    return (
      <>
        {Object.entries(CATEGORIES).map(([key, cat]) => {
          const catItems = grouped[key];
          if (!catItems || catItems.length === 0) return null;
          return (
            <div key={key}>
              <div className="shop-cat-header">
                <span className="shop-cat-cn">{cat.cn}</span> {cat.label}
              </div>
              {catItems.map(item => (
                <ShopItem key={item.id} item={item} points={points} onBuy={handleBuy} />
              ))}
            </div>
          );
        })}
      </>
    );
  };

  // ── Рендер инвентаря ─────────────────────────────────────────────────
  const renderInventory = () => {
    if (inventory.length === 0) {
      return (
        <div className="empty-state" style={{ margin: '15px' }}>
          <p>Инвентарь пуст</p>
          <span className="hint">背包是空的 — сходи в магазин!</span>
        </div>
      );
    }
    return inventory.map(item => (
      <InventoryItem
        key={item.id}
        item={item}
        onUse={handleUse}
        onGift={handleGift}
        onSell={handleSell}
      />
    ));
  };

  return (
    <div className="page-container shop-page">

      {/* ЗАГОЛОВОК */}
      <div className="page-hdr">
        <div>
          <div className="page-hdr-title">
            МАГАЗИН <span className="page-hdr-cn">商店</span>
          </div>
          <div className="page-hdr-sub">&gt; shāng diàn // 免税区 беспошлинная зона</div>
        </div>
        <button className="lb-refresh-btn" onClick={tab === 'store' ? loadStore : loadInventory} title="Обновить">
          <IconRefresh size={18} />
        </button>
      </div>

      {/* БАЛАНС */}
      <div className="shop-balance-bar">
        <span className="shop-balance-label">信用 // БАЛАНС</span>
        <span className="shop-balance-pts">
          {points} <IconStar size={14} className="star-icon" />
        </span>
      </div>

      {/* ЗАМОРОЗКА */}
      {shopData?.frozen && (
        <div className="frozen-banner">⛔ NetWatch 网络保安 — аккаунт заморожен</div>
      )}

      {/* ВКЛАДКИ */}
      <div className="subtabs">
        <button
          className={`subtab ${tab === 'store' ? 'active' : ''}`}
          onClick={() => setTab('store')}
        >
          商店 МАГАЗИН
        </button>
        <button
          className={`subtab ${tab === 'inventory' ? 'active' : ''}`}
          onClick={() => setTab('inventory')}
        >
          背包 ИНВЕНТАРЬ
        </button>
      </div>

      {/* КОНТЕНТ */}
      {loading ? (
        <div className="loading-spinner" style={{ padding: '30px' }}>
          <div className="dragon-loader"></div>
          <p>Загрузка...</p>
        </div>
      ) : error ? (
        <div className="error-box" style={{ margin: '15px' }}>
          <h3>⚠️ Ошибка</h3>
          <p>{error}</p>
          <button onClick={tab === 'store' ? loadStore : loadInventory}>Повторить</button>
        </div>
      ) : (
        <div className="shop-content">
          {tab === 'store' ? renderStore() : renderInventory()}
        </div>
      )}

      <div className="bg-decoration">店</div>
    </div>
  );
};

export default ShopPage;
