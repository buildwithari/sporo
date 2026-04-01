import { useState, useMemo } from 'react'
import { isDue, isOverdue } from '../../lib/srs'

function buildReviseTasks(milestones, progress) {
  const tasks = []
  for (const ms of milestones) {
    if (!ms.units) continue
    for (const unit of ms.units) {
      const up = progress.units?.[unit.id]
      if ((up?.status === 'planted' || up?.status === 'mastered') && isDue(up.nextReview)) {
        tasks.push({
          id: `recall-${unit.id}`,
          type: 'recall',
          unit,
          milestone: ms,
          overdue: isOverdue(up.nextReview),
          nextReview: up.nextReview,
        })
      }
    }
  }
  tasks.sort((a, b) => new Date(a.nextReview) - new Date(b.nextReview))
  return tasks.slice(0, 4)
}

function buildNewTasks(milestones, progress) {
  const tasks = []
  for (const ms of milestones) {
    if (!ms.unlocked || !ms.units) continue
    for (const unit of ms.units) {
      if (tasks.length >= 4) break
      const status = progress.units?.[unit.id]?.status ?? 'new'
      if (status === 'new' || status === 'in_progress') {
        tasks.push({
          id: `learn-${unit.id}`,
          type: status === 'in_progress' ? 'continue' : 'new',
          unit,
          milestone: ms,
        })
      }
    }
    if (tasks.length >= 4) break
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
  return up.status === 'planted' || up.status === 'mastered'
}

function TaskRow({ task, completed, onStart }) {
  const icon =
    task.type === 'recall' ? '💧'
    : task.type === 'continue' ? '🌱'
    : '🌿'

  return (
    <div className={`flex items-center gap-3 py-2.5 transition-opacity ${completed ? 'opacity-40' : ''}`}>
      <span className="text-base shrink-0 w-6 text-center leading-none">
        {completed ? '✓' : icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium text-stone-700 leading-snug truncate ${completed ? 'line-through decoration-stone-400' : ''}`}>
          {task.unit.name}
        </p>
        <p className="text-xs text-stone-400 truncate">{task.milestone.name}</p>
      </div>
      {!completed && (
        <button
          onClick={() => onStart(task)}
          className="shrink-0 text-xs font-semibold text-emerald-600 hover:text-emerald-800 transition-colors"
        >
          Start →
        </button>
      )}
    </div>
  )
}

export default function DailyTaskWidget({ milestones, progress, onStartUnit, onStartRecall }) {
  const [open, setOpen] = useState(true)

  const [{ reviseTasks, newTasks }] = useState(() => ({
    reviseTasks: buildReviseTasks(milestones, progress),
    newTasks: buildNewTasks(milestones, progress),
  }))

  const [tab, setTab] = useState(() => reviseTasks.length > 0 ? 'revise' : 'new')

  const allTasks = useMemo(() => [...reviseTasks, ...newTasks], [reviseTasks, newTasks])

  const completedIds = useMemo(() => {
    const ids = new Set()
    for (const t of allTasks) {
      if (isTaskCompleted(t, progress)) ids.add(t.id)
    }
    return ids
  }, [allTasks, progress])

  const reviseRemaining = reviseTasks.filter(t => !completedIds.has(t.id)).length
  const newRemaining = newTasks.filter(t => !completedIds.has(t.id)).length
  const totalRemaining = reviseRemaining + newRemaining

  const reviseDone = reviseTasks.length === 0 || reviseTasks.every(t => completedIds.has(t.id))
  const newDone = newTasks.length === 0 || newTasks.every(t => completedIds.has(t.id))

  function handleStart(task) {
    if (task.type === 'recall') onStartRecall(task.unit, task.milestone)
    else onStartUnit(task.unit, task.milestone)
  }

  const tabItems = tab === 'revise' ? reviseTasks : newTasks

  return (
    <div className="fixed top-20 right-4 z-30 w-72">
      <div className="bg-white rounded-2xl shadow-md border border-stone-200 overflow-hidden">

        {/* Header — matches milestone banner style */}
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full bg-emerald-500 flex items-center justify-between px-4 py-3 hover:bg-emerald-600 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🌿</span>
            <span className="text-sm font-bold text-white">Today's garden</span>
            {totalRemaining > 0 && (
              <span className="text-[11px] font-bold bg-white/25 text-white rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
                {totalRemaining}
              </span>
            )}
          </div>
          <span className="text-white/60 text-xs">{open ? '▲' : '▼'}</span>
        </button>

        {open && (
          <>
            {/* Tabs */}
            <div className="flex px-4 border-b border-stone-100">
              {[
                { key: 'revise', label: 'Revise', count: reviseRemaining },
                { key: 'new', label: 'New', count: newRemaining },
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex items-center gap-1.5 text-xs font-semibold py-2 mr-4 border-b-2 -mb-px transition-colors ${
                    tab === key
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-stone-400 hover:text-stone-600'
                  }`}
                >
                  {label}
                  <span className={`text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center ${
                    tab === key ? 'bg-emerald-100 text-emerald-600' : 'bg-stone-100 text-stone-400'
                  }`}>
                    {count}
                  </span>
                </button>
              ))}
            </div>

            {/* Content */}
            {tab === 'revise' && reviseDone ? (
              <div className="px-4 py-4 text-center">
                <p className="text-sm font-semibold text-stone-700 mb-1">All watered! 🎉</p>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Get ahead on the{' '}
                  <span className="text-orange-500 font-medium">orange</span>
                  {' '}/{' '}
                  <span className="text-red-500 font-medium">red</span>
                  {' '}problems on the roadmap if you'd like.
                </p>
              </div>
            ) : tab === 'new' && newDone ? (
              <div className="px-4 py-4 text-center">
                <p className="text-sm font-semibold text-stone-700 mb-1">All planted! 🌱</p>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Explore the roadmap to get ahead on more problems.
                </p>
              </div>
            ) : (
              <div className="px-4 divide-y divide-stone-50">
                {tabItems.map(task => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    completed={completedIds.has(task.id)}
                    onStart={handleStart}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
