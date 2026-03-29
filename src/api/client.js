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

// === userApi с поддержкой моков ===
export const userApi = {
  getProfile: async (tid) => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
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
        cards: []
      };
    }
    return request(`/api/user/${tid}`);
  },

  getLeaderboard: async () => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return [
        { telegram_id: 244487659, full_name: 'Михаил Юрьевич', points: 999999, has_title: true, implant: 'implant_red_dragon' },
        { telegram_id: 389741116, full_name: 'Марк Альбертович', points: 1500, has_title: false, implant: null },
      ];
    }
    return request('/api/leaderboard');
  },

  getImplants: async (tid) => {
    if (USE_MOCK) return Promise.resolve([]);
    return request(`/api/user/${tid}/implants`);
  },

  getCards: async (tid) => {
    if (USE_MOCK) return Promise.resolve([]);
    return request(`/api/user/${tid}/cards`);
  },
};

// === Остальные API (без моков, пока не нужны) ===
export const shopApi = {
  getItems: () => request('/api/shop/items'),
  getPurchases: (tid) => request(`/api/shop/purchases/${tid}`),
  buyItem: (itemId, tid) => request('/api/shop/buy', {
    method: 'POST',
    body: JSON.stringify({ telegram_id: tid, item_id: itemId }),
  }),
  useItem: (purchaseId) => request(`/api/shop/use/${purchaseId}`, { method: 'POST' }),
};

export const casinoApi = {
  openCase: (tid) => request('/api/casino/open', {
    method: 'POST',
    body: JSON.stringify({ telegram_id: tid }),
  }),
};

export const genshinApi = {
  pray: (tid) => request('/api/genshin/pray', {
    method: 'POST',
    body: JSON.stringify({ telegram_id: tid }),
  }),
};

export const scheduleApi = {
  getDaily: () => request('/api/schedule'),
  getAnnouncements: () => request('/api/announcements'),
};

export const laundryApi = {
  getSchedule: () => request('/api/laundry/schedule'),
  takeSlot: (slotId, tid) => request(`/api/laundry/take/${slotId}`, {
    method: 'POST',
    body: JSON.stringify({ telegram_id: tid }),
  }),
};

export const settingsApi = {
  getGlobalSettings: () => request('/api/settings'),
};