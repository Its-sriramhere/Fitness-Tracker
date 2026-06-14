import { useState } from 'react'
import { getState, saveState } from '../../store/Store'
import { formatDate } from '../../utils/helpers'

export default function History() {
  const [s, setS] = useState(getState())
  const [q, setQ] = useState('')
  const [month, setMonth] = useState('all')

  let entries = [...s.history].sort((a, b) => new Date(b.date) - new Date(a.date))
  if (q) entries = entries.filter(h => h.name.toLowerCase().includes(q.toLowerCase()))
  if (month !== 'all' && !isNaN(parseInt(month))) {
    entries = entries.filter(h => new Date(h.date).getMonth() === parseInt(month))
  }

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  const del = (id) => {
    s.history = s.history.filter(h => h.id !== id)
    saveState()
    setS({ ...s })
  }

  return (
    <div>
      <h3 style={{ marginBottom: 24 }}>Workout History</h3>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <input type="text" placeholder="Search workouts..." value={q} onChange={e => setQ(e.target.value)} style={{ maxWidth: 260 }} />
        <select value={month} onChange={e => setMonth(e.target.value)} style={{ maxWidth: 160 }}>
          <option value="all">All Time</option>
          {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
      </div>
      {entries.length === 0 ? (
        <div className="empty-state">No workout history found.</div>
      ) : (
        entries.map(h => (
          <div key={h.id} style={{
            padding: 16, background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', marginBottom: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
          }}>
            <div>
              <div style={{ fontWeight: 600 }}>{h.name}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{formatDate(new Date(h.date))}</div>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {h.duration || 0} min | {h.calories || 0} cal | {h.exercises.reduce((a, e) => a + e.sets.length, 0)} sets
            </div>
            <button className="btn btn-sm btn-ghost" onClick={() => del(h.id)}>&times;</button>
          </div>
        ))
      )}
    </div>
  )
}
