// ════════════════════════════════════════════════════════════
//  พืชผล (Crops) — farming data
// ════════════════════════════════════════════════════════════
//  plant seed (costs seedCost) → grow (growMinutes, real-time) →
//  water/fertilize to speed up → harvest → sell for sellPrice.
//  `tier` gates availability by residence.maxSeedTier.
//  Tunable: profit ≈ sellPrice − seedCost per grow cycle.
// ════════════════════════════════════════════════════════════

export const SEED_TIER_RANK = { common: 0, rare: 1, epic: 2, legendary: 3 }

// speed-ups (multipliers on grow time); water is free, fertilizer costs coins
export const WATER_MULT = 0.85   // −15%
export const FERT_MULT  = 0.65   // −35%
export const FERT_COST_RATIO = 0.5 // fertilizer costs 50% of the seed price

export const CROPS = [
  // COMMON — fast, cheap
  { id: 'carrot',   name: 'แครอท',    emoji: '🥕', tier: 'common',    seedCost: 30,   growMinutes: 5,   sellPrice: 60 },
  { id: 'lettuce',  name: 'ผักกาด',   emoji: '🥬', tier: 'common',    seedCost: 25,   growMinutes: 4,   sellPrice: 50 },
  { id: 'tomato',   name: 'มะเขือเทศ', emoji: '🍅', tier: 'common',   seedCost: 40,   growMinutes: 8,   sellPrice: 95 },
  { id: 'corn',     name: 'ข้าวโพด',  emoji: '🌽', tier: 'common',    seedCost: 50,   growMinutes: 12,  sellPrice: 125 },
  // RARE
  { id: 'strawberry', name: 'สตรอว์เบอร์รี', emoji: '🍓', tier: 'rare', seedCost: 120, growMinutes: 20,  sellPrice: 320 },
  { id: 'chili',    name: 'พริก',     emoji: '🌶️', tier: 'rare',      seedCost: 100,  growMinutes: 18,  sellPrice: 270 },
  { id: 'eggplant', name: 'มะเขือ',   emoji: '🍆', tier: 'rare',      seedCost: 110,  growMinutes: 22,  sellPrice: 300 },
  // EPIC — herbs, slow & valuable
  { id: 'herb',     name: 'สมุนไพร',  emoji: '🌿', tier: 'epic',      seedCost: 300,  growMinutes: 40,  sellPrice: 850 },
  { id: 'mushroom', name: 'เห็ดวิเศษ', emoji: '🍄', tier: 'epic',     seedCost: 350,  growMinutes: 45,  sellPrice: 980 },
  { id: 'ginseng',  name: 'โสม',      emoji: '🪴', tier: 'epic',      seedCost: 400,  growMinutes: 60,  sellPrice: 1150 },
  // LEGENDARY — long-haul cash crops
  { id: 'lotus',    name: 'บัวหลวง',  emoji: '🪷', tier: 'legendary', seedCost: 1200, growMinutes: 100, sellPrice: 3700 },
  { id: 'sunflower', name: 'ทานตะวันทอง', emoji: '🌻', tier: 'legendary', seedCost: 1500, growMinutes: 120, sellPrice: 4600 },
]

const _byId = Object.fromEntries(CROPS.map(c => [c.id, c]))
export const getCrop = (id) => _byId[id] || null

/** Crops a player can plant given their residence's maxSeedTier. */
export function cropsForSeedTier(maxTier) {
  const cap = SEED_TIER_RANK[maxTier] ?? 0
  return CROPS.filter(c => (SEED_TIER_RANK[c.tier] ?? 0) <= cap)
}

/** Effective grow time (ms) for a planted plot, after water/fertilizer. */
export function effectiveGrowMs(plot) {
  const crop = getCrop(plot?.seedId)
  if (!crop) return 0
  let m = crop.growMinutes
  if (plot.watered)    m *= WATER_MULT
  if (plot.fertilized) m *= FERT_MULT
  return m * 60 * 1000
}

export const fertilizerCost = (seedId) =>
  Math.round((getCrop(seedId)?.seedCost || 0) * FERT_COST_RATIO)
