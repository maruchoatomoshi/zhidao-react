import { useState, useEffect } from 'react'
import { useTelegram } from './hooks/useTelegram'
import { useStore } from './hooks/useStore'
import HomePage from './pages/HomePage'
import LeaderboardPage from './pages/LeaderboardPage'
import './App.css'
import './theme.css'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const { userId } = useTelegram()
  const { fetchProfile } = useStore()

  useEffect(() => {
    if (userId) {
      fetchProfile(userId)
    }
  }, [userId, fetchProfile])

  const renderPage = () => {
    if (currentPage === 'home') {
      return <HomePage />
    }
    if (currentPage === 'leaderboard') {
      return <LeaderboardPage />
    }
    return (
      <div className="page-container">
        <h2>Страница в разработке: {currentPage}</h2>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="page-content">
        {renderPage()}
      </div>

      <nav className="bottom-nav">
        <button className={currentPage === 'home' ? 'active' : ''} onClick={() => setCurrentPage('home')}>🏠 主页</button>
        <button className={currentPage === 'schedule' ? 'active' : ''} onClick={() => setCurrentPage('schedule')}>📅 日程</button>
        <button className={currentPage === 'leaderboard' ? 'active' : ''} onClick={() => setCurrentPage('leaderboard')}>🏆 排名</button>
        <button className={currentPage === 'shop' ? 'active' : ''} onClick={() => setCurrentPage('shop')}>🛒 商店</button>
        <button className={currentPage === 'casino' ? 'active' : ''} onClick={() => setCurrentPage('casino')}>📦 箱子</button>
        <button className={currentPage === 'implants' ? 'active' : ''} onClick={() => setCurrentPage('implants')}>⚡ 植入物</button>
        <button className={currentPage === 'more' ? 'active' : ''} onClick={() => setCurrentPage('more')}>☰ 更多</button>
      </nav>
    </div>
  )
}

export default App