import { useState, useEffect } from 'react'
import { initStore, getState, getCurrentUser } from './store/Store'
import LandingPage from './components/Landing/LandingPage'
import AuthModal from './components/Auth/AuthModal'
import AppLayout from './components/Layout/AppLayout'
import BG3D from './components/common/BG3D'
import EntryProgress from './components/common/EntryProgress'

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [showAuth, setShowAuth] = useState(null)
  const [user, setUser] = useState(null)
  const [entryDone, setEntryDone] = useState(false)

  useEffect(() => {
    initStore()
    const s = getState()
    if (s.loggedIn && s.currentUser) {
      setLoggedIn(true)
      setUser(getCurrentUser())
    }
  }, [])

  const handleLogin = (u) => {
    setLoggedIn(true)
    setUser(u)
    setShowAuth(null)
  }

  const handleLogout = () => {
    const s = getState()
    s.loggedIn = false
    s.currentUser = null
    setLoggedIn(false)
    setUser(null)
  }

  return (
    <div className="content-layer">
      <BG3D />
      {loggedIn && !entryDone && <EntryProgress onDone={() => setEntryDone(true)} />}
      {!loggedIn ? (
        <LandingPage onGetStarted={() => setShowAuth('signup')} onLogin={() => setShowAuth('login')} />
      ) : (
        entryDone && <AppLayout user={user} onLogout={handleLogout} />
      )}
      {showAuth && (
        <AuthModal
          mode={showAuth}
          onClose={() => setShowAuth(null)}
          onSuccess={handleLogin}
          onSwitch={(mode) => setShowAuth(mode)}
        />
      )}
    </div>
  )
}
