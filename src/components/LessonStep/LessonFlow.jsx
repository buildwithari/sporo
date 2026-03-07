import { useState, useEffect } from 'react'
import LessonStep from './LessonStep'
import CodeEditor from '../CodeEditor/CodeEditor'
import {
  generateLessons,
  evaluateCode,
  evaluateFullSolution,
} from '../../lib/claude'
import {
  getUnitProgress,
  updateUnitProgress,
  addXP,
} from '../../lib/progress'
import { getCachedLessons, setCachedLessons } from '../../lib/lessonCache'
import { getNextInterval, getNextReviewDate } from '../../lib/srs'

const XP_VALUES = {
  LESSON: 10,
  SOLVE_FIRST: 50,
  RECALL_CLEAN: 30,
  RECALL_HINTS: 15,
}

export default function LessonFlow({
  unit,
  isRecall,
  onComplete,
  onBack,
  onProgressUpdate,
}) {
  const [phase, setPhase] = useState('loading') // loading | intro | lesson | evaluating | final | finalEvaluating | error
  const [lessons, setLessons] = useState(null)
  const [lessonIdx, setLessonIdx] = useState(0)
  const [completedSteps, setCompletedSteps] = useState([]) // { title, code }[]
  const [feedback, setFeedback] = useState(null)
  const [finalCode, setFinalCode] = useState('')
  const [finalFeedback, setFinalFeedback] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  const [usedHints, setUsedHints] = useState(0)
  // When recalling and user clicks "I'm stuck", we drop them into lessons
  const [stuck, setStuck] = useState(false)

  useEffect(() => {
    if (isRecall) {
      setPhase('final')
      return
    }

    const cached = getCachedLessons(unit.id)
    if (cached) {
      setLessons(cached)
      const saved = getUnitProgress(unit.id)
      const resumeIdx = saved.currentLesson || 0
      // If all lessons were completed but final wasn't submitted, go to final
      if (resumeIdx >= cached.length) {
        setLessonIdx(cached.length - 1)
        setPhase('final')
      } else {
        setLessonIdx(resumeIdx)
        setPhase(resumeIdx > 0 ? 'lesson' : 'intro')
      }
    } else {
      loadLessons()
    }
  }, [])

  async function loadLessons() {
    setPhase('loading')
    try {
      const generatedLessons = await generateLessons(unit)
      // Persist to dedicated lesson cache — survives progress resets
      setCachedLessons(unit.id, generatedLessons)
      setLessons(generatedLessons)
      updateUnitProgress(unit.id, {
        status: 'in_progress',
        currentLesson: 0,
      })
      setLessonIdx(0)
      setPhase('intro')
    } catch (e) {
      setErrorMsg(
        e.message === 'NO_API_KEY'
          ? 'No API key found. Add VITE_ANTHROPIC_API_KEY to your .env file and restart.'
          : 'Could not reach Claude. Check your API key and internet connection.'
      )
      setPhase('error')
    }
  }

  async function handleLessonSubmit(code) {
    setPhase('evaluating')
    try {
      const result = await evaluateCode(lessons[lessonIdx], code)
      setFeedback(result)
      if (result.correct) {
        addXP(XP_VALUES.LESSON)
        updateUnitProgress(unit.id, { currentLesson: lessonIdx + 1 })
        onProgressUpdate()
        // Store completed step at its index — works for both new and re-submitted steps
        setCompletedSteps((prev) => {
          const updated = [...prev]
          updated[lessonIdx] = { title: lessons[lessonIdx].title, code }
          return updated
        })
      } else if (result.hint) {
        setUsedHints((n) => n + 1)
      }
    } catch {
      setFeedback({ correct: false, feedback: 'Could not evaluate. Try again.', hint: '' })
    }
    setPhase('lesson')
  }

  function handleNextLesson() {
    setFeedback(null)
    const next = lessonIdx + 1
    if (next >= lessons.length) {
      setPhase('final')
    } else {
      setLessonIdx(next)
    }
  }

  // Step back through the lesson flow
  function handleStepBack() {
    setFeedback(null)
    setFinalFeedback(null)

    if (phase === 'final') {
      if (isRecall && !stuck) {
        // Pure recall mode — back goes to roadmap
        onBack()
      } else {
        // Back to last coding lesson — don't touch completedSteps
        setLessonIdx(lessons.length - 1)
        setPhase('lesson')
      }
    } else if (phase === 'lesson' && lessonIdx > 0) {
      // Don't slice completedSteps — the step is still completed
      setLessonIdx(lessonIdx - 1)
    } else if (phase === 'lesson' && lessonIdx === 0) {
      setPhase('intro')
    } else if (phase === 'intro') {
      if (stuck) {
        // Return to the recall final-step view
        setStuck(false)
        setPhase('final')
      } else {
        onBack()
      }
    } else {
      onBack()
    }
  }

  async function handleGetStuck() {
    // Mark this recall as using hints so XP is reduced accordingly
    setUsedHints((n) => n + 1)
    setStuck(true)

    const cached = getCachedLessons(unit.id)
    if (cached) {
      setLessons(cached)
      setLessonIdx(0)
      setCompletedSteps([])
      setPhase('intro')
    } else {
      await loadLessons()
    }
  }

  async function handleFinalSubmit() {
    setPhase('finalEvaluating')
    try {
      const result = await evaluateFullSolution(unit, finalCode)
      setFinalFeedback(result)

      if (result.correct) {
        const saved = getUnitProgress(unit.id)
        let xpGained, newInterval, newStatus

        if (isRecall) {
          xpGained = usedHints > 0 ? XP_VALUES.RECALL_HINTS : XP_VALUES.RECALL_CLEAN
          newInterval = getNextInterval(saved.interval || 1, usedHints > 0 ? 3 : 5)
          newStatus = newInterval >= 30 ? 'mastered' : 'planted'
        } else {
          xpGained = XP_VALUES.SOLVE_FIRST
          newInterval = 1
          newStatus = 'planted'
        }

        updateUnitProgress(unit.id, {
          status: newStatus,
          nextReview: getNextReviewDate(newInterval),
          interval: newInterval,
          reviewCount: (saved.reviewCount || 0) + (isRecall ? 1 : 0),
          lastReview: new Date().toISOString(),
          usedHintsOnLastRecall: usedHints > 0,
        })
        addXP(xpGained)
        onProgressUpdate()

        const msg = isRecall
          ? usedHints > 0
            ? '💧 Recalled with hints — still growing!'
            : '💧 Clean recall — nice!'
          : '🌱 Problem planted!'

        setTimeout(() => onComplete(xpGained, msg), 400)
      } else {
        setPhase('final')
      }
    } catch {
      setFinalFeedback({ correct: false, feedback: 'Could not evaluate. Try again.' })
      setPhase('final')
    }
  }

  // Total steps: 1 (intro/description) + N (coding lessons) + 1 (real problem + final editor)
  // Recall mode skips intro and goes straight to the final editor step
  const totalSteps = lessons ? lessons.length + 2 : 0
  const currentStep =
    phase === 'intro' ? 1
    : phase === 'lesson' || phase === 'evaluating' ? lessonIdx + 2
    : phase === 'final' || phase === 'finalEvaluating' ? totalSteps
    : 0
  const progressPct = totalSteps > 0 ? Math.round((currentStep / totalSteps) * 100) : 0

  const showProgressBar = !isRecall && lessons && ['intro', 'lesson', 'evaluating', 'final', 'finalEvaluating'].includes(phase)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="text-stone-400 hover:text-stone-600 transition-colors text-xl leading-none"
        >
          ←
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-stone-400 uppercase tracking-wide font-medium">
            {isRecall ? '🔁 Recall' : '🌱 Learning'}
          </div>
          <h1 className="font-bold text-stone-800 text-lg leading-tight truncate">{unit.name}</h1>
        </div>
      </div>

      {/* Progress bar — spans all steps including intro and final */}
      {showProgressBar && (
        <div className="mb-6">
          <div className="flex justify-between text-xs text-stone-400 mb-1.5">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{progressPct}%</span>
          </div>
          <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Loading ── */}
      {phase === 'loading' && (
        <div className="text-center py-24 animate-fade-in">
          <div className="text-5xl mb-4 animate-bounce">🌱</div>
          <p className="text-stone-500 text-sm">Preparing your lessons…</p>
        </div>
      )}

      {/* ── Error ── */}
      {phase === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-800 font-semibold mb-2">Setup needed</p>
          <p className="text-red-600 text-sm mb-6 max-w-sm mx-auto">{errorMsg}</p>
          <button
            onClick={loadLessons}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Step 1: Plain-English description ── */}
      {phase === 'intro' && (
        <div className="animate-slide-up">
          <div className="bg-white border border-stone-200 rounded-2xl p-8 mb-6 shadow-sm">
            <div className="text-4xl mb-4">🤔</div>
            <h2 className="text-xl font-bold text-stone-800 mb-3">What are we solving?</h2>
            <p className="text-stone-600 leading-relaxed mb-6">
              {unit.summary || unit.description}
            </p>

            {unit.testCases?.[0] && (
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
                <div className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">Example</div>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="text-stone-400 w-16 shrink-0">Input:</span>
                    <code className="text-stone-700 font-mono">{unit.testCases[0].input}</code>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-stone-400 w-16 shrink-0">Output:</span>
                    <code className="text-emerald-600 font-mono font-semibold">{unit.testCases[0].expected}</code>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setPhase('lesson')}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl text-lg transition-colors"
          >
            Let's go! →
          </button>
        </div>
      )}

      {/* ── Steps 2–N: Coding lessons ── */}
      {(phase === 'lesson' || phase === 'evaluating') && lessons && (
        <LessonStep
          key={lessonIdx}
          lesson={lessons[lessonIdx]}
          lessonIndex={lessonIdx}
          totalLessons={lessons.length}
          completedSteps={completedSteps.slice(0, lessonIdx)}
          initialCode={completedSteps[lessonIdx]?.code ?? ''}
          alreadyCompleted={lessonIdx < completedSteps.length}
          onSubmit={handleLessonSubmit}
          isEvaluating={phase === 'evaluating'}
          feedback={feedback}
          onNext={handleNextLesson}
          onPrev={handleStepBack}
        />
      )}

      {/* ── Last step: LeetCode-style split view ── */}
      {(phase === 'final' || phase === 'finalEvaluating') && (
        <div className="fixed inset-0 bg-stone-50 z-50 flex flex-col animate-fade-in">
          {/* Top bar */}
          <div className="flex items-center gap-3 px-4 py-2.5 bg-white border-b border-stone-200 shrink-0">
            <button
              onClick={handleStepBack}
              className="text-stone-400 hover:text-stone-700 transition-colors text-lg leading-none px-1"
            >
              ←
            </button>
            <span className="text-stone-800 font-semibold text-sm">{unit.name}</span>
            {isRecall && !stuck ? (
              <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                🔁 Recall
              </span>
            ) : (
              <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Put it all together
              </span>
            )}
          </div>

          {/* Split body */}
          <div className="flex-1 flex overflow-hidden">
            {/* ── Left: problem statement ── */}
            <div className="w-1/2 overflow-y-auto p-6 border-r border-stone-200 bg-white">
              <h2 className="text-stone-800 font-bold text-lg mb-1">{unit.name}</h2>
              {unit.difficulty && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block mb-4 ${
                  unit.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' :
                  unit.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {unit.difficulty}
                </span>
              )}
              <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-wrap mb-6">
                {unit.description}
              </p>

              {unit.testCases && (
                <div className="space-y-4">
                  {unit.testCases.map((tc, i) => (
                    <div key={i}>
                      <div className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">
                        Example {i + 1}
                      </div>
                      <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-sm font-mono space-y-1.5">
                        <div className="flex gap-3">
                          <span className="text-stone-400 shrink-0 w-16">Input:</span>
                          <span className="text-stone-700">{tc.input}</span>
                        </div>
                        <div className="flex gap-3">
                          <span className="text-stone-400 shrink-0 w-16">Output:</span>
                          <span className="text-emerald-600 font-semibold">{tc.expected}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* I'm stuck — recall mode only */}
              {isRecall && !stuck && (
                <div className="mt-8 pt-6 border-t border-stone-100">
                  <p className="text-stone-400 text-xs mb-3">Can't remember how to approach this?</p>
                  <button
                    onClick={handleGetStuck}
                    className="text-sm font-medium text-stone-500 hover:text-stone-800 border border-stone-200 hover:border-stone-400 px-4 py-2 rounded-xl transition-colors"
                  >
                    I'm stuck — walk me through it
                  </button>
                </div>
              )}
            </div>

            {/* ── Right: code editor + submit ── */}
            <div className="w-1/2 flex flex-col overflow-hidden bg-stone-50">
              <div className="flex-1 overflow-auto p-4">
                <CodeEditor value={finalCode} onChange={setFinalCode} minHeight="100%" />
              </div>

              {finalFeedback && (
                <div
                  className={`mx-4 mb-3 rounded-xl p-3 animate-fade-in text-sm ${
                    finalFeedback.correct
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span>{finalFeedback.correct ? '✓' : '✗'}</span>
                    <div className="flex-1">
                      <p>{finalFeedback.feedback}</p>
                      {finalFeedback.correct && (
                        <div className="flex gap-4 mt-1.5 text-xs text-stone-400">
                          <span>⏱ {finalFeedback.timeComplexity}</span>
                          <span>💾 {finalFeedback.spaceComplexity}</span>
                        </div>
                      )}
                      {!finalFeedback.correct && finalFeedback.hint && (
                        <p className="text-xs text-stone-500 mt-1 italic">{finalFeedback.hint}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="px-4 pb-4 shrink-0">
                <button
                  onClick={handleFinalSubmit}
                  disabled={phase === 'finalEvaluating' || !finalCode.trim()}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  {phase === 'finalEvaluating' ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-block animate-spin">⟳</span> Evaluating…
                    </span>
                  ) : (
                    'Submit solution →'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
