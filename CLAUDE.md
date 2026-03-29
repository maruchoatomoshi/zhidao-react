# ZHIDAO Protocol — React Migration

## Проект
Telegram Mini App для группы российских школьников на языковой поездке в Пекине (3–27 июля 2026). Геймификация дисциплины + изучение китайского. Тематика: NetWatch/Cyberpunk 2077 + традиционный Китай + Genshin Impact.

## Задача
Перенос HTML-приложения v2.6.6 (`reference/index.html`, 3800+ строк) на React+Vite. Бэкенд НЕ ТРОГАТЬ. Только фронтенд.

## Стек
- React 19 + Vite 8
- Zustand (глобальный стейт)
- react-router-dom
- @tabler/icons-react
- CSS переменные для 4 тем (БЕЗ CSS-in-JS, БЕЗ Tailwind)
- GitHub Pages + GitHub Actions (автодеплой настроен)

## ⚠️ КРИТИЧЕСКИЕ НАСТРОЙКИ — НЕ МЕНЯТЬ
- `base: '/zhidao-react/'` в vite.config.js — без этого 404 на GitHub Pages
- `.github/workflows/deploy.yml` — автодеплой при git push
- Перед пушем всегда: `npm run build` локально

## Деплой
- **URL:** https://maruchoatomoshi.github.io/zhidao-react/
- **Репозиторий:** maruchoatomoshi/zhidao-react
- **Ассеты (картинки):** из репозитория `zhidao-protocol` через raw.githubusercontent.com

## Бэкенд
- FastAPI: `https://hk.marucho.icu:8443`
- Авторизация: `telegram_id` в теле запроса или `x-telegram-id` в заголовке
- Админы: `x-admin-id` в заголовке
- SQLite БД на сервере

## Админы (telegram_id)
- 389741116 — Марк (разработчик)
- 244487659 — МЮ (руководитель)
- 1190015933 — Лиза (вожатая)
- 491711713 — Юля (вожатая)

## Навигация (7 табов)
1. 🏠 Главная (home) — 首页
2. 📅 日程 (schedule) — расписание + объявления
3. 🏆 Рейтинг (leaderboard) — 排名
4. 🏪 Магазин (shop) — 商店
5. 🎰 Кейсы (casino) — 运气 / Молитвы (Genshin)
6. ⚡ Импланты (implants) — 植入体 / Карточки (Genshin)
7. ≡ Ещё (more) — темы, погода, стирка/вода, новости, достижения, команда, админка

## Изображения (raw.githubusercontent.com/maruchoatomoshi/zhidao-protocol/main/)
| Файл | Назначение |
|------|-----------|
| logo.png | Логотип приложения |
| 1774509730760.png | Золотой кейс |
| purple_case.png | Фиолетовый кейс |
| legendary_case.png | Легендарный (чёрный) кейс |
| guanxi_implant.png | Имплант Гуаньси |
| armor.png | Имплант Терракота |
| honglong_implant.png | Имплант Красный Дракон |
| card_zhongli.png | Карточка 岩王帝君 5★ |
| card_star.png | Карточка 紫微星君 5★ |
| card_pyro.png | Карточка 焰莲使者 4★ |
| card_fox.png | Карточка 九尾狐灵 4★ |
| card_fairy.png | Карточка 桃花仙子 4★ |
| card_literature.png | Карточка 文曲星君 4★ |
| card_forest.png | Карточка 木灵仙君 4★ |
| card_sea.png | Карточка 海灵仙后 4★ |
| logo_genshintheme.png | Логотип для Genshin-темы |
| logo_genshintheme_nobackground.png | Логотип Genshin без фона |

## API эндпоинты
```
GET  /api/user/{telegram_id}         — профиль, баллы, статусы, gender
GET  /api/leaderboard                — [{telegram_id, full_name, points, has_title, implants}]
GET  /api/schedule                   — расписание дня
GET  /api/announcements              — [{id, text, date, reactions}]
POST /api/announcements/{id}/react   — {telegram_id, emoji}

GET  /api/shop/items                 — [{id, name, cn_name, price, emoji, desc, category, limit_per_day}]
POST /api/shop/buy                   — {telegram_id, item_id}
GET  /api/shop/purchases/{tid}       — инвентарь
POST /api/shop/use/{purchase_id}     — header x-telegram-id
POST /api/shop/gift/{purchase_id}    — {target_telegram_id}, header x-telegram-id
POST /api/shop/sell/{purchase_id}    — header x-telegram-id (50% цены)
POST /api/shop/reset-daily           — сброс лимитов (админ)

POST /api/casino/open                — {telegram_id}
GET  /api/casino/log/{tid}?date=     — история кейсов

POST /api/genshin/pray               — {telegram_id}
GET  /api/user/{tid}/cards           — карточки
GET  /api/user/{tid}/implants        — импланты

GET  /api/laundry/schedule           — слоты стирки
POST /api/laundry/schedule           — создать (админ) {day, time, note}
DELETE /api/laundry/schedule/{id}    — удалить (админ)
POST /api/laundry/take/{slot_id}     — записаться {telegram_id}

GET  /api/water/schedule             — слоты воды
POST /api/water/schedule             — создать (админ)
DELETE /api/water/schedule/{id}      — удалить (админ)

GET  /api/raid/status                — статус рейда
POST /api/raid/join                  — {telegram_id}

GET  /api/weather                    — погода в Пекине
GET  /api/yuan-rate                  — курс юаня

GET  /api/achievements               — все достижения
GET  /api/user/{tid}/achievements    — полученные

POST /api/question                   — {question, telegram_id}

GET  /api/settings                   — {blackwall: bool}
POST /api/admin/blackwall            — {enabled}, header x-admin-id
POST /api/admin/freeze               — {telegram_id, frozen}, header x-admin-id
```

## 4 темы (CSS классы на body)
- По умолчанию: NetWatch Dark (без класса)
- `theme-nw-light`: NetWatch Light
- `theme-genshin-light`: Genshin Light (Georgia, radius 20px, фон #ece5d8)
- `theme-genshin-dark`: Genshin Dark (фон #1a1628, золотые акценты)

Сохранение: tg.CloudStorage + localStorage fallback.
При Genshin-темах: Кейсы→Молитвы, Импланты→Карточки, иконки меняются.

## UI-паттерны из HTML (воспроизвести)
- Плавающие иероглифы на фоне
- Сканлайны (body::before)
- Градиентные разделители cn-divider
- Карточки с верхней светящейся линией
- Кнопки с анимацией sweep
- Навбар с backdrop-filter blur
- HapticFeedback на действиях
- Конфетти (canvas) при выигрышах

## Кейсы (casino)
- Золотой 78.9%, фиолетовый 21%, чёрный 0.1%
- Рулетка-барабан с замедлением
- Фулскрин оверлей + конфетти
- Лимит 3/день, доп за 200★
- BlackWall/заморозка блокируют

## Молитвы (Genshin-тема casino)
- Синий 79%, фиолетовый 20%, золотой 1%
- Вихрь → вспышка → лучи → карточка → 3D переворот
- Лимит 3/день

## Карточки (9 шт)
| card_id | Название | ★ |
|---------|----------|---|
| card_zhongli | 岩王帝君 | 5 |
| card_star | 紫微星君 | 5 |
| card_pyro | 焰莲使者 | 4 |
| card_fox | 九尾狐灵 | 4 |
| card_fairy | 桃花仙子 | 4 |
| card_literature | 文曲星君 | 4 |
| card_forest | 木灵仙君 | 4 |
| card_sea | 海灵仙后 | 4 |
| card_moon | 嫦娥仙子 | 4 |

## Импланты (3 шт)
- implant_guanxi 关系 — -10% магазин
- implant_terracota 兵马俑 — блок штрафа
- implant_red_dragon 红龙 — +20% баллов + красный ник

## Рейд на Альфабосса
- Взнос 50★, победа 60% → +150★
- Мин 3 игрока, макс 2/день

## Достижения (14 шт с SVG-иконками)
early_bird, iron_mode, legend, curious, polyglot, explorer, brave, exemplary, helper, dragon, night_watch, master, gambler, lucky

## Telegram WebApp
```javascript
const tg = window.Telegram?.WebApp;
const user = tg?.initDataUnsafe?.user;
// CloudStorage, HapticFeedback, showPopup, showAlert
// Всегда fallback для тестирования в браузере
```

## Правила кода
- Интерфейс: русский + 中文
- Комментарии: на русском
- Функциональные компоненты + хуки
- CSS классы + переменные, НЕ inline
- try/catch на все fetch
- НЕ менять бэкенд
- Референс: reference/index.html

## ✅ Текущий статус (что готово)
- [x] GitHub Actions автодеплой
- [x] vite.config.js с правильным base
- [x] App.jsx — навигация
- [x] App.css — стили NetWatch (неон, анимации, градиенты)
- [x] theme.css — CSS переменные 4 тем
- [x] HomePage.jsx — логотип, статистика, нейролинк, импланты (визуально)
- [x] useStore.js — Zustand стор (базовый)
- [x] useTelegram.js — Telegram WebApp хук (базовый)

## 🔲 Что нужно делать дальше
1. LeaderboardPage.jsx — рейтинг с цветными никами
2. SchedulePage.jsx — расписание + объявления + реакции
3. ShopPage.jsx — товары (категории) + инвентарь (использовать/подарить/продать)
4. CasinoPage.jsx — кейсы с рулеткой + молитвы Genshin с анимациями
5. ImplantsPage.jsx — импланты с прочностью + каталог карточек
6. MorePage.jsx — темы, погода, курс юаня, стирка/вода, достижения, команда, админка
7. Проверить и доработать api/client.js — все эндпоинты
8. Проверить useStore.js — все стейты и экшены
