import { useState, useEffect } from 'react'
import LessonEditor from '../CodeEditor/LessonEditor'
import { getHint } from '../../lib/claude'

function ReferencePanel({ code }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mb-4 border border-stone-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 bg-stone-50 hover:bg-stone-100 transition-colors text-sm"
      >
        <span className="font-medium text-stone-600">Your brute force</span>
        <span className="text-stone-400 text-xs">{open ? '▲ hide' : '▼ show'}</span>
      </button>
      {open && (
        <pre className="bg-stone-900 text-stone-300 text-xs font-mono px-4 py-3 overflow-y-auto max-h-52 leading-5 border-t border-stone-700">
          {code}
        </pre>
      )}
    </div>
  )
}

export default function LessonStep({
  lesson,
  lessonIndex,
  totalLessons,
  initialCode,
  alreadyCompleted,
  onSubmit,
  isEvaluating,
  feedback,
  onNext,
  onPrev,
  referenceCode,  // optional: brute force solution shown as a collapsible reference panel
  language,       // language ID for editor syntax + comment prefix
}) {
  const [code, setCode] = useState(initialCode || '')
  const [hints, setHints] = useState([])   // accumulated hints in order
  const [loadingHint, setLoadingHint] = useState(false)

  // Auto-advance 1.5s after a correct answer
  useEffect(() => {
    if (!feedback?.correct) return
    const timer = setTimeout(() => onNext(code), 1500)
    return () => clearTimeout(timer)
  }, [feedback?.correct])

  const handleGetHint = async () => {
    setLoadingHint(true)
    try {
      const hintLevel = hints.length + 1
      const h = await getHint(lesson, code, language, hintLevel)
      setHints((prev) => [...prev, { level: hintLevel, text: h }])
    } catch {
      setHints((prev) => [...prev, { level: prev.length + 1, text: 'Look at the step description again — what specific value or structure does it ask you to write?' }])
    }
    setLoadingHint(false)
  }

  const isEmpty = !code.trim()
  const isModified = alreadyCompleted && code !== (initialCode || '') && !feedback?.correct

  return (
    // Extra bottom padding so the fixed success/error bar doesn't cover content
    <div className="animate-slide-up pb-28">
      {/* Current lesson */}
      <div className="mb-5">
        <h2 className="text-xl font-bold text-stone-800 mb-2">{lesson.title}</h2>
        <p className="text-stone-600 leading-relaxed">{lesson.explanation}</p>
      </div>

      {/* Brute force reference — collapsible, for the optimization phase */}
      {referenceCode && <ReferencePanel code={referenceCode} />}

      {/* Editor */}
      <div className="mb-4">
        <LessonEditor
          value={code}
          onChange={setCode}
          commentLine={lesson.title}
          language={language}
        />
      </div>

      {/* Hints — progressive, all shown stacked */}
      {hints.length > 0 && (
        <div className="space-y-2 mb-4">
          {hints.map((h) => (
            <div key={h.level} className={`border rounded-xl p-4 animate-fade-in ${
              h.level === 3
                ? 'bg-stone-900 border-stone-700'
                : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-start gap-2">
                <span className="shrink-0 text-sm">{h.level === 1 ? '💡' : h.level === 2 ? '🔍' : '✏️'}</span>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-semibold mb-1 ${h.level === 3 ? 'text-stone-400' : 'text-amber-600'}`}>
                    {h.level === 1 ? 'Hint' : h.level === 2 ? 'More detail' : 'Solution'}
                  </div>
                  {h.level === 3
                    ? <pre className="text-stone-300 text-xs font-mono leading-5 whitespace-pre-wrap">{h.text}</pre>
                    : <p className="text-amber-900 text-sm">{h.text}</p>
                  }
                </div>
              </div>
            </div>
          ))}
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

        {(feedback?.correct || (alreadyCompleted && !isModified)) ? (
          <button
            onClick={() => onNext(code)}
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
            {hints.length < 3 && (
              <button
                onClick={handleGetHint}
                disabled={loadingHint || isEvaluating}
                className="text-stone-400 hover:text-stone-600 text-sm font-medium px-3 py-3 rounded-xl hover:bg-stone-100 transition-colors disabled:opacity-40"
              >
                {loadingHint ? '…' : hints.length === 0 ? '💡 Hint' : hints.length === 1 ? '🔍 More' : '✏️ Show answer'}
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
                <p className="text-red-100 text-sm mt-0.5">{feedback.hint || feedback.feedback}</p>
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
