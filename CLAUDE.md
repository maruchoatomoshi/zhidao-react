# ZHIDAO Protocol — React Migration

## Проект
Telegram Mini App для группы российских школьников на языковой поездке в Пекине (3–27 июля 2026). Геймификация дисциплины + изучение китайского. Тематика: NetWatch/Cyberpunk 2077 + традиционный Китай + Genshin Impact.

## Задача
Перенос работающего HTML-приложения (`reference/index.html`) на React+Vite. Бэкенд НЕ ТРОГАТЬ — он уже работает. Только фронтенд.

## Стек
- React 19 + Vite 8
- Zustand (глобальный стейт)
- react-router-dom
- @tabler/icons-react (иконки — tabler)
- CSS переменные для 4 тем (БЕЗ CSS-in-JS, БЕЗ Tailwind)
- Деплой: GitHub Pages

## Бэкенд
- FastAPI: `https://hk.marucho.icu:8443`
- Авторизация через `telegram_id` в теле запроса или заголовке `x-telegram-id`
- Админы передают `x-admin-id` в заголовке
- SQLite БД на сервере

## Админы (telegram_id)
- 389741116 — Марк (разработчик)
- 244487659 — МЮ / Михаил Юрьевич (руководитель)
- 1190015933 — Лиза (вожатая)
- 491711713 — Юля (вожатая)

## Навигация (7 табов внизу)
1. 🏠 Главная (home) — 首页
2. 📅 日程 (schedule) — расписание + объявления
3. 🏆 Рейтинг (leaderboard) — 排名
4. 🏪 Магазин (shop) — 商店 (вкладки: товары / инвентарь)
5. 🎰 Кейсы (casino) — 运气 (NetWatch) / Молитвы (Genshin)
6. ⚡ Импланты (implants) — 植入体 (NetWatch) / Карточки (Genshin)
7. ≡ Ещё (more) — темы, погода, стирка/вода, новости, достижения, команда, админка

## API эндпоинты (из HTML-кода)
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
- `theme-nw-light`: светлый NetWatch
- `theme-genshin-light`: Genshin Light (Georgia, radius 20px, фон #ece5d8)
- `theme-genshin-dark`: Genshin Dark (фон #1a1628, золотые акценты)

Сохранение: `tg.CloudStorage.setItem('zhidao_theme', theme)` + localStorage fallback.
При Genshin-темах: Кейсы→Молитвы, Импланты→Карточки, меняются иконки.

## Ключевые UI-паттерны (воспроизвести из HTML)
- Фоновые плавающие иероглифы (декоративные, pointer-events:none)
- Сканлайны поверх фона (body::before, repeating-linear-gradient)
- Градиентные разделители с китайским текстом (cn-divider)
- Карточки с верхней светящейся линией (card::before gradient)
- Кнопки с анимацией sweep (btn-primary::after)
- Нижняя навигация с backdrop-filter blur
- HapticFeedback: tg.HapticFeedback.impactOccurred('medium')
- Конфетти при выигрышах (canvas-based)

## Кейсы — рулетка
- Золотой 78.9%, фиолетовый 21%, чёрный 0.1%
- Анимация барабана с замедлением
- Фулскрин оверлей результата + конфетти
- Лимит 3/день, доп кейс за 200★
- BlackWall и заморозка блокируют доступ

## Молитвы — Genshin
- Синий 79%, фиолетовый 20%, золотой 1%
- Анимация: вихрь → вспышка → лучи → карточка рубашкой → 3D переворот
- Лимит 3/день

## Карточки (9 шт)
| card_id | Название | ★ | Пассивка |
|---------|----------|---|---------|
| card_zhongli | 岩王帝君 | 5 | Блок штрафа + -5% магазин |
| card_star | 紫微星君 | 5 | Передать штраф другому |
| card_pyro | 焰莲使者 | 4 | +50★ после штрафа |
| card_fox | 九尾狐灵 | 4 | Перекрутить неудачный приз |
| card_fairy | 桃花仙子 | 4 | +30★ отряду на перекличке |
| card_literature | 文曲星君 | 4 | +25★ за отчёт |
| card_forest | 木灵仙君 | 4 | +10★ за день вовремя |
| card_sea | 海灵仙后 | 4 | Каждые 3 молитвы +30★ |
| card_moon | 嫦娥仙子 | 4 | Дубль даёт +50★ |

## Импланты (3 шт)
- `implant_guanxi` 关系 — -10% магазин, фиолетовый кейс
- `implant_terracota` 兵马俑 — блок штрафа, фиолетовый кейс
- `implant_red_dragon` 红龙 — +20% баллов + красный ник, чёрный кейс
Прочность: 3 точки, уменьшается при использовании.

## Магазин
Категории: privilege, social, food, vip
Инвентарь: использовать / подарить / продать (50%)
Заморозка аккаунта блокирует магазин.

## Рейд на Альфабосса
- Взнос 50★, победа 60% → +150★
- Мин 3 игрока, макс 2 рейда/день
- МЮ (244487659) — 999999★ вне зачёта

## Достижения (14 SVG-иконок)
early_bird, iron_mode, legend, curious, polyglot, explorer, brave, exemplary, helper, dragon, night_watch, master, gambler, lucky

## Telegram WebApp
```javascript
const tg = window.Telegram?.WebApp;
const user = tg?.initDataUnsafe?.user;
const telegram_id = user?.id;
// CloudStorage, HapticFeedback, showPopup, showAlert
// Всегда делать fallback для тестирования в браузере
```

## Правила кода
- Интерфейс: русский + 中文 иероглифы
- Комментарии: на русском
- Функциональные компоненты + хуки
- CSS классы + переменные (theme.css), НЕ inline
- `window.Telegram?.WebApp` — безопасный доступ
- try/catch на все fetch
- НЕ менять бэкенд
- Референс: `reference/index.html`

## Текущий статус
- [x] App.jsx — скелет навигации
- [x] theme.css — CSS переменные 4 тем
- [ ] api/client.js
- [ ] hooks/useTelegram.js
- [ ] hooks/useStore.js
- [ ] Все страницы

## Порядок разработки
1. Фундамент: api/client.js + useTelegram.js + useStore.js
2. HomePage — профиль, баллы, статусы, импланты
3. LeaderboardPage — рейтинг
4. SchedulePage — расписание + объявления
5. ShopPage — товары + инвентарь
6. CasinoPage — кейсы/молитвы с анимациями
7. ImplantsPage — импланты/карточки
8. MorePage — темы, погода, стирка, достижения, админка
