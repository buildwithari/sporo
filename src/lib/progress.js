const STORAGE_KEY = 'sporo_progress'

const defaultUnitProgress = () => ({
  status: 'new',           // 'new' | 'in_progress' | 'planted' | 'mastered'
  learningPhase: 'brute',  // 'brute' | 'optimal' — which part they're currently on
  currentLesson: 0,        // brute-force lesson index
  optCurrentLesson: 0,     // optimal lesson index
  bfSolvedCode: null,      // the user's accepted brute-force solution (seeds optimal editor)
  lessons: null,
  xp: 0,
  nextReview: null,
  interval: 1,
  reviewCount: 0,
  lastReview: null,
  usedHintsOnLastRecall: false,
})

const defaultProgress = () => ({
  units: {},
  user: {
    totalXP: 0,
    streak: 0,
    lastActive: null,
  },
})

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultProgress()
    return JSON.parse(raw)
  } catch {
    return defaultProgress()
  }
}

function saveProgress(p) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
}

export function getUnitProgress(unitId) {
  const p = loadProgress()
  return p.units[unitId] ?? defaultUnitProgress()
}

export function updateUnitProgress(unitId, updates) {
  const p = loadProgress()
  p.units[unitId] = { ...getUnitProgress(unitId), ...updates }
  saveProgress(p)
  return p
}

/**
 * Add XP and update streak. Returns updated user object.
 */
export function addXP(amount) {
  const p = loadProgress()
  p.user.totalXP = (p.user.totalXP || 0) + amount

  const today = new Date().toDateString()
  if (p.user.lastActive !== today) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    if (p.user.lastActive === yesterday.toDateString()) {
      p.user.streak = (p.user.streak || 0) + 1
    } else {
      p.user.streak = 1
    }
    p.user.lastActive = today
  }

  saveProgress(p)
  return p.user
}

export function getUserStats() {
  return loadProgress().user
}

/** Reset a single unit's progress (keeps lesson cache). */
export function resetUnitProgress(unitId) {
  const p = loadProgress()
  delete p.units[unitId]
  saveProgress(p)
}

/** Reset progress for a set of units (e.g. all units in a milestone). */
export function resetMilestoneProgress(unitIds) {
  const p = loadProgress()
  unitIds.forEach((id) => delete p.units[id])
  saveProgress(p)
}

/** Wipe all progress. */
export function resetAllProgress() {
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * Purchase a plant. Deducts XP and adds plant to user's forest.
 * Returns { success, reason } where reason is set on failure.
 */
export function purchasePlant(plantId, cost) {
  const p = loadProgress()
  const currentXP = p.user.totalXP || 0
  if (currentXP < cost) {
    return { success: false, reason: 'not_enough_xp' }
  }
  const owned = p.user.forest || []
  if (owned.includes(plantId)) {
    return { success: false, reason: 'already_owned' }
  }
  p.user.totalXP = currentXP - cost
  p.user.forest = [...owned, plantId]
  saveProgress(p)
  return { success: true }
}
