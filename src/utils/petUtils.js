// ════════════════════════════════════════════════════════════
//  Pet economy (v2 — RETUNED) + storage helpers
// ════════════════════════════════════════════════════════════
//  Inflation fix: the legacy model summed petDailyCoins over ALL owned pets
//  with a steep grade curve (→37×) and no ownership cap. v2 keeps the
//  "every stored pet earns" model but (a) caps ownership via residence
//  pet-storage, and (b) retunes the numbers DOWN so a full endgame storage
//  is comparable to a top residence, not a multiple of it.
//
//  These constants SUPERSEDE the legacy RARITY.dailyBase / GRADE_MULTI.
// ════════════════════════════════════════════════════════════

// daily coins per rarity at grade 0 (Phase B ×2.5 จาก 6/15/35/70)
export const RARITY_DAILY_BASE = {
  common: 15,
  rare: 38,
  epic: 85,
  legendary: 175,
}

// grade multiplier, max grade = 12× (was 5.5×). Index = grade 0..5.
export const GRADE_MULTI_V2 = [1.0, 2.0, 3.5, 5.5, 8.0, 12.0]   // income mult by grade 0-5 (draft pin)

/** Daily coins a single stored pet produces. Deterministic from rarity+grade. */
export function petDailyCoins(pet) {
  if (!pet) return 0
  const base = RARITY_DAILY_BASE[pet.rarity] ?? RARITY_DAILY_BASE.common
  const g = Math.min(GRADE_MULTI_V2.length - 1, Math.max(0, pet.grade || 0))
  let coins = base * GRADE_MULTI_V2[g]
  // optional +Daily Coins% potential affix (Milestone 2; harmless if absent)
  if (Array.isArray(pet.potential)) {
    const bonus = pet.potential
      .filter(a => a?.stat === 'dailyCoins')
      .reduce((s, a) => s + (a.value || 0), 0)
    if (bonus) coins *= 1 + bonus / 100
  }
  return Math.round(coins)
}

/** Sum of daily coins across stored (active) pets — vault pets earn nothing. */
export function totalPetDaily(pets) {
  return (pets || []).reduce((sum, p) => sum + petDailyCoins(p), 0)
}
