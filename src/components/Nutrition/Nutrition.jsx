import { useState, useEffect, useRef } from 'react'
import { getState, saveState, getCurrentUser } from '../../store/Store'
import { formatISO } from '../../utils/helpers'
import { searchLocalFoods, searchOpenFoodFacts } from './FoodDatabase'
import { parseFoodInput } from './AIFoodParser'

const activityFactors = { sedentary: 1.2, 'light active': 1.375, moderate: 1.55, 'very active': 1.725, athlete: 1.9 }
const goalAdjustments = { 'weight loss': -500, maintain: 0, 'muscle gain': 300, 'athletic performance': 200 }

function calculateTargets(user) {
  if (!user) return null
  const bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age + (user.gender === 'male' ? 5 : -161)
  const factor = activityFactors[user.activityLevel] || 1.55
  const tdee = Math.round(bmr * factor)
  const adj = goalAdjustments[user.goal] || 0
  const cal = Math.round(tdee + adj)
  return {
    bmr: Math.round(bmr), tdee,
    caloriesTarget: cal,
    proteinTarget: Math.round((cal * 0.3) / 4),
    carbsTarget: Math.round((cal * 0.45) / 4),
    fatsTarget: Math.round((cal * 0.25) / 9),
    waterTarget: 4000,
  }
}

const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks']
const mealLabels = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snacks: 'Snacks' }
const mealEmojis = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snacks: '🍿' }

export default function Nutrition() {
  const [s, setS] = useState(getState())
  const [date, setDate] = useState(new Date())
  const [goalOpen, setGoalOpen] = useState(false)
  const [goalForm, setGoalForm] = useState({})
  const [mealOpen, setMealOpen] = useState('breakfast')
  const [searchQ, setSearchQ] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchOnline, setSearchOnline] = useState([])
  const [searchMeal, setSearchMeal] = useState('breakfast')
  const [aiText, setAiText] = useState('')
  const [aiResult, setAiResult] = useState(null)
  const searchTimer = useRef(null)
  const user = getCurrentUser()
  const dateKey = formatISO(date)

  const targets = user ? {
    caloriesTarget: user.caloriesTarget || 2800,
    proteinTarget: user.proteinTarget || 210,
    carbsTarget: user.carbsTarget || 315,
    fatsTarget: user.fatsTarget || 78,
    waterTarget: user.waterTarget || 4000,
  } : { caloriesTarget: 2800, proteinTarget: 210, carbsTarget: 315, fatsTarget: 78, waterTarget: 4000 }

  useEffect(() => {
    if (!s.nutrition[dateKey]) {
      s.nutrition[dateKey] = {
        meals: { breakfast: [], lunch: [], dinner: [], snacks: [] },
        totals: { calories: 0, protein: 0, carbs: 0, fats: 0, water: 0 },
      }
    }
  }, [dateKey])

  const nd = s.nutrition[dateKey]
  const n = nd ? nd.totals || { calories: 0, protein: 0, carbs: 0, fats: 0, water: 0 } : { calories: 0, protein: 0, carbs: 0, fats: 0, water: 0 }
  const meals = nd ? nd.meals || { breakfast: [], lunch: [], dinner: [], snacks: [] } : { breakfast: [], lunch: [], dinner: [], snacks: [] }

  const recalcTotals = () => {
    const t = { calories: 0, protein: 0, carbs: 0, fats: 0, water: n.water || 0 }
    for (const m of mealTypes) {
      for (const item of (meals[m] || [])) {
        t.calories += item.calories || 0
        t.protein += item.protein || 0
        t.carbs += item.carbs || 0
        t.fats += item.fats || 0
      }
    }
    s.nutrition[dateKey].totals = t
    saveState()
    setS({ ...s })
  }

  const changeDate = (dir) => {
    const d = new Date(date)
    d.setDate(d.getDate() + dir)
    if (d > new Date()) return
    setDate(d)
    setSearchQ(''); setSearchResults([])
  }

  const addFood = (food, qty, meal) => {
    if (!s.nutrition[dateKey]) {
      s.nutrition[dateKey] = { meals: { breakfast: [], lunch: [], dinner: [], snacks: [] }, totals: { calories: 0, protein: 0, carbs: 0, fats: 0, water: 0 } }
    }
    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      foodId: food.id,
      name: food.name,
      quantity: qty,
      calories: Math.round(food.calories * qty),
      protein: Math.round((food.protein * qty) * 10) / 10,
      carbs: Math.round((food.carbs * qty) * 10) / 10,
      fats: Math.round((food.fats * qty) * 10) / 10,
    }
    if (!s.nutrition[dateKey].meals[meal]) s.nutrition[dateKey].meals[meal] = []
    s.nutrition[dateKey].meals[meal].push(entry)
    recalcTotals()
    setSearchQ(''); setSearchResults([])
  }

  const removeFood = (meal, idx) => {
    s.nutrition[dateKey].meals[meal].splice(idx, 1)
    recalcTotals()
  }

  const handleSearch = (q) => {
    setSearchQ(q)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    if (q.length < 2) { setSearchResults([]); setSearchOnline([]); return }
    const local = searchLocalFoods(q)
    setSearchResults(local)
    searchTimer.current = setTimeout(async () => {
      const online = await searchOpenFoodFacts(q)
      setSearchOnline(online)
    }, 300)
  }

  const parseAI = () => {
    if (!aiText.trim()) return
    const parsed = parseFoodInput(aiText)
    setAiResult(parsed)
    if (parsed.length > 0) {
      for (const item of parsed) {
        const food = s.foods?.find(f => f.id === item.foodId)
        if (food) {
          addFood(food, item.quantity, item.meal)
        }
      }
      setAiText('')
      setAiResult(null)
    }
  }

  const saveGoalForm = () => {
    if (!user) return
    const u = s.users.find(u => u.id === user.id)
    if (!u) return
    Object.assign(u, goalForm)
    const calc = calculateTargets(u)
    if (calc) {
      u.caloriesTarget = calc.caloriesTarget
      u.proteinTarget = calc.proteinTarget
      u.carbsTarget = calc.carbsTarget
      u.fatsTarget = calc.fatsTarget
      u.waterTarget = calc.waterTarget
    }
    saveState()
    setS({ ...s })
    setGoalOpen(false)
  }

  const remainingCal = targets.caloriesTarget - n.calories
  const remainingProtein = targets.proteinTarget - n.protein
  const remainingCarbs = targets.carbsTarget - n.carbs
  const remainingFats = targets.fatsTarget - n.fats

  const suggestions = []
  if (remainingProtein > 15) {
    suggestions.push({ type: 'protein', text: `Need ${Math.round(remainingProtein)}g protein — try Chicken Breast, Greek Yogurt, Paneer, or Whey Protein` })
  }
  if (remainingCal < 0) {
    suggestions.push({ type: 'warning', text: `Calories exceeded by ${Math.abs(remainingCal)} kcal` })
  }

  const macroRings = [
    { key: 'calories', label: 'Calories', value: n.calories, target: targets.caloriesTarget, unit: '', color: 'var(--accent)', remaining: remainingCal },
    { key: 'protein', label: 'Protein', value: n.protein, target: targets.proteinTarget, unit: 'g', color: 'var(--green)', remaining: remainingProtein },
    { key: 'carbs', label: 'Carbs', value: n.carbs, target: targets.carbsTarget, unit: 'g', color: '#f59e0b', remaining: remainingCarbs },
    { key: 'fats', label: 'Fats', value: n.fats, target: targets.fatsTarget, unit: 'g', color: '#ec4899', remaining: remainingFats },
  ]

  const circumference = 2 * Math.PI * 34

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(date); d.setDate(d.getDate() - (6 - i))
    const dk = formatISO(d)
    const nd = s.nutrition[dk]
    const cal = nd?.totals?.calories || 0
    const pro = nd?.totals?.protein || 0
    const wt = s.weightHistory?.filter(w => formatISO(new Date(w.date)) === dk)
    return { date: d, key: dk, calories: cal, protein: pro, weight: wt?.[0]?.weight || null }
  })
  const maxWeekCal = Math.max(...weekDates.map(d => d.calories), 1)

  const addWater = (ml) => {
    if (!s.nutrition[dateKey]) {
      s.nutrition[dateKey] = { meals: { breakfast: [], lunch: [], dinner: [], snacks: [] }, totals: { calories: 0, protein: 0, carbs: 0, fats: 0, water: 0 } }
    }
    s.nutrition[dateKey].totals.water = (s.nutrition[dateKey].totals.water || 0) + ml
    saveState()
    setS({ ...s })
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
        <h3 style={{ margin: 0 }}>Diet & Nutrition</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-sm btn-ghost" onClick={() => changeDate(-1)}>&larr; Prev</button>
          <span style={{ fontWeight: 600, minWidth: 130, textAlign: 'center', fontSize: '0.9rem' }}>
            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <button className="btn btn-sm btn-ghost" onClick={() => changeDate(1)}>Next &rarr;</button>
        </div>
      </div>

      {/* Goals & Targets */}
      <div className="nutri-goal-panel">
        <div className="nutri-goal-header" onClick={() => setGoalOpen(!goalOpen)}>
          <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>⚙ Goals &amp; Targets</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{goalOpen ? '▲' : '▼'}</span>
        </div>
        {goalOpen && (
          <div className="nutri-goal-body">
            {['age', 'weight', 'height'].map(f => (
              <label key={f} style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {f === 'age' ? 'Age' : f === 'weight' ? 'Weight (kg)' : 'Height (cm)'}
                <input type="number" value={goalForm[f] ?? user?.[f] ?? ''} onChange={e => setGoalForm({ ...goalForm, [f]: parseFloat(e.target.value) || '' })} style={{ padding: '6px 8px' }} />
              </label>
            ))}
            <label style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Gender
              <select value={goalForm.gender ?? user?.gender ?? 'male'} onChange={e => setGoalForm({ ...goalForm, gender: e.target.value })} style={{ padding: '6px 8px' }}>
                <option value="male">Male</option><option value="female">Female</option>
              </select>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Activity Level
              <select value={goalForm.activityLevel ?? user?.activityLevel ?? 'moderate'} onChange={e => setGoalForm({ ...goalForm, activityLevel: e.target.value })} style={{ padding: '6px 8px' }}>
                <option value="sedentary">Sedentary</option><option value="light active">Light Active</option>
                <option value="moderate">Moderate</option><option value="very active">Very Active</option><option value="athlete">Athlete</option>
              </select>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Goal
              <select value={goalForm.goal ?? user?.goal ?? 'maintain'} onChange={e => setGoalForm({ ...goalForm, goal: e.target.value })} style={{ padding: '6px 8px' }}>
                <option value="weight loss">Weight Loss</option><option value="maintain">Maintain</option>
                <option value="muscle gain">Muscle Gain</option><option value="athletic performance">Athletic Performance</option>
              </select>
            </label>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-sm btn-primary" onClick={saveGoalForm}>Calculate &amp; Save</button>
            </div>
          </div>
        )}
      </div>

      {/* Smart Suggestions */}
      {suggestions.length > 0 && suggestions.map((sug, i) => (
        <div key={i} className={`nutri-suggestion${sug.type === 'warning' ? ' warning' : ''}`}>
          {sug.type === 'warning' ? '⚠️' : '💡'} {sug.text}
        </div>
      ))}

      {/* Macro Progress Rings */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
        {macroRings.map(m => {
          const pct = m.target > 0 ? Math.min(100, (m.value / m.target) * 100) : 0
          const offset = circumference - (pct / 100) * circumference
          return (
            <div key={m.key} className="glass" style={{ padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div className="nutri-ring-label">{m.label}</div>
              <div style={{ position: 'relative', width: 80, height: 80 }}>
                <svg className="nutri-progress-ring" viewBox="0 0 80 80">
                  <circle className="bg" cx="40" cy="40" r="34" />
                  <circle cx="40" cy="40" r="34" stroke={m.color} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <div className="nutri-ring-value">{Math.round(pct)}%</div>
                </div>
              </div>
              <div className="nutri-ring-value">{m.value.toLocaleString()}<span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}> / {m.target.toLocaleString()}{m.unit}</span></div>
              <div className="nutri-ring-remaining">Remaining: {m.remaining >= 0 ? m.remaining + (m.unit || ' kcal') : '0'}</div>
            </div>
          )
        })}
      </div>

      {/* AI Food Entry */}
      <div className="nutri-ai-input">
        <input type="text" placeholder='AI Entry: "2 dosa and 3 eggs for breakfast"' value={aiText} onChange={e => setAiText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && parseAI()} />
        <button className="btn btn-sm btn-primary" onClick={parseAI} disabled={!aiText.trim()}>Parse</button>
      </div>
      {aiResult && aiResult.length === 0 && (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 12 }}>Could not recognize any foods. Try simpler terms like "2 eggs and 1 banana".</div>
      )}

      {/* Meal Sections */}
      {mealTypes.map(mt => {
        const isOpen = mealOpen === mt
        const items = meals[mt] || []
        const mealTotal = items.reduce((a, i) => ({
          cal: a.cal + (i.calories || 0),
          pro: a.pro + (i.protein || 0),
          carb: a.carb + (i.carbs || 0),
          fat: a.fat + (i.fats || 0),
        }), { cal: 0, pro: 0, carb: 0, fat: 0 })
        return (
          <div key={mt} className="nutri-meal-section">
            <div className="nutri-meal-header" onClick={() => setMealOpen(isOpen ? '' : mt)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{mealEmojis[mt]}</span>
                <h4>{mealLabels[mt]}</h4>
                {items.length > 0 && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({items.length})</span>}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {Math.round(mealTotal.cal)} cal &middot; {Math.round(mealTotal.pro)}P &middot; {Math.round(mealTotal.carb)}C &middot; {Math.round(mealTotal.fat)}F
              </div>
            </div>
            {isOpen && (
              <div className="nutri-meal-body">
                {items.length > 0 ? items.map((item, idx) => (
                  <div key={item.id} className="nutri-food-row">
                    <span className="nutri-food-name">{item.name} <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>({item.quantity}x)</span></span>
                    <span className="nutri-food-macros">{item.calories} cal &middot; {item.protein}P &middot; {item.carbs}C &middot; {item.fats}F</span>
                    <button className="nutri-food-del" onClick={() => removeFood(mt, idx)}>&times;</button>
                  </div>
                )) : (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', padding: '8px 0', textAlign: 'center' }}>No foods logged yet</div>
                )}
                <div className="nutri-search-wrap" style={{ marginTop: 8 }}>
                  <input type="text" placeholder="Search food..." value={searchMeal === mt ? searchQ : ''}
                    onChange={e => { setSearchMeal(mt); handleSearch(e.target.value) }}
                    onFocus={() => setSearchMeal(mt)} />
                  {(searchResults.length > 0 || searchOnline.length > 0) && searchMeal === mt && (
                    <div className="nutri-search-results">
                      {searchResults.map(f => (
                        <div key={f.id} className="nutri-search-result" onClick={() => addFood(f, 1, mt)}>
                          <span>{f.name} <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>({f.serving})</span></span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{f.calories}cal &middot; {f.protein}P</span>
                        </div>
                      ))}
                      {searchOnline.length > 0 && <div style={{ padding: '4px 12px', fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Online results</div>}
                      {searchOnline.map(f => (
                        <div key={f.id} className="nutri-search-result" onClick={() => addFood(f, 1, mt)}>
                          <span>{f.name} <span className="online-badge">online</span></span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{f.calories}cal &middot; {f.protein}P</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* Water Tracker */}
      <div className="glass" style={{ padding: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>💧 Water</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {Math.round((n.water || 0) / 10) / 100}L <span style={{ color: 'var(--text-muted)' }}>/ {targets.waterTarget / 1000}L</span>
          </span>
        </div>
        <div style={{ height: 8, background: 'var(--bg-secondary)', borderRadius: 4, overflow: 'hidden', marginBottom: 10 }}>
          <div style={{ height: '100%', borderRadius: 4, background: '#3b82f6', width: `${Math.min(100, ((n.water || 0) / targets.waterTarget) * 100)}%`, transition: 'width 0.4s ease' }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[{ l: '+250ml', v: 250 }, { l: '+500ml', v: 500 }, { l: '+1L', v: 1000 }].map(b => (
            <button key={b.v} className="nutri-water-btn" onClick={() => addWater(b.v)}>{b.l}</button>
          ))}
        </div>
      </div>

      {/* Weekly Trends */}
      <div className="glass" style={{ padding: 16 }}>
        <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 14 }}>📊 Weekly Trends</div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 6 }}>Calories</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 60 }}>
            {weekDates.map(d => (
              <div key={d.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{d.calories > 0 ? Math.round(d.calories / 100) + 'k' : '-'}</div>
                <div className="nutri-week-bar" style={{ width: '100%', background: 'var(--accent)', height: `${(d.calories / maxWeekCal) * 50}px`, opacity: d.calories > 0 ? 1 : 0.2 }} />
                <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>{d.date.toLocaleDateString('en', { weekday: 'short' })}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 6 }}>Protein (g)</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 50 }}>
            {weekDates.map(d => (
              <div key={d.key + 'p'} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div className="nutri-week-bar" style={{ width: '100%', background: 'var(--green)', height: `${Math.min(50, d.protein)}px`, opacity: d.protein > 0 ? 1 : 0.2 }} />
                <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>{Math.round(d.protein) || '-'}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 6 }}>Weight (kg)</div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
            {weekDates.map((d, i) => (
              <div key={d.key + 'w'} style={{ flex: 1, textAlign: 'center', fontSize: '0.72rem', fontWeight: 600 }}>
                {d.weight ? <span>{d.weight}</span> : <span style={{ color: 'var(--text-muted)' }}>-</span>}
                <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', marginTop: 2 }}>{d.date.toLocaleDateString('en', { weekday: 'short' })}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
