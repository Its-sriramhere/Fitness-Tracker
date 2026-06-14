import { seedFoods } from '../components/Nutrition/FoodDatabase'

const LS_KEY = 'bifit_state'

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

function seedData() {
  const now = new Date()
  const exercises = [
    { id: 'ex1', name: 'Bench Press', category: 'Gym', muscle: 'Chest', desc: 'Barbell bench press for upper body strength.' },
    { id: 'ex2', name: 'Squat', category: 'Gym', muscle: 'Legs', desc: 'Barbell back squat for lower body strength.' },
    { id: 'ex3', name: 'Deadlift', category: 'Gym', muscle: 'Back', desc: 'Conventional deadlift for posterior chain.' },
    { id: 'ex4', name: 'Overhead Press', category: 'Gym', muscle: 'Shoulders', desc: 'Standing barbell overhead press.' },
    { id: 'ex5', name: 'Pull Up', category: 'Gym', muscle: 'Back', desc: 'Bodyweight pull up for back and biceps.' },
    { id: 'ex6', name: 'Barbell Row', category: 'Gym', muscle: 'Back', desc: 'Bent over barbell row.' },
    { id: 'ex7', name: 'Dumbbell Curl', category: 'Gym', muscle: 'Arms', desc: 'Standing dumbbell bicep curl.' },
    { id: 'ex8', name: 'Tricep Pushdown', category: 'Gym', muscle: 'Arms', desc: 'Cable tricep pushdown.' },
    { id: 'ex9', name: 'Leg Press', category: 'Gym', muscle: 'Legs', desc: 'Machine leg press for quads and glutes.' },
    { id: 'ex10', name: 'Lateral Raise', category: 'Gym', muscle: 'Shoulders', desc: 'Dumbbell lateral raise for side delts.' },
    { id: 'ex11', name: 'Clean & Jerk', category: 'CrossFit', muscle: 'Full Body', desc: 'Olympic lift for explosive power.' },
    { id: 'ex12', name: 'Box Jump', category: 'CrossFit', muscle: 'Legs', desc: 'Explosive box jumps for power.' },
    { id: 'ex13', name: 'Kettlebell Swing', category: 'CrossFit', muscle: 'Full Body', desc: 'Kettlebell hip hinge swing.' },
    { id: 'ex14', name: 'Burpee', category: 'CrossFit', muscle: 'Full Body', desc: 'Full body burpee exercise.' },
    { id: 'ex15', name: 'Sprint 100m', category: 'Athletics', muscle: 'Legs', desc: 'Max effort 100 meter sprint.' },
    { id: 'ex16', name: 'Broad Jump', category: 'Athletics', muscle: 'Legs', desc: 'Standing broad jump measurement.' },
    { id: 'ex17', name: 'Rowing Machine', category: 'Cardio', muscle: 'Cardio', desc: 'Indoor rowing for endurance.' },
    { id: 'ex18', name: 'Jump Rope', category: 'Cardio', muscle: 'Cardio', desc: 'Speed jump rope for cardio.' },
    { id: 'ex19', name: 'Yoga Flow', category: 'Mobility', muscle: 'Full Body', desc: 'Full body yoga flow sequence.' },
    { id: 'ex20', name: 'Hip Stretch', category: 'Mobility', muscle: 'Core', desc: 'Pigeon pose hip mobility stretch.' },
    { id: 'ex21', name: 'Incline Bench Press', category: 'Gym', muscle: 'Chest', desc: 'Incline barbell bench press for upper chest.' },
    { id: 'ex22', name: 'Barbell Curl', category: 'Gym', muscle: 'Arms', desc: 'Standing barbell bicep curl.' },
    { id: 'ex23', name: 'Overhead Tricep Extension', category: 'Gym', muscle: 'Arms', desc: 'Overhead cable tricep extension.' },
    { id: 'ex24', name: 'Cable Fly', category: 'Gym', muscle: 'Chest', desc: 'Cable chest fly for chest definition.' },
    { id: 'ex25', name: 'Face Pull', category: 'Gym', muscle: 'Shoulders', desc: 'Cable face pull for rear delts.' },
  ]
  const history = []
  const weightHistory = []
  const goals = [
    { id: 'g1', title: 'Bench 100kg', target: 100, unit: 'kg', current: 80, deadline: new Date(now.getFullYear(), now.getMonth() + 2, 1).toISOString(), createdAt: new Date(Date.now() - 86400000 * 30).toISOString() },
    { id: 'g2', title: 'Squat 140kg', target: 140, unit: 'kg', current: 110, deadline: new Date(now.getFullYear(), now.getMonth() + 3, 1).toISOString(), createdAt: new Date(Date.now() - 86400000 * 30).toISOString() },
    { id: 'g3', title: 'Run 5K in 25min', target: 25, unit: 'min', current: 28, deadline: new Date(now.getFullYear(), now.getMonth() + 1, 15).toISOString(), createdAt: new Date(Date.now() - 86400000 * 20).toISOString() },
  ]
  for (let d = 27; d >= 0; d--) {
    const date = new Date(now); date.setDate(date.getDate() - d)
    if (d % 2 === 1 && d % 4 !== 0) {
      const workoutNames = ['Upper Body', 'Lower Body', 'Full Body', 'Push Day', 'Pull Day']
      const wName = workoutNames[d % workoutNames.length]
      const duration = 30 + Math.floor(Math.random() * 45)
      const calories = 200 + Math.floor(Math.random() * 300)
      const exNames = exercises.filter((_, i) => i % 3 === d % 3).slice(0, 3).map(e => ({
        name: e.name, sets: Array.from({ length: 3 + Math.floor(Math.random() * 2) }, () => ({ reps: 8 + Math.floor(Math.random() * 5), weight: 20 + Math.floor(Math.random() * 60), done: true }))
      }))
      history.push({ id: `wh-${d}`, name: wName, date: date.toISOString(), duration, calories, exercises: exNames })
    }
    if (d % 3 === 0) {
      const w = 82 + Math.random() * 3 - 1.5 + (d / 27) * 2
      weightHistory.push({ date: date.toISOString(), weight: Math.round(w * 10) / 10 })
    }
  }
  const savedWorkouts = [
    { id: 'sw1', name: 'Upper Body Blast', category: 'Gym', exercises: [{ exId: 'ex1', sets: 4, reps: 10 }, { exId: 'ex2', sets: 4, reps: 8 }, { exId: 'ex5', sets: 3, reps: 12 }] },
    { id: 'sw2', name: 'Leg Day', category: 'Gym', exercises: [{ exId: 'ex2', sets: 5, reps: 5 }, { exId: 'ex9', sets: 4, reps: 10 }, { exId: 'ex6', sets: 3, reps: 10 }] },
    { id: 'sw3', name: 'CrossFit WOD', category: 'CrossFit', exercises: [{ exId: 'ex11', sets: 3, reps: 5 }, { exId: 'ex13', sets: 4, reps: 15 }, { exId: 'ex14', sets: 3, reps: 10 }] },
    { id: 'sw4', name: 'Track Day', category: 'Athletics', exercises: [{ exId: 'ex15', sets: 5, reps: 1 }, { exId: 'ex16', sets: 4, reps: 3 }] },
    { id: 'sw5', name: 'Cardio Burn', category: 'Cardio', exercises: [{ exId: 'ex17', sets: 3, reps: 500 }, { exId: 'ex18', sets: 3, reps: 200 }] },
    { id: 'sw6', name: 'Flexibility Flow', category: 'Mobility', exercises: [{ exId: 'ex19', sets: 2, reps: 10 }, { exId: 'ex20', sets: 2, reps: 10 }] },
    { id: 'sw7', name: 'Chest Day', category: 'Gym', exercises: [{ exId: 'ex1', sets: 4, reps: 10 }, { exId: 'ex21', sets: 4, reps: 10 }, { exId: 'ex24', sets: 3, reps: 12 }] },
    { id: 'sw8', name: 'Shoulder Day', category: 'Gym', exercises: [{ exId: 'ex4', sets: 4, reps: 10 }, { exId: 'ex10', sets: 3, reps: 12 }, { exId: 'ex25', sets: 3, reps: 15 }] },
    { id: 'sw9', name: 'Bicep Day', category: 'Gym', exercises: [{ exId: 'ex7', sets: 4, reps: 12 }, { exId: 'ex22', sets: 4, reps: 10 }] },
    { id: 'sw10', name: 'Tricep Day', category: 'Gym', exercises: [{ exId: 'ex8', sets: 4, reps: 12 }, { exId: 'ex23', sets: 4, reps: 10 }] },
    { id: 'sw11', name: 'Back Day', category: 'Gym', exercises: [{ exId: 'ex3', sets: 4, reps: 8 }, { exId: 'ex5', sets: 3, reps: 10 }, { exId: 'ex6', sets: 3, reps: 10 }] },
  ]
  return {
    users: [
      {
        id: 'u1', name: 'Demo User', email: 'demo@bifit.app', password: 'demo123',
        weight: 82, height: 178, age: 28, gender: 'male', activityLevel: 'moderate', goal: 'maintain',
        caloriesTarget: 2800, proteinTarget: 210, carbsTarget: 315, fatsTarget: 78, waterTarget: 4000,
        restTimer: 90, soundEnabled: true
      }
    ],
    currentUser: null,
    exercises,
    savedWorkouts,
    history,
    weightHistory,
    goals,
    foods: seedFoods,
    nutrition: {},
    weeklyPlan: {},
    welcomeDate: '',
    loggedIn: false
  }
}

let state = null

export function getState() {
  return state
}

export function initStore() {
  const saved = localStorage.getItem(LS_KEY)
  if (saved) {
    try { state = JSON.parse(saved) } catch { state = seedData() }
  } else {
    state = seedData()
  }
  return state
}

export function saveState() {
  localStorage.setItem(LS_KEY, JSON.stringify(state))
}

export function getCurrentUser() {
  if (!state?.currentUser) return null
  return state.users.find(u => u.id === state.currentUser)
}

export { uid }
