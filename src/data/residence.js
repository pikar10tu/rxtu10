// ════════════════════════════════════════════════════════════
//  ที่อยู่อาศัย (Residence) — house-upgrade ladder
// ════════════════════════════════════════════════════════════
//  Narrative arc: สู้ชีวิต → สร้างตัว → ประสบความสำเร็จ → (อนาคต) เหนือระดับ
//  15 tiers defined; only 1–12 are RELEASED (MAX_RESIDENCE_LEVEL).
//  `residence.level` (1-based) drives daily income, farm plots, pet-storage,
//  battle-team size, market unlock, seed tier, shop discount, art/frame.
//  All numbers tunable.
// ════════════════════════════════════════════════════════════

export const RESIDENCE_TIERS = [
  // ── 🪙 สู้ชีวิต (เริ่มต้น–ดิ้นรน) ──
  { level: 1,  tierName: 'ปูหนังสือพิมพ์ริมทาง',     art: '📰', upgradeCost: 0,       dailyIncome: 150,   plots: 4,  petStorage: 20, battleSlots: 1, marketUnlocked: false, maxSeedTier: 'common',    shopDiscountPct: 0,  eggSlots: 2, frameColor: '#9ca3af' },
  { level: 2,  tierName: 'เพิงกล่องกระดาษใต้สะพานลอย', art: '📦', upgradeCost: 700,    dailyIncome: 250,   plots: 5,  petStorage: 25, battleSlots: 1, marketUnlocked: false, maxSeedTier: 'common',    shopDiscountPct: 0,  eggSlots: 2, frameColor: '#a8a29e' },
  { level: 3,  tierName: 'ห้องเช่ารูหนู',            art: '🚪', upgradeCost: 1800,   dailyIncome: 400,   plots: 6,  petStorage: 30, battleSlots: 1, marketUnlocked: false, maxSeedTier: 'rare',      shopDiscountPct: 0,  eggSlots: 2, frameColor: '#84cc16' },
  { level: 4,  tierName: 'ห้องแถวไม้เก่าท้ายซอย',    art: '🏚️', upgradeCost: 4000,   dailyIncome: 650,   plots: 6,  petStorage: 35, battleSlots: 2, marketUnlocked: true,  maxSeedTier: 'rare',      shopDiscountPct: 0,  eggSlots: 3, frameColor: '#22c55e' },
  // ── 🏢 สร้างตัว (เริ่มลืมตาอ้าปากได้) ──
  { level: 5,  tierName: 'ห้องแบ่งเช่าใต้หลังคา',    art: '🏠', upgradeCost: 8000,   dailyIncome: 1000,  plots: 7,  petStorage: 40, battleSlots: 2, marketUnlocked: true,  maxSeedTier: 'rare',      shopDiscountPct: 0,  eggSlots: 3, frameColor: '#14b8a6' },
  { level: 6,  tierName: 'เซฟเฮาส์ตึกแถวรีโนเวท',    art: '🏢', upgradeCost: 16000,  dailyIncome: 1500,  plots: 8,  petStorage: 45, battleSlots: 2, marketUnlocked: true,  maxSeedTier: 'rare',      shopDiscountPct: 3,  eggSlots: 3, frameColor: '#06b6d4' },
  { level: 7,  tierName: 'คอนโด High-Rise ชั้นสูง',  art: '🏙️', upgradeCost: 32000,  dailyIncome: 2200,  plots: 8,  petStorage: 50, battleSlots: 2, marketUnlocked: true,  maxSeedTier: 'epic',      shopDiscountPct: 3,  eggSlots: 4, frameColor: '#3b82f6' },
  { level: 8,  tierName: 'ทาวน์โฮม 3 ชั้นในเมือง',   art: '🏘️', upgradeCost: 58000,  dailyIncome: 3200,  plots: 9,  petStorage: 55, battleSlots: 3, marketUnlocked: true,  maxSeedTier: 'epic',      shopDiscountPct: 5,  eggSlots: 4, frameColor: '#6366f1' },
  // ── 🏰 ประสบความสำเร็จ (ร่ำรวย–มหาเศรษฐี) ──
  { level: 9,  tierName: 'บ้านพักตากอากาศริมทะเล',   art: '🏖️', upgradeCost: 105000, dailyIncome: 4500,  plots: 10, petStorage: 60, battleSlots: 3, marketUnlocked: true,  maxSeedTier: 'epic',      shopDiscountPct: 5,  eggSlots: 4, frameColor: '#8b5cf6' },
  { level: 10, tierName: 'คฤหาสน์หรูพร้อมสระว่ายน้ำ', art: '🏛️', upgradeCost: 190000, dailyIncome: 6000,  plots: 10, petStorage: 65, battleSlots: 3, marketUnlocked: true,  maxSeedTier: 'epic',      shopDiscountPct: 7,  eggSlots: 5, frameColor: '#a855f7' },
  { level: 11, tierName: 'เพนต์เฮาส์ลอยฟ้า',         art: '🌆', upgradeCost: 350000, dailyIncome: 8000,  plots: 11, petStorage: 70, battleSlots: 4, marketUnlocked: true,  maxSeedTier: 'legendary', shopDiscountPct: 8,  eggSlots: 5, frameColor: '#ec4899' },
  { level: 12, tierName: 'คฤหาสน์บนเกาะส่วนตัว',     art: '🏝️', upgradeCost: 650000, dailyIncome: 12000, plots: 12, petStorage: 75, battleSlots: 4, marketUnlocked: true,  maxSeedTier: 'legendary', shopDiscountPct: 10, eggSlots: 6, frameColor: '#f59e0b' },
  // ── 🚀 อนาคต (เหนือระดับ–หลุดโลก) — ยังไม่เปิด (cap = 12) ──
  { level: 13, tierName: 'ปราสาทโบราณในยุโรป',       art: '🏰', upgradeCost: 1100000, dailyIncome: 16000, plots: 13, petStorage: 80, battleSlots: 4, marketUnlocked: true, maxSeedTier: 'legendary', shopDiscountPct: 12, eggSlots: 7, frameColor: '#f43f5e' },
  { level: 14, tierName: 'สถานีอวกาศส่วนตัว',        art: '🛰️', upgradeCost: 1900000, dailyIncome: 21000, plots: 14, petStorage: 85, battleSlots: 4, marketUnlocked: true, maxSeedTier: 'legendary', shopDiscountPct: 14, eggSlots: 7, frameColor: '#a21caf' },
  { level: 15, tierName: 'มิติส่วนตัวเหนือกาลเวลา',   art: '🌌', upgradeCost: 3200000, dailyIncome: 28000, plots: 15, petStorage: 90, battleSlots: 4, marketUnlocked: true, maxSeedTier: 'legendary', shopDiscountPct: 15, eggSlots: 8, frameColor: '#fbbf24' },
]

export const MIN_RESIDENCE_LEVEL = 1
export const MAX_RESIDENCE_LEVEL = 12 // released cap (array defines 15 for future tiers)

// ── Lookups (all clamp the level into range, accept missing/undefined) ──
export function clampLevel(level) {
  const n = Number(level) || MIN_RESIDENCE_LEVEL
  return Math.min(MAX_RESIDENCE_LEVEL, Math.max(MIN_RESIDENCE_LEVEL, Math.floor(n)))
}

/** Tier object for a given level (1-based, clamped). */
export function getTier(level) {
  return RESIDENCE_TIERS[clampLevel(level) - 1]
}

/** The next tier up, or null if already at the released max. */
export function nextTier(level) {
  const l = clampLevel(level)
  return l >= MAX_RESIDENCE_LEVEL ? null : RESIDENCE_TIERS[l] // index l == level (l+1 - 1)
}

export const isMaxResidence = (level) => clampLevel(level) >= MAX_RESIDENCE_LEVEL

// ── Per-level accessors ──
export const residenceDailyIncome  = (level) => getTier(level).dailyIncome
export const residencePlots        = (level) => getTier(level).plots
export const residencePetStorage   = (level) => getTier(level).petStorage
export const residenceBattleSlots  = (level) => getTier(level).battleSlots
export const residenceEggSlots     = (level) => getTier(level).eggSlots
export const residenceMarketOpen   = (level) => getTier(level).marketUnlocked
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
