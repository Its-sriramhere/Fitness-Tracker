import { useState, useEffect } from 'react'
import { getState, getCurrentUser, saveState } from '../../store/Store'

export default function Settings() {
  const [s, setS] = useState(getState())
  const [user, setUser] = useState(getCurrentUser())

  const update = (field, value) => {
    if (!user) return
    user[field] = value
    saveState()
    setS({ ...s })
  }

  const exportData = () => {
    const blob = new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'bifit-backup.json'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const resetAll = () => {
    if (confirm('Reset all data?')) {
      localStorage.removeItem('bifit_state')
      location.reload()
    }
  }

  if (!user) return null

  return (
    <div>
      <h3 style={{ marginBottom: 24 }}>Settings</h3>
      <div className="glass" style={{ padding: 24, marginBottom: 20 }}>
        <h4 style={{ marginBottom: 16, fontSize: '1rem' }}>Profile</h4>
        <div className="form-group">
          <label>Display Name</label>
          <input value={user.name || ''} onChange={e => update('name', e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group"><label>Weight (kg)</label><input type="number" value={user.weight || ''} step="0.1" onChange={e => update('weight', parseFloat(e.target.value) || user.weight)} /></div>
          <div className="form-group"><label>Height (cm)</label><input type="number" value={user.height || ''} onChange={e => update('height', parseInt(e.target.value) || user.height)} /></div>
          <div className="form-group"><label>Age</label><input type="number" value={user.age || ''} onChange={e => update('age', parseInt(e.target.value) || user.age)} /></div>
        </div>
      </div>

      <div className="glass" style={{ padding: 24, marginBottom: 20 }}>
        <h4 style={{ marginBottom: 16, fontSize: '1rem' }}>Nutrition Targets</h4>
        <div className="form-row">
          {[
            { key: 'caloriesTarget', label: 'Daily Calories' },
            { key: 'proteinTarget', label: 'Protein (g)' },
            { key: 'carbsTarget', label: 'Carbs (g)' },
            { key: 'fatsTarget', label: 'Fats (g)' },
            { key: 'waterTarget', label: 'Water (glasses)' },
          ].map(f => (
            <div key={f.key} className="form-group">
              <label>{f.label}</label>
              <input type="number" value={user[f.key] || ''} onChange={e => update(f.key, parseInt(e.target.value) || 0)} />
            </div>
          ))}
        </div>
      </div>

      <div className="glass" style={{ padding: 24, marginBottom: 20 }}>
        <h4 style={{ marginBottom: 16, fontSize: '1rem' }}>Preferences</h4>
        <div className="form-row">
          <div className="form-group">
            <label>Rest Timer (seconds)</label>
            <input type="number" value={user.restTimer || 90} min={15} max={300} onChange={e => update('restTimer', parseInt(e.target.value) || 90)} />
          </div>
          <div className="form-group">
            <label className="toggle-label" style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <span>Sound Effects</span>
              <input type="checkbox" checked={user.soundEnabled !== false} onChange={e => update('soundEnabled', e.target.checked)} />
              <span className="toggle-switch" />
            </label>
          </div>
        </div>
      </div>

      <div className="glass" style={{ padding: 24, marginBottom: 20, border: '1px solid rgba(239,68,68,0.2)' }}>
        <h4 style={{ marginBottom: 16, fontSize: '1rem', color: 'var(--red)' }}>Data Management</h4>
        <button className="btn btn-outline" onClick={exportData} style={{ marginRight: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export Data
        </button>
        <button className="btn btn-danger" onClick={resetAll}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
          Reset All Data
        </button>
      </div>
    </div>
  )
}
