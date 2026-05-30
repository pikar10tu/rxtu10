// ════════════════════════════════════════════════════════════
//  พืชผล (Crops) — farming data
// ════════════════════════════════════════════════════════════
//  plant seed (costs seedCost) → grow (growMinutes, real-time) → harvest →
//  sell for sellPrice. No water/fertilizer — just plant & wait.
//  `tier` gates availability by residence.maxSeedTier AND sets the timescale:
//    common = minutes · rare = hours · epic = most of a day · legendary = days
//  Longer waits pay much more (set-and-forget). Tunable.
// ════════════════════════════════════════════════════════════

export const SEED_TIER_RANK = { common: 0, rare: 1, epic: 2, legendary: 3 }

export const CROPS = [
  // COMMON — minutes (แป๊บเดียว)
  { id: 'lettuce',  name: 'ผักกาด',    emoji: '🥬', tier: 'common',    seedCost: 25,   growMinutes: 4,    sellPrice: 55 },
  { id: 'carrot',   name: 'แครอท',     emoji: '🥕', tier: 'common',    seedCost: 35,   growMinutes: 8,    sellPrice: 80 },
  { id: 'tomato',   name: 'มะเขือเทศ',  emoji: '🍅', tier: 'common',    seedCost: 50,   growMinutes: 15,   sellPrice: 120 },
  { id: 'corn',     name: 'ข้าวโพด',   emoji: '🌽', tier: 'common',    seedCost: 60,   growMinutes: 20,   sellPrice: 150 },
  // RARE — hours (หลักชั่วโมง)
  { id: 'strawberry', name: 'สตรอว์เบอร์รี', emoji: '🍓', tier: 'rare', seedCost: 200,  growMinutes: 120,  sellPrice: 600 },
  { id: 'chili',    name: 'พริก',      emoji: '🌶️', tier: 'rare',      seedCost: 280,  growMinutes: 180,  sellPrice: 900 },
  { id: 'eggplant', name: 'มะเขือ',    emoji: '🍆', tier: 'rare',      seedCost: 350,  growMinutes: 240,  sellPrice: 1150 },
  // EPIC — most of a day (เกือบวัน)
  { id: 'herb',     name: 'สมุนไพร',   emoji: '🌿', tier: 'epic',      seedCost: 700,  growMinutes: 480,  sellPrice: 2600 },
  { id: 'mushroom', name: 'เห็ดวิเศษ',  emoji: '🍄', tier: 'epic',      seedCost: 1000, growMinutes: 720,  sellPrice: 4000 },
  { id: 'ginseng',  name: 'โสม',       emoji: '🪴', tier: 'epic',      seedCost: 1400, growMinutes: 960,  sellPrice: 5800 },
  // LEGENDARY — days (หลักวัน)
  { id: 'lotus',    name: 'บัวหลวง',   emoji: '🪷', tier: 'legendary', seedCost: 3000, growMinutes: 1440, sellPrice: 13000 },
  { id: 'sunflower', name: 'ทานตะวันทอง', emoji: '🌻', tier: 'legendary', seedCost: 6000, growMinutes: 2880, sellPrice: 28000 },
]

const _byId = Object.fromEntries(CROPS.map(c => [c.id, c]))
export const getCrop = (id) => _byId[id] || null

/** Crops a player can plant given their residence's maxSeedTier. */
export function cropsForSeedTier(maxTier) {
  const cap = SEED_TIER_RANK[maxTier] ?? 0
  return CROPS.filter(c => (SEED_TIER_RANK[c.tier] ?? 0) <= cap)
}

/** Grow time (ms) for a seed — plain, no speed-ups. */
export const growMs = (seedId) => (getCrop(seedId)?.growMinutes || 0) * 60 * 1000

/** Human-readable grow time: "8 นาที" / "2 ชม." / "1 วัน". */
export function growLabel(crop) {
  const m = crop?.growMinutes || 0
  if (m < 60) return `${m} นาที`
  if (m < 1440) { const h = m / 60; return `${Number.isInteger(h) ? h : h.toFixed(1)} ชม.` }
  const d = m / 1440; return `${Number.isInteger(d) ? d : d.toFixed(1)} วัน`
}
