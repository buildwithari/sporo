import { useState, useMemo } from 'react'
import { isDue, isOverdue } from '../../lib/srs'

/**
 * Build the full ordered task list for today.
 * Order: overdue recalls → due-today recalls → 1 new/in-progress problem.
 * Called once at mount so the list is stable across the session.
 */
function buildAllTasks(milestones, progress) {
  const tasks = []

  // 1. Overdue recalls
  for (const ms of milestones) {
    if (!ms.units) continue
    for (const unit of ms.units) {
      const up = progress.units?.[unit.id]
      if ((up?.status === 'planted' || up?.status === 'mastered') && isOverdue(up.nextReview)) {
        tasks.push({ id: `recall-${unit.id}`, type: 'recall', unit, milestone: ms, priority: 'overdue' })
      }
    }
  }

  // 2. Due-today recalls
  for (const ms of milestones) {
    if (!ms.units) continue
    for (const unit of ms.units) {
      const up = progress.units?.[unit.id]
      if (
        (up?.status === 'planted' || up?.status === 'mastered') &&
        isDue(up.nextReview) &&
        !isOverdue(up.nextReview)
      ) {
        tasks.push({ id: `recall-${unit.id}`, type: 'recall', unit, milestone: ms, priority: 'due' })
      }
    }
  }

  // 3. One new or in-progress problem (the next thing to learn)
  let found = false
  for (const ms of milestones) {
    if (!ms.unlocked || !ms.units || found) continue
    for (const unit of ms.units) {
      const status = progress.units?.[unit.id]?.status ?? 'new'
      if (status === 'new' || status === 'in_progress') {
        tasks.push({
          id: `learn-${unit.id}`,
          type: status === 'in_progress' ? 'continue' : 'new',
          unit,
          milestone: ms,
          priority: 'normal',
        })
        found = true
        break
      }
    }
  }

  return tasks
}

function isTaskCompleted(task, progress) {
  const up = progress.units?.[task.unit.id]
  if (!up) return false
  if (task.type === 'recall') {
    if (!up.lastReview) return false
    return new Date(up.lastReview).toDateString() === new Date().toDateString()
  }
  // new / continue: done when planted or mastered
  return up.status === 'planted' || up.status === 'mastered'
}

function TaskRow({ task, completed, onStart }) {
  const icon =
    task.priority === 'overdue' ? '⚠️'
    : task.type === 'recall' ? '🔁'
    : task.type === 'continue' ? '🌱'
    : '⭐'

  const tag =
    task.priority === 'overdue'
      ? { label: 'overdue', cls: 'bg-red-50 text-red-600' }
      : task.type === 'recall'
      ? { label: 'due today', cls: 'bg-amber-50 text-amber-600' }
      : task.type === 'continue'
      ? { label: 'continue', cls: 'bg-emerald-50 text-emerald-600' }
      : { label: 'new', cls: 'bg-stone-100 text-stone-500' }

  return (
    <div className={`flex items-center gap-2.5 py-2.5 ${completed ? 'opacity-40' : ''}`}>
      <span className="text-sm shrink-0 w-5 text-center">
        {completed ? '✓' : icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-medium text-stone-800 leading-snug truncate ${completed ? 'line-through' : ''}`}>
          {task.unit.name}
        </p>
        <span className={`inline-block text-[10px] px-1.5 rounded-full font-medium mt-0.5 ${tag.cls}`}>
          {tag.label}
        </span>
      </div>
      {!completed && (
        <button
          onClick={() => onStart(task)}
          className="shrink-0 text-xs font-semibold text-emerald-600 hover:text-emerald-800 transition-colors"
        >
          Go →
        </button>
      )}
    </div>
  )
}

export default function DailyTaskWidget({ milestones, progress, onStartUnit, onStartRecall }) {
  const [open, setOpen] = useState(true)
  const [tab, setTab] = useState('today')

  // Stable task list — computed once at mount from initial progress
  const [allTasks] = useState(() => buildAllTasks(milestones, progress))
  const total = allTasks.length

  // Derive completion state from live progress (updates as user finishes tasks)
  const completedIds = useMemo(() => {
    const ids = new Set()
    for (const t of allTasks) {
      if (isTaskCompleted(t, progress)) ids.add(t.id)
    }
    return ids
  }, [allTasks, progress])

  const activeTasks = allTasks.filter((t) => !completedIds.has(t.id))
  const completedTasks = allTasks.filter((t) => completedIds.has(t.id))

  // Tabs only when there are more than 3 tasks total
  const hasMultipleTabs = total > 3

  function handleStart(task) {
    if (task.type === 'recall') onStartRecall(task.unit, task.milestone)
    else onStartUnit(task.unit, task.milestone)
  }

  if (total === 0) return null

  // Today tab shows first 3 active tasks (sliding window as tasks complete).
  // For ≤3 total: show all tasks in one list (completed ones with strikethrough).
  const todayItems = hasMultipleTabs ? activeTasks.slice(0, 3) : allTasks

  return (
    <div className="fixed top-20 right-4 z-30 w-64">
      <div className="bg-white rounded-2xl shadow-md border border-stone-200 overflow-hidden">

        {/* Header */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-stone-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-600 uppercase tracking-wide">Today</span>
            {activeTasks.length > 0 && (
              <span className="text-[10px] font-bold bg-emerald-500 text-white rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {activeTasks.length}
              </span>
            )}
          </div>
          <span className="text-stone-300 text-[10px]">{open ? '▲' : '▼'}</span>
        </button>

        {open && (
          <>
            {/* Tabs — only shown when total > 3 */}
            {hasMultipleTabs && (
              <div className="flex px-4 border-b border-stone-100">
                {['today', 'done'].map((key) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={`text-xs font-medium py-1.5 mr-4 border-b-2 -mb-px transition-colors ${
                      tab === key
                        ? 'border-emerald-500 text-emerald-600'
                        : 'border-transparent text-stone-400 hover:text-stone-600'
                    }`}
                  >
                    {key === 'today'
                      ? `Today (${activeTasks.length})`
                      : `Done (${completedTasks.length})`}
                  </button>
                ))}
              </div>
            )}

            {/* Task list */}
            <div className="px-4 divide-y divide-stone-50">
              {!hasMultipleTabs || tab === 'today' ? (
                todayItems.length > 0 ? (
                  todayItems.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      completed={completedIds.has(task.id)}
                      onStart={handleStart}
                    />
                  ))
                ) : (
                  <p className="py-5 text-center text-xs text-stone-400">All done today 🎉</p>
                )
              ) : (
                completedTasks.length > 0 ? (
                  completedTasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      completed={true}
                      onStart={handleStart}
                    />
                  ))
                ) : (
                  <p className="py-5 text-center text-xs text-stone-400">Nothing done yet</p>
                )
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
