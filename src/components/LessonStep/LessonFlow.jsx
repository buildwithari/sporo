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
      setLessonIdx(resumeIdx)
      // If mid-lesson, skip intro and jump straight to where they left off
      setPhase(resumeIdx > 0 ? 'lesson' : 'intro')
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
        // Accumulate this step's code for the "code so far" panel
        setCompletedSteps((prev) => [
          ...prev,
          { title: lessons[lessonIdx].title, code },
        ])
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
      // Back to last coding lesson, remove its completed step
      const lastIdx = lessons.length - 1
      setLessonIdx(lastIdx)
      setCompletedSteps((prev) => prev.slice(0, lastIdx))
      setPhase('lesson')
    } else if (phase === 'lesson' && lessonIdx > 0) {
      const prevIdx = lessonIdx - 1
      setLessonIdx(prevIdx)
      setCompletedSteps((prev) => prev.slice(0, prevIdx))
    } else if (phase === 'lesson' && lessonIdx === 0) {
      setCompletedSteps([])
      setPhase('intro')
    } else if (phase === 'intro') {
      onBack()
    } else {
      onBack()
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
          onClick={isRecall ? onBack : handleStepBack}
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
          completedSteps={completedSteps}
          onSubmit={handleLessonSubmit}
          isEvaluating={phase === 'evaluating'}
          feedback={feedback}
          onNext={handleNextLesson}
          onPrev={handleStepBack}
        />
      )}

      {/* ── Last step: real LeetCode problem + final editor ── */}
      {(phase === 'final' || phase === 'finalEvaluating') && (
        <div className="animate-slide-up pb-4">
          {isRecall ? (
            /* Recall: just show the problem description */
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 mb-5">
              <p className="text-stone-700 text-sm leading-relaxed">{unit.description}</p>
            </div>
          ) : (
            /* Learning: reveal the real LeetCode problem statement */
            <div className="mb-6">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-5">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <h2 className="font-bold text-stone-800 mb-1">Here's the real problem</h2>
                    <p className="text-stone-500 text-sm mb-4">
                      This is exactly how it appears on LeetCode. Everything you just built maps directly to this.
                    </p>
                    <div className="bg-white border border-amber-200 rounded-xl p-4">
                      <p className="text-stone-700 text-sm leading-relaxed font-mono whitespace-pre-wrap">{unit.description}</p>
                    </div>
                    {unit.testCases && (
                      <div className="mt-4 space-y-2">
                        <div className="text-xs font-semibold text-stone-400 uppercase tracking-wide">Examples</div>
                        {unit.testCases.map((tc, i) => (
                          <div key={i} className="flex gap-3 text-xs font-mono">
                            <span className="text-stone-400 shrink-0">Input:</span>
                            <span className="text-stone-600">{tc.input}</span>
                            <span className="text-stone-400 shrink-0 ml-2">→</span>
                            <span className="text-emerald-600 font-semibold">{tc.expected}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <h3 className="font-semibold text-stone-800 mb-1">Now write the full solution</h3>
              <p className="text-stone-400 text-sm mb-4">You've got this — you just built it piece by piece.</p>
            </div>
          )}

          <div className="mb-4">
            <CodeEditor value={finalCode} onChange={setFinalCode} minHeight="260px" />
          </div>

          {finalFeedback && (
            <div
              className={`rounded-xl p-4 mb-4 animate-fade-in ${
                finalFeedback.correct
                  ? 'bg-emerald-50 border border-emerald-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <div className="flex items-start gap-2">
                <span>{finalFeedback.correct ? '✅' : '❌'}</span>
                <div className="flex-1">
                  <p className={`text-sm ${finalFeedback.correct ? 'text-emerald-800' : 'text-red-800'}`}>
                    {finalFeedback.feedback}
                  </p>
                  {finalFeedback.correct && (
                    <div className="flex gap-4 mt-2 text-xs text-stone-500">
                      <span>⏱ {finalFeedback.timeComplexity}</span>
                      <span>💾 {finalFeedback.spaceComplexity}</span>
                    </div>
                  )}
                  {!finalFeedback.correct && finalFeedback.hint && (
                    <p className="text-sm text-stone-500 mt-1 italic">{finalFeedback.hint}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
          <button
            onClick={handleStepBack}
            disabled={phase === 'finalEvaluating'}
            className="text-stone-400 hover:text-stone-600 text-sm font-medium px-3 py-3 rounded-xl hover:bg-stone-100 transition-colors disabled:opacity-40"
          >
            ← Prev
          </button>
          <button
            onClick={handleFinalSubmit}
            disabled={phase === 'finalEvaluating' || !finalCode.trim()}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors"
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
      )}
    </div>
  )
}
