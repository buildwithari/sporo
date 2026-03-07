import { useState } from 'react'
import { plants, RARITY } from '../../data/plants'
import { purchasePlant } from '../../lib/progress'

function PlantCard({ plant, owned, canAfford, onBuy }) {
  const rarity = RARITY[plant.rarity]
  const [confirming, setConfirming] = useState(false)

  function handleBuy() {
    if (owned || !canAfford) return
    if (!confirming) { setConfirming(true); return }
    onBuy(plant)
    setConfirming(false)
  }

  return (
    <div
      className={`rounded-2xl border p-4 flex flex-col gap-2 transition-all ${
        owned
          ? `${rarity.bgColor} ${rarity.borderColor}`
          : canAfford
          ? 'bg-white border-stone-200 hover:border-stone-300 hover:shadow-sm'
          : 'bg-stone-50 border-stone-100 opacity-60'
      }`}
    >
      <div className="text-3xl text-center">{plant.emoji}</div>
      <div className="text-center">
        <p className="font-semibold text-stone-800 text-sm">{plant.name}</p>
        <p className="text-xs text-stone-400 mt-0.5 leading-snug">{plant.description}</p>
      </div>
      <div className="flex items-center justify-between mt-auto pt-1">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${rarity.bgColor} ${rarity.textColor}`}>
          {rarity.label}
        </span>
        {owned ? (
          <span className="text-xs text-stone-400 font-medium">Owned ✓</span>
        ) : confirming ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleBuy}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-800"
            >
              Confirm
            </button>
            <span className="text-stone-300 text-xs">·</span>
            <button
              onClick={() => setConfirming(false)}
              className="text-xs text-stone-400 hover:text-stone-600"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={handleBuy}
            disabled={!canAfford}
            className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
              canAfford
                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                : 'text-stone-300 cursor-not-allowed'
            }`}
          >
            <span>⚡</span>
            <span>{plant.cost}</span>
          </button>
        )}
      </div>
    </div>
  )
}

function ForestDisplay({ ownedPlants }) {
  if (ownedPlants.length === 0) {
    return (
      <div className="text-center py-16 text-stone-400">
        <div className="text-5xl mb-3">🌾</div>
        <p className="text-sm">Your forest is empty.</p>
        <p className="text-xs mt-1">Spend XP in the shop to plant something.</p>
      </div>
    )
  }

  return (
    <div className="min-h-32 rounded-3xl bg-gradient-to-b from-sky-50 to-emerald-50 border border-emerald-100 p-6">
      <div className="flex flex-wrap gap-3 justify-center">
        {ownedPlants.map((plant) => (
          <div key={plant.id} className="flex flex-col items-center gap-1 group">
            <div className="text-4xl transition-transform group-hover:scale-110">{plant.emoji}</div>
            <span className="text-xs text-stone-400">{plant.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const RARITY_ORDER = ['common', 'uncommon', 'rare', 'legendary']

export default function ForestPage({ progress, onProgressUpdate }) {
  const totalXP = progress.user?.totalXP || 0
  const ownedIds = new Set(progress.user?.forest || [])
  const ownedPlants = plants.filter((p) => ownedIds.has(p.id))

  const [activeRarity, setActiveRarity] = useState('all')
  const [toast, setToast] = useState(null)

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  function handleBuy(plant) {
    const result = purchasePlant(plant.id, plant.cost)
    if (result.success) {
      onProgressUpdate()
      showToast(`${plant.emoji} ${plant.name} added to your forest!`)
    } else if (result.reason === 'not_enough_xp') {
      showToast('Not enough XP.')
    }
  }

  const shopPlants = plants.filter((p) => {
    if (activeRarity !== 'all' && p.rarity !== activeRarity) return false
    return true
  })

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🌲</div>
        <h1 className="text-2xl font-bold text-stone-800 mb-1">Your Forest</h1>
        <p className="text-stone-400 text-sm">
          {ownedPlants.length === 0
            ? 'Nothing planted yet'
            : `${ownedPlants.length} plant${ownedPlants.length !== 1 ? 's' : ''} growing`}
        </p>
      </div>

      {/* Forest display */}
      <div className="mb-10">
        <ForestDisplay ownedPlants={ownedPlants} />
      </div>

      {/* Shop */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-stone-800 text-lg">Shop</h2>
          <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg text-sm font-bold text-emerald-700">
            <span>⚡</span>
            <span>{totalXP} XP</span>
          </div>
        </div>

        {/* Rarity filter */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {['all', ...RARITY_ORDER].map((r) => (
            <button
              key={r}
              onClick={() => setActiveRarity(r)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize ${
                activeRarity === r
                  ? 'bg-stone-800 text-white'
                  : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
              }`}
            >
              {r === 'all' ? 'All' : RARITY[r].label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {shopPlants.map((plant) => (
            <PlantCard
              key={plant.id}
              plant={plant}
              owned={ownedIds.has(plant.id)}
              canAfford={totalXP >= plant.cost}
              onBuy={handleBuy}
            />
          ))}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-sm px-5 py-2.5 rounded-full shadow-lg z-50 animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  )
}
