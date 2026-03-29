// src/api/client.js

const API_BASE = 'https://hk.marucho.icu:8443';
const USE_MOCK = import.meta.env.DEV; // true только при разработке

// Универсальная функция для отправки запросов
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  const tg = window.Telegram?.WebApp;
  const telegramId = tg?.initDataUnsafe?.user?.id?.toString();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (telegramId) {
    headers['x-telegram-id'] = telegramId;
  }

  try {
    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Ошибка HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

// =============================================
// === userApi ===
// =============================================
export const userApi = {
  getProfile: async (tid) => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 400));
      return {
        telegram_id: parseInt(tid),
        full_name: 'Марк Альбертович',
        points: 1500,
        gender: 'male',
        code: 'zhidao',
        marzban_username: 'hk_mark',
        frozen: false,
        immunity: false,
        extra_cases: 0,
        double_win: false,
        title_date: null,
        implants: [],
        cards: [],
      };
    }
    return request(`/api/user/${tid}`);
  },

  getLeaderboard: async () => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 300));
      return [
        { telegram_id: 244487659, full_name: 'Михаил Юрьевич', points: 4200, has_title: true,  implant: 'implant_red_dragon' },
        { telegram_id: 1190015933, full_name: 'Лиза Вожатая',   points: 3100, has_title: false, implant: 'implant_guanxi' },
        { telegram_id: 491711713,  full_name: 'Юля Вожатая',    points: 2850, has_title: false, implant: 'implant_terracota' },
        { telegram_id: 389741116,  full_name: 'Марк Альбертович', points: 1500, has_title: false, implant: null },
        { telegram_id: 100000001,  full_name: 'Анастасия К.',   points: 1200, has_title: false, implant: null },
        { telegram_id: 100000002,  full_name: 'Дмитрий В.',     points: 980,  has_title: false, implant: null },
        { telegram_id: 100000003,  full_name: 'Полина С.',      points: 740,  has_title: false, implant: null },
      ];
    }
    return request('/api/leaderboard');
  },

  getImplants: async (tid) => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 200));
      return [
        { id: 1, implant_id: 'implant_guanxi',    name: '关系 ГУАНЬСИ',       desc: 'guān xi — связи, отношения', durability: 2, obtained_at: '2026-03-10T10:00:00' },
        { id: 2, implant_id: 'implant_terracota', name: '兵马俑 ТЕРРАКОТА',    desc: 'bīng mǎ yǒng — армия тьмы', durability: 3, obtained_at: '2026-03-15T14:00:00' },
      ];
    }
    return request(`/api/user/${tid}/implants`);
  },

  getCards: async (tid) => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 200));
      return [
        { id: 1, card_id: 'card_zhongli', obtained_at: '2026-03-12T09:00:00' },
        { id: 2, card_id: 'card_pyro',    obtained_at: '2026-03-20T11:30:00' },
      ];
    }
    return request(`/api/user/${tid}/cards`);
  },
};

// =============================================
// === scheduleApi ===
// =============================================
export const scheduleApi = {
  getDaily: async () => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 300));
      return [
        { id: 1, day: 'Понедельник', time: '09:00', subject: '汉语课 Китайский язык', location: 'Аудитория 204' },
        { id: 2, day: 'Понедельник', time: '11:00', subject: '文化讲座 Культурная лекция', location: 'Актовый зал' },
        { id: 3, day: 'Понедельник', time: '14:00', subject: '自由时间 Свободное время', location: 'Торговый квартал' },
        { id: 4, day: 'Вторник',     time: '09:30', subject: '太极拳 Тайцзицюань', location: 'Парк Жэньминь' },
        { id: 5, day: 'Вторник',     time: '13:00', subject: '参观 Экскурсия', location: 'Запретный город' },
        { id: 6, day: 'Среда',       time: '10:00', subject: '书法课 Каллиграфия', location: 'Мастерская 3' },
      ];
    }
    return request('/api/schedule');
  },

  getAnnouncements: async () => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 250));
      return [
        {
          id: 1,
          text: '🏮 Завтра обязательный поход на Великую стену! Выход в 08:00 от главного входа. Берите воду и солнцезащитный крем.',
          created_at: '2026-03-28T10:00:00',
          reactions: [
            { emoji: '👍', count: 5 },
            { emoji: '🔥', count: 3 },
          ],
        },
        {
          id: 2,
          text: '⚡ Внимание! Сегодня вечером разыгрываются 3 карточки Genshin для тех, кто набрал больше всего очков за неделю. Проверьте рейтинг!',
          created_at: '2026-03-27T18:30:00',
          reactions: [
            { emoji: '❤️', count: 8 },
            { emoji: '😮', count: 4 },
          ],
        },
        {
          id: 3,
          text: '📋 Расписание на следующую неделю обновлено. Во вторник занятий не будет — поездка в Шанхай.',
          created_at: '2026-03-26T09:00:00',
          reactions: [],
        },
      ];
    }
    return request('/api/announcements');
  },

  reactToAnnouncement: async (id, emoji, telegramId) => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 150));
      return { ok: true };
    }
    return request(`/api/announcements/${id}/react`, {
      method: 'POST',
      body: JSON.stringify({ telegram_id: parseInt(telegramId), emoji }),
    });
  },
};

// =============================================
// === shopApi ===
// =============================================
export const shopApi = {
  getItems: async (telegramId) => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 400));
      return {
        frozen: false,
        items: [
          { id: 1,  code: 'immunity',     name: 'Иммунитет',        cn_name: '免疫',   price: 300, emoji: '🛡',  desc: 'Защита от следующего штрафа',     category: 'privilege', daily_limit: 1, sold_today: 0, available: true },
          { id: 2,  code: 'no_report',    name: 'Без отчёта',       cn_name: '免报告', price: 200, emoji: '📄',  desc: 'Не сдавать один ежедневный отчёт', category: 'privilege', daily_limit: 2, sold_today: 1, available: true },
          { id: 3,  code: 'extra_case',   name: 'Доп. кейс',        cn_name: '加箱',   price: 200, emoji: '📦',  desc: '+1 к дневному лимиту кейсов',     category: 'privilege', daily_limit: 1, sold_today: 0, available: true },
          { id: 4,  code: 'double_win',   name: 'Двойной выигрыш',  cn_name: '双赢',   price: 400, emoji: '⭐',  desc: 'x2 очки из следующего кейса',     category: 'privilege', daily_limit: 1, sold_today: 0, available: true },
          { id: 5,  code: 'dj',           name: 'Ди-джей',          cn_name: '放歌',   price: 150, emoji: '🎵',  desc: 'Выбрать музыку на 15 минут',      category: 'social',    daily_limit: 3, sold_today: 2, available: true },
          { id: 6,  code: 'solo_seat',    name: 'Своё место',       cn_name: '专座',   price: 120, emoji: '🧠',  desc: 'Сесть где хочешь на занятии',     category: 'social',    daily_limit: 0, sold_today: 0, available: true },
          { id: 7,  code: 'amnesty',      name: 'Амнистия',         cn_name: '特赦',   price: 500, emoji: '💙',  desc: 'Снять одно нарушение с другого',  category: 'social',    daily_limit: 1, sold_today: 0, available: true },
          { id: 8,  code: 'kfc',          name: 'KFC',              cn_name: '肯德基', price: 100, emoji: '🍗',  desc: 'Рейд в KFC после занятий',        category: 'food',      daily_limit: 5, sold_today: 3, available: true },
          { id: 9,  code: 'bubbletea',    name: '奶茶 Молочный чай', cn_name: '奶茶',  price: 80,  emoji: '🧋',  desc: 'Время на молочный чай',           category: 'food',      daily_limit: 5, sold_today: 0, available: true },
          { id: 10, code: 'snack',        name: 'Перекус',          cn_name: '零食',   price: 60,  emoji: '🍡',  desc: 'Официальный перекус на занятии',  category: 'food',      daily_limit: 0, sold_today: 0, available: true },
          { id: 11, code: 'title_player', name: 'Титул игрока',     cn_name: '称号',   price: 800, emoji: '👑',  desc: 'Особый значок в рейтинге на день', category: 'vip',      daily_limit: 1, sold_today: 0, available: true },
          { id: 12, code: 'poizon',       name: 'Poizon-шоппинг',   cn_name: '毒',     price: 600, emoji: '👟',  desc: 'Оффициальная поездка на Poizon',  category: 'vip',       daily_limit: 1, sold_today: 0, available: false },
          { id: 13, code: 'laundry_vip',  name: 'VIP стирка',       cn_name: '贵宾洗', price: 250, emoji: '🫧',  desc: 'Вне очереди на стиральную машину', category: 'vip',      daily_limit: 2, sold_today: 0, available: true },
        ],
      };
    }
    return request(`/api/shop/items?telegram_id=${telegramId || 0}`);
  },

  getPurchases: async (tid) => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 300));
      return [
        { id: 101, item_name: 'KFC', item_code: 'kfc',          icon: '🍗', purchased_at: '2026-03-28T14:00:00', used: false },
        { id: 102, item_name: 'Молочный чай', item_code: 'bubbletea', icon: '🧋', purchased_at: '2026-03-27T16:00:00', used: false },
        { id: 103, item_name: 'Иммунитет', item_code: 'immunity', icon: '🛡', purchased_at: '2026-03-26T10:00:00', used: true },
      ];
    }
    return request(`/api/shop/purchases/${tid}`);
  },

  buyItem: async (itemId, telegramId) => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 400));
      return { ok: true, new_points: 1400, item: 'Товар куплен' };
    }
    return request('/api/shop/buy', {
      method: 'POST',
      body: JSON.stringify({ telegram_id: parseInt(telegramId), item_id: itemId }),
    });
  },

  useItem: async (purchaseId, telegramId) => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 300));
      return { ok: true };
    }
    return request(`/api/shop/use/${purchaseId}`, {
      method: 'POST',
      headers: { 'x-telegram-id': telegramId },
    });
  },

  giftItem: async (purchaseId, targetTid, senderTid) => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 300));
      return { ok: true };
    }
    return request(`/api/shop/gift/${purchaseId}`, {
      method: 'POST',
      headers: { 'x-telegram-id': senderTid },
      body: JSON.stringify({ target_telegram_id: parseInt(targetTid) }),
    });
  },

  sellItem: async (purchaseId, telegramId) => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 300));
      return { ok: true, refund: 40 };
    }
    return request(`/api/shop/sell/${purchaseId}`, {
      method: 'POST',
      headers: { 'x-telegram-id': telegramId },
    });
  },
};

// =============================================
// === casinoApi ===
// =============================================
export const casinoApi = {
  openCase: async (telegramId) => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 600));
      // Имитируем случайный результат
      const rnd = Math.random();
      let prize, caseType;
      if (rnd < 0.789) {
        caseType = 'gold';
        const gRnd = Math.random();
        if (gRnd < 0.20) prize = { code: 'empty',    icon: '🍚', name: 'Пустая миска',     desc: 'Не повезло...', points: 0 };
        else if (gRnd < 0.55) prize = { code: 'points30',  icon: '⭐', name: '+30 баллов',    desc: 'Неплохо!', points: 30 };
        else if (gRnd < 0.80) prize = { code: 'points60',  icon: '💫', name: '+60 баллов',    desc: 'Хороший результат!', points: 60 };
        else if (gRnd < 0.90) prize = { code: 'freedom30', icon: '🕐', name: '+30 мин свободы', desc: 'Свободное время', points: 0 };
        else if (gRnd < 0.96) prize = { code: 'laundry',   icon: '🧺', name: 'Вне очереди',   desc: 'Приоритет стирки', points: 0 };
        else if (gRnd < 0.99) prize = { code: 'immunity',  icon: '🛡', name: 'Иммунитет',     desc: 'Защита от штрафа', points: 0 };
        else prize = { code: 'jackpot', icon: '👑', name: 'ДЖЕКПОТ!', desc: '+250 баллов', points: 250 };
      } else if (rnd < 0.999) {
        caseType = 'purple';
        prize = { code: 'implant_guanxi', icon: '🤝', name: '关系 ГУАНЬСИ', desc: 'Имплант установлен!', points: 0 };
      } else {
        caseType = 'black';
        prize = { code: 'implant_red_dragon', icon: '🐉', name: '红龙 КРАСНЫЙ ДРАКОН', desc: 'ЛЕГЕНДАРНЫЙ ИМПЛАНТ!', points: 0 };
      }
      return {
        prize: { ...prize, case_type: caseType },
        new_points: 1450,
        remaining_today: 2,
      };
    }
    return request('/api/casino/open', {
      method: 'POST',
      body: JSON.stringify({ telegram_id: parseInt(telegramId) }),
    });
  },

  getLog: async (telegramId, date) => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 200));
      return [
        { id: 1, created_at: '2026-03-28T12:00:00', case_type: 'gold',   prize_code: 'points60',  prize_name: '+60 баллов',      prize_icon: '💫' },
        { id: 2, created_at: '2026-03-28T11:00:00', case_type: 'purple', prize_code: 'implant_guanxi', prize_name: 'ГУАНЬСИ', prize_icon: '🤝' },
        { id: 3, created_at: '2026-03-27T15:30:00', case_type: 'gold',   prize_code: 'empty',     prize_name: 'Пустая миска',    prize_icon: '🍚' },
      ];
    }
    const params = date ? `?date=${date}` : '';
    return request(`/api/casino/log/${telegramId}${params}`);
  },
};

// =============================================
// === genshinApi ===
// =============================================
export const genshinApi = {
  pray: async (telegramId) => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 600));
      const rnd = Math.random();
      let card;
      if (rnd < 0.79) {
        const blues = ['card_pyro', 'card_fox', 'card_fairy', 'card_literature', 'card_forest', 'card_sea'];
        const id = blues[Math.floor(Math.random() * blues.length)];
        card = { card_id: id, stars: 4, new_points: 1450, remaining_today: 2 };
      } else if (rnd < 0.99) {
        const purples = ['card_pyro', 'card_fox', 'card_fairy', 'card_moon'];
        const id = purples[Math.floor(Math.random() * purples.length)];
        card = { card_id: id, stars: 4, new_points: 1450, remaining_today: 2 };
      } else {
        const golds = ['card_zhongli', 'card_star'];
        const id = golds[Math.floor(Math.random() * golds.length)];
        card = { card_id: id, stars: 5, new_points: 1450, remaining_today: 2 };
      }
      return card;
    }
    return request('/api/genshin/pray', {
      method: 'POST',
      body: JSON.stringify({ telegram_id: parseInt(telegramId) }),
    });
  },
};

// =============================================
// === laundryApi ===
// =============================================
export const laundryApi = {
  getSchedule: async () => {
    if (USE_MOCK) {
      return [
        { id: 1, day: 'Понедельник', time: '10:00', note: '', taken_by: null },
        { id: 2, day: 'Понедельник', time: '12:00', note: '', taken_by: 389741116 },
        { id: 3, day: 'Среда',       time: '14:00', note: 'Только тихая',  taken_by: null },
      ];
    }
    return request('/api/laundry/schedule');
  },
  takeSlot: async (slotId, tid) => {
    if (USE_MOCK) return { ok: true };
    return request(`/api/laundry/take/${slotId}`, {
      method: 'POST',
      body: JSON.stringify({ telegram_id: parseInt(tid) }),
    });
  },
};

// =============================================
// === settingsApi ===
// =============================================
export const settingsApi = {
  getGlobalSettings: async () => {
    if (USE_MOCK) return { blackwall: false };
    return request('/api/settings');
  },
};
