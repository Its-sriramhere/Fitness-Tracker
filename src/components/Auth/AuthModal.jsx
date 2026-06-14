import { useState } from 'react'
import { getState, getCurrentUser, saveState, uid } from '../../store/Store'
import { IconClose } from '../../icons/SvgIcons'

const overlayStyle = {
  display: 'flex', position: 'fixed', inset: 0, zIndex: 1000,
  background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
  alignItems: 'center', justifyContent: 'center',
}

const modalStyle = {
  width: '90%', maxWidth: '440px', padding: '40px', maxHeight: '90vh', overflowY: 'auto',
  animation: 'modalIn 0.3s ease',
}

export default function AuthModal({ mode, onClose, onSuccess, onSwitch }) {
  const [loginEmail, setLoginEmail] = useState('demo@bifit.app')
  const [loginPass, setLoginPass] = useState('demo123')
  const [loginErr, setLoginErr] = useState('')
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPass, setSignupPass] = useState('')
  const [signupErr, setSignupErr] = useState('')

  const handleLogin = () => {
    const s = getState()
    const user = s.users.find(u => u.email === loginEmail && u.password === loginPass)
    if (!user) { setLoginErr('Invalid email or password.'); return }
    s.currentUser = user.id
    s.loggedIn = true
    saveState()
    onSuccess(user)
  }

  const handleSignup = () => {
    if (!signupName || !signupEmail || !signupPass) { setSignupErr('All fields required.'); return }
    if (signupPass.length < 6) { setSignupErr('Password min 6 characters.'); return }
    const s = getState()
    if (s.users.find(u => u.email === signupEmail)) { setSignupErr('Email already registered.'); return }
    const user = {
      id: uid(), name: signupName, email: signupEmail, password: signupPass,
      weight: 75, height: 175, age: 25,
      caloriesTarget: 2500, proteinTarget: 180, carbsTarget: 250, fatsTarget: 65, waterTarget: 8,
      restTimer: 90, soundEnabled: true,
    }
    s.users.push(user)
    s.currentUser = user.id
    s.loggedIn = true
    saveState()
    onSuccess(user)
  }

  return (
    <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="glass" style={modalStyle} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 0 }}><IconClose /></button>
        
        {mode === 'login' && (
          <div>
            <h2 style={{ marginBottom: 4 }}>Welcome Back</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.9rem' }}>Log in to continue your journey</p>
            <div className="form-group"><label>Email</label><input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="you@example.com" /></div>
            <div className="form-group"><label>Password</label><input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="Enter password" /></div>
            <p className="form-error">{loginErr}</p>
            <button className="btn btn-primary btn-full" onClick={handleLogin}>Log In</button>
            <p className="auth-switch" style={{ textAlign: 'center', marginTop: 16, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Don't have an account? <a href="#" style={{ color: 'var(--accent)', textDecoration: 'none' }} onClick={e => { e.preventDefault(); onSwitch('signup') }}>Sign Up</a>
            </p>
            <p style={{ textAlign: 'center', marginTop: 12, fontSize: '0.8rem', color: 'var(--text-muted)', padding: 8, background: 'var(--bg-secondary)', borderRadius: 6 }}>Demo: demo@bifit.app / demo123</p>
          </div>
        )}

        {mode === 'signup' && (
          <div>
            <h2 style={{ marginBottom: 4 }}>Create Account</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.9rem' }}>Start your fitness journey today</p>
            <div className="form-group"><label>Full Name</label><input type="text" value={signupName} onChange={e => setSignupName(e.target.value)} placeholder="Your name" /></div>
            <div className="form-group"><label>Email</label><input type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} placeholder="you@example.com" /></div>
            <div className="form-group"><label>Password</label><input type="password" value={signupPass} onChange={e => setSignupPass(e.target.value)} placeholder="Min 6 characters" /></div>
            <p className="form-error">{signupErr}</p>
            <button className="btn btn-primary btn-full" onClick={handleSignup}>Create Account</button>
            <p className="auth-switch" style={{ textAlign: 'center', marginTop: 16, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Already have an account? <a href="#" style={{ color: 'var(--accent)', textDecoration: 'none' }} onClick={e => { e.preventDefault(); onSwitch('login') }}>Log In</a>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
