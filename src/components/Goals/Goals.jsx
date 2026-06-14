import { useState } from 'react'
import { getState, saveState, uid } from '../../store/Store'
import { IconPlus, IconClose, IconTarget } from '../../icons/SvgIcons'

export default function Goals() {
  const [s, setS] = useState(getState())
  const [showModal, setShowModal] = useState(false)
  const [g, setG] = useState({ title: '', target: '', unit: 'kg', deadline: new Date().toISOString().split('T')[0] })

  const updateProgress = (id) => {
    const goal = s.goals.find(g => g.id === id)
    if (!goal) return
    const val = parseFloat(document.getElementById(`goal-input-${id}`)?.value)
    if (!val) return
    goal.current = Math.min(goal.target, goal.current + val)
    saveState()
    setS({ ...s })
  }

  const del = (id) => {
    s.goals = s.goals.filter(g => g.id !== id)
    saveState()
    setS({ ...s })
  }

  const saveGoal = () => {
    if (!g.title || !g.target) return
    s.goals.push({
      id: uid(), title: g.title, target: parseInt(g.target), unit: g.unit,
      current: 0, deadline: new Date(g.deadline).toISOString(), createdAt: new Date().toISOString(),
    })
    saveState()
    setS({ ...s })
    setShowModal(false)
    setG({ title: '', target: '', unit: 'kg', deadline: new Date().toISOString().split('T')[0] })
  }

  return (
    <div>
      <div className="view-header">
        <h3>Goal Management</h3>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><IconPlus /> Add Goal</button>
      </div>
      {s.goals.length === 0 ? (
        <div className="empty-state">No goals set. Add one to start tracking!</div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {s.goals.map(g => {
            const pct = Math.min(100, Math.round((g.current / g.target) * 100))
            return (
              <div key={g.id} style={{ padding: 20, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontWeight: 600 }}>{g.title}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Due: {new Date(g.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8 }}>{g.current} / {g.target} {g.unit} ({pct}%)</div>
                <div style={{ height: 8, background: 'var(--bg-secondary)', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
                  <div style={{ height: '100%', borderRadius: 4, background: 'var(--accent)', width: `${pct}%`, transition: 'width 0.6s ease' }} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="number" placeholder="+ progress" style={{ width: 100 }} id={`goal-input-${g.id}`} />
                  <button className="btn btn-sm btn-primary" onClick={() => updateProgress(g.id)}>Update</button>
                  <button className="btn btn-sm btn-ghost" onClick={() => del(g.id)}>Delete</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" style={{ display: 'flex' }} onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="glass" style={{ width: '90%', maxWidth: 440, padding: 40, position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><IconClose /></button>
            <h2 style={{ marginBottom: 16 }}>Add Goal</h2>
            <div className="form-group"><label>Goal Title</label><input placeholder="e.g. Bench 100kg" value={g.title} onChange={e => setG({ ...g, title: e.target.value })} /></div>
            <div className="form-group"><label>Target Value</label><input type="number" placeholder="100" min="1" value={g.target} onChange={e => setG({ ...g, target: e.target.value })} /></div>
            <div className="form-group"><label>Unit</label><input value={g.unit} onChange={e => setG({ ...g, unit: e.target.value })} /></div>
            <div className="form-group"><label>Deadline</label><input type="date" value={g.deadline} onChange={e => setG({ ...g, deadline: e.target.value })} /></div>
            <button className="btn btn-primary btn-full" onClick={saveGoal}>Save Goal</button>
          </div>
        </div>
      )}
    </div>
  )
}
