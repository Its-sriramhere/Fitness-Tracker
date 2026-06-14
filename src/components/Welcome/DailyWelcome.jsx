import { useState } from 'react'
import { getState, saveState, getCurrentUser } from '../../store/Store'
import { formatISO } from '../../utils/helpers'

export default function DailyWelcome({ setActiveView }) {
  const [s] = useState(getState())
  const user = getCurrentUser()

  const today = new Date()
  const todayStr = formatISO(today)
  if (s.welcomeDate !== todayStr) {
    s.welcomeDate = todayStr
    saveState()
  }

  const hour = today.getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening'

  const todayIndex = today.getDay()
  const pid = s.weeklyPlan?.[todayIndex]
  const todaysWorkout = pid ? s.savedWorkouts.find(w => w.id === pid) : null
  const hasWorkout = s.history.some(h => formatISO(new Date(h.date)) === todayStr)

  const quotes = [
    "Your only limit is you.",
    "No pain, no gain.",
    "The body achieves what the mind believes.",
    "Stay hard!",
    "Every rep counts."
  ]
  const quote = quotes[today.getDate() % quotes.length]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      background: 'var(--bg-deep)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 32, animation: 'fadeIn 0.5s ease'
    }}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
        maxWidth: 420, width: '100%'
      }}>
        <div style={{
          width: 120, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'streakBob 2s ease-in-out infinite'
        }}>
          <img src="/streak-figure.jpg" alt="Muscular figure" style={{ height: '100%', objectFit: 'contain', borderRadius: 12 }} />
        </div>

        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 4 }}>
            {greeting}, {user?.name?.split(' ')[0] || 'Athlete'}!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{quote}"</p>
        </div>

        <div className="glass" style={{ width: '100%', padding: '20px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8 }}>Today's Plan</div>
          {hasWorkout ? (
            <div style={{ color: 'var(--green)', fontWeight: 700, fontSize: '1.1rem' }}>
              💪 Complete! {s.history.find(h => formatISO(new Date(h.date)) === todayStr)?.name}
            </div>
          ) : todaysWorkout ? (
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{todaysWorkout.name}</div>
          ) : (
            <div style={{ color: 'var(--text-muted)' }}>Rest Day — You deserve it</div>
          )}
        </div>

        <button className="btn btn-primary btn-lg" onClick={() => setActiveView('todays-workout')} style={{
          fontSize: '1.1rem', padding: '16px 48px', marginTop: 8
        }}>
          Let's Go 🚀
        </button>
      </div>
    </div>
  )
}
