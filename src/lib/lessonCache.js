// Lesson content cache — stored separately from progress so clearing
// XP/streaks/progress never triggers a re-generation.
// Key per unit+language: sporo_lesson_<unitId>_<language>

const key = (unitId, language = 'java') => `sporo_lesson_${unitId}_${language}`

export function getCachedLessons(unitId, language) {
  try {
    const raw = localStorage.getItem(key(unitId, language))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setCachedLessons(unitId, language, lessons) {
  try {
    localStorage.setItem(key(unitId, language), JSON.stringify(lessons))
  } catch (e) {
    console.warn('lessonCache: could not persist lessons for', unitId, e)
  }
}

export function clearCachedLessons(unitId, language) {
  if (language) {
    localStorage.removeItem(key(unitId, language))
  } else {
    // Clear all languages for this unit
    const prefix = `sporo_lesson_${unitId}_`
    const toRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k?.startsWith(prefix)) toRemove.push(k)
    }
    toRemove.forEach((k) => localStorage.removeItem(k))
  }
}

/** Remove all lesson caches (used on full reset). */
export function clearAllLessonCaches() {
  const toRemove = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k?.startsWith('sporo_lesson_')) toRemove.push(k)
  }
  toRemove.forEach((k) => localStorage.removeItem(k))
}
