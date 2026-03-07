import { useState, useEffect } from 'react'
import CodeEditor from '../CodeEditor/CodeEditor'
import { getHint } from '../../lib/claude'

export default function LessonStep({
  lesson,
  lessonIndex,
  totalLessons,
  completedSteps,
  onSubmit,
  isEvaluating,
  feedback,
  onNext,
  onPrev,
}) {
  const [code, setCode] = useState('')
  const [hint, setHint] = useState(null)
  const [loadingHint, setLoadingHint] = useState(false)

  // Auto-advance 1.5s after a correct answer
  useEffect(() => {
    if (!feedback?.correct) return
    const timer = setTimeout(() => onNext(), 1500)
    return () => clearTimeout(timer)
  }, [feedback?.correct])

  const handleGetHint = async () => {
    setLoadingHint(true)
    try {
      const h = await getHint(lesson, code)
      setHint(h)
    } catch {
      setHint('Think about what data structure gives you O(1) lookups.')
    }
    setLoadingHint(false)
  }

  const isEmpty = !code.trim()

  return (
    // Extra bottom padding so the fixed success/error bar doesn't cover content
    <div className="animate-slide-up pb-28">
      {/* Code so far — all previous steps stacked */}
      {completedSteps.length > 0 && (
        <div className="mb-5 space-y-2">
          <div className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">
            Code so far
          </div>
          {completedSteps.map((step, i) => (
            <div key={i} className="rounded-xl overflow-hidden border border-emerald-200">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border-b border-emerald-200">
                <span className="text-emerald-600 text-xs">✓</span>
                <span className="text-xs font-medium text-emerald-700">{step.title}</span>
              </div>
              <CodeEditor value={step.code} readOnly minHeight="0px" />
            </div>
          ))}
        </div>
      )}

      {/* Current lesson */}
      <div className="mb-5">
        <h2 className="text-xl font-bold text-stone-800 mb-2">{lesson.title}</h2>
        <p className="text-stone-600 leading-relaxed">{lesson.explanation}</p>
      </div>

      {/* Task */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
        <div className="flex items-start gap-2">
          <span className="text-emerald-600 mt-0.5 shrink-0">✏️</span>
          <div>
            <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">
              Your task
            </div>
            <p className="text-emerald-900 text-sm">{lesson.task}</p>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="mb-4">
        <CodeEditor value={code} onChange={setCode} minHeight="100px" />
      </div>

      {/* Hint */}
      {hint && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 animate-fade-in">
          <div className="flex items-start gap-2">
            <span className="text-amber-500 shrink-0">💡</span>
            <p className="text-amber-900 text-sm">{hint}</p>
          </div>
        </div>
      )}

      {/* Action row */}
      <div className="flex items-center gap-3">
        {/* Previous — always available */}
        <button
          onClick={onPrev}
          disabled={isEvaluating}
          className="text-stone-400 hover:text-stone-600 text-sm font-medium px-3 py-3 rounded-xl hover:bg-stone-100 transition-colors disabled:opacity-40"
        >
          ← Prev
        </button>

        {feedback?.correct ? (
          <button
            onClick={onNext}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            {lessonIndex + 1 === totalLessons ? 'Finish ✓' : 'Next →'}
          </button>
        ) : (
          <>
            <button
              onClick={() => onSubmit(code)}
              disabled={isEvaluating || isEmpty}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              {isEvaluating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block animate-spin">⟳</span> Checking…
                </span>
              ) : (
                'Check →'
              )}
            </button>
            {!hint && (
              <button
                onClick={handleGetHint}
                disabled={loadingHint || isEvaluating}
                className="text-stone-400 hover:text-stone-600 text-sm font-medium px-3 py-3 rounded-xl hover:bg-stone-100 transition-colors disabled:opacity-40"
              >
                {loadingHint ? '…' : '💡 Hint'}
              </button>
            )}
          </>
        )}
      </div>

      {/* ── Fixed bottom bar ── */}
      {feedback && (
        <div
          className={`fixed bottom-0 left-0 right-0 py-5 px-6 animate-slide-up ${
            feedback.correct ? 'bg-emerald-500' : 'bg-red-500'
          }`}
        >
          <div className="max-w-2xl mx-auto flex items-center gap-4">
            <div className="text-3xl">
              {feedback.correct ? '✓' : '✗'}
            </div>
            <div className="flex-1 min-w-0">
              <div className={`font-bold text-lg ${feedback.correct ? 'text-white' : 'text-white'}`}>
                {feedback.correct
                  ? lessonIndex + 1 === totalLessons
                    ? 'Amazing! Time to put it all together.'
                    : 'Correct!'
                  : 'Not quite'}
              </div>
              {(!feedback.correct) && (
                <p className="text-red-100 text-sm mt-0.5 truncate">{feedback.hint || feedback.feedback}</p>
              )}
            </div>
            {feedback.correct && (
              <div className="text-white font-bold text-sm opacity-75">
                +10 XP
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
