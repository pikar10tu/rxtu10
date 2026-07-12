// ════════════════════════════════════════════════════════════
//  Pet economy (v2 — RETUNED) + storage helpers
// ════════════════════════════════════════════════════════════

// income constants + petDailyCoins ย้ายไป data/petPower.js (แหล่งเดียว) — re-export back-compat
export { RARITY_DAILY_BASE, GRADE_MULTI_V2, petDailyCoins } from '../data/petPower.js'
import { petDailyCoins } from '../data/petPower.js'

/** Sum of daily coins across stored (active) pets — vault pets earn nothing. */
export function totalPetDaily(pets) {
  return (pets || []).reduce((sum, p) => sum + petDailyCoins(p), 0)
}
