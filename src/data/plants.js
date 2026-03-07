export const plants = [
  // ── Common ──────────────────────────────────────────────────
  {
    id: 'sprout',
    name: 'Sprout',
    emoji: '🌱',
    description: 'Every forest starts with a single seed.',
    cost: 10,
    rarity: 'common',
  },
  {
    id: 'herb',
    name: 'Herb',
    emoji: '🌿',
    description: 'Fresh, simple, timeless.',
    cost: 25,
    rarity: 'common',
  },
  {
    id: 'wheat',
    name: 'Wheat',
    emoji: '🌾',
    description: 'Sways gently in a breeze you can almost feel.',
    cost: 40,
    rarity: 'common',
  },
  {
    id: 'clover',
    name: 'Four-Leaf Clover',
    emoji: '🍀',
    description: 'Rare by nature. Not by price.',
    cost: 50,
    rarity: 'common',
  },
  {
    id: 'potted',
    name: 'Potted Plant',
    emoji: '🪴',
    description: 'A cozy corner for your forest.',
    cost: 60,
    rarity: 'common',
  },

  // ── Uncommon ─────────────────────────────────────────────────
  {
    id: 'tulip',
    name: 'Tulip',
    emoji: '🌷',
    description: 'Elegant. Worth every XP.',
    cost: 80,
    rarity: 'uncommon',
  },
  {
    id: 'mushroom',
    name: 'Mushroom',
    emoji: '🍄',
    description: 'Technically not a plant. Your forest, your rules.',
    cost: 90,
    rarity: 'uncommon',
  },
  {
    id: 'sunflower',
    name: 'Sunflower',
    emoji: '🌻',
    description: 'Always faces toward the light.',
    cost: 110,
    rarity: 'uncommon',
  },
  {
    id: 'cactus',
    name: 'Cactus',
    emoji: '🌵',
    description: 'Thrives on neglect. Respects no one.',
    cost: 120,
    rarity: 'uncommon',
  },
  {
    id: 'hibiscus',
    name: 'Hibiscus',
    emoji: '🌺',
    description: 'A little tropical energy for your garden.',
    cost: 140,
    rarity: 'uncommon',
  },

  // ── Rare ─────────────────────────────────────────────────────
  {
    id: 'bamboo',
    name: 'Bamboo',
    emoji: '🎋',
    description: 'Grows fast. Stands tall. Very zen.',
    cost: 175,
    rarity: 'rare',
  },
  {
    id: 'pine',
    name: 'Pine Tree',
    emoji: '🎄',
    description: 'Evergreen. Patient. Permanent.',
    cost: 220,
    rarity: 'rare',
  },
  {
    id: 'oak',
    name: 'Oak Tree',
    emoji: '🌳',
    description: 'Steady, strong, unhurried. Classic.',
    cost: 250,
    rarity: 'rare',
  },
  {
    id: 'palm',
    name: 'Palm Tree',
    emoji: '🌴',
    description: 'For the forest with serious ambitions.',
    cost: 300,
    rarity: 'rare',
  },
  {
    id: 'cherry',
    name: 'Cherry Blossom',
    emoji: '🌸',
    description: 'Brief, brilliant, and worth every moment.',
    cost: 350,
    rarity: 'rare',
  },
  {
    id: 'maple',
    name: 'Maple Tree',
    emoji: '🍁',
    description: 'Autumn, distilled into a single tree.',
    cost: 400,
    rarity: 'rare',
  },

  // ── Legendary ─────────────────────────────────────────────────
  {
    id: 'lotus',
    name: 'Lotus',
    emoji: '🪷',
    description: 'Blooms from the mud. The most beautiful things do.',
    cost: 550,
    rarity: 'legendary',
  },
  {
    id: 'bouquet',
    name: 'Grand Bouquet',
    emoji: '💐',
    description: 'A celebration made of flowers. For the truly committed.',
    cost: 700,
    rarity: 'legendary',
  },
  {
    id: 'willow',
    name: 'Weeping Willow',
    emoji: '🌲',
    description: 'Ancient, wise, and slightly dramatic.',
    cost: 800,
    rarity: 'legendary',
  },
]

export const RARITY = {
  common:    { label: 'Common',    textColor: 'text-stone-500',   bgColor: 'bg-stone-100',   borderColor: 'border-stone-200' },
  uncommon:  { label: 'Uncommon',  textColor: 'text-emerald-600', bgColor: 'bg-emerald-50',  borderColor: 'border-emerald-200' },
  rare:      { label: 'Rare',      textColor: 'text-blue-600',    bgColor: 'bg-blue-50',     borderColor: 'border-blue-200' },
  legendary: { label: 'Legendary', textColor: 'text-amber-600',   bgColor: 'bg-amber-50',    borderColor: 'border-amber-200' },
}

export function getPlant(id) {
  return plants.find((p) => p.id === id) ?? null
}
