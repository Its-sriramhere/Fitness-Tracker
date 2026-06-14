import { seedFoods, fuzzyMatchFood } from './FoodDatabase'

const numberWords = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  half: 0.5, dozen: 12,
}

const mealKeywords = {
  breakfast: ['breakfast', 'morning', 'brunch'],
  lunch: ['lunch', 'afternoon', 'midday'],
  dinner: ['dinner', 'evening', 'night', 'supper'],
  snacks: ['snack', 'snacks', 'evening snack'],
}

const stopWords = new Set([
  'a', 'an', 'the', 'of', 'with', 'and', 'some', 'for', 'at', 'in',
  'more', 'extra', 'please', 'want', 'need', 'have', 'having', 'eats',
  'eating', 'make', 'making', 'cook', 'cooking', 'add', 'adding',
])

const cookingAdjectives = [
  'boiled', 'fried', 'grilled', 'roasted', 'baked', 'steamed', 'sauteed',
  'stir', 'raw', 'cooked', 'smoked', 'broiled', 'poached', 'scrambled',
  'toasted', 'salted', 'sliced', 'diced', 'chopped', 'mashed',
]

const unitKeywords = {
  g: 1, gram: 1, grams: 1,
  kg: 1000, kilo: 1000,
  ml: 1, millilitre: 1, millilitres: 1,
  l: 1000, litre: 1000, litres: 1000,
  cup: 240, cups: 240,
  tbsp: 15, tablespoon: 15, tablespoons: 15,
  tsp: 5, teaspoon: 5, teaspoons: 5,
  slice: 1, slices: 1, piece: 1, pieces: 1,
  scoop: 30, scoops: 30,
  bowl: 200, bowls: 200,
  plate: 200, plates: 200,
  serving: 100, servings: 100,
}

function extractQuantity(token) {
  token = token.replace(/^x$/i, '1')
  if (numberWords[token.toLowerCase()] !== undefined)
    return numberWords[token.toLowerCase()]
  const num = parseFloat(token.replace(/,/g, ''))
  if (!isNaN(num) && num > 0) return num
  return null
}

function normalizeFoodName(word) {
  let w = word.toLowerCase()
    .replace(/^boiled |^fried |^grilled |^roasted |^baked |^steamed |^sauteed |^stir-?fried /, '')
    .replace(/^scrambled |^poached |^smoked |^toasted |^salted /, '')
    .replace(/^fresh /, '')
    .replace(/^whole /, '')
  if (w.endsWith('s') && !w.endsWith('ss') && w.length > 3) w = w.slice(0, -1)
  const foodMap = {
    'egg': 'Egg (whole)',
    'eggs': 'Egg (whole)',
    'dosa': 'Dosa',
    'dosas': 'Dosa',
    'idli': 'Idli',
    'idlis': 'Idli',
    'paneer': 'Paneer',
    'roti': 'Roti/Chapati',
    'chapati': 'Roti/Chapati',
    'rice': 'Rice (cooked)',
    'chicken': 'Chicken Breast',
    'banana': 'Banana',
    'broccoli': 'Broccoli',
    'salmon': 'Salmon',
    'oats': 'Oats',
    'oatmeal': 'Oats',
    'almond': 'Almonds',
    'almonds': 'Almonds',
    'greek yogurt': 'Greek Yogurt',
    'curd': 'Curd/Yogurt',
    'yogurt': 'Greek Yogurt',
    'whey': 'Whey Protein',
    'protein': 'Whey Protein',
    'beef': 'Lean Beef',
    'tofu': 'Tofu',
    'peanut butter': 'Peanut Butter',
    'avocado': 'Avocado',
    'quinoa': 'Quinoa',
    'brown rice': 'Brown Rice',
    'milk': 'Milk',
    'spinach': 'Spinach',
    'potato': 'Potato (boiled)',
    'sweet potato': 'Sweet Potato',
    'dal': 'Dal (cooked)',
    'chole': 'Chole/Chickpeas',
    'chickpea': 'Chole/Chickpeas',
    'chickpeas': 'Chole/Chickpeas',
    'biryani': 'Biryani',
    'naan': 'Naan',
    'samosa': 'Samosa',
    'apple': 'Apple',
    'orange': 'Orange',
    'pasta': 'Pasta (cooked)',
    'noodle': 'Pasta (cooked)',
    'noodles': 'Pasta (cooked)',
    'bread': 'Bread (whole wheat)',
    'turkey': 'Turkey Breast',
    'shrimp': 'Shrimp',
    'honey': 'Honey',
    'ghee': 'Ghee',
    'olive oil': 'Olive Oil',
    'mixed nuts': 'Mixed Nuts',
    'dark chocolate': 'Dark Chocolate',
    'protein bar': 'Protein Bar',
    'cottage cheese': 'Cottage Cheese',
    'fish': 'Fish Curry',
    'prawn': 'Shrimp',
    'prawns': 'Shrimp',
  }
  return foodMap[w] || null
}

export function parseFoodInput(text) {
  if (!text || !text.trim()) return []
  let input = text.trim()
  let detectedMeal = 'breakfast'
  for (const [meal, keywords] of Object.entries(mealKeywords)) {
    for (const kw of keywords) {
      if (input.toLowerCase().includes(kw)) {
        detectedMeal = meal
        input = input.replace(new RegExp(kw, 'gi'), '').trim()
        break
      }
    }
  }
  input = input.replace(/@/g, ' for ').replace(/[.,;:!?]+/g, ' ').replace(/\s+/g, ' ').trim()
  let segments = input.split(/\band\b|,|&/).map(s => s.trim()).filter(Boolean)
  if (segments.length === 0) segments = [input]
  const results = []
  for (const seg of segments) {
    const tokens = seg.split(/\s+/).filter(t => !stopWords.has(t.toLowerCase()))
    let qty = 1
    let unit = null
    let unitGrams = null
    let foodStart = 0
    for (let i = 0; i < tokens.length; i++) {
      const q = extractQuantity(tokens[i])
      if (q !== null) {
        qty = q
        foodStart = i + 1
        if (i + 1 < tokens.length) {
          const next = tokens[i + 1].toLowerCase().replace(/[.,]/g, '')
          if (unitKeywords[next]) {
            unit = next
            unitGrams = unitKeywords[next]
            foodStart = i + 2
          }
        }
        break
      }
    }
    const foodTokens = tokens.slice(foodStart)
    let foodName = foodTokens.map(t => cookingAdjectives.includes(t.toLowerCase()) ? '' : t).filter(Boolean).join(' ')
    if (!foodName) foodName = foodTokens.join(' ')
    let matched = normalizeFoodName(foodName)
    if (!matched) matched = normalizeFoodName(foodTokens[foodTokens.length - 1] || '')
    if (!matched) {
      const fuzz = fuzzyMatchFood(foodName)
      if (fuzz) matched = fuzz.name
    }
    if (matched) {
      const food = seedFoods.find(f => f.name === matched)
      if (food) {
        let multiplier = qty
        if (unitGrams) multiplier = (qty * unitGrams) / food.servingGrams
        results.push({
          foodId: food.id,
          name: food.name,
          quantity: Math.round(multiplier * 10) / 10,
          calories: Math.round(food.calories * multiplier),
          protein: Math.round((food.protein * multiplier) * 10) / 10,
          carbs: Math.round((food.carbs * multiplier) * 10) / 10,
          fats: Math.round((food.fats * multiplier) * 10) / 10,
          meal: detectedMeal,
        })
      }
    }
  }
  return results
}
