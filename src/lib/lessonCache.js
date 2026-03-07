// Lesson content cache — stored separately from progress so clearing
// XP/streaks/progress never triggers a re-generation.
// Key per unit: sporo_lesson_<unitId>

const key = (unitId) => `sporo_lesson_${unitId}`

export function getCachedLessons(unitId) {
  try {
    const raw = localStorage.getItem(key(unitId))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setCachedLessons(unitId, lessons) {
  try {
    localStorage.setItem(key(unitId), JSON.stringify(lessons))
  } catch (e) {
    // localStorage full — silently continue, lessons will just regenerate next time
    console.warn('lessonCache: could not persist lessons for', unitId, e)
  }
}

export function clearCachedLessons(unitId) {
  localStorage.removeItem(key(unitId))
}

/** Remove lesson caches for all given unit IDs (used on full reset). */
export function clearAllLessonCaches(unitIds) {
  unitIds.forEach((id) => localStorage.removeItem(key(id)))
}
