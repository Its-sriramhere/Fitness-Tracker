import { useEffect, useState } from 'react'

export default function EntryProgress({ onDone }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDone, 300)
    }, 2100)
    return () => clearTimeout(timer)
  }, [onDone])

  if (!visible) return null

  return (
    <div className="entry-overlay">
      <h1>BIFIT</h1>
      <div className="entry-progress-track">
        <div className="entry-progress-fill" />
      </div>
      <div className="entry-progress-label">PREPARING YOUR WORKOUT</div>
    </div>
  )
}
