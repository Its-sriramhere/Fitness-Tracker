import { useState } from 'react'
import { IconLogo, IconMenu, IconClose, IconArrowRight } from '../../icons/SvgIcons'
import { IconPlanner, IconTracking, IconAnalytics, IconPR } from '../../icons/SvgIcons'
import { IconGym, IconCrossFit, IconAthletics, IconSports, IconCardio, IconMobility } from '../../icons/SvgIcons'

const styles = {
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 40px', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    background: 'rgba(27,29,33,0.9)', backdropFilter: 'blur(16px)',
    borderBottom: '1px solid var(--border)',
  },
  logo: { fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '10px' },
  nav: { display: 'flex', gap: '28px' },
  navLink: { color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem', transition: 'var(--transition)', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'var(--font-sans)' },
  actions: { display: 'flex', gap: '12px', alignItems: 'center' },
  hamburger: { display: 'none', background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '1.5rem', cursor: 'pointer' },
  hero: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', gap: '60px',
    padding: '120px 40px 80px', maxWidth: '1200px', margin: '0 auto',
    position: 'relative',
  },
  heroBg: {
    position: 'absolute', inset: 0, zIndex: -1,
    background: 'radial-gradient(circle at center, #64270E 0%, #3A1408 35%, #1B0905 70%, #0E0605 100%)',
  },
  heroContent: { flex: 1 },
  heroH1: {
    fontFamily: "'Poppins', sans-serif", fontWeight: 800,
    fontSize: 'clamp(2.8rem, 5vw, 4.5rem)', lineHeight: 1.05, marginBottom: '20px',
  },
  heroP: { fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '520px', marginBottom: '36px', lineHeight: 1.7 },
  heroActions: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '48px' },
  heroStats: { display: 'flex', gap: '48px' },
  statNum: { fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent)' },
  statLabel: { fontSize: '0.85rem', color: 'var(--text-muted)' },
  heroVis: { flex: '0 0 400px' },
  section: { padding: '80px 40px', maxWidth: '1200px', margin: '0 auto' },
  featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' },
  featureCard: { padding: '36px 28px', textAlign: 'center', transition: 'var(--transition)', cursor: 'default' },
  featureIcon: { marginBottom: '20px', color: 'var(--accent)' },
  featureH3: { marginBottom: '10px', fontSize: '1.15rem', fontWeight: 600 },
  featureP: { color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 },
  catGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '20px' },
  catCard: (c) => ({
    padding: '28px 20px', textAlign: 'center', borderRadius: 'var(--radius)',
    background: `linear-gradient(135deg, color-mix(in srgb, ${c} 12%, transparent), transparent)`,
    border: `1px solid color-mix(in srgb, ${c} 18%, transparent)`,
    transition: 'var(--transition)', cursor: 'default',
  }),
  catIcon: { marginBottom: '10px', color: 'var(--accent)' },
  footer: { textAlign: 'center', padding: '32px', borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.85rem', background: 'var(--bg-dark)' },
  aboutSection: {
    padding: '100px 40px', textAlign: 'center',
    background: 'linear-gradient(180deg, #161A23, #1B1D21)',
  },
}

function FitnessIllustration() {
  return (
    <svg viewBox="0 0 400 500" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF5A1F" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FF5A1F" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FF5722" />
          <stop offset="100%" stopColor="#FF7A2D" />
        </linearGradient>
      </defs>
      <circle cx="200" cy="250" r="180" fill="url(#glow)" />
      <g opacity="0.15">
        <circle cx="200" cy="200" r="90" stroke="#FF5A1F" strokeWidth="0.5" fill="none" opacity="0.3" />
        <circle cx="200" cy="200" r="120" stroke="#FF5A1F" strokeWidth="0.5" fill="none" opacity="0.2" />
        <circle cx="200" cy="200" r="150" stroke="#FF5A1F" strokeWidth="0.5" fill="none" opacity="0.1" />
      </g>
      <g transform="translate(200,240)">
        <rect x="-60" y="-80" width="120" height="160" rx="12" fill="#22252C" stroke="#343840" strokeWidth="1" />
        <rect x="-60" y="-80" width="120" height="80" rx="12" fill="url(#barGrad)" opacity="0.9" />
        <text x="0" y="-40" textAnchor="middle" fill="#fff" fontSize="28" fontWeight="800">75</text>
        <text x="0" y="-22" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="10" fontWeight="500">MIN</text>
        <text x="0" y="10" textAnchor="middle" fill="#B4B4B4" fontSize="9" fontWeight="600">WORKOUT</text>
        <rect x="-40" y="24" width="80" height="4" rx="2" fill="rgba(255,255,255,0.1)" />
        <rect x="-40" y="24" width="56" height="4" rx="2" fill="url(#barGrad)" />
        <text x="0" y="46" textAnchor="middle" fill="#B4B4B4" fontSize="8" fontWeight="500">PROGRESS 70%</text>
      </g>
      <g transform="translate(120,300)" opacity="0.3">
        <rect x="0" y="0" width="30" height="60" rx="4" fill="#FF5A1F" opacity="0.5" />
        <rect x="36" y="10" width="30" height="50" rx="4" fill="#FF5A1F" opacity="0.3" />
        <rect x="72" y="20" width="30" height="40" rx="4" fill="#FF5A1F" opacity="0.4" />
        <rect x="108" y="-5" width="30" height="65" rx="4" fill="#FF5A1F" opacity="0.6" />
        <rect x="144" y="15" width="30" height="45" rx="4" fill="#FF5A1F" opacity="0.35" />
        <rect x="180" y="5" width="30" height="55" rx="4" fill="#FF5A1F" opacity="0.45" />
      </g>
      <g opacity="0.25">
        <path d="M80 380 Q140 320 200 350 Q260 380 320 330" stroke="#FF5A1F" strokeWidth="1.5" fill="none" opacity="0.3" />
        <path d="M60 400 Q130 340 200 370 Q270 400 340 350" stroke="#FF5722" strokeWidth="1" fill="none" opacity="0.2" />
      </g>
    </svg>
  )
}

export default function LandingPage({ onGetStarted, onLogin }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const catColors = { Gym: '#FF5A1F', CrossFit: '#10b981', Athletics: '#f97316', Sports: '#ef4444', Cardio: '#8b5cf6', Mobility: '#ec4899' }
  const catIcons = { Gym: IconGym, CrossFit: IconCrossFit, Athletics: IconAthletics, Sports: IconSports, Cardio: IconCardio, Mobility: IconMobility }

  return (
    <div id="landing-page">
      <header style={styles.header}>
        <div style={styles.logo}><IconLogo /> BIFIT</div>
        <nav style={{ ...styles.nav, ...(mobileOpen ? { display: 'flex', flexDirection: 'column', position: 'absolute', top: '60px', left: 0, right: 0, background: 'var(--bg-primary)', padding: '20px', borderBottom: '1px solid var(--border)' } : {}) }}>
          <button style={styles.navLink} onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>Features</button>
          <button style={styles.navLink} onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })}>Categories</button>
          <button style={styles.navLink} onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}>About</button>
        </nav>
        <div style={styles.actions}>
          <button className="btn btn-ghost" onClick={onLogin}>Log In</button>
          <button className="btn btn-primary" onClick={onGetStarted}>Get Started</button>
        </div>
        <button style={styles.hamburger} className="hamburger" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <IconClose /> : <IconMenu />}
        </button>
      </header>

      <section style={styles.hero}>
        <div style={styles.heroBg} />
        <div style={styles.heroContent}>
          <h1 style={styles.heroH1}>
            Push Your<br />
            <span className="accent-text">Limits</span> with Us
          </h1>
          <p style={styles.heroP}>Premium fitness tracking engineered for strength, performance, and results. Every rep, every set, every drop of sweat counts.</p>
          <div style={styles.heroActions}>
            <button className="btn btn-primary btn-lg" onClick={onGetStarted}>
              Start Free Trial <IconArrowRight />
            </button>
            <button className="btn btn-outline btn-lg" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              Explore
            </button>
          </div>
          <div style={styles.heroStats}>
            <div><div style={styles.statNum}>10K+</div><div style={styles.statLabel}>Active Athletes</div></div>
            <div><div style={styles.statNum}>50K+</div><div style={styles.statLabel}>Workouts Logged</div></div>
            <div><div style={styles.statNum}>4.9</div><div style={styles.statLabel}>App Rating</div></div>
          </div>
        </div>
        <div style={styles.heroVis}>
          <FitnessIllustration />
        </div>
      </section>

      <section id="features" style={styles.section}>
        <h2 className="section-title">Everything You Need</h2>
        <p className="section-subtitle">Premium tools for the dedicated athlete</p>
        <div style={styles.featuresGrid}>
          {[
            { icon: IconPlanner, title: 'Workout Planner', desc: 'Design custom workouts with our extensive exercise library.' },
            { icon: IconTracking, title: 'Live Tracking', desc: 'Track sets, reps, and rest timers in real-time.' },
            { icon: IconAnalytics, title: 'Analytics', desc: 'Beautiful charts showing your strength and progress.' },
            { icon: IconPR, title: 'Progress Tracking', desc: 'Heatmaps, PRs, and goal tracking with visual feedback.' },
            { icon: IconTimerIcon, title: 'Timers', desc: 'Stopwatch, Interval, Tabata, and EMOM timers.' },
            { icon: IconNutritionIcon, title: 'Nutrition', desc: 'Log calories, macros, and water intake daily.' },
          ].map((f, i) => (
            <div key={i} className="glass" style={styles.featureCard}>
              <div style={styles.featureIcon}>{f.icon ? <f.icon /> : <IconPlanner />}</div>
              <h3 style={styles.featureH3}>{f.title}</h3>
              <p style={styles.featureP}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="categories" style={styles.section}>
        <h2 className="section-title">Training Categories</h2>
        <p className="section-subtitle">Specialized programs for every discipline</p>
        <div style={styles.catGrid}>
          {Object.entries(catColors).map(([name, color]) => {
            const CatIcon = catIcons[name]
            return (
              <div key={name} style={styles.catCard(color)}>
                <div style={styles.catIcon}>{CatIcon ? <CatIcon /> : <IconGym />}</div>
                <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>{name}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {name === 'Gym' ? 'Bodybuilding & Strength' : name === 'CrossFit' ? 'Functional Fitness' : name === 'Athletics' ? 'Speed & Agility' : name === 'Sports' ? 'Sport Specific' : name === 'Cardio' ? 'Endurance Training' : 'Flexibility & Recovery'}
                </p>
              </div>
            )
          })}
        </div>
        <hr className="accent-divider" />
      </section>

      <section id="about" style={styles.aboutSection}>
        <h2 className="section-title">Built for <span className="accent-text">Performance</span></h2>
        <p className="section-subtitle">Every feature designed to help you push harder, recover smarter, and track every victory</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', maxWidth: 900, margin: '0 auto' }}>
          {[
            { val: '99.9%', label: 'Uptime' },
            { val: '15+', label: 'Exercise Categories' },
            { val: '5K+', label: 'Exercises' },
          ].map((s, i) => (
            <div key={i} className="glass" style={{ padding: '28px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent)' }}>{s.val}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ ...styles.section, paddingTop: 0 }}>
        <h2 className="section-title">What Our Athletes Say</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {[
            { text: "Best fitness tracker I've used. The analytics are incredible.", author: 'Alex R.' },
            { text: 'The Tabata timer alone is worth it. Clean UI, great experience.', author: 'Jamie L.' },
            { text: 'Finally an app that combines workout tracking and nutrition logging seamlessly.', author: 'Sam K.' },
          ].map((t, i) => (
            <div key={i} className="glass" style={{ padding: '28px' }}>
              <p style={{ fontStyle: 'italic', marginBottom: '16px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>"{t.text}"</p>
              <div style={{ color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 600 }}>
                - {t.author}
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer style={styles.footer}>
        <p>&copy; 2026 BIFIT. Premium fitness tracking for the dedicated athlete.</p>
      </footer>
    </div>
  )
}

function IconTimerIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 1.5M10 2h4" />
    </svg>
  )
}

function IconNutritionIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 010 8h-1" /><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
    </svg>
  )
}
