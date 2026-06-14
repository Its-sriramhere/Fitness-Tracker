import { useState } from 'react'
import { getState, saveState } from '../../store/Store'
import { formatISO } from '../../utils/helpers'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

export default function Progress() {
  const [s, setS] = useState(getState())
  const [weightInput, setWeightInput] = useState('')

  const logWeight = () => {
    const val = parseFloat(weightInput)
    if (!val) return
    s.weightHistory.push({ date: new Date().toISOString(), weight: val })
    saveState()
    setS({ ...s })
    setWeightInput('')
  }

  const weightData = s.weightHistory?.length ? {
    labels: s.weightHistory.map(w => new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [{
      label: 'Weight (kg)', data: s.weightHistory.map(w => w.weight),
      borderColor: '#FF5A1F', backgroundColor: 'rgba(255,90,31,0.08)',
      fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: '#FF5A1F',
    }]
  } : null

  const now = new Date()
  const days = 84
  let heatHtml = ''
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i)
    const ds = formatISO(d)
    const hasWorkout = s.history.some(h => formatISO(new Date(h.date)) === ds)
    const count = s.history.filter(h => formatISO(new Date(h.date)) === ds).length
    let level = ''
    if (hasWorkout) {
      if (count >= 3) level = 'l4'
      else if (count === 2) level = 'l3'
      else level = 'l1'
    }
    heatHtml += `<div class="hm-day ${hasWorkout ? 'has-workout ' + level : ''}" title="${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}${hasWorkout ? ': ' + count + ' workout(s)' : ''}">${d.getDate()}</div>`
  }

  return (
    <div>
      <h3 style={{ marginBottom: 24 }}>Your Progress</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 24 }}>
        <div className="glass chart-card">
          <h3>Weight Log</h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input type="number" placeholder="Weight (kg)" step="0.1" value={weightInput} onChange={e => setWeightInput(e.target.value)} style={{ maxWidth: 160 }} />
            <button className="btn btn-primary btn-sm" onClick={logWeight}>Log</button>
          </div>
          {weightData ? (
            <Line data={weightData} options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b7280' } }, x: { grid: { display: false }, ticks: { color: '#6b7280', maxTicksLimit: 10 } } }
            }} />
          ) : <div className="empty-state">No data</div>}
        </div>
        <div className="glass chart-card">
          <h3>Workout Heatmap</h3>
          <div className="heatmap" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 12 }} dangerouslySetInnerHTML={{ __html: heatHtml }} />
          <style>{`
            .hm-day { aspect-ratio: 1; border-radius: 3px; background: var(--bg-card); font-size: 0.6rem; display: flex; align-items: center; justify-content: center; color: var(--text-muted); min-width: 0; overflow: hidden; }
            .hm-day.has-workout { background: var(--accent); opacity: 0.3; }
            .hm-day.has-workout.l1 { opacity: 0.4; }
            .hm-day.has-workout.l2 { opacity: 0.6; }
            .hm-day.has-workout.l3 { opacity: 0.75; }
            .hm-day.has-workout.l4 { opacity: 1; }
          `}</style>
          <div className="heatmap-legend" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>No workout</span>
            {['', 'l1', 'l2', 'l3', 'l4'].map((l, i) => (
              <span key={i} style={{
                width: 14, height: 14, borderRadius: 3,
                background: i === 0 ? 'var(--bg-card)' : 'var(--accent)',
                opacity: i === 0 ? 1 : [0, 0.35, 0.55, 0.75, 1][i],
              }} />
            ))}
            <span>Max</span>
          </div>
        </div>
      </div>
    </div>
  )
}
