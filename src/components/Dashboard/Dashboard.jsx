import { useState, useEffect, useRef } from 'react'
import { getState, getCurrentUser } from '../../store/Store'
import { formatISO, getToday } from '../../utils/helpers'
import { IconFlame, IconActivity } from '../../icons/SvgIcons'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip, Legend } from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip, Legend)

export default function Dashboard() {
  const [s, setS] = useState(getState())
  const [refreshKey, setRefreshKey] = useState(0)
  const weightRef = useRef(null)
  const consistencyRef = useRef(null)

  useEffect(() => {
    setS(getState())
    const interval = setInterval(() => setRefreshKey(k => k + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  const user = getCurrentUser()
  const today = getToday()
  const todayStr = formatISO(today)
  const todaysWorkout = s.history.find(h => formatISO(new Date(h.date)) === todayStr)
  const todayCalories = s.history.filter(h => formatISO(new Date(h.date)) === todayStr).reduce((a, h) => a + (h.calories || 0), 0)

  let streak = 0
  const d = new Date()
  while (true) {
    const ds = formatISO(d)
    if (s.history.some(h => formatISO(new Date(h.date)) === ds)) { streak++; d.setDate(d.getDate() - 1) }
    else break
  }

  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const weekWorkouts = s.history.filter(h => new Date(h.date) >= weekStart)
  const weeklyPct = Math.min(100, Math.round((weekWorkouts.length / 7) * 100))

  const weightData = s.weightHistory?.length ? {
    labels: s.weightHistory.slice(-14).map(w => new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [{
      label: 'Weight (kg)', data: s.weightHistory.slice(-14).map(w => w.weight),
      borderColor: '#FF5A1F', backgroundColor: 'rgba(255,90,31,0.08)',
      fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#FF5A1F',
    }]
  } : null

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const counts = days.map((_, i) => {
    const dayStart = new Date(); dayStart.setDate(dayStart.getDate() - dayStart.getDay() + i)
    const dayEnd = new Date(dayStart); dayEnd.setDate(dayEnd.getDate() + 1)
    return s.history.filter(h => { const hd = new Date(h.date); return hd >= dayStart && hd < dayEnd }).length
  })

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 32 }}>
        {[
          { label: "Today's Workout", value: todaysWorkout?.name || 'Rest Day', sub: todaysWorkout ? `${todaysWorkout.duration} min | ${todaysWorkout.calories} cal` : 'No workout scheduled', icon: IconActivity },
          { label: 'Calories Burned', value: todayCalories, sub: 'Today', icon: IconFlame },
          { label: 'Current Streak', value: streak, sub: 'Days', icon: null },
          { label: 'Weekly Progress', value: `${weeklyPct}%`, sub: 'This Week', icon: null },
        ].map((card, i) => (
          <div key={i} className="glass stat-card">
            <div className="stat-label">{card.label}</div>
            <div className="stat-value">{card.value}</div>
            <div className="stat-sub">{card.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: 24 }}>
        <div className="glass chart-card">
          <h3>Weight Trend</h3>
          {weightData ? (
            <Line ref={weightRef} data={weightData} options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b7280' } }, x: { grid: { display: false }, ticks: { color: '#6b7280' } } }
            }} />
          ) : <div className="empty-state">No data</div>}
        </div>
        <div className="glass chart-card">
          <h3>Workout Consistency</h3>
          <Bar ref={consistencyRef} data={{
            labels: days,
            datasets: [{ label: 'Workouts', data: counts, backgroundColor: 'rgba(255,90,31,0.5)', borderColor: '#FF5A1F', borderWidth: 1, borderRadius: 4 }]
          }} options={{
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b7280', stepSize: 1 } }, x: { grid: { display: false }, ticks: { color: '#6b7280' } } }
          }} />
        </div>
      </div>
    </div>
  )
}
