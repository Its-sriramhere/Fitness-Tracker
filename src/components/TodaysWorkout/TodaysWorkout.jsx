import { useState, useEffect, useRef } from 'react'
import { getState, saveState, getCurrentUser } from '../../store/Store'
import { formatTime, formatMMSS, formatISO, getToday } from '../../utils/helpers'
import { IconPlay, IconPause } from '../../icons/SvgIcons'

export default function TodaysWorkout() {
  const [s, setS] = useState(getState())
  const [workout, setWorkout] = useState(null)
  const [seconds, setSeconds] = useState(0)
  const [paused, setPaused] = useState(false)
  const [restSeconds, setRestSeconds] = useState(0)
  const [restActive, setRestActive] = useState(false)
  const [restNext, setRestNext] = useState('')

  const [streakAnim, setStreakAnim] = useState(false)
  const [openDay, setOpenDay] = useState(null)
  const [started, setStarted] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const timerRef = useRef(null)
  const restTimerRef = useRef(null)
  const pausedRef = useRef(false)
  const prevStreakRef = useRef(0)

  const user = getCurrentUser()

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const todayIndex = new Date().getDay()
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - todayIndex + i)
    const ds = formatISO(d)
    const hasWorkout = s.history.some(h => formatISO(new Date(h.date)) === ds)
    return { index: i, name: dayNames[i], date: d, isToday: i === todayIndex, hasWorkout }
  })

  let streak = 0
  for (let i = 0; i <= todayIndex; i++) {
    const d = new Date(); d.setDate(d.getDate() - (todayIndex - i))
    const ds = formatISO(d)
    if (s.history.some(h => formatISO(new Date(h.date)) === ds)) streak++
    else break
  }

  const yesterday = new Date(getToday())
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = formatISO(yesterday)
  const yesterdayWorkout = s.history.find(h => formatISO(new Date(h.date)) === yesterdayStr)

  useEffect(() => {
    if (streak > 0 && streak > prevStreakRef.current) {
      setStreakAnim(true)
      setTimeout(() => setStreakAnim(false), 800)
    }
    prevStreakRef.current = streak
  }, [streak])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (restTimerRef.current) clearInterval(restTimerRef.current)
    }
  }, [])

  const startTimer = () => {
    setStarted(true)
    setSeconds(0)
    setPaused(false)
    pausedRef.current = false
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      if (!pausedRef.current) {
        setSeconds(prev => prev + 1)
      }
    }, 1000)
  }

  const selectWorkout = (id) => {
    setStarted(false)
    if (!id) { setWorkout(null); return }
    const w = s.savedWorkouts.find(x => x.id === id)
    if (!w) return
    const wData = JSON.parse(JSON.stringify(w))
    wData.exercises = wData.exercises.map(e => {
      const ex = s.exercises.find(x => x.id === e.exId)
      return { ...e, name: ex ? ex.name : 'Exercise', sets: Array.from({ length: e.sets || 3 }, () => ({ reps: e.reps || 10, weight: 0, done: false })) }
    })
    setWorkout(wData)
    setSeconds(0)
    setPaused(false)
    pausedRef.current = false
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }

  const toggleSet = (ei, si) => {
    if (!workout) return
    const w = { ...workout }
    w.exercises[ei].sets[si].done = !w.exercises[ei].sets[si].done
    setWorkout(w)
    if (w.exercises[ei].sets[si].done) {
      const u = getCurrentUser()
      const restDur = u ? u.restTimer : 90
      setRestSeconds(restDur)
      setRestNext(w.exercises[ei].name)
      setRestActive(true)
      if (restTimerRef.current) clearInterval(restTimerRef.current)
      restTimerRef.current = setInterval(() => {
        setRestSeconds(prev => {
          if (prev <= 1) { clearInterval(restTimerRef.current); setRestActive(false); return 0 }
          return prev - 1
        })
      }, 1000)
    }
  }

  const skipRest = () => {
    if (restTimerRef.current) clearInterval(restTimerRef.current)
    setRestActive(false)
    setRestSeconds(0)
  }

  const togglePause = () => {
    pausedRef.current = !pausedRef.current
    setPaused(pausedRef.current)
  }

  const complete = () => {
    if (!workout) return
    if (restTimerRef.current) clearInterval(restTimerRef.current)
    if (timerRef.current) clearInterval(timerRef.current)
    const doneSets = workout.exercises.reduce((a, e) => a + e.sets.filter(s => s.done).length, 0)
    const totalSets = workout.exercises.reduce((a, e) => a + e.sets.length, 0)
    if (doneSets < totalSets && !confirm(`${doneSets}/${totalSets} sets done. Complete anyway?`)) return
    const duration = Math.round(seconds / 60)
    const cals = Math.round(seconds * 0.05)
    s.history.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: workout.name, date: new Date().toISOString(), duration, calories: cals,
      exercises: workout.exercises.map(e => ({ name: e.name, sets: e.sets.map(s => ({ reps: s.reps, weight: s.weight, done: s.done })) }))
    })
    saveState()
    setWorkout(null)
    setSeconds(0)
    setStarted(false)
    alert('Workout completed! Logged to history.')
  }

  const totalSets = workout?.exercises.reduce((a, e) => a + e.sets.length, 0) || 0
  const doneSets = workout?.exercises.reduce((a, e) => a + e.sets.filter(s => s.done).length, 0) || 0

  const yesterdayPct = yesterdayWorkout
    ? Math.min(100, Math.round((yesterdayWorkout.duration / 60) * 100))
    : 0
  const circRadius = 40
  const circC = 2 * Math.PI * circRadius
  const circOff = circC - (circC * yesterdayPct) / 100

  return (
    <div>
      <div className="glass" style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '16px 28px', marginBottom: 20 }}>
        <div className="streak-figure" style={{ position: 'relative', width: 64, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/streak-figure.jpg" alt="Muscular figure" style={{ height: '100%', objectFit: 'contain', borderRadius: 8 }} />
          {streakAnim && [0,1,2,3,4,5].map(i => {
            const angle = i * 60 * Math.PI / 180
            const dist = 18 + i * 6
            return (
              <span key={i} className="streak-star" style={{
                position: 'absolute', left: '50%', top: '70%', fontSize: '0.9rem',
                '--dx': `${Math.cos(angle) * dist}px`, '--dy': `${Math.sin(angle) * dist}px`
              }}>✨</span>
            )
          })}
        </div>
        <div>
          <div className="streak-glowing" style={{ fontSize: '2.4rem', fontWeight: 900, lineHeight: 1, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums', transformOrigin: 'left center' }}>
            {streak}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Week Streak</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{streak === 0 ? 'No workouts yet' : streak >= 5 ? 'Perfect week!' : 'Keep going!'}</div>
        </div>
      </div>

      <div className="glass" style={{ padding: '16px 24px', marginBottom: 20 }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 10 }}>This Week</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
          {weekDays.map(day => (
            <div key={day.index} style={{
              flex: 1, textAlign: 'center', padding: '8px 0', borderRadius: 8,
              background: day.isToday ? 'var(--accent)' : day.hasWorkout ? 'rgba(16,185,129,0.15)' : 'var(--bg-secondary)',
              color: day.isToday ? '#fff' : day.hasWorkout ? 'var(--green)' : 'var(--text-muted)',
              fontWeight: day.isToday ? 700 : 500, fontSize: '0.8rem', transition: 'var(--transition)'
            }}>
              {day.hasWorkout && <span style={{ display: 'block', fontSize: '1.1rem', lineHeight: 1, marginBottom: 2 }}>💪</span>}
              {day.name}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 2 }}>Welcome back, {user?.name?.split(' ')[0] || 'Athlete'}!</h2>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
      </div>

      <div className="glass" style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '20px 28px', marginBottom: 24 }}>
        <svg width="96" height="96" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={circRadius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <circle cx="50" cy="50" r={circRadius} fill="none" stroke="var(--accent)" strokeWidth="8"
            strokeLinecap="round" strokeDasharray={circC} strokeDashoffset={circOff}
            transform="rotate(-90 50 50)" style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
          <text x="50" y="50" textAnchor="middle" dominantBaseline="central"
            fill="var(--text-primary)" fontSize="24" fontWeight="800">{yesterdayPct}%</text>
        </svg>
        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 2 }}>Yesterday's Workout</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>{yesterdayWorkout ? yesterdayWorkout.name : 'Rest Day'}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {yesterdayWorkout ? `${yesterdayWorkout.duration} min | ${yesterdayWorkout.calories} cal` : 'No workout logged'}
          </div>
        </div>
      </div>

      <div className="glass" style={{ padding: '16px 24px', marginBottom: 24 }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 12 }}>Weekly Workout Plan</div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
          {weekDays.map(day => {
            const pid = s.weeklyPlan?.[day.index]
            const isExercise = pid && pid.startsWith('ex:')
            const planned = pid
              ? isExercise
                ? s.exercises.find(e => e.id === pid.replace('ex:', ''))
                : s.savedWorkouts.find(w => w.id === pid)
              : null
            return (
              <div key={day.index} style={{ flex: 1, position: 'relative' }}>
                <div onClick={() => {
                  if (planned && !day.hasWorkout) {
                    if (isExercise) {
                      selectWorkout(null)
                      const ex = planned
                      const wData = { id: 'tmp', name: ex.name, exercises: [{ name: ex.name, sets: [{ reps: 10, weight: 0, done: false }] }] }
                      setWorkout(wData)
                    } else {
                      selectWorkout(planned.id)
                    }
                  }
                  setOpenDay(openDay === day.index ? null : day.index)
                }} style={{
                  textAlign: 'center', padding: '10px 4px', borderRadius: 8, cursor: 'pointer',
                  background: day.isToday ? 'var(--accent)' : day.hasWorkout ? 'rgba(16,185,129,0.15)' : 'var(--bg-secondary)',
                  border: day.isToday ? '2px solid var(--accent)' : '1px solid var(--border)',
                  transition: 'var(--transition)', minHeight: 72,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
                }}>
                  <div style={{
                    fontSize: '0.75rem', fontWeight: 600,
                    color: day.isToday ? '#fff' : 'var(--text-secondary)'
                  }}>{day.name}</div>
                  {planned ? (
                    <div style={{
                      fontSize: '0.7rem', fontWeight: 700, lineHeight: 1.2,
                      color: day.isToday ? '#fff' : day.hasWorkout ? 'var(--green)' : 'var(--text-primary)'
                    }}>{planned.name}{isExercise ? '' : ''}</div>
                  ) : (
                    <div style={{
                      fontSize: '1.4rem', lineHeight: 1,
                      color: day.isToday ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)'
                    }}>+</div>
                  )}
                  {day.hasWorkout && <span style={{
                    fontSize: '0.65rem', color: 'var(--green)', fontWeight: 600
                  }}>✓ Done</span>}
                </div>
                {openDay === day.index && (
                  <>
                    <div style={{
                      position: 'fixed', inset: 0, zIndex: 98, background: 'transparent'
                    }} onClick={() => setOpenDay(null)} />
                    <div style={{
                      position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                      zIndex: 99, marginTop: 6, minWidth: 220, maxHeight: 340, overflowY: 'auto',
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      borderRadius: 10, boxShadow: 'var(--shadow-lg)',
                      animation: 'modalIn 0.2s ease',
                    }}>
                      <div style={{ padding: '6px 10px', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {['All', 'Gym', 'CrossFit', 'Athleteism'].map(cat => (
                          <button key={cat} onClick={() => setSelectedCategory(cat)} style={{
                            padding: '3px 10px', border: 'none', borderRadius: 12, cursor: 'pointer',
                            fontSize: '0.72rem', fontWeight: 600, fontFamily: 'var(--font-sans)',
                            background: selectedCategory === cat ? 'var(--accent)' : 'var(--bg-secondary)',
                            color: selectedCategory === cat ? '#fff' : 'var(--text-secondary)',
                            transition: 'var(--transition)',
                          }}>{cat}</button>
                        ))}
                      </div>
                      <div style={{ borderTop: '1px solid var(--border)', padding: '4px 0' }}>
                        <div style={{ padding: '4px 14px', fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Exercises</div>
                        {s.exercises
                          .filter(ex => selectedCategory === 'All' || ex.category === (selectedCategory === 'Athleteism' ? 'Athletics' : selectedCategory))
                          .map(ex => (
                          <button key={ex.id} onClick={() => {
                            s.weeklyPlan = { ...s.weeklyPlan, [day.index]: 'ex:' + ex.id }
                            saveState(); setS({ ...s }); setOpenDay(null)
                          }} style={{
                            display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                            padding: '5px 14px', border: 'none',
                            background: pid === ('ex:' + ex.id) ? 'rgba(16,185,129,0.12)' : 'transparent',
                            color: pid === ('ex:' + ex.id) ? 'var(--green)' : 'var(--text-secondary)',
                            cursor: 'pointer', fontSize: '0.78rem', textAlign: 'left',
                            fontFamily: 'var(--font-sans)', transition: 'var(--transition)',
                          }}
                            onMouseEnter={e => e.target.style.background = 'var(--bg-hover)'}
                            onMouseLeave={e => e.target.style.background = pid === ('ex:' + ex.id) ? 'rgba(16,185,129,0.12)' : 'transparent'}
                          >
                            <span style={{ fontSize: '0.8rem' }}>▸</span>
                            <span>{ex.name}</span>
                            <span style={{ marginLeft: 'auto', fontSize: '0.6rem', color: 'var(--text-muted)' }}>{ex.muscle}</span>
                          </button>
                        ))}
                      </div>
                      <div style={{ borderTop: '1px solid var(--border)', padding: '4px 0' }}>
                        <button onClick={() => {
                          s.weeklyPlan = { ...s.weeklyPlan, [day.index]: '' }
                          saveState(); setS({ ...s }); setOpenDay(null)
                        }} style={{
                          display: 'block', width: '100%', padding: '6px 14px', border: 'none',
                          background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer',
                          fontSize: '0.78rem', textAlign: 'left', fontFamily: 'var(--font-sans)',
                        }}>— Rest Day —</button>
                        {s.savedWorkouts.filter(w => !['sw7','sw8','sw9','sw10','sw11'].includes(w.id)).map(w => (
                          <button key={w.id} onClick={() => {
                            s.weeklyPlan = { ...s.weeklyPlan, [day.index]: w.id }
                            saveState(); setS({ ...s }); setOpenDay(null)
                          }} style={{
                            display: 'block', width: '100%', padding: '6px 14px', border: 'none',
                            background: pid === w.id ? 'rgba(255,90,31,0.1)' : 'transparent',
                            color: pid === w.id ? 'var(--accent)' : 'var(--text-primary)',
                            cursor: 'pointer', fontSize: '0.78rem', textAlign: 'left',
                            fontFamily: 'var(--font-sans)', transition: 'var(--transition)',
                          }}
                            onMouseEnter={e => e.target.style.background = 'var(--bg-hover)'}
                            onMouseLeave={e => e.target.style.background = pid === w.id ? 'rgba(255,90,31,0.1)' : 'transparent'}
                          >{w.name}</button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {workout && (
        <>
          {!started ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', marginBottom: 20 }}>
              <div className="glass" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '32px 48px' }}>
                <h3 style={{ fontSize: '1.2rem' }}>{workout.name}</h3>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {workout.exercises.length} exercises · {totalSets} sets
                </div>
                <button className="btn btn-primary btn-lg" onClick={startTimer} style={{ fontSize: '1.1rem', padding: '14px 48px' }}>
                  <IconPlay /> Start Workout
                </button>
              </div>
            </div>
          ) : (
            <div className="glass" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 20, marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: 'var(--accent)' }}>{formatTime(seconds)}</span>
                <button className={`btn btn-sm ${paused ? 'btn-primary' : 'btn-ghost'}`} onClick={togglePause}>
                  {paused ? <IconPlay /> : <IconPause />} {paused ? 'Resume' : 'Pause'}
                </button>
              </div>
              <div style={{ display: 'flex', gap: 20, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <span>Calories: <strong style={{ color: 'var(--text-primary)' }}>{Math.round(seconds * 0.05)}</strong></span>
                <span>Exercises: <strong style={{ color: 'var(--text-primary)' }}>{workout.exercises.length}</strong></span>
                <span>Sets: <strong style={{ color: 'var(--text-primary)' }}>{doneSets}</strong>/{totalSets}</span>
              </div>
            </div>
          )}

          {workout.exercises.map((ex, ei) => (
            <div key={ei} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 600 }}>{ex.name}</span>
                {ex.sets.every(s => s.done) && <span style={{ color: 'var(--green)', fontSize: '0.85rem' }}>&#10003; Complete</span>}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {ex.sets.map((s, si) => (
                  <label key={si} className={`set-check${s.done ? ' completed' : ''}`} style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px',
                    background: s.done ? 'rgba(16,185,129,0.15)' : 'var(--bg-secondary)',
                    borderRadius: 6, fontSize: '0.85rem', cursor: 'pointer', transition: 'var(--transition)',
                    color: s.done ? 'var(--green)' : 'inherit',
                  }} onClick={() => toggleSet(ei, si)}>
                    <input type="checkbox" checked={s.done} onChange={() => {}} style={{ width: 'auto', accentColor: 'var(--accent)' }} />
                    Set {si + 1} {s.weight > 0 ? `${s.weight}kg ` : ''}&times; {s.reps}
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <button className="btn btn-primary btn-lg" onClick={complete}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              Complete Workout
            </button>
          </div>
        </>
      )}

      {!workout && (
        <div className="empty-state">Tap a day tile above to plan and start your workout.</div>
      )}

      {restActive && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass" style={{ textAlign: 'center', padding: '40px 60px', animation: 'modalIn 0.3s ease' }}>
            <h3 style={{ marginBottom: 8 }}>Rest Timer</h3>
            <div style={{ fontSize: '4rem', fontWeight: 800, margin: '20px 0', color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>{formatMMSS(restSeconds)}</div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: '0.95rem' }}>Next: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{restNext}</span></div>
            <button className="btn btn-primary" onClick={skipRest}>Skip Rest</button>
          </div>
        </div>
      )}
    </div>
  )
}
