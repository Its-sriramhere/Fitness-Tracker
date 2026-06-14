import { useState } from 'react'
import { IconLogo, IconDashboard, IconWorkout, IconLibrary, IconActivity, IconTrendingUp, IconChart, IconHistory, IconTarget, IconTimer, IconNutrition, IconSettings, IconMenu } from '../../icons/SvgIcons'
import Dashboard from '../Dashboard/Dashboard'
import WorkoutPlanner from '../WorkoutPlanner/WorkoutPlanner'
import ExerciseLibrary from '../ExerciseLibrary/ExerciseLibrary'
import TodaysWorkout from '../TodaysWorkout/TodaysWorkout'
import Progress from '../Progress/Progress'
import Analytics from '../Analytics/Analytics'
import History from '../History/History'
import Goals from '../Goals/Goals'
import Timers from '../Timers/Timers'
import Nutrition from '../Nutrition/Nutrition'
import Settings from '../Settings/Settings'
import DailyWelcome from '../Welcome/DailyWelcome'

const navItems = [
  { id: 'todays-workout', label: "Today's Workout", icon: IconActivity },
  { id: 'workout-planner', label: 'Workout Planner', icon: IconWorkout },
  { id: 'exercise-library', label: 'Exercise Library', icon: IconLibrary },
  { id: 'progress', label: 'Progress', icon: IconTrendingUp },
  { id: 'analytics', label: 'Analytics', icon: IconChart },
  { id: 'history', label: 'History', icon: IconHistory },
  { id: 'goals', label: 'Goals', icon: IconTarget },
  { id: 'timers', label: 'Timers', icon: IconTimer },
  { id: 'nutrition', label: 'Nutrition', icon: IconNutrition },
  { id: 'settings', label: 'Settings', icon: IconSettings },
  { id: 'dashboard', label: 'Dashboard', icon: IconDashboard },
]

const views = {
  welcome: DailyWelcome,
  'todays-workout': TodaysWorkout,
  dashboard: Dashboard,
  'workout-planner': WorkoutPlanner,
  'exercise-library': ExerciseLibrary,
  progress: Progress,
  analytics: Analytics,
  history: History,
  goals: Goals,
  timers: Timers,
  nutrition: Nutrition,
  settings: Settings,
}

export default function AppLayout({ user, onLogout }) {
  const [activeView, setActiveView] = useState('welcome')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const titles = {
    dashboard: 'Dashboard', 'workout-planner': 'Workout Planner', 'exercise-library': 'Exercise Library',
    'todays-workout': "Today's Workout", progress: 'Progress', analytics: 'Analytics', history: 'History',
    goals: 'Goals', timers: 'Timers', nutrition: 'Nutrition', settings: 'Settings',
  }

  const ActiveComponent = views[activeView]

  if (activeView === 'welcome') {
    return <DailyWelcome setActiveView={setActiveView} />
  }

  return (
    <div className="app-layout">
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`} style={{
        width: 'var(--sidebar-width)', background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50, transition: 'var(--transition)',
      }}>
        <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <IconLogo /> BIFIT
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '1rem', flexShrink: 0, color: '#fff',
          }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.name || 'User'}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email || ''}</span>
          </div>
        </div>
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveView(item.id); setSidebarOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px',
                width: '100%', borderRadius: 8, color: activeView === item.id ? 'var(--accent)' : 'var(--text-secondary)',
                textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500,
                transition: 'var(--transition)', marginBottom: 2, cursor: 'pointer',
                background: activeView === item.id ? 'rgba(255,90,31,0.1)' : 'transparent',
                border: 'none', fontFamily: 'var(--font-sans)', textAlign: 'left',
              }}
            >
              <item.icon /> {item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-ghost btn-full" onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header style={{
          display: 'flex', alignItems: 'center', gap: 16, padding: '12px 32px',
          height: 'var(--header-height)', borderBottom: '1px solid var(--border)',
          background: 'rgba(14,6,5,0.8)', backdropFilter: 'blur(12px)',
          position: 'sticky', top: 0, zIndex: 40,
        }}>
          <button className="btn-icon btn-ghost" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ position: 'relative', zIndex: 51 }}>
            <IconMenu />
          </button>
          <h1 className="page-title">{titles[activeView] || 'Dashboard'}</h1>
          <div style={{ marginLeft: 'auto', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </header>

        <div className="view-container">
          {ActiveComponent && <ActiveComponent user={user} setActiveView={setActiveView} />}
        </div>
      </main>

      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position: 'fixed', inset: 0, zIndex: 49, background: 'rgba(0,0,0,0.5)',
        }} />
      )}
    </div>
  )
}
