// src/pages/SchedulePage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useStore } from '../hooks/useStore';
import { useTelegram } from '../hooks/useTelegram';
import { scheduleApi } from '../api/client';
import { IconRefresh } from '@tabler/icons-react';

const REACTIONS = ['👍', '❤️', '🔥', '😂', '😮', '👑'];

// ── Карточка объявления ──────────────────────────────────────────────
const AnnouncementCard = ({ item, onReact }) => {
  const [reacting, setReacting] = useState(false);

  const handleReact = async (emoji) => {
    if (reacting) return;
    setReacting(true);
    await onReact(item.id, emoji);
    setReacting(false);
  };

  const date = new Date(item.created_at).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long',
  });

  // Карта реакций: emoji -> count
  const reactionMap = {};
  (item.reactions || []).forEach(r => {
    reactionMap[r.emoji] = r.count;
  });

  return (
    <div className="announce-card">
      <p className="announce-text">{item.text}</p>
      <div className="announce-date">{date}</div>
      <div className="announce-reactions">
        {REACTIONS.map(emoji => {
          const count = reactionMap[emoji] || 0;
          return (
            <button
              key={emoji}
              className={`reaction-btn ${count > 0 ? 'reaction-btn-active' : ''}`}
              onClick={() => handleReact(emoji)}
              disabled={reacting}
            >
              {emoji}
              {count > 0 && <span className="reaction-count">{count}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ── Группировка расписания по дням ────────────────────────────────────
const ScheduleSection = ({ items }) => {
  const byDay = {};
  items.forEach(item => {
    if (!byDay[item.day]) byDay[item.day] = [];
    byDay[item.day].push(item);
  });

  return (
    <div className="schedule-list">
      {Object.entries(byDay).map(([day, dayItems]) => (
        <div key={day}>
          <div className="schedule-day-label">🏮 {day}</div>
          {dayItems.map(item => (
            <div key={item.id} className="sched-item">
              <div className="sched-time">{item.time}</div>
              <div className="sched-info">
                <div className="sched-subject">{item.subject}</div>
                {item.location && (
                  <div className="sched-location">📍 {item.location}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

// ── Главный компонент ──────────────────────────────────────────────────
const SchedulePage = () => {
  const { userId } = useTelegram();
  const { hapticFeedback } = useTelegram();

  const [announcements, setAnnouncements] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [ann, sch] = await Promise.all([
        scheduleApi.getAnnouncements(),
        scheduleApi.getDaily(),
      ]);
      setAnnouncements(ann);
      setSchedule(sch);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleReact = async (id, emoji) => {
    if (!userId) return;
    try {
      await scheduleApi.reactToAnnouncement(id, emoji, userId);
      hapticFeedback('light');
      // Оптимистично обновляем счётчик локально
      setAnnouncements(prev => prev.map(a => {
        if (a.id !== id) return a;
        const reactions = [...(a.reactions || [])];
        const idx = reactions.findIndex(r => r.emoji === emoji);
        if (idx >= 0) {
          reactions[idx] = { ...reactions[idx], count: reactions[idx].count + 1 };
        } else {
          reactions.push({ emoji, count: 1 });
        }
        return { ...a, reactions };
      }));
    } catch {
      // Перезагружаем при ошибке
      load();
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-spinner">
          <div className="dragon-loader"></div>
          <p>Загрузка...</p>
          <p className="cn-text">正在加载...</p>
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
          <button onClick={load}>Повторить</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container schedule-page">

      {/* ЗАГОЛОВОК */}
      <div className="page-hdr">
        <div>
          <div className="page-hdr-title">
            НОВОСТИ <span className="page-hdr-cn">新闻</span>
          </div>
          <div className="page-hdr-sub">&gt; xīn wén // объявления от вожатых</div>
        </div>
        <button className="lb-refresh-btn" onClick={load} title="Обновить">
          <IconRefresh size={18} />
        </button>
      </div>

      {/* ОБЪЯВЛЕНИЯ */}
      <div className="sc-section">
        {announcements.length > 0 ? (
          announcements.map(a => (
            <AnnouncementCard key={a.id} item={a} onReact={handleReact} />
          ))
        ) : (
          <div className="empty-state">
            <p>Объявлений пока нет</p>
            <span className="hint">暂无公告</span>
          </div>
        )}
      </div>

      {/* РАЗДЕЛИТЕЛЬ */}
      <div className="cn-divider">📅 课表 РАСПИСАНИЕ</div>

      {/* РАСПИСАНИЕ */}
      <div className="sc-section">
        {schedule.length > 0 ? (
          <ScheduleSection items={schedule} />
        ) : (
          <div className="empty-state">
            <p>Расписание не добавлено</p>
            <span className="hint">暂无课表</span>
          </div>
        )}
      </div>

      <div className="bg-decoration">课</div>
    </div>
  );
};

export default SchedulePage;
