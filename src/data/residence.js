// ════════════════════════════════════════════════════════════
//  ที่อยู่อาศัย (Residence) — 12-tier prestige / coin-sink ladder
// ════════════════════════════════════════════════════════════
//  Climb from rock-bottom (newspaper on the ground) to a castle.
//  `residence.level` (1-based) on the user doc drives EVERYTHING here:
//  daily income, farm plots, pet-storage cap, battle-team size,
//  market unlock, seed tier, shop discount, and the prestige art/frame.
//
//  Tunable: every number below is a starting curve — adjust freely.
//  `upgradeCost` = coins to REACH that level (Lv1 is free/start).
// ════════════════════════════════════════════════════════════

export const RESIDENCE_TIERS = [
  // lvl, name, art, upgradeCost, dailyIncome, plots, petStorage, battleSlots,
  //      market, maxSeedTier, shopDiscountPct, eggSlots, frameColor
  { level: 1,  tierName: 'นอนกลางแจ้ง',  art: '📰', upgradeCost: 0,         dailyIncome: 150,    plots: 4,  petStorage: 20, battleSlots: 1, marketUnlocked: false, maxSeedTier: 'common',    shopDiscountPct: 0,  eggSlots: 2, frameColor: '#9ca3af' },
  { level: 2,  tierName: 'กล่องกระดาษ',   art: '📦', upgradeCost: 1000,      dailyIncome: 250,    plots: 5,  petStorage: 25, battleSlots: 1, marketUnlocked: false, maxSeedTier: 'common',    shopDiscountPct: 0,  eggSlots: 2, frameColor: '#a8a29e' },
  { level: 3,  tierName: 'เต็นท์ผ้าใบ',    art: '⛺', upgradeCost: 2500,      dailyIncome: 400,    plots: 6,  petStorage: 30, battleSlots: 1, marketUnlocked: false, maxSeedTier: 'rare',      shopDiscountPct: 0,  eggSlots: 2, frameColor: '#84cc16' },
  { level: 4,  tierName: 'เพิงไม้',        art: '🛖', upgradeCost: 6000,      dailyIncome: 650,    plots: 6,  petStorage: 35, battleSlots: 2, marketUnlocked: true,  maxSeedTier: 'rare',      shopDiscountPct: 0,  eggSlots: 3, frameColor: '#22c55e' },
  { level: 5,  tierName: 'กระท่อม',        art: '🏚️', upgradeCost: 14000,     dailyIncome: 1000,   plots: 7,  petStorage: 40, battleSlots: 2, marketUnlocked: true,  maxSeedTier: 'rare',      shopDiscountPct: 0,  eggSlots: 3, frameColor: '#14b8a6' },
  { level: 6,  tierName: 'บ้านไม้',        art: '🏠', upgradeCost: 32000,     dailyIncome: 1500,   plots: 8,  petStorage: 45, battleSlots: 2, marketUnlocked: true,  maxSeedTier: 'rare',      shopDiscountPct: 3,  eggSlots: 3, frameColor: '#06b6d4' },
  { level: 7,  tierName: 'บ้านอิฐ',        art: '🧱', upgradeCost: 70000,     dailyIncome: 2200,   plots: 8,  petStorage: 50, battleSlots: 2, marketUnlocked: true,  maxSeedTier: 'epic',      shopDiscountPct: 3,  eggSlots: 4, frameColor: '#3b82f6' },
  { level: 8,  tierName: 'บ้านสองชั้น',    art: '🏡', upgradeCost: 150000,    dailyIncome: 3200,   plots: 9,  petStorage: 55, battleSlots: 3, marketUnlocked: true,  maxSeedTier: 'epic',      shopDiscountPct: 5,  eggSlots: 4, frameColor: '#6366f1' },
  { level: 9,  tierName: 'ทาวน์โฮม',       art: '🏘️', upgradeCost: 320000,    dailyIncome: 4500,   plots: 10, petStorage: 60, battleSlots: 3, marketUnlocked: true,  maxSeedTier: 'epic',      shopDiscountPct: 5,  eggSlots: 4, frameColor: '#8b5cf6' },
  { level: 10, tierName: 'คฤหาสน์',        art: '🏛️', upgradeCost: 680000,    dailyIncome: 6000,   plots: 10, petStorage: 65, battleSlots: 3, marketUnlocked: true,  maxSeedTier: 'epic',      shopDiscountPct: 7,  eggSlots: 5, frameColor: '#a855f7' },
  { level: 11, tierName: 'วิลล่าหรู',       art: '🏨', upgradeCost: 1400000,   dailyIncome: 8000,   plots: 11, petStorage: 70, battleSlots: 4, marketUnlocked: true,  maxSeedTier: 'legendary', shopDiscountPct: 8,  eggSlots: 5, frameColor: '#ec4899' },
  { level: 12, tierName: 'ปราสาท',         art: '🏰', upgradeCost: 3000000,   dailyIncome: 12000,  plots: 12, petStorage: 75, battleSlots: 4, marketUnlocked: true,  maxSeedTier: 'legendary', shopDiscountPct: 10, eggSlots: 6, frameColor: '#f59e0b' },
]

export const MIN_RESIDENCE_LEVEL = 1
export const MAX_RESIDENCE_LEVEL = RESIDENCE_TIERS.length // 12

// ── Lookups (all clamp the level into range, accept missing/undefined) ──
export function clampLevel(level) {
  const n = Number(level) || MIN_RESIDENCE_LEVEL
  return Math.min(MAX_RESIDENCE_LEVEL, Math.max(MIN_RESIDENCE_LEVEL, Math.floor(n)))
}

/** Tier object for a given level (1-based, clamped). */
export function getTier(level) {
  return RESIDENCE_TIERS[clampLevel(level) - 1]
}

/** The next tier up, or null if already at max. */
export function nextTier(level) {
  const l = clampLevel(level)
  return l >= MAX_RESIDENCE_LEVEL ? null : RESIDENCE_TIERS[l] // index l == level (l+1 - 1)
}

export const isMaxResidence = (level) => clampLevel(level) >= MAX_RESIDENCE_LEVEL

// ── Per-level accessors (convenience) ──
export const residenceDailyIncome = (level) => getTier(level).dailyIncome
export const residencePlots       = (level) => getTier(level).plots
export const residencePetStorage  = (level) => getTier(level).petStorage
export const residenceBattleSlots = (level) => getTier(level).battleSlots
export const residenceEggSlots    = (level) => getTier(level).eggSlots
export const residenceMarketOpen  = (level) => getTier(level).marketUnlocked
export const residenceShopDiscount = (level) => getTier(level).shopDiscountPct

/** Cost to upgrade FROM `level` to `level+1` (null if maxed). */
export function upgradeCostFrom(level) {
  const nt = nextTier(level)
  return nt ? nt.upgradeCost : null
}

/** Cumulative coins spent to reach a level from Lv1 (for migration mapping). */
export function cumulativeCost(level) {
  const l = clampLevel(level)
  let sum = 0
  for (let i = 1; i < l; i++) sum += RESIDENCE_TIERS[i].upgradeCost
  return sum
}

/**
 * Highest residence level affordable with a given wealth — used by the v2
 * launch migration to convert existing coins into a starting residence tier.
 */
export function residenceLevelForWealth(wealth) {
  let lvl = MIN_RESIDENCE_LEVEL
  for (let l = MIN_RESIDENCE_LEVEL + 1; l <= MAX_RESIDENCE_LEVEL; l++) {
    if (wealth >= cumulativeCost(l)) lvl = l
    else break
  }
  return lvl
}
