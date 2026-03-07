// Spaced repetition intervals in days (SM-2 inspired)
const INTERVALS = [1, 3, 7, 14, 30, 60]

/**
 * Get the next review interval.
 * @param {number} currentInterval - current interval in days
 * @param {number} quality - 0 (fail) to 5 (perfect recall)
 */
export function getNextInterval(currentInterval, quality) {
  if (quality < 3) {
    return 1 // failed recall — reset to 1 day
  }
  const idx = INTERVALS.indexOf(currentInterval)
  if (idx === -1) return INTERVALS[1] // unknown interval, start at 3 days
  if (idx >= INTERVALS.length - 1) return INTERVALS[INTERVALS.length - 1] // already at max
  return INTERVALS[idx + 1]
}

/** Returns true if a unit is due for review today or overdue. */
export function isDue(nextReview) {
  if (!nextReview) return false
  return new Date() >= new Date(nextReview)
}

/** Returns true if a unit is overdue (missed review). */
export function isOverdue(nextReview) {
  if (!nextReview) return false
  const due = new Date(nextReview)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return due < today
}

/** Get ISO string for next review date given an interval in days. */
export function getNextReviewDate(intervalDays) {
  const date = new Date()
  date.setDate(date.getDate() + intervalDays)
  date.setHours(0, 0, 0, 0)
  return date.toISOString()
}

/** Human-readable label for a review date. */
export function formatDueLabel(nextReview) {
  if (!nextReview) return null
  const due = new Date(nextReview)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)
  const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`
  if (diffDays === 0) return 'due today'
  if (diffDays === 1) return 'due tomorrow'
  return `in ${diffDays} days`
}
