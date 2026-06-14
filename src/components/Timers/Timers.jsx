import { useState, useRef, useEffect } from 'react'
import { formatTime, formatMMSS } from '../../utils/helpers'
import { IconStopwatch } from '../../icons/SvgIcons'

export default function Timers() {
  const [tab, setTab] = useState('stopwatch')

  return (
    <div>
      <h3 style={{ marginBottom: 24 }}>Timers</h3>
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--bg-card)', padding: 4, borderRadius: 'var(--radius)' }}>
        {['stopwatch', 'interval', 'tabata', 'emom'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 20px', border: 'none', background: tab === t ? 'var(--accent)' : 'transparent',
            color: tab === t ? 'var(--bg-deep)' : 'var(--text-secondary)',
            cursor: 'pointer', borderRadius: 8, fontWeight: 500, transition: 'var(--transition)',
            fontFamily: 'var(--font-sans)', textTransform: 'capitalize',
          }}>{t}</button>
        ))}
      </div>
      {tab === 'stopwatch' && <Stopwatch />}
      {tab === 'interval' && <IntervalTimer />}
      {tab === 'tabata' && <TabataTimer />}
      {tab === 'emom' && <EmomTimer />}
    </div>
  )
}

function Stopwatch() {
  const [time, setTime] = useState(0)
  const [running, setRunning] = useState(false)
  const [laps, setLaps] = useState([])
  const [lapCount, setLapCount] = useState(0)
  const ref = useRef(null)

  const start = () => {
    if (running) return
    setRunning(true)
    ref.current = setInterval(() => setTime(t => t + 1), 1000)
  }

  const pause = () => {
    setRunning(false)
    if (ref.current) { clearInterval(ref.current); ref.current = null }
  }

  const reset = () => {
    setRunning(false)
    if (ref.current) { clearInterval(ref.current); ref.current = null }
    setTime(0); setLaps([]); setLapCount(0)
  }

  const lap = () => {
    setLapCount(c => c + 1)
    setLaps(l => [...l, { num: lapCount + 1, time }])
  }

  useEffect(() => () => { if (ref.current) clearInterval(ref.current) }, [])

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="timer-display" style={{ fontSize: '5rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums', margin: '24px 0', color: 'var(--accent)', lineHeight: 1 }}>
        {formatTime(time)}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={start}>Start</button>
        <button className="btn btn-ghost" onClick={pause}>Pause</button>
        <button className="btn btn-outline" onClick={reset}>Reset</button>
        <button className="btn btn-sm" onClick={lap}>Lap</button>
      </div>
      {laps.length > 0 && (
        <div style={{ maxWidth: 300, margin: '16px auto 0', textAlign: 'left' }}>
          {laps.map((l, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Lap {l.num}</span>
              <span>{formatTime(l.time)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function IntervalTimer() {
  const [work, setWork] = useState(30)
  const [rest, setRest] = useState(15)
  const [cycles, setCycles] = useState(8)
  const [time, setTime] = useState(30)
  const [phase, setPhase] = useState('Ready')
  const [running, setRunning] = useState(false)
  const ref = useRef(null)

  const start = () => {
    if (running) return
    setRunning(true)
    let w = work, r = rest, cyc = cycles, cycCount = 1, ph = 'work', t = work
    setTime(t); setPhase('Work')
    ref.current = setInterval(() => {
      t--
      setTime(t)
      if (t <= 0) {
        if (ph === 'work') {
          ph = 'rest'; t = r
          setPhase(`Rest (Cycle ${cycCount}/${cyc})`)
        } else {
          if (cycCount >= cyc) { clearInterval(ref.current); setRunning(false); setPhase('Complete!'); return }
          cycCount++; ph = 'work'; t = w
          setPhase(`Work (Cycle ${cycCount}/${cyc})`)
        }
        setTime(t)
      }
    }, 1000)
  }

  const stop = () => {
    if (ref.current) { clearInterval(ref.current); ref.current = null }
    setRunning(false); setPhase('Ready'); setTime(work)
  }

  useEffect(() => () => { if (ref.current) clearInterval(ref.current) }, [])

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap', marginBottom: 20 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Work (s): <input type="number" value={work} min="1" max="300" onChange={e => { setWork(+e.target.value); if (!running) setTime(+e.target.value) }} style={{ width: 60, textAlign: 'center' }} /></label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Rest (s): <input type="number" value={rest} min="1" max="300" onChange={e => setRest(+e.target.value)} style={{ width: 60, textAlign: 'center' }} /></label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Cycles: <input type="number" value={cycles} min="1" max="99" onChange={e => setCycles(+e.target.value)} style={{ width: 60, textAlign: 'center' }} /></label>
      </div>
      <div className="timer-display">{formatMMSS(time)}</div>
      <div className="timer-phase" style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>{phase}</div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
        <button className="btn btn-primary" onClick={start} disabled={running}>Start</button>
        <button className="btn btn-ghost" onClick={stop}>Stop</button>
      </div>
    </div>
  )
}

function TabataTimer() {
  const [prep, setPrep] = useState(10)
  const [work, setWork] = useState(20)
  const [rest, setRest] = useState(10)
  const [rounds, setRounds] = useState(8)
  const [time, setTime] = useState(10)
  const [phase, setPhase] = useState('Ready')
  const [round, setRound] = useState(0)
  const [running, setRunning] = useState(false)
  const ref = useRef(null)

  const start = () => {
    if (running) return
    setRunning(true)
    let p = prep > 0 ? 'prep' : 'work', t = p === 'prep' ? prep : work, r = 0
    setTime(t); setPhase(p === 'prep' ? 'Prepare' : 'Work'); setRound(0)
    ref.current = setInterval(() => {
      t--
      setTime(t)
      if (t <= 0) {
        if (p === 'prep') { p = 'work'; t = work; setPhase('Work'); setRound(1) }
        else if (p === 'work') {
          r++
          if (r >= rounds) { clearInterval(ref.current); setRunning(false); setPhase('Complete!'); return }
          p = 'rest'; t = rest; setPhase('Rest')
        } else {
          p = 'work'; t = work; setPhase('Work'); setRound(r + 1)
        }
        setTime(t)
      }
    }, 1000)
  }

  const stop = () => {
    if (ref.current) { clearInterval(ref.current); ref.current = null }
    setRunning(false); setPhase('Ready'); setRound(0); setTime(work)
  }

  useEffect(() => () => { if (ref.current) clearInterval(ref.current) }, [])

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap', marginBottom: 20 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Prep (s): <input type="number" value={prep} min="0" max="60" onChange={e => { setPrep(+e.target.value); if (!running) setTime(+e.target.value) }} style={{ width: 60, textAlign: 'center' }} /></label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Work (s): <input type="number" value={work} min="1" max="120" onChange={e => setWork(+e.target.value)} style={{ width: 60, textAlign: 'center' }} /></label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Rest (s): <input type="number" value={rest} min="1" max="120" onChange={e => setRest(+e.target.value)} style={{ width: 60, textAlign: 'center' }} /></label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Rounds: <input type="number" value={rounds} min="1" max="50" onChange={e => setRounds(+e.target.value)} style={{ width: 60, textAlign: 'center' }} /></label>
      </div>
      <div className="timer-display">{formatMMSS(time)}</div>
      <div className="timer-phase">{phase}</div>
      <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: 16 }}>Round {round}/{rounds}</div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
        <button className="btn btn-primary" onClick={start} disabled={running}>Start</button>
        <button className="btn btn-ghost" onClick={stop}>Stop</button>
      </div>
    </div>
  )
}

function EmomTimer() {
  const [work, setWork] = useState(40)
  const [rest, setRest] = useState(20)
  const [minutes, setMinutes] = useState(10)
  const [time, setTime] = useState(40)
  const [phase, setPhase] = useState('Ready')
  const [minute, setMinute] = useState(0)
  const [running, setRunning] = useState(false)
  const ref = useRef(null)

  const start = () => {
    if (running) return
    setRunning(true)
    let w = work, r = rest, mins = minutes, ph = 'work', t = work, m = 1
    setTime(t); setPhase('Work'); setMinute(1)
    ref.current = setInterval(() => {
      t--
      setTime(t)
      if (t <= 0) {
        if (ph === 'work') {
          ph = 'rest'; t = r; setPhase('Rest')
        } else {
          m++
          if (m > mins) { clearInterval(ref.current); setRunning(false); setPhase('Complete!'); return }
          ph = 'work'; t = w; setPhase('Work'); setMinute(m)
        }
        setTime(t)
      }
    }, 1000)
  }

  const stop = () => {
    if (ref.current) { clearInterval(ref.current); ref.current = null }
    setRunning(false); setPhase('Ready'); setMinute(0); setTime(work)
  }

  useEffect(() => () => { if (ref.current) clearInterval(ref.current) }, [])

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap', marginBottom: 20 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Work (s): <input type="number" value={work} min="1" max="300" onChange={e => { setWork(+e.target.value); if (!running) setTime(+e.target.value) }} style={{ width: 60, textAlign: 'center' }} /></label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Rest (s): <input type="number" value={rest} min="1" max="300" onChange={e => setRest(+e.target.value)} style={{ width: 60, textAlign: 'center' }} /></label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Minutes: <input type="number" value={minutes} min="1" max="60" onChange={e => setMinutes(+e.target.value)} style={{ width: 60, textAlign: 'center' }} /></label>
      </div>
      <div className="timer-display">{formatMMSS(time)}</div>
      <div className="timer-phase">{phase}</div>
      <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: 16 }}>Minute {minute}/{minutes}</div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
        <button className="btn btn-primary" onClick={start} disabled={running}>Start</button>
        <button className="btn btn-ghost" onClick={stop}>Stop</button>
      </div>
    </div>
  )
}
