import { useState, useEffect } from 'react'
import { plants, RARITY } from '../../data/plants'
import { purchasePlant, checkAndResetForest } from '../../lib/progress'
import { getPlant } from '../../data/plants'

const RARITY_ORDER = ['common', 'uncommon', 'rare', 'legendary']

// Size per rarity for the scenic display
const RARITY_SIZES = {
  common: 'text-3xl',
  uncommon: 'text-4xl',
  rare: 'text-5xl',
  legendary: 'text-6xl',
}
// Deterministic vertical stagger so items sit at natural heights
const Y_OFFSETS = [0, 28, 10, 40, 4, 34, 16, 46, 6, 36, 20, 44, 2, 30, 12, 38]

function getMondayOf(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function daysUntilNextMonday(forestWeekStart) {
  if (!forestWeekStart) return 7
  const nextMonday = getMondayOf(new Date(forestWeekStart))
  nextMonday.setDate(nextMonday.getDate() + 7)
  const ms = nextMonday - Date.now()
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)))
}

function formatWeekLabel(isoDate) {
  if (!isoDate) return 'Unknown week'
  const monday = getMondayOf(new Date(isoDate))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const fmt = (d) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  return `${fmt(monday)} – ${fmt(sunday)}`
}

function ForestScene({ ownedPlantIds, compact = false }) {
  const ownedItems = ownedPlantIds.map((id) => getPlant(id)).filter(Boolean)

  if (ownedItems.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-stone-200 py-14 text-center">
        <div className="text-5xl mb-3 opacity-30">🌾</div>
        <p className="text-sm text-stone-400">Your forest is empty this week.</p>
        <p className="text-xs text-stone-300 mt-1">Visit the Shop tab to spend XP.</p>
      </div>
    )
  }

  return (
    <div className="rounded-3xl overflow-hidden border border-sky-200 shadow-md">
      {/* Sky */}
      <div className={`relative ${compact ? 'h-16' : 'h-36'} bg-gradient-to-b from-sky-400 via-sky-300 to-sky-100 overflow-hidden`}>
        <span className="absolute top-3 left-8 text-4xl opacity-20 select-none">☁️</span>
        <span className="absolute top-8 left-1/4 text-2xl opacity-15 select-none">☁️</span>
        <span className="absolute top-4 right-20 text-5xl opacity-15 select-none">☁️</span>
        <span className="absolute top-2 right-1/3 text-3xl opacity-20 select-none">☁️</span>
        {!compact && (
          <span className="absolute top-3 right-8 text-4xl opacity-25 select-none">🌤️</span>
        )}
      </div>

      {/* Tree canopy layer — rare & legendary flora only */}
      {ownedItems.some((i) => i.type === 'flora' && (i.rarity === 'rare' || i.rarity === 'legendary')) && (
        <div className="bg-gradient-to-b from-sky-100 to-emerald-100 px-10 pt-4 pb-0 flex flex-wrap gap-x-8 gap-y-0 justify-around items-end min-h-[80px]">
          {ownedItems
            .filter((i) => i.type === 'flora' && (i.rarity === 'rare' || i.rarity === 'legendary'))
            .map((item, i) => (
              <div
                key={item.id}
                className="flex flex-col items-center group cursor-default"
                style={{ marginBottom: `${Y_OFFSETS[i % Y_OFFSETS.length] / 2}px` }}
              >
                <span
                  className={`${RARITY_SIZES[item.rarity]} leading-none transition-transform duration-200 group-hover:scale-125 group-hover:-translate-y-1 select-none`}
                >
                  {item.emoji}
                </span>
                <span className="text-[10px] text-emerald-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {item.name}
                </span>
              </div>
            ))}
        </div>
      )}

      {/* Ground — everything else */}
      <div className="bg-gradient-to-b from-emerald-100 to-emerald-200 px-10 pt-6 pb-8">
        <div className="flex flex-wrap gap-x-6 gap-y-0 justify-around items-end min-h-[160px]">
          {ownedItems
            .filter((i) => !(i.type === 'flora' && (i.rarity === 'rare' || i.rarity === 'legendary')))
            .map((item, i) => (
              <div
                key={item.id}
                className="flex flex-col items-center group cursor-default"
                style={{ marginBottom: `${Y_OFFSETS[i % Y_OFFSETS.length]}px` }}
              >
                <span
                  className={`${RARITY_SIZES[item.rarity]} leading-none transition-transform duration-200 group-hover:scale-125 group-hover:-translate-y-1 select-none`}
                >
                  {item.emoji}
                </span>
                <span className="text-[10px] text-emerald-700 font-medium mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {item.name}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Soil */}
      <div className="h-3 bg-gradient-to-b from-amber-700 to-amber-900 opacity-50" />
    </div>
  )
}

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
            <button onClick={handleBuy} className="text-xs font-bold text-emerald-600 hover:text-emerald-800">
              Confirm
            </button>
            <span className="text-stone-300 text-xs">·</span>
            <button onClick={() => setConfirming(false)} className="text-xs text-stone-400 hover:text-stone-600">
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
            <span>{plant.cost.toLocaleString()}</span>
          </button>
        )}
      </div>
    </div>
  )
}

function ShopSection({ title, items, ownedIds, totalXP, onBuy }) {
  if (items.length === 0) return null
  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((plant) => (
          <PlantCard
            key={plant.id}
            plant={plant}
            owned={ownedIds.has(plant.id)}
            canAfford={totalXP >= plant.cost}
            onBuy={onBuy}
          />
        ))}
      </div>
    </div>
  )
}

export default function ForestPage({ progress, onProgressUpdate }) {
  const [page, setPage] = useState('forest') // 'forest' | 'shop'
  const [shopTab, setShopTab] = useState('flora') // 'flora' | 'fauna'
  const [showHistory, setShowHistory] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    const { didReset } = checkAndResetForest()
    if (didReset) onProgressUpdate()
  }, [])

  const totalXP = progress.user?.totalXP || 0
  const ownedIds = new Set(progress.user?.forest || [])
  const forestHistory = progress.user?.forestHistory || []
  const forestWeekStart = progress.user?.forestWeekStart || null
  const daysLeft = daysUntilNextMonday(forestWeekStart)

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

  const shopPlants = plants.filter((p) => p.type === shopTab)

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">🌲</div>
        <h1 className="text-2xl font-bold text-stone-800 mb-1">Your Forest</h1>
        <p className="text-stone-400 text-sm">
          {ownedIds.size === 0
            ? 'Nothing planted yet this week'
            : `${ownedIds.size} item${ownedIds.size !== 1 ? 's' : ''} growing`}
        </p>
        <p className="text-xs text-stone-300 mt-1">
          Resets in {daysLeft} day{daysLeft !== 1 ? 's' : ''} · every Monday
        </p>
      </div>

      {/* Forest / Shop page tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'forest', label: '🌳 Forest' },
          { key: 'shop',   label: '🛍️ Shop' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setPage(key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              page === key
                ? 'bg-stone-800 text-white'
                : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Forest page ── */}
      {page === 'forest' && (
        <div>
          <ForestScene ownedPlantIds={[...ownedIds]} />

          {/* History */}
          {forestHistory.length > 0 && (
            <div className="mt-6">
              <button
                onClick={() => setShowHistory((v) => !v)}
                className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-1 mx-auto"
              >
                <span>{showHistory ? '▲' : '▼'}</span>
                <span>
                  {showHistory ? 'Hide' : 'Past forests'} ({forestHistory.length} week{forestHistory.length !== 1 ? 's' : ''})
                </span>
              </button>

              {showHistory && (
                <div className="mt-5 flex flex-col gap-6">
                  {forestHistory.map((entry, i) => (
                    <div key={i}>
                      <p className="text-xs font-semibold text-stone-500 mb-2">
                        {formatWeekLabel(entry.weekStart)}
                      </p>
                      <ForestScene ownedPlantIds={entry.plants} compact />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Shop page ── */}
      {page === 'shop' && (
        <div>
          {/* XP balance */}
          <div className="flex items-center justify-end mb-5">
            <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg text-sm font-bold text-emerald-700">
              <span>⚡</span>
              <span>{totalXP.toLocaleString()} XP</span>
            </div>
          </div>

          {/* Flora / Fauna tabs */}
          <div className="flex gap-2 mb-6">
            {[
              { key: 'flora', label: '🌿 Flora' },
              { key: 'fauna', label: '🐾 Fauna' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setShopTab(key)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  shopTab === key
                    ? 'bg-stone-800 text-white'
                    : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Rarity subsections */}
          {RARITY_ORDER.map((rarity) => (
            <ShopSection
              key={rarity}
              title={RARITY[rarity].label}
              items={shopPlants.filter((p) => p.rarity === rarity)}
              ownedIds={ownedIds}
              totalXP={totalXP}
              onBuy={handleBuy}
            />
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-sm px-5 py-2.5 rounded-full shadow-lg z-50 animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  )
}
