import { useState } from 'react'
import { getState, saveState, uid } from '../../store/Store'
import { IconPlus, IconClose } from '../../icons/SvgIcons'

export default function ExerciseLibrary() {
  const [s, setS] = useState(getState())
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('all')
  const [muscle, setMuscle] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [showDetail, setShowDetail] = useState(null)
  const [newEx, setNewEx] = useState({ name: '', category: 'Gym', muscle: 'Chest', desc: '' })

  const exercises = s.exercises.filter(e => {
    if (q && !e.name.toLowerCase().includes(q.toLowerCase())) return false
    if (cat !== 'all' && e.category !== cat) return false
    if (muscle !== 'all' && e.muscle !== muscle) return false
    return true
  })

  const saveCustom = () => {
    if (!newEx.name.trim()) return
    s.exercises.push({ id: uid(), ...newEx })
    saveState()
    setS({ ...s })
    setShowModal(false)
    setNewEx({ name: '', category: 'Gym', muscle: 'Chest', desc: '' })
  }

  return (
    <div>
      <div className="view-header">
        <h3>Exercise Library</h3>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><IconPlus /> Custom Exercise</button>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        {exercises.map(e => (
          <div key={e.id} className="exercise-card" style={{
            padding: 16, borderRadius: 'var(--radius)', cursor: 'pointer',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            transition: 'var(--transition)',
          }} onClick={() => setShowDetail(e)}>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 4 }}>{e.name}</div>
            <div style={{ display: 'flex', gap: 8, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span style={{ background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: 4 }}>{e.category}</span>
              <span style={{ background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: 4 }}>{e.muscle}</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" style={{ display: 'flex' }} onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="glass" style={{ width: '90%', maxWidth: 440, padding: 40, position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><IconClose /></button>
            <h2 style={{ marginBottom: 16 }}>Create Custom Exercise</h2>
            <div className="form-group"><label>Name</label><input value={newEx.name} onChange={e => setNewEx({ ...newEx, name: e.target.value })} /></div>
            <div className="form-group">
              <label>Category</label>
              <select value={newEx.category} onChange={e => setNewEx({ ...newEx, category: e.target.value })}>
                <option>Gym</option><option>CrossFit</option><option>Athletics</option><option>Sports</option><option>Cardio</option><option>Mobility</option>
              </select>
            </div>
            <div className="form-group">
              <label>Muscle Group</label>
              <select value={newEx.muscle} onChange={e => setNewEx({ ...newEx, muscle: e.target.value })}>
                <option>Chest</option><option>Back</option><option>Shoulders</option><option>Legs</option><option>Arms</option><option>Core</option><option>Full Body</option><option>Cardio</option>
              </select>
            </div>
            <div className="form-group"><label>Description</label><textarea value={newEx.desc} onChange={e => setNewEx({ ...newEx, desc: e.target.value })} rows={2} /></div>
            <button className="btn btn-primary btn-full" onClick={saveCustom}>Save Exercise</button>
          </div>
        </div>
      )}

      {showDetail && (
        <div className="modal-overlay" style={{ display: 'flex' }} onClick={e => { if (e.target === e.currentTarget) setShowDetail(null) }}>
          <div className="glass" style={{ width: '90%', maxWidth: 440, padding: 40, position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowDetail(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><IconClose /></button>
            <h2 style={{ marginBottom: 12 }}>{showDetail.name}</h2>
            <p style={{ marginBottom: 8 }}><strong style={{ color: 'var(--text-secondary)' }}>Category:</strong> {showDetail.category}</p>
            <p style={{ marginBottom: 8 }}><strong style={{ color: 'var(--text-secondary)' }}>Muscle Group:</strong> {showDetail.muscle}</p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{showDetail.desc}</p>
          </div>
        </div>
      )}
    </div>
  )
}
