// ════════════════════════════════════════════════════════════
//  พืชผล (Crops) — farming data
// ════════════════════════════════════════════════════════════
//  plant seed (costs seedCost) → grow (growMinutes, real-time) → harvest →
//  sell for sellPrice. No water/fertilizer — just plant & wait.
//
//  Two INDEPENDENT axes:
//   • tier   → gates availability by residence.maxSeedTier + higher profit rate
//   • time   → every tier has a spread: quick(min) / short(hr) / half-day / multi-day
//  Design: short crops = higher profit/hr but small total (active replanting);
//          long crops  = lower profit/hr but big total (set-and-forget);
//          higher tier = better profit at every time bracket.
//  All numbers are tunable.
// ════════════════════════════════════════════════════════════

export const SEED_TIER_RANK = { common: 0, rare: 1, epic: 2, legendary: 3 }

export const CROPS = [
  // ── COMMON (Lv1) ──
  { id: 'lettuce',  name: 'ผักกาด',     emoji: '🥬', tier: 'common',    seedCost: 20,    growMinutes: 5,    sellPrice: 45 },
  { id: 'tomato',   name: 'มะเขือเทศ',   emoji: '🍅', tier: 'common',    seedCost: 120,   growMinutes: 60,   sellPrice: 320 },
  { id: 'corn',     name: 'ข้าวโพด',    emoji: '🌽', tier: 'common',    seedCost: 400,   growMinutes: 360,  sellPrice: 1300 },
  { id: 'potato',   name: 'มันฝรั่ง',    emoji: '🥔', tier: 'common',    seedCost: 1200,  growMinutes: 1440, sellPrice: 4200 },
  // ── RARE (Lv3) ──
  { id: 'strawberry', name: 'สตรอว์เบอร์รี', emoji: '🍓', tier: 'rare',  seedCost: 80,    growMinutes: 10,   sellPrice: 160 },
  { id: 'chili',    name: 'พริก',       emoji: '🌶️', tier: 'rare',      seedCost: 300,   growMinutes: 120,  sellPrice: 800 },
  { id: 'eggplant', name: 'มะเขือ',     emoji: '🍆', tier: 'rare',      seedCost: 900,   growMinutes: 480,  sellPrice: 2900 },
  { id: 'melon',    name: 'แตงโม',      emoji: '🍉', tier: 'rare',      seedCost: 2500,  growMinutes: 2160, sellPrice: 9000 },
  // ── EPIC (Lv7) ──
  { id: 'mushroom', name: 'เห็ดวิเศษ',   emoji: '🍄', tier: 'epic',      seedCost: 200,   growMinutes: 15,   sellPrice: 380 },
  { id: 'herb',     name: 'สมุนไพร',    emoji: '🌿', tier: 'epic',      seedCost: 700,   growMinutes: 180,  sellPrice: 1900 },
  { id: 'ginseng',  name: 'โสม',        emoji: '🪴', tier: 'epic',      seedCost: 2000,  growMinutes: 720,  sellPrice: 6800 },
  { id: 'pumpkin',  name: 'ฟักทองยักษ์', emoji: '🎃', tier: 'epic',     seedCost: 5000,  growMinutes: 2880, sellPrice: 20000 },
  // ── LEGENDARY (Lv11) ──
  { id: 'glowflower', name: 'ดอกไม้เรืองแสง', emoji: '🌟', tier: 'legendary', seedCost: 600, growMinutes: 20, sellPrice: 1100 },
  { id: 'lotus',    name: 'บัวหลวง',    emoji: '🪷', tier: 'legendary', seedCost: 2000,  growMinutes: 240,  sellPrice: 5600 },
  { id: 'sunflower', name: 'ทานตะวันทอง', emoji: '🌻', tier: 'legendary', seedCost: 6000, growMinutes: 1440, sellPrice: 22000 },
  { id: 'moneytree', name: 'ต้นไม้เงินตรา', emoji: '🌳', tier: 'legendary', seedCost: 15000, growMinutes: 4320, sellPrice: 70000 },
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

/** Human-readable grow time: "5 นาที" / "2 ชม." / "1.5 วัน". */
export function growLabel(crop) {
  const m = crop?.growMinutes || 0
  if (m < 60) return `${m} นาที`
  if (m < 1440) { const h = m / 60; return `${Number.isInteger(h) ? h : h.toFixed(1)} ชม.` }
  const d = m / 1440; return `${Number.isInteger(d) ? d : d.toFixed(1)} วัน`
}
