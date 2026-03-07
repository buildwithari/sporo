import { useState, useEffect, useRef } from 'react'
import { askAssistant } from '../../lib/claude'
import { getMilestoneGuide } from '../../data/milestoneGuides'

const ACCENT_COLORS = {
  'arrays-hashing':      'text-emerald-600',
  'two-pointers':        'text-blue-600',
  'sliding-window':      'text-violet-600',
  'stack':               'text-orange-600',
  'binary-search':       'text-teal-600',
  'linked-list':         'text-cyan-600',
  'trees':               'text-lime-600',
  'graphs':              'text-rose-600',
  'dynamic-programming': 'text-purple-600',
}
const ACCENT_BG = {
  'arrays-hashing':      'bg-emerald-600',
  'two-pointers':        'bg-blue-600',
  'sliding-window':      'bg-violet-600',
  'stack':               'bg-orange-600',
  'binary-search':       'bg-teal-600',
  'linked-list':         'bg-cyan-600',
  'trees':               'bg-lime-600',
  'graphs':              'bg-rose-600',
  'dynamic-programming': 'bg-purple-600',
}

function CodeBlock({ code }) {
  if (!code) return null
  return (
    <pre className="bg-stone-950 text-stone-300 rounded-lg px-5 py-4 text-xs font-mono overflow-x-auto mt-4 leading-6 tracking-wide">
      {code}
    </pre>
  )
}

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div
        className={`max-w-[88%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
          isUser
            ? 'bg-stone-800 text-white'
            : 'bg-stone-100 text-stone-700'
        }`}
      >
        {msg.content}
      </div>
    </div>
  )
}

export default function MilestonePage({ milestone, onBack }) {
  const accentText = ACCENT_COLORS[milestone.id] ?? 'text-stone-600'
  const accentBg   = ACCENT_BG[milestone.id]   ?? 'bg-stone-600'
  const article = getMilestoneGuide(milestone.id)

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Ask me anything about ${milestone.name} — concepts, examples, Java syntax, anything.`,
    },
  ])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [chatError, setChatError] = useState(null)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  async function handleSend() {
    const text = input.trim()
    if (!text || thinking) return
    setChatError(null)
    const userMsg = { role: 'user', content: text }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setThinking(true)
    try {
      const reply = await askAssistant(milestone.name, updated)
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch (e) {
      if (e.message === 'NO_API_KEY') setChatError('No API key set.')
      else setMessages((prev) => [...prev, { role: 'assistant', content: "Couldn't respond. Try again." }])
    }
    setThinking(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div className="animate-fade-in">
      {/* Back */}
      <button
        onClick={onBack}
        className="text-stone-400 hover:text-stone-600 transition-colors text-sm mb-10 flex items-center gap-1.5"
      >
        ← Back
      </button>

      <div className="flex gap-12 items-start">

        {/* ── Article ── */}
        <article className="flex-1 min-w-0 pb-24">

          {/* Title */}
          <div className="mb-12">
            <div className={`text-xs font-semibold uppercase tracking-widest mb-3 ${accentText}`}>
              Concept Guide
            </div>
            <h1 className="text-4xl font-bold text-stone-900 leading-tight mb-6">
              {milestone.emoji} {milestone.name}
            </h1>
            {article && (
              <p className="text-lg text-stone-500 leading-relaxed max-w-prose">
                {article.intro}
              </p>
            )}
          </div>

          {/* Sections */}
          {article?.sections?.map((section, i) => (
            <section key={i} className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-xs font-bold ${accentText} tabular-nums`}>
                  0{i + 1}
                </span>
                <div className="flex-1 h-px bg-stone-200" />
              </div>
              <h2 className="text-xl font-semibold text-stone-800 mb-3">{section.title}</h2>
              <p className="text-stone-500 leading-relaxed text-base">{section.content}</p>
              <CodeBlock code={section.codeExample} />
            </section>
          ))}

          {/* Key insights */}
          {article?.keyInsights?.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <span className={`text-xs font-bold ${accentText}`}>✦</span>
                <div className="flex-1 h-px bg-stone-200" />
              </div>
              <h2 className="text-xl font-semibold text-stone-800 mb-5">Key insights</h2>
              <ul className="space-y-4">
                {article.keyInsights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${accentBg}`} />
                    <p className="text-stone-600 leading-relaxed">{insight}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>

        {/* ── Sidebar chat ── */}
        <aside className="w-72 shrink-0 sticky top-20">
          <div className="mb-3">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Assistant</p>
          </div>

          <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white">
            {/* Messages */}
            <div className="p-4 space-y-3 overflow-y-auto" style={{ height: '380px' }}>
              {messages.map((msg, i) => <Message key={i} msg={msg} />)}
              {thinking && (
                <div className="flex justify-start animate-fade-in">
                  <div className="bg-stone-100 rounded-xl px-3 py-2.5 flex gap-1">
                    {[0, 150, 300].map((d) => (
                      <span
                        key={d}
                        className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${d}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}
              {chatError && <p className="text-red-400 text-xs text-center">{chatError}</p>}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-stone-100 p-3 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question…"
                disabled={thinking}
                className="flex-1 text-sm bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100 disabled:opacity-50 transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || thinking}
                className="bg-stone-800 hover:bg-stone-900 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-medium px-3 py-2 rounded-xl transition-colors"
              >
                ↑
              </button>
            </div>
          </div>
        </aside>

      </div>
    </div>
  )
}
