import { useState, useEffect } from 'react'
import LessonStep from './LessonStep'
import CodeEditor from '../CodeEditor/CodeEditor'
import {
  generateLessons,
  evaluateCode,
  evaluateBruteSolution,
  evaluateFullSolution,
} from '../../lib/claude'
import {
  getUnitProgress,
  updateUnitProgress,
  addXP,
} from '../../lib/progress'
import { getCachedLessons, setCachedLessons, clearCachedLessons } from '../../lib/lessonCache'
import { getNextInterval, getNextReviewDate } from '../../lib/srs'

function ProblemStatement({ unit, lessons, phaseLabel, showBruteForceTip, isRecall, stuck, onGetStuck }) {
  return (
    <div className="w-1/2 overflow-y-auto p-6 border-r border-stone-200 bg-white">
      <h2 className="text-stone-800 font-bold text-lg mb-2">{unit.name}</h2>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {unit.difficulty && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            unit.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' :
            unit.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
            'bg-red-100 text-red-700'
          }`}>
            {unit.difficulty}
          </span>
        )}
        {phaseLabel && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${phaseLabel.className}`}>
            {phaseLabel.text}
          </span>
        )}
      </div>

      <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-wrap mb-6">
        {unit.description || lessons?.description}
      </p>

      {unit.testCases && unit.testCases.length > 0 && (
        <div className="space-y-4 mb-6">
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
                {tc.explanation && (
                  <div className="flex gap-3 pt-1 border-t border-stone-200 font-sans">
                    <span className="text-stone-400 shrink-0 w-16">Explain:</span>
                    <span className="text-stone-500 text-xs leading-relaxed">{tc.explanation}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {unit.constraints && unit.constraints.length > 0 && (
        <div className="mb-6">
          <div className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">Constraints</div>
          <ul className="space-y-1">
            {unit.constraints.map((c, i) => (
              <li key={i} className="text-stone-600 text-xs font-mono flex gap-2">
                <span className="text-stone-300 shrink-0">•</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {unit.followUp && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm">
          <p className="font-semibold text-blue-800 mb-1">Follow-up</p>
          <p className="text-blue-700 text-xs leading-relaxed">{unit.followUp}</p>
        </div>
      )}

      {showBruteForceTip && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
          <p className="font-semibold text-amber-800 mb-1">🔨 Brute force is fine here</p>
          <p className="text-amber-700 text-xs leading-relaxed">
            Don't worry about time or space complexity yet — just write the simplest
            solution that produces correct output. We'll make it faster in Part 2.
          </p>
        </div>
      )}

      {isRecall && !stuck && onGetStuck && (
        <div className="mt-8 pt-6 border-t border-stone-100">
          <p className="text-stone-400 text-xs mb-3">Can't remember the optimal approach?</p>
          <button
            onClick={onGetStuck}
            className="text-sm font-medium text-stone-500 hover:text-stone-800 border border-stone-200 hover:border-stone-400 px-4 py-2 rounded-xl transition-colors"
          >
            I'm stuck — walk me through it
          </button>
        </div>
      )}
    </div>
  )
}

const XP_VALUES = {
  LESSON: 10,
  BF_SOLVE: 20,
  OPT_SOLVE: 50,
  RECALL_CLEAN: 30,
  RECALL_HINTS: 15,
}

export default function LessonFlow({
  unit,
  isRecall,
  language,
  onComplete,
  onBack,
  onProgressUpdate,
}) {
  // phases: loading | error | bf-intro | bf-lesson | bf-evaluating | bf-final | bf-finalEvaluating
  //       | opt-intro | opt-lesson | opt-evaluating | opt-final | opt-finalEvaluating
  const [phase, setPhase] = useState('loading')
  // { brute: { intro: string, lessons: [] }, optimal: { intro: string, lessons: [] } }
  const [lessons, setLessons] = useState(null)

  // ── Brute-force lesson state ─────────────────────────────────
  const [bfLessonIdx, setBfLessonIdx] = useState(0)
  const [bfCompletedSteps, setBfCompletedSteps] = useState([]) // { title, code }[]
  const [bfFeedback, setBfFeedback] = useState(null)
  const starterCode = typeof unit.starterCode === 'object'
    ? (unit.starterCode[language] || unit.starterCode.java || '')
    : (unit.starterCode || '')

  const [bfFinalCode, setBfFinalCode] = useState(starterCode)
  const [bfFinalFeedback, setBfFinalFeedback] = useState(null)

  // ── Optimal lesson state ─────────────────────────────────────
  const [optLessonIdx, setOptLessonIdx] = useState(0)
  const [optCompletedSteps, setOptCompletedSteps] = useState([]) // { title, code }[]
  const [optFeedback, setOptFeedback] = useState(null)
  // recall mode: seeds with starter code so user sees the function signature
  const [optFinalCode, setOptFinalCode] = useState(starterCode)
  const [optFinalFeedback, setOptFinalFeedback] = useState(null)

  const [errorMsg, setErrorMsg] = useState(null)
  const [usedHints, setUsedHints] = useState(0)
  const [stuck, setStuck] = useState(false)


  useEffect(() => {
    if (isRecall) {
      setPhase('opt-final')
      return
    }

    const cached = getCachedLessons(unit.id, language)
    // Use cache only if it has the two-part shape AND a summary (for stubs without static description)
    const needsGeneratedSummary = !unit.description
    if (cached?.brute?.lessons && cached?.optimal?.lessons && (!needsGeneratedSummary || cached.summary)) {
      setLessons(cached)
      const saved = getUnitProgress(unit.id)
      if ((saved.learningPhase ?? 'brute') === 'optimal') {
        const optIdx = saved.optCurrentLesson || 0
        const savedBfCode = saved.bfSolvedCode || ''
        setBfFinalCode(savedBfCode)
        setOptLessonIdx(optIdx)
        if (optIdx >= cached.optimal.lessons.length) {
          setOptFinalCode(saved.optSolvedCode || savedBfCode)
          setPhase('opt-final')
        } else {
          setPhase(optIdx > 0 ? 'opt-lesson' : 'opt-intro')
        }
      } else {
        const bfIdx = saved.currentLesson || 0
        setBfLessonIdx(bfIdx)
        if (bfIdx >= cached.brute.lessons.length) {
          setPhase('bf-final')
        } else {
          setPhase(bfIdx > 0 ? 'bf-lesson' : 'problem-intro')
        }
      }
    } else {
      // Clear stale old-format cache before regenerating
      if (cached) clearCachedLessons(unit.id, language)
      loadLessons()
    }
  }, [])

  async function loadLessons() {
    setPhase('loading')
    try {
      const generated = await generateLessons(unit, language)
      setCachedLessons(unit.id, language, generated)
      setLessons(generated)
      updateUnitProgress(unit.id, {
        status: 'in_progress',
        currentLesson: 0,
        learningPhase: 'brute',
      })
      onProgressUpdate()
      setBfLessonIdx(0)
      setPhase('problem-intro')
    } catch (e) {
      setErrorMsg(
        e.message === 'NO_API_KEY'
          ? 'No API key found. Add VITE_ANTHROPIC_API_KEY to your .env file and restart.'
          : 'Could not reach Claude. Check your API key and internet connection.'
      )
      setPhase('error')
    }
  }

  // ── Brute-force lesson handlers ──────────────────────────────

  async function handleBfLessonSubmit(code) {
    setPhase('bf-evaluating')
    try {
      const priorCode = bfCompletedSteps.slice(0, bfLessonIdx).map((s) => s.code).join('\n')
      const result = await evaluateCode(lessons.brute.lessons[bfLessonIdx], code, language, priorCode)
      setBfFeedback(result)
      if (result.correct) {
        addXP(XP_VALUES.LESSON)
        updateUnitProgress(unit.id, { currentLesson: bfLessonIdx + 1 })
        onProgressUpdate()
        setBfCompletedSteps((prev) => {
          const updated = [...prev]
          updated[bfLessonIdx] = { title: lessons.brute.lessons[bfLessonIdx].title, code }
          return updated
        })
      } else if (result.hint) {
        setUsedHints((n) => n + 1)
      }
    } catch {
      setBfFeedback({ correct: false, feedback: 'Could not evaluate. Try again.', hint: '' })
    }
    setPhase('bf-lesson')
  }

  function handleBfNextLesson() {
    setBfFeedback(null)
    const next = bfLessonIdx + 1
    if (next >= lessons.brute.lessons.length) {
      setPhase('bf-final')
    } else {
      setBfLessonIdx(next)
    }
  }

  function handleBfStepBack() {
    setBfFeedback(null)
    if (phase === 'bf-lesson' && bfLessonIdx > 0) {
      setBfLessonIdx(bfLessonIdx - 1)
    } else if (phase === 'bf-lesson' && bfLessonIdx === 0) {
      setPhase('bf-intro')
    } else {
      onBack()
    }
  }

  async function handleBfFinalSubmit() {
    setPhase('bf-finalEvaluating')
    try {
      const result = await evaluateBruteSolution(unit, bfFinalCode, language)
      setBfFinalFeedback(result)
      if (result.correct) {
        addXP(XP_VALUES.BF_SOLVE)
        updateUnitProgress(unit.id, {
          learningPhase: 'optimal',
          bfSolvedCode: bfFinalCode,
          optCurrentLesson: 0,
        })
        onProgressUpdate()
      }
    } catch {
      setBfFinalFeedback({ correct: false, feedback: 'Could not evaluate. Try again.' })
    }
    setPhase('bf-final')
  }

  function handleContinueToOptimal() {
    setBfFinalFeedback(null)
    setOptLessonIdx(0)
    setOptCompletedSteps([])
    setPhase('opt-intro')
  }

  // ── Optimal lesson handlers ──────────────────────────────────

  async function handleOptLessonSubmit(code) {
    setPhase('opt-evaluating')
    try {
      const priorCode = optCompletedSteps.slice(0, optLessonIdx).map((s) => s.code).join('\n')
      const result = await evaluateCode(lessons.optimal.lessons[optLessonIdx], code, language, priorCode)
      setOptFeedback(result)
      if (result.correct) {
        addXP(XP_VALUES.LESSON)
        updateUnitProgress(unit.id, { optCurrentLesson: optLessonIdx + 1 })
        onProgressUpdate()
        setOptCompletedSteps((prev) => {
          const updated = [...prev]
          updated[optLessonIdx] = { title: lessons.optimal.lessons[optLessonIdx].title, code }
          return updated
        })
      } else if (result.hint) {
        setUsedHints((n) => n + 1)
      }
    } catch {
      setOptFeedback({ correct: false, feedback: 'Could not evaluate. Try again.', hint: '' })
    }
    setPhase('opt-lesson')
  }

  function handleOptNextLesson() {
    setOptFeedback(null)
    const next = optLessonIdx + 1
    if (next >= lessons.optimal.lessons.length) {
      setOptFinalCode(starterCode)
      setPhase('opt-final')
    } else {
      setOptLessonIdx(next)
    }
  }

  function handleOptStepBack() {
    setOptFeedback(null)
    setOptFinalFeedback(null)
    if (phase === 'opt-final') {
      if (isRecall && !stuck) {
        onBack()
      } else if (lessons?.optimal?.lessons?.length > 0) {
        setOptLessonIdx(lessons.optimal.lessons.length - 1)
        setPhase('opt-lesson')
      } else {
        setPhase('opt-intro')
      }
    } else if (phase === 'opt-lesson' && optLessonIdx > 0) {
      setOptLessonIdx(optLessonIdx - 1)
    } else if (phase === 'opt-lesson' && optLessonIdx === 0) {
      setPhase('opt-intro')
    } else if (phase === 'opt-intro') {
      if (stuck) {
        setStuck(false)
        setPhase('opt-final')
      } else {
        setPhase('bf-final')
      }
    } else {
      onBack()
    }
  }

  async function handleGetStuck() {
    setUsedHints((n) => n + 1)
    setStuck(true)
    const saved = getUnitProgress(unit.id)
    const seedCode = saved.bfSolvedCode || starterCode
    setBfFinalCode(seedCode)

    const cached = getCachedLessons(unit.id, language)
    if (cached?.brute?.lessons && cached?.optimal?.lessons) {
      setLessons(cached)
      setOptLessonIdx(0)
      setOptCompletedSteps([])
      setPhase('opt-intro')
    } else {
      // Fallback: regenerate from scratch — lands on bf-intro for full walkthrough
      await loadLessons()
    }
  }

  async function handleOptFinalSubmit() {
    setPhase('opt-finalEvaluating')
    try {
      const result = await evaluateFullSolution(unit, optFinalCode, language)
      setOptFinalFeedback(result)
      if (result.correct) {
        const saved = getUnitProgress(unit.id)
        let xpGained, newInterval, newStatus

        if (isRecall) {
          xpGained = usedHints > 0 ? XP_VALUES.RECALL_HINTS : XP_VALUES.RECALL_CLEAN
          newInterval = getNextInterval(saved.interval || 1, usedHints > 0 ? 3 : 5)
          newStatus = newInterval >= 30 ? 'mastered' : 'planted'
        } else {
          xpGained = XP_VALUES.OPT_SOLVE
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
          optSolvedCode: optFinalCode,
        })
        addXP(xpGained)
        onProgressUpdate()

        const msg = isRecall
          ? usedHints > 0
            ? '💧 Recalled with hints — still growing!'
            : '💧 Clean recall — nice!'
          : '🌿 Problem planted!'

        setTimeout(() => onComplete(xpGained, msg), 400)
      } else {
        setPhase('opt-final')
      }
    } catch (e) {
      console.error('handleOptFinalSubmit error:', e)
      setOptFinalFeedback({ correct: false, feedback: 'Could not evaluate. Try again.' })
      setPhase('opt-final')
    }
  }

  // ── Progress bar ─────────────────────────────────────────────

  const bfLessons = lessons?.brute?.lessons || []
  const optLessons = lessons?.optimal?.lessons || []
  // Steps: bf-intro(1) + bf-lessons(N) + bf-final(1) + opt-intro(1) + opt-lessons(M) + opt-final(1)
  const totalSteps = lessons ? bfLessons.length + optLessons.length + 4 : 0

  const currentStep =
    phase === 'bf-intro' ? 1
    : phase === 'bf-lesson' || phase === 'bf-evaluating' ? 2 + bfLessonIdx
    : phase === 'bf-final' || phase === 'bf-finalEvaluating' ? bfLessons.length + 2
    : phase === 'opt-intro' ? bfLessons.length + 3
    : phase === 'opt-lesson' || phase === 'opt-evaluating' ? bfLessons.length + 4 + optLessonIdx
    : phase === 'opt-final' || phase === 'opt-finalEvaluating' ? totalSteps
    : 0

  const progressPct = totalSteps > 0 ? Math.round((currentStep / totalSteps) * 100) : 0

  const isBfFinalPhase = phase === 'bf-final' || phase === 'bf-finalEvaluating'
  const isOptFinalPhase = phase === 'opt-final' || phase === 'opt-finalEvaluating'
  const isFinalPhase = isBfFinalPhase || isOptFinalPhase

  const showProgressBar =
    !isRecall && lessons &&
    !isFinalPhase &&
    ['bf-intro', 'bf-lesson', 'bf-evaluating', 'opt-intro', 'opt-lesson', 'opt-evaluating'].includes(phase)

  const partLabel =
    isRecall ? '🔁 Recall'
    : phase === 'problem-intro' ? '📋 Problem'
    : isBfFinalPhase || ['bf-intro', 'bf-lesson', 'bf-evaluating'].includes(phase)
      ? '🔨 Part 1: Brute Force'
      : '🚀 Part 2: Optimize'

  return (
    <div>
      {/* ── Header (not shown in full-screen final phases) ── */}
      {!isFinalPhase && (
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBack}
            className="text-stone-400 hover:text-stone-600 transition-colors text-xl leading-none"
          >
            ←
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-stone-400 uppercase tracking-wide font-medium">
              {partLabel}
            </div>
            <h1 className="font-bold text-stone-800 text-lg leading-tight truncate">{unit.name}</h1>
          </div>
        </div>
      )}

      {/* ── Progress bar ── */}
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

      {/* ── Problem Intro ── */}
      {phase === 'problem-intro' && (
        <div className="animate-slide-up">
          <div className="bg-white border border-stone-200 rounded-2xl p-8 mb-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">📋</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                unit.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' :
                unit.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                unit.difficulty === 'Hard' ? 'bg-red-100 text-red-700' :
                'bg-stone-100 text-stone-500'
              }`}>{unit.difficulty || 'Problem'}</span>
            </div>
            <h2 className="text-xl font-bold text-stone-800 mb-3">{unit.name}</h2>
            {(unit.summary || lessons?.summary) && (
              <p className="text-stone-600 leading-relaxed mb-4">{unit.summary || lessons.summary}</p>
            )}
            {(unit.description || lessons?.description) && (
              <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-wrap mb-6">{unit.description || lessons.description}</p>
            )}

            {unit.testCases && unit.testCases.length > 0 && (
              <div className="space-y-3">
                {unit.testCases.map((tc, i) => (
                  <div key={i}>
                    <div className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">Example {i + 1}</div>
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
          </div>
          <button
            onClick={() => setPhase('bf-intro')}
            className="w-full bg-stone-800 hover:bg-stone-900 text-white font-bold py-4 rounded-xl text-lg transition-colors"
          >
            Start solving →
          </button>
        </div>
      )}

      {/* ── Part 1 Intro ── */}
      {phase === 'bf-intro' && (
        <div className="animate-slide-up">
          <div className="bg-white border border-stone-200 rounded-2xl p-8 mb-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🔨</span>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Part 1 of 2</span>
            </div>
            <h2 className="text-xl font-bold text-stone-800 mb-3">Brute Force First</h2>
            <p className="text-stone-600 leading-relaxed mb-6">{lessons.brute.intro}</p>

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
            onClick={() => setPhase('bf-lesson')}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-xl text-lg transition-colors"
          >
            Start Part 1 →
          </button>
        </div>
      )}

      {/* ── Part 1 Lessons ── */}
      {(phase === 'bf-lesson' || phase === 'bf-evaluating') && lessons && (
        <LessonStep
          key={`bf-${bfLessonIdx}`}
          lesson={lessons.brute.lessons[bfLessonIdx]}
          lessonIndex={bfLessonIdx}
          totalLessons={lessons.brute.lessons.length}
          completedSteps={bfCompletedSteps.slice(0, bfLessonIdx)}
          initialCode={bfCompletedSteps[bfLessonIdx]?.code ?? (bfLessonIdx === 0 ? starterCode : '')}
          alreadyCompleted={bfLessonIdx < bfCompletedSteps.length}
          onSubmit={handleBfLessonSubmit}
          isEvaluating={phase === 'bf-evaluating'}
          feedback={bfFeedback}
          onNext={handleBfNextLesson}
          onPrev={handleBfStepBack}
          contextCode={bfLessonIdx === 0 ? undefined : starterCode}
          language={language}
        />
      )}

      {/* ── Part 2 Intro ── */}
      {phase === 'opt-intro' && (
        <div className="animate-slide-up">
          <div className="bg-white border border-stone-200 rounded-2xl p-8 mb-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🚀</span>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Part 2 of 2</span>
            </div>
            <h2 className="text-xl font-bold text-stone-800 mb-3">Now Let's Optimize</h2>
            <p className="text-stone-600 leading-relaxed">{lessons.optimal.intro}</p>
          </div>
          <button
            onClick={() => setPhase('opt-lesson')}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl text-lg transition-colors"
          >
            Start Part 2 →
          </button>
        </div>
      )}

      {/* ── Part 2 Lessons ── */}
      {(phase === 'opt-lesson' || phase === 'opt-evaluating') && lessons && (
        <LessonStep
          key={`opt-${optLessonIdx}`}
          lesson={lessons.optimal.lessons[optLessonIdx]}
          lessonIndex={optLessonIdx}
          totalLessons={lessons.optimal.lessons.length}
          completedSteps={optCompletedSteps.slice(0, optLessonIdx)}
          initialCode={optCompletedSteps[optLessonIdx]?.code ?? (optLessonIdx === 0 ? bfFinalCode : '')}
          alreadyCompleted={optLessonIdx < optCompletedSteps.length}
          onSubmit={handleOptLessonSubmit}
          isEvaluating={phase === 'opt-evaluating'}
          feedback={optFeedback}
          onNext={handleOptNextLesson}
          onPrev={handleOptStepBack}
          referenceCode={bfFinalCode}
          contextCode={optLessonIdx === 0 ? undefined : starterCode}
          language={language}
        />
      )}

      {/* ── Part 1 Final Editor (full-screen) ── */}
      {isBfFinalPhase && (
        <div className="fixed top-14 inset-x-0 bottom-0 bg-stone-50 z-30 flex flex-col animate-fade-in">
          <div className="flex-1 flex overflow-hidden">
            {/* Left: problem statement */}
            <ProblemStatement
              unit={unit}
              lessons={lessons}
              phaseLabel={{ text: '🔨 Brute Force', className: 'bg-amber-50 text-amber-700 border border-amber-200' }}
              showBruteForceTip
            />

            {/* Right: editor + submit */}
            <div className="w-1/2 flex flex-col overflow-hidden bg-stone-50">
              <div className="flex-1 overflow-auto p-4">
                <CodeEditor value={bfFinalCode} onChange={setBfFinalCode} minHeight="100%" language={language} />
              </div>

              {bfFinalFeedback && (
                <div className={`mx-4 mb-3 rounded-xl p-3 animate-fade-in text-sm ${
                  bfFinalFeedback.correct
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  <div className="flex items-start gap-2">
                    <span>{bfFinalFeedback.correct ? '✓' : '✗'}</span>
                    <div className="flex-1">
                      <p>{bfFinalFeedback.feedback}</p>
                      {bfFinalFeedback.correct && (
                        <div className="flex gap-4 mt-1.5 text-xs text-stone-400">
                          <span>⏱ {bfFinalFeedback.timeComplexity}</span>
                          <span>💾 {bfFinalFeedback.spaceComplexity}</span>
                        </div>
                      )}
                      {!bfFinalFeedback.correct && bfFinalFeedback.hint && (
                        <p className="text-xs text-stone-500 mt-1 italic">{bfFinalFeedback.hint}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="px-4 pb-4 shrink-0">
                {bfFinalFeedback?.correct ? (
                  <button
                    onClick={handleContinueToOptimal}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                  >
                    Continue to Part 2: Optimize it 🚀
                  </button>
                ) : (
                  <button
                    onClick={handleBfFinalSubmit}
                    disabled={phase === 'bf-finalEvaluating' || !bfFinalCode.trim()}
                    className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                  >
                    {phase === 'bf-finalEvaluating' ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="inline-block animate-spin">⟳</span> Evaluating…
                      </span>
                    ) : (
                      'Submit brute force →'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Part 2 Final Editor (full-screen) ── */}
      {isOptFinalPhase && (
        <div className="fixed top-14 inset-x-0 bottom-0 bg-stone-50 z-30 flex flex-col animate-fade-in">
          <div className="flex-1 flex overflow-hidden">
            {/* Left: problem statement */}
            <ProblemStatement
              unit={unit}
              lessons={lessons}
              phaseLabel={
                isRecall && !stuck
                  ? { text: '🔁 Recall', className: 'bg-amber-50 text-amber-700 border border-amber-200' }
                  : { text: '🚀 Optimal', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' }
              }
              isRecall={isRecall}
              stuck={stuck}
              onGetStuck={handleGetStuck}
            />

            {/* Right: editor + submit */}
            <div className="w-1/2 flex flex-col overflow-hidden bg-stone-50">
              <div className="flex-1 overflow-auto p-4">
                <CodeEditor value={optFinalCode} onChange={setOptFinalCode} minHeight="100%" language={language} />
              </div>

              {optFinalFeedback && (
                <div className={`mx-4 mb-3 rounded-xl p-3 animate-fade-in text-sm ${
                  optFinalFeedback.correct
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  <div className="flex items-start gap-2">
                    <span>{optFinalFeedback.correct ? '✓' : '✗'}</span>
                    <div className="flex-1">
                      <p>{optFinalFeedback.feedback}</p>
                      {optFinalFeedback.correct && (
                        <div className="flex gap-4 mt-1.5 text-xs text-stone-400">
                          <span>⏱ {optFinalFeedback.timeComplexity}</span>
                          <span>💾 {optFinalFeedback.spaceComplexity}</span>
                        </div>
                      )}
                      {!optFinalFeedback.correct && optFinalFeedback.hint && (
                        <p className="text-xs text-stone-500 mt-1 italic">{optFinalFeedback.hint}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="px-4 pb-4 shrink-0">
                <button
                  onClick={handleOptFinalSubmit}
                  disabled={phase === 'opt-finalEvaluating' || !optFinalCode.trim()}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  {phase === 'opt-finalEvaluating' ? (
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
