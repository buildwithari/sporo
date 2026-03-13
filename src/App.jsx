import { useState, useCallback, useEffect, useRef } from 'react'
import Roadmap from './components/Roadmap/Roadmap'
import DailyPlan from './components/DailyPlan/DailyPlan'
import LessonFlow from './components/LessonStep/LessonFlow'
import MilestonePage from './components/Milestone/MilestonePage'
import Celebration from './components/Celebration/Celebration'
import { loadProgress, resetUnitProgress, resetMilestoneProgress, resetAllProgress } from './lib/progress'
import ForestPage from './components/Forest/ForestPage'
import { clearAllLessonCaches } from './lib/lessonCache'
import { milestones } from './data/neetcode150'
import DailyTaskWidget from './components/DailyTask/DailyTaskWidget'

function useClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(t)
  }, [])
  return now
}

export default function App() {
  const [view, setView] = useState('roadmap') // 'roadmap' | 'daily-plan' | 'lesson-flow' | 'milestone' | 'forest'
  const [selectedUnit, setSelectedUnit] = useState(null)
  const [selectedMilestone, setSelectedMilestone] = useState(null)
  const [isRecall, setIsRecall] = useState(false)
  const [celebration, setCelebration] = useState(null)
  const [progress, setProgress] = useState(() => loadProgress())

  const refreshProgress = useCallback(() => {
    setProgress(loadProgress())
  }, [])

  function handleMilestoneClick(milestone) {
    setSelectedMilestone(milestone)
    setView('milestone')
  }

  function handleStartUnit(unit, milestone) {
    setSelectedUnit(unit)
    setSelectedMilestone(milestone)
    setIsRecall(false)
    setView('lesson-flow')
  }

  function handleStartRecall(unit, milestone) {
    setSelectedUnit(unit)
    setSelectedMilestone(milestone)
    setIsRecall(true)
    setView('lesson-flow')
  }

  function handleLessonComplete(xpGained, message) {
    refreshProgress()
    setCelebration({ xp: xpGained, message })
  }

  function handleCelebrationClose() {
    setCelebration(null)
    setView('roadmap')
    setSelectedUnit(null)
  }

  const [showResetMenu, setShowResetMenu] = useState(false)
  const resetMenuRef = useRef(null)
  const now = useClock()

  // Close reset menu when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (resetMenuRef.current && !resetMenuRef.current.contains(e.target)) {
        setShowResetMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleResetUnit(unit) {
    resetUnitProgress(unit.id)
    refreshProgress()
  }

  function handleResetMilestone(milestone) {
    const ids = (milestone.units || []).map((u) => u.id)
    resetMilestoneProgress(ids)
    refreshProgress()
  }

  function handleResetAll() {
    const allUnitIds = milestones.flatMap((ms) => (ms.units || []).map((u) => u.id))
    resetAllProgress()
    clearAllLessonCaches(allUnitIds)
    refreshProgress()
    setShowResetMenu(false)
  }

  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  const totalXP = progress.user?.totalXP || 0
  const streak = progress.user?.streak || 0

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Nav */}
      <nav className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setView('roadmap')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-2xl">🌱</span>
            <span className="font-bold text-stone-800 text-lg">Sporo</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Live date + time → opens daily plan */}
            <button
              onClick={() => setView('daily-plan')}
              className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                view === 'daily-plan'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
              }`}
            >
              {dateStr} · {timeStr}
            </button>

            {streak > 0 && (
              <div className="flex items-center gap-1 text-sm bg-orange-50 px-2.5 py-1.5 rounded-lg">
                <span>🔥</span>
                <span className="font-bold text-orange-600">{streak}</span>
              </div>
            )}

            <button
              onClick={() => setView('forest')}
              className={`flex items-center gap-1 text-sm px-2.5 py-1.5 rounded-lg transition-colors ${
                view === 'forest'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
              title="Your Forest"
            >
              <span>⚡</span>
              <span className="font-bold">{totalXP}</span>
              <span className="ml-0.5">🌲</span>
            </button>

            {/* Global reset menu */}
            <div className="relative" ref={resetMenuRef}>
              <button
                onClick={() => setShowResetMenu((s) => !s)}
                className="text-stone-400 hover:text-stone-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-stone-100 text-base"
                title="Settings"
              >
                ⚙️
              </button>
              {showResetMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-stone-200 rounded-xl shadow-lg py-1 z-50 w-44">
                  <button
                    onClick={handleResetAll}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    ↺ Reset all progress
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Content — milestone page gets extra width for the sidebar */}
      <main className={`mx-auto px-4 py-8 ${view === 'milestone' ? 'max-w-5xl' : 'max-w-2xl'}`}>
        {view === 'roadmap' && (
          <Roadmap
            milestones={milestones}
            progress={progress}
            onStartUnit={handleStartUnit}
            onStartRecall={handleStartRecall}
            onMilestoneClick={handleMilestoneClick}
            onResetUnit={handleResetUnit}
            onResetMilestone={handleResetMilestone}
          />
        )}

        {view === 'milestone' && selectedMilestone && (
          <MilestonePage
            milestone={selectedMilestone}
            onBack={() => setView('roadmap')}
          />
        )}

        {view === 'daily-plan' && (
          <DailyPlan
            milestones={milestones}
            progress={progress}
            onStartUnit={handleStartUnit}
            onStartRecall={handleStartRecall}
          />
        )}

        {view === 'lesson-flow' && selectedUnit && (
          <LessonFlow
            unit={selectedUnit}
            milestone={selectedMilestone}
            isRecall={isRecall}
            onComplete={handleLessonComplete}
            onBack={() => setView('roadmap')}
            onProgressUpdate={refreshProgress}
          />
        )}

        {view === 'forest' && (
          <ForestPage
            progress={progress}
            onProgressUpdate={refreshProgress}
          />
        )}
      </main>

      {/* Daily task widget — roadmap view only */}
      {view === 'roadmap' && (
        <DailyTaskWidget
          milestones={milestones}
          progress={progress}
          onStartUnit={handleStartUnit}
          onStartRecall={handleStartRecall}
        />
      )}

      {/* Celebration overlay */}
      {celebration && (
        <Celebration
          xp={celebration.xp}
          message={celebration.message}
          onClose={handleCelebrationClose}
        />
      )}
    </div>
  )
}
