import { useState } from 'react'
import { isDue, isOverdue } from '../../lib/srs'

// Colors per milestone
const MILESTONE_STYLES = {
  'arrays-hashing':      { bg: 'bg-emerald-500', light: 'bg-emerald-50', border: 'border-emerald-200', ring: 'ring-emerald-300', text: 'text-emerald-700' },
  'two-pointers':        { bg: 'bg-blue-500',    light: 'bg-blue-50',    border: 'border-blue-200',    ring: 'ring-blue-300',    text: 'text-blue-700' },
  'sliding-window':      { bg: 'bg-violet-500',  light: 'bg-violet-50',  border: 'border-violet-200',  ring: 'ring-violet-300',  text: 'text-violet-700' },
  'stack':               { bg: 'bg-orange-500',  light: 'bg-orange-50',  border: 'border-orange-200',  ring: 'ring-orange-300',  text: 'text-orange-700' },
  'binary-search':       { bg: 'bg-teal-500',    light: 'bg-teal-50',    border: 'border-teal-200',    ring: 'ring-teal-300',    text: 'text-teal-700' },
  'linked-list':         { bg: 'bg-cyan-500',    light: 'bg-cyan-50',    border: 'border-cyan-200',    ring: 'ring-cyan-300',    text: 'text-cyan-700' },
  'trees':               { bg: 'bg-lime-500',    light: 'bg-lime-50',    border: 'border-lime-200',    ring: 'ring-lime-300',    text: 'text-lime-700' },
  'graphs':              { bg: 'bg-rose-500',    light: 'bg-rose-50',    border: 'border-rose-200',    ring: 'ring-rose-300',    text: 'text-rose-700' },
  'tries':               { bg: 'bg-sky-500',     light: 'bg-sky-50',     border: 'border-sky-200',     ring: 'ring-sky-300',     text: 'text-sky-700' },
  'heap-priority-queue': { bg: 'bg-red-500',     light: 'bg-red-50',     border: 'border-red-200',     ring: 'ring-red-300',     text: 'text-red-700' },
  'backtracking':        { bg: 'bg-fuchsia-500', light: 'bg-fuchsia-50', border: 'border-fuchsia-200', ring: 'ring-fuchsia-300', text: 'text-fuchsia-700' },
  'advanced-graphs':     { bg: 'bg-pink-500',    light: 'bg-pink-50',    border: 'border-pink-200',    ring: 'ring-pink-300',    text: 'text-pink-700' },
  'dynamic-programming': { bg: 'bg-purple-500',  light: 'bg-purple-50',  border: 'border-purple-200',  ring: 'ring-purple-300',  text: 'text-purple-700' },
  '2d-dynamic-programming': { bg: 'bg-indigo-500', light: 'bg-indigo-50', border: 'border-indigo-200', ring: 'ring-indigo-300', text: 'text-indigo-700' },
  'greedy':              { bg: 'bg-yellow-500',  light: 'bg-yellow-50',  border: 'border-yellow-200',  ring: 'ring-yellow-300',  text: 'text-yellow-700' },
  'intervals':           { bg: 'bg-amber-500',   light: 'bg-amber-50',   border: 'border-amber-200',   ring: 'ring-amber-300',   text: 'text-amber-700' },
  'math-geometry':       { bg: 'bg-slate-500',   light: 'bg-slate-50',   border: 'border-slate-200',   ring: 'ring-slate-300',   text: 'text-slate-700' },
  'bit-manipulation':    { bg: 'bg-zinc-600',    light: 'bg-zinc-50',    border: 'border-zinc-200',    ring: 'ring-zinc-300',    text: 'text-zinc-700' },
}

const DEFAULT_STYLE = { bg: 'bg-stone-400', light: 'bg-stone-50', border: 'border-stone-200', ring: 'ring-stone-300', text: 'text-stone-600' }

// Horizontal offsets for the winding path (px from center)
const WAVE = [0, 70, 110, 70, 0, -70, -110, -70]

function UnitNode({ unit, unitProgress, style, onStart, onRecall, onReset, onScheduleReview, index, isLocked }) {
  const status = unitProgress?.status || 'new'
  const recallDue = isDue(unitProgress?.nextReview)
  const overdue = isOverdue(unitProgress?.nextReview)
  const offset = WAVE[index % WAVE.length]
  const canSchedule = status === 'planted' || status === 'mastered'

  let nodeClass = ''
  let icon = null

  if (isLocked) {
    nodeClass = 'bg-stone-100 border-2 border-stone-200 cursor-not-allowed'
    icon = <span className="text-xl">🔒</span>
  } else if (status === 'mastered') {
    nodeClass = 'bg-amber-400 shadow-lg shadow-amber-200'
    icon = <span className="text-2xl">⭐</span>
  } else if (status === 'planted') {
    nodeClass = `${style.bg} shadow-lg text-white`
    icon = <span className="text-2xl">✓</span>
  } else if (status === 'in_progress') {
    nodeClass = `bg-white border-4 ${style.border} ring-4 ${style.ring} ring-opacity-40 shadow-md`
    icon = <span className="text-2xl">🌱</span>
  } else {
    nodeClass = `bg-white border-2 ${style.border} shadow-sm`
    icon = (
      <span className={`text-xs font-bold uppercase tracking-wide ${
        unit.difficulty === 'Easy' ? 'text-emerald-500' :
        unit.difficulty === 'Medium' ? 'text-amber-500' : 'text-red-500'
      }`}>
        {unit.difficulty?.[0] ?? '?'}
      </span>
    )
  }

  const [confirming, setConfirming] = useState(false)

  function handleClick() {
    if (isLocked || confirming) return
    if (recallDue) onRecall(unit)
    else onStart(unit)
  }

  function handleReset(e) {
    e.stopPropagation()
    setConfirming(true)
  }

  function confirmReset(e) {
    e.stopPropagation()
    onReset(unit)
    setConfirming(false)
  }

  function cancelReset(e) {
    e.stopPropagation()
    setConfirming(false)
  }

  const hasProgress = status !== 'new'

  return (
    <div
      className={`flex flex-col items-center group ${isLocked ? 'opacity-40' : ''}`}
      style={{ transform: `translateX(${offset}px)` }}
    >
      <div className="relative">
        <button
          onClick={handleClick}
          disabled={isLocked}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-transform ${
            isLocked ? '' : 'hover:scale-110 active:scale-95'
          } ${nodeClass}`}
        >
          {icon}
        </button>

        {!isLocked && recallDue && (
          <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs ${overdue ? 'bg-red-500' : 'bg-amber-400'}`}>
            💧
          </div>
        )}
      </div>

      <div className="mt-2 text-center" style={{ maxWidth: '90px' }}>
        <p className={`text-xs font-medium leading-tight line-clamp-2 ${isLocked ? 'text-stone-400' : 'text-stone-700'}`}>
          {unit.name}
        </p>

        {/* Reset + Schedule — shown on hover if there's progress */}
        {!isLocked && hasProgress && (
          <div className="mt-1 h-4">
            {confirming ? (
              <div className="flex items-center justify-center gap-1">
                <button onClick={confirmReset} className="text-red-500 text-xs font-semibold hover:text-red-700">Yes</button>
                <span className="text-stone-300 text-xs">·</span>
                <button onClick={cancelReset} className="text-stone-400 text-xs hover:text-stone-600">No</button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={handleReset}
                  className="text-stone-300 hover:text-stone-500 text-xs"
                >
                  ↺ reset
                </button>
                {canSchedule && (
                  <>
                    <span className="text-stone-200 text-xs">·</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onScheduleReview(unit, unitProgress) }}
                      className="text-stone-300 hover:text-stone-500 text-xs"
                    >
                      🗓 review
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function Connector({ fromOffset, toOffset }) {
  // A short dashed vertical line, shifted to stay visually between the two nodes
  const midOffset = (fromOffset + toOffset) / 2
  return (
    <div
      className="flex justify-center my-1"
      style={{ transform: `translateX(${midOffset}px)` }}
    >
      <div className="w-0.5 h-8 border-l-2 border-dashed border-stone-200" />
    </div>
  )
}

function MilestoneSection({ milestone, progress, isActive, onStartUnit, onStartRecall, onMilestoneClick, onResetUnit, onResetMilestone, onScheduleReview }) {
  const style = MILESTONE_STYLES[milestone.id] ?? DEFAULT_STYLE
  const units = milestone.units || []

  const completedCount = units.filter((u) => {
    const s = progress.units?.[u.id]?.status
    return s === 'planted' || s === 'mastered'
  }).length

  const isComplete = units.length > 0 && completedCount === units.length

  const hasRecallsDue = units.some((u) => {
    const up = progress.units?.[u.id]
    return (up?.status === 'planted' || up?.status === 'mastered') && isDue(up.nextReview)
  })

  const [open, setOpen] = useState(milestone.unlocked && (isActive || hasRecallsDue))
  const [confirmingMilestoneReset, setConfirmingMilestoneReset] = useState(false)

  // The frontier is the first unit that isn't completed yet.
  // Units after the frontier are locked; completed units before it stay accessible.
  const frontierIdx = units.findIndex((u) => {
    const s = progress.units?.[u.id]?.status
    return !s || s === 'new' || s === 'in_progress'
  })
  // If all units are completed, nothing is locked
  const effectiveFrontier = frontierIdx === -1 ? units.length : frontierIdx

  return (
    <div className="mb-8">
      {/* Chapter banner */}
      <div className={`rounded-2xl mb-6 ${milestone.unlocked ? style.bg : 'bg-stone-200'} relative overflow-hidden`}>
        {!milestone.unlocked && (
          <div className="absolute inset-0 bg-stone-100/60 flex items-center justify-center rounded-2xl">
            <div className="flex items-center gap-2 bg-white/90 px-4 py-2 rounded-full shadow-sm">
              <span className="text-lg">🔒</span>
              <span className="text-stone-600 font-semibold text-sm">Locked</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 p-5">
          {/* Left: click to open concept page */}
          <button
            onClick={() => milestone.unlocked && onMilestoneClick(milestone)}
            disabled={!milestone.unlocked}
            className="flex items-center gap-3 flex-1 text-left group"
          >
            <span className="text-3xl">{milestone.emoji}</span>
            <div>
              <h2 className="font-bold text-white text-lg leading-tight group-hover:underline decoration-white/60">
                {milestone.name}
              </h2>
              {milestone.unlocked && (
                <p className="text-white/70 text-sm">{completedCount} / {units.length} planted</p>
              )}
            </div>
          </button>

          {/* Right: reset chapter + expand/collapse */}
          {milestone.unlocked && (
            <div className="flex items-center gap-1">
              {completedCount > 0 && (
                confirmingMilestoneReset ? (
                  <div className="flex items-center gap-1.5 bg-white/20 rounded-lg px-2 py-1">
                    <span className="text-white text-xs">Reset chapter?</span>
                    <button
                      onClick={() => { onResetMilestone(milestone); setConfirmingMilestoneReset(false) }}
                      className="text-white font-bold text-xs hover:text-red-200"
                    >Yes</button>
                    <span className="text-white/50 text-xs">·</span>
                    <button
                      onClick={() => setConfirmingMilestoneReset(false)}
                      className="text-white/70 text-xs hover:text-white"
                    >No</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmingMilestoneReset(true)}
                    className="text-white/50 hover:text-white/90 transition-colors text-xs px-2 py-1 rounded-lg hover:bg-white/10"
                    title="Reset chapter progress"
                  >↺</button>
                )
              )}
              <button
                onClick={() => setOpen((o) => !o)}
                className="text-white/80 hover:text-white transition-colors p-1"
                aria-label={open ? 'Collapse' : 'Expand'}
              >
                {open ? '▲' : '▼'}
              </button>
            </div>
          )}
        </div>

        {milestone.unlocked && units.length > 0 && (
          <div className="mx-5 mb-5 h-1.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white/80 rounded-full transition-all"
              style={{ width: `${(completedCount / units.length) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Unit nodes — winding path */}
      {milestone.unlocked && (
        <div
          style={{
            overflow: 'hidden',
            maxHeight: open ? '9999px' : '0',
            transition: open ? 'max-height 0.6s ease-in' : 'max-height 0.45s ease-out',
          }}
        >
          <div className="flex flex-col items-center">
            {units.map((unit, i) => (
              <div key={unit.id} className="flex flex-col items-center w-full">
                {i > 0 && (
                  <Connector
                    fromOffset={WAVE[(i - 1) % WAVE.length]}
                    toOffset={WAVE[i % WAVE.length]}
                  />
                )}
                <UnitNode
                  unit={unit}
                  unitProgress={progress.units?.[unit.id]}
                  style={style}
                  onStart={(u) => onStartUnit(u, milestone)}
                  onRecall={(u) => onStartRecall(u, milestone)}
                  onReset={(u) => onResetUnit(u)}
                  onScheduleReview={onScheduleReview}
                  index={i}
                  isLocked={i > effectiveFrontier && !['planted', 'mastered', 'in_progress'].includes(progress.units?.[unit.id]?.status)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ReviewSchedulerModal({ unit, unitProgress, onConfirm, onResetSRS, onClose }) {
  const today = new Date().toISOString().split('T')[0]
  const currentReview = unitProgress?.nextReview
    ? new Date(unitProgress.nextReview).toISOString().split('T')[0]
    : today
  const [date, setDate] = useState(currentReview < today ? today : currentReview)
  const [confirmingReset, setConfirmingReset] = useState(false)

  function handleConfirm() {
    const iso = new Date(date + 'T00:00:00').toISOString()
    onConfirm(unit, iso)
  }

  const currentInterval = unitProgress?.interval || 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div
        className="relative bg-white rounded-2xl shadow-xl p-6 w-80 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-bold text-stone-800 text-base mb-1">Schedule review</h3>
        <p className="text-stone-500 text-sm mb-5">{unit.name}</p>

        <label className="block text-xs font-medium text-stone-500 uppercase tracking-wide mb-2">
          Review date
        </label>
        <input
          type="date"
          value={date}
          min={today}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-stone-800 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-stone-300"
        />

        <div className="flex gap-2 mb-5">
          <button
            onClick={onClose}
            className="flex-1 border border-stone-200 text-stone-500 hover:text-stone-700 hover:border-stone-300 font-medium py-2.5 rounded-xl text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!date}
            className="flex-1 bg-stone-800 hover:bg-stone-900 disabled:opacity-40 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
          >
            Set date
          </button>
        </div>

        <div className="border-t border-stone-100 pt-4">
          {confirmingReset ? (
            <div>
              <p className="text-stone-600 text-xs mb-3">
                This resets the SRS interval back to 1 day. The full 1→3→7→14→30→60 cycle will run again.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmingReset(false)}
                  className="flex-1 border border-stone-200 text-stone-500 hover:text-stone-700 font-medium py-2 rounded-xl text-xs transition-colors"
                >
                  Keep current
                </button>
                <button
                  onClick={() => onResetSRS(unit)}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 rounded-xl text-xs transition-colors"
                >
                  Reset SRS
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-stone-500 text-xs">Current interval</p>
                <p className="text-stone-700 text-xs font-medium">{currentInterval} day{currentInterval !== 1 ? 's' : ''}</p>
              </div>
              <button
                onClick={() => setConfirmingReset(true)}
                className="text-xs text-amber-600 hover:text-amber-800 font-medium border border-amber-200 hover:border-amber-400 px-3 py-1.5 rounded-lg transition-colors"
              >
                ↺ Reset SRS
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Roadmap({ milestones, progress, onStartUnit, onStartRecall, onMilestoneClick, onResetUnit, onResetMilestone, onScheduleReview, onResetSRS }) {
  const [schedulingUnit, setSchedulingUnit] = useState(null) // { unit, unitProgress }

  const totalPlanted = Object.values(progress.units || {}).filter(
    (u) => u.status === 'planted' || u.status === 'mastered'
  ).length

  const dueToday = Object.entries(progress.units || {}).filter(
    ([, u]) => (u.status === 'planted' || u.status === 'mastered') && isDue(u.nextReview)
  ).length

  // The active milestone is the first unlocked one that isn't fully complete
  const activeMilestoneId = milestones.find((ms) => {
    if (!ms.unlocked) return false
    const units = ms.units || []
    const completedCount = units.filter((u) => {
      const s = progress.units?.[u.id]?.status
      return s === 'planted' || s === 'mastered'
    }).length
    return units.length === 0 || completedCount < units.length
  })?.id

  function handleScheduleReview(unit, unitProgress) {
    setSchedulingUnit({ unit, unitProgress })
  }

  function handleConfirmSchedule(unit, isoDate) {
    onScheduleReview(unit, isoDate)
    setSchedulingUnit(null)
  }

  return (
    <div className="animate-fade-in">
      {/* Hero header */}
      <div className="text-center mb-10">
        <div className="text-5xl mb-3">🌿</div>
        <h1 className="text-2xl font-bold text-stone-800 mb-1">Your DSA Garden</h1>
        {totalPlanted > 0 ? (
          <p className="text-stone-400 text-sm">
            {totalPlanted} problem{totalPlanted !== 1 ? 's' : ''} planted
            {dueToday > 0 && (
              <span className="text-amber-500 font-medium"> · {dueToday} to water 💧</span>
            )}
          </p>
        ) : (
          <p className="text-stone-400 text-sm">Tap a problem to start planting</p>
        )}
      </div>

      {/* Milestones */}
      {milestones.map((ms) => (
        <MilestoneSection
          key={ms.id}
          milestone={ms}
          progress={progress}
          isActive={ms.id === activeMilestoneId}
          onStartUnit={onStartUnit}
          onStartRecall={onStartRecall}
          onMilestoneClick={onMilestoneClick}
          onResetUnit={onResetUnit}
          onResetMilestone={onResetMilestone}
          onScheduleReview={handleScheduleReview}
        />
      ))}

      {/* Review scheduler modal */}
      {schedulingUnit && (
        <ReviewSchedulerModal
          unit={schedulingUnit.unit}
          unitProgress={schedulingUnit.unitProgress}
          onConfirm={handleConfirmSchedule}
          onResetSRS={(unit) => { onResetSRS(unit); setSchedulingUnit(null) }}
          onClose={() => setSchedulingUnit(null)}
        />
      )}
    </div>
  )
}
