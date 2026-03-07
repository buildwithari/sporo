import { useEffect, useState } from 'react'

const EMOJIS = ['🌱', '🌿', '🍀', '🌸', '✨', '💧', '⭐']

function FloatingEmoji({ emoji, style }) {
  return (
    <span
      className="absolute text-3xl pointer-events-none animate-bounce-once"
      style={style}
    >
      {emoji}
    </span>
  )
}

export default function Celebration({ xp, message, onClose }) {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    const items = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      emoji: EMOJIS[i % EMOJIS.length],
      style: {
        left: `${10 + Math.random() * 80}%`,
        top: `${10 + Math.random() * 60}%`,
        animationDelay: `${i * 0.08}s`,
      },
    }))
    setParticles(items)
  }, [])

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl p-10 text-center shadow-2xl max-w-sm w-full mx-4 animate-pop-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {particles.map((p) => (
          <FloatingEmoji key={p.id} emoji={p.emoji} style={p.style} />
        ))}

        <div className="relative z-10">
          <div className="text-6xl mb-4">🌱</div>
          <h2 className="text-2xl font-bold text-stone-800 mb-2">
            {message || 'Nice work!'}
          </h2>
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-3xl font-bold text-emerald-600">+{xp}</span>
            <span className="text-xl text-stone-500">XP</span>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            Keep going →
          </button>
        </div>
      </div>
    </div>
  )
}
