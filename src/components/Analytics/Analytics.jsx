import { useState } from 'react'
import { getState } from '../../store/Store'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Filler, Tooltip, Legend } from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Filler, Tooltip, Legend)

export default function Analytics() {
  const [s] = useState(getState())
  const history = [...s.history].sort((a, b) => new Date(a.date) - new Date(b.date))

  const bestBench = history.filter(h => h.exercises.some(e => e.name === 'Bench Press')).map(h => {
    const maxW = Math.max(...h.exercises.filter(e => e.name === 'Bench Press').flatMap(e => e.sets.map(s => s.weight || 0)))
    return { date: h.date, weight: maxW }
  }).filter(d => d.weight > 0)

  const weeks = 8
  const weekLabels = [], weekData = []
  for (let i = weeks - 1; i >= 0; i--) {
    const start = new Date(); start.setDate(start.getDate() - start.getDay() - i * 7)
    const end = new Date(start); end.setDate(end.getDate() + 7)
    weekLabels.push('W' + String(weeks - i))
    weekData.push(history.filter(h => { const d = new Date(h.date); return d >= start && d < end }).length)
  }

  const muscleCount = {}
  history.forEach(h => h.exercises.forEach(e => {
    const ex = s.exercises.find(x => x.name === e.name)
    if (ex) muscleCount[ex.muscle] = (muscleCount[ex.muscle] || 0) + 1
  }))

  const volData = history.slice(-20).map(h => {
    const vol = h.exercises.reduce((a, e) => a + e.sets.reduce((s, set) => s + (set.reps || 0) * (set.weight || 0), 0), 0)
    return { date: h.date, volume: vol }
  })

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b7280' } }, x: { grid: { display: false }, ticks: { color: '#6b7280' } } }
  }

  return (
    <div>
      <h3 style={{ marginBottom: 24 }}>Analytics Dashboard</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: 24 }}>
        <div className="glass chart-card wide">
          <h3>Strength Progress</h3>
          {bestBench.length ? (
            <Line data={{
              labels: bestBench.map(b => new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
              datasets: [{ label: 'Bench Press (kg)', data: bestBench.map(b => b.weight), borderColor: '#FF5A1F', backgroundColor: 'rgba(255,90,31,0.08)', fill: true, tension: 0.4 }]
            }} options={{ ...chartOpts, plugins: { legend: { labels: { color: '#9ca3b5' } } } }} />
          ) : <div className="empty-state">No bench press data</div>}
        </div>
        <div className="glass chart-card">
          <h3>Workouts Per Week</h3>
          <Bar data={{
            labels: weekLabels,
            datasets: [{ label: 'Workouts', data: weekData, backgroundColor: 'rgba(255,90,31,0.5)', borderColor: '#FF5A1F', borderWidth: 1, borderRadius: 4 }]
          }} options={{ ...chartOpts, plugins: { legend: { display: false } }, scales: { ...chartOpts.scales, y: { ...chartOpts.scales.y, beginAtZero: true, ticks: { ...chartOpts.scales.y.ticks, stepSize: 1 } } } }} />
        </div>
        <div className="glass chart-card">
          <h3>Muscle Distribution</h3>
          <Doughnut data={{
            labels: Object.keys(muscleCount),
            datasets: [{ data: Object.values(muscleCount), backgroundColor: ['#FF5A1F', '#10b981', '#f97316', '#ef4444', '#8b5cf6', '#ec4899', '#3b82f6', '#f59e0b'] }]
          }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#9ca3b5', padding: 12 } } } }} />
        </div>
        <div className="glass chart-card wide">
          <h3>Volume Over Time</h3>
          <Bar data={{
            labels: volData.map(v => new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
            datasets: [{ label: 'Volume (kg)', data: volData.map(v => v.volume), backgroundColor: 'rgba(255,90,31,0.4)', borderColor: '#FF5A1F', borderWidth: 1, borderRadius: 4 }]
          }} options={{ ...chartOpts, plugins: { legend: { labels: { color: '#9ca3b5' } } } }} />
        </div>
      </div>
    </div>
  )
}
