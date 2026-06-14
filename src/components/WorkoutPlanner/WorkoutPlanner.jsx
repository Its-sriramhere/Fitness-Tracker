import { useState } from 'react'
import { getState, saveState, uid } from '../../store/Store'
import { IconPlus, IconGym, IconCrossFit, IconAthletics, IconCardio, IconMobility, IconSports } from '../../icons/SvgIcons'

export default function WorkoutPlanner() {
  const [s, setS] = useState(getState())
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('all')
  const [muscle, setMuscle] = useState('all')
  const [plan, setPlan] = useState([])
  const [planName, setPlanName] = useState('')
  const [showPanel, setShowPanel] = useState(false)
  const [refresh, setRefresh] = useState(0)

  const exercises = s.exercises.filter(e => {
    if (q && !e.name.toLowerCase().includes(q.toLowerCase())) return false
    if (cat !== 'all' && e.category !== cat) return false
    if (muscle !== 'all' && e.muscle !== muscle) return false
    return true
  })

  const addToPlan = (exId) => {
    const ex = s.exercises.find(e => e.id === exId)
    if (!ex) return
    setPlan([...plan, { exId: ex.id, name: ex.name, sets: 3, reps: 10 }])
    setShowPanel(true)
  }

  const updateEx = (i, field, val) => {
    const p = [...plan]; p[i][field] = val; setPlan(p)
  }

  const removeEx = (i) => {
    const p = plan.filter((_, idx) => idx !== i)
    setPlan(p)
    if (p.length === 0) setShowPanel(false)
  }

  const savePlan = () => {
    const name = prompt('Workout name:')
    if (!name) return
    s.savedWorkouts.push({ id: uid(), name, category: 'Gym', exercises: plan.map(e => ({ exId: e.exId, sets: e.sets, reps: e.reps })) })
    saveState()
    setPlan([]); setShowPanel(false); setRefresh(r => r + 1)
  }

  const catIcons = { Gym: IconGym, CrossFit: IconCrossFit, Athletics: IconAthletics, Cardio: IconCardio, Mobility: IconMobility, Sports: IconSports }

  const startWorkout = (id) => {
    window.location.hash = `#todays-workout-${id}`
  }

  const deleteWorkout = (id) => {
    s.savedWorkouts = s.savedWorkouts.filter(w => w.id !== id)
    saveState()
    setS({ ...s })
    setRefresh(r => r + 1)
  }

  return (
    <div>
      <div className="view-header">
        <h3>Create Workout Plan</h3>
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <input type="text" placeholder="Search exercises..." value={q} onChange={e => setQ(e.target.value)} style={{ maxWidth: 260 }} />
        <select value={cat} onChange={e => setCat(e.target.value)} style={{ maxWidth: 180 }}>
          <option value="all">All Categories</option>
          <option value="Gym">Gym</option><option value="CrossFit">CrossFit</option><option value="Athletics">Athletics</option>
          <option value="Sports">Sports</option><option value="Cardio">Cardio</option><option value="Mobility">Mobility</option>
        </select>
        <select value={muscle} onChange={e => setMuscle(e.target.value)} style={{ maxWidth: 180 }}>
          <option value="all">All Muscles</option>
          <option value="Chest">Chest</option><option value="Back">Back</option><option value="Shoulders">Shoulders</option>
          <option value="Legs">Legs</option><option value="Arms">Arms</option><option value="Core">Core</option>
          <option value="Full Body">Full Body</option><option value="Cardio">Cardio</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginBottom: 24 }}>
        {exercises.map(e => (
          <div key={e.id} className="exercise-card" style={{
            padding: 16, borderRadius: 'var(--radius)', cursor: 'pointer',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            transition: 'var(--transition)',
          }}>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 4 }}>{e.name}</div>
            <div style={{ display: 'flex', gap: 8, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span style={{ background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: 4 }}>{e.category}</span>
              <span style={{ background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: 4 }}>{e.muscle}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <button className="btn btn-sm btn-primary" onClick={() => addToPlan(e.id)}>
                <IconPlus /> Add
              </button>
              <span style={{ color: 'var(--text-muted)', display: 'flex' }}>
                {(catIcons[e.category] || (() => null))()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {showPanel && (
        <div className="glass" style={{ padding: 20, marginBottom: 24 }}>
          <h3 style={{ marginBottom: 12 }}>Current Plan</h3>
          {plan.map((ex, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ flex: 1, fontWeight: 600 }}>{ex.name}</span>
              <label style={{ fontSize: '0.85rem' }}>Sets: <input type="number" value={ex.sets} min="1" style={{ width: 50 }} onChange={e => updateEx(i, 'sets', +e.target.value)} /></label>
              <label style={{ fontSize: '0.85rem' }}>Reps: <input type="number" value={ex.reps} min="1" style={{ width: 50 }} onChange={e => updateEx(i, 'reps', +e.target.value)} /></label>
              <button className="btn btn-sm btn-ghost" onClick={() => removeEx(i)}>&times;</button>
            </div>
          ))}
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={savePlan}>Save Workout</button>
            <button className="btn btn-ghost" onClick={() => { setPlan([]); setShowPanel(false) }}>Cancel</button>
          </div>
        </div>
      )}

      <div>
        <h3 style={{ marginBottom: 16 }}>Saved Workouts</h3>
        {s.savedWorkouts.map(w => (
          <div key={w.id} style={{
            padding: 16, background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', marginBottom: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontWeight: 600 }}>{w.name}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{w.exercises.length} exercises</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-sm btn-primary" onClick={() => startWorkout(w.id)}>Start</button>
              <button className="btn btn-sm btn-ghost" onClick={() => deleteWorkout(w.id)}>&times;</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
