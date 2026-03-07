import { useState, useMemo } from 'react'
import { isDue, isOverdue } from '../../lib/srs'

const TIME_OPTIONS = [15, 30, 45, 60]

// Approximate minutes per activity
const RECALL_MINUTES = 8
const LESSON_CONTINUE_MINUTES = 12
const NEW_UNIT_MINUTES = 20

function buildPlan(milestones, progress, budgetMinutes) {
  const plan = []
  let minutesLeft = budgetMinutes

  // 1. Overdue recalls first
  for (const ms of milestones) {
    if (!ms.units) continue
    for (const unit of ms.units) {
      const up = progress.units?.[unit.id]
      if (!up) continue
      if ((up.status === 'planted' || up.status === 'mastered') && isOverdue(up.nextReview)) {
        if (minutesLeft >= RECALL_MINUTES) {
          plan.push({ type: 'recall', unit, milestone: ms, priority: 'overdue', minutes: RECALL_MINUTES })
          minutesLeft -= RECALL_MINUTES
        }
      }
    }
  }

  // 2. Due-today recalls
  for (const ms of milestones) {
    if (!ms.units) continue
    for (const unit of ms.units) {
      const up = progress.units?.[unit.id]
      if (!up) continue
      if (
        (up.status === 'planted' || up.status === 'mastered') &&
        isDue(up.nextReview) &&
        !isOverdue(up.nextReview)
      ) {
        if (minutesLeft >= RECALL_MINUTES) {
          plan.push({ type: 'recall', unit, milestone: ms, priority: 'due', minutes: RECALL_MINUTES })
          minutesLeft -= RECALL_MINUTES
        }
      }
    }
  }

  // 3. In-progress units (continue learning)
  for (const ms of milestones) {
    if (!ms.units) continue
    for (const unit of ms.units) {
      const up = progress.units?.[unit.id]
      if (up?.status === 'in_progress') {
        if (minutesLeft >= LESSON_CONTINUE_MINUTES) {
          const lessonNum = (up.currentLesson || 0) + 1
          const total = up.lessons?.length || 5
          plan.push({
            type: 'continue',
            unit,
            milestone: ms,
            priority: 'normal',
            minutes: LESSON_CONTINUE_MINUTES,
            lessonLabel: `step ${lessonNum} of ${total}`,
          })
          minutesLeft -= LESSON_CONTINUE_MINUTES
        }
      }
    }
  }

  // 4. New units (first unlocked milestone)
  for (const ms of milestones) {
    if (!ms.unlocked || !ms.units) continue
    for (const unit of ms.units) {
      const up = progress.units?.[unit.id]
      const isNew = !up || up.status === 'new'
      if (isNew) {
        if (minutesLeft >= NEW_UNIT_MINUTES) {
          plan.push({ type: 'new', unit, milestone: ms, priority: 'normal', minutes: NEW_UNIT_MINUTES })
          minutesLeft -= NEW_UNIT_MINUTES
        }
      }
    }
    break // only suggest new from first unlocked milestone
  }

  return plan
}

const PRIORITY_CONFIG = {
  overdue: {
    label: '🔁 Recall',
    tag: 'overdue — water now!',
    tagClass: 'bg-red-100 text-red-700',
    borderClass: 'border-red-200 bg-red-50',
  },
  due: {
    label: '🔁 Recall',
    tag: 'due today',
    tagClass: 'bg-amber-100 text-amber-700',
    borderClass: 'border-amber-200 bg-amber-50',
  },
}

const TYPE_CONFIG = {
  continue: { label: '🌱 Continue', borderClass: 'border-emerald-200 bg-emerald-50' },
  new: { label: '⭐ New', borderClass: 'border-stone-200 bg-white' },
}

export default function DailyPlan({ milestones, progress, onStartUnit, onStartRecall }) {
  const [budget, setBudget] = useState(30)

  const plan = useMemo(
    () => buildPlan(milestones, progress, budget),
    [milestones, progress, budget]
  )

  const totalMinutes = plan.reduce((s, i) => s + i.minutes, 0)

  function handleStart(item) {
    if (item.type === 'recall') {
      onStartRecall(item.unit, item.milestone)
    } else {
      onStartUnit(item.unit, item.milestone)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800 mb-1">Today's garden 📅</h1>
        <p className="text-stone-500 text-sm">How much time do you have?</p>
      </div>

      {/* Time selector */}
      <div className="flex gap-2 mb-6">
        {TIME_OPTIONS.map((t) => (
          <button
            key={t}
            onClick={() => setBudget(t)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
              budget === t
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {t}m
          </button>
        ))}
      </div>

      {plan.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🌿</div>
          <p className="text-stone-600 font-medium mb-1">All caught up!</p>
          <p className="text-stone-400 text-sm">No reviews due. Start a new problem when you're ready.</p>
          <button
            onClick={() => setBudget(60)}
            className="mt-4 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Show more →
          </button>
        </div>
      ) : (
        <>
          <div className="text-xs text-stone-400 mb-3">
            ~{totalMinutes} min · {plan.length} {plan.length === 1 ? 'item' : 'items'}
          </div>

          <div className="space-y-3">
            {plan.map((item, i) => {
              const config =
                item.type === 'recall'
                  ? PRIORITY_CONFIG[item.priority]
                  : TYPE_CONFIG[item.type]

              return (
                <div
                  key={`${item.unit.id}-${i}`}
                  className={`border rounded-xl p-4 flex items-center justify-between gap-4 ${config.borderClass}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-semibold text-stone-700">
                        {item.type === 'recall'
                          ? config.label
                          : item.type === 'continue'
                          ? TYPE_CONFIG.continue.label
                          : TYPE_CONFIG.new.label}
                      </span>
                      {item.type === 'recall' && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.tagClass}`}>
                          {config.tag}
                        </span>
                      )}
                      {item.type === 'continue' && item.lessonLabel && (
                        <span className="text-xs text-stone-400">{item.lessonLabel}</span>
                      )}
                    </div>
                    <p className="text-stone-800 font-medium truncate">{item.unit.name}</p>
                    <p className="text-xs text-stone-400 mt-0.5">~{item.minutes} min</p>
                  </div>
                  <button
                    onClick={() => handleStart(item)}
                    className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    Start
                  </button>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
