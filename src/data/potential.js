// ════════════════════════════════════════════════════════════
//  ศักยภาพ (Potential) — RPG affix/enchant system
// ════════════════════════════════════════════════════════════
//  Each pet instance can hold affixes in `potential: [{stat, value}]`.
//  Slots by rarity. Roll a slot by sacrificing a same-rarity fodder pet
//  + coins. Re-roll → preview → keep or replace. No duplicate affix/pet.
//  ATK%/HP% feed battle stats; dailyCoins% feeds income (petUtils);
//  crit/critDmg/lifesteal/dodge are used by the battle engine (later).
// ════════════════════════════════════════════════════════════

export const AFFIXES = [
  { stat: 'atk',        label: '⚔️ ATK',        min: 5,  max: 12 },
  { stat: 'hp',         label: '❤️ HP',         min: 5,  max: 12 },
  { stat: 'crit',       label: '🎯 Crit Rate',  min: 3,  max: 8  },
  { stat: 'critDmg',    label: '💥 Crit DMG',    min: 10, max: 25 },
  { stat: 'lifesteal',  label: '🩸 Lifesteal',   min: 3,  max: 8  },
  { stat: 'dodge',      label: '💨 Dodge',       min: 2,  max: 6  },
  { stat: 'dailyCoins', label: '💰 รายได้',      min: 5,  max: 15 },
]

export const SLOTS_BY_RARITY = { common: 1, rare: 2, epic: 3, legendary: 4 }
export const POTENTIAL_COST  = { common: 200, rare: 800, epic: 2500, legendary: 8000 }

export const affixMeta = (stat) => AFFIXES.find(a => a.stat === stat) || { stat, label: stat }
export const slotsFor  = (rarity) => SLOTS_BY_RARITY[rarity] || 1
export const rollCost  = (rarity) => POTENTIAL_COST[rarity] || 200

/** Roll a random affix, excluding stats already on the pet (no duplicates). */
export function rollAffix(excludeStats = []) {
  const pool = AFFIXES.filter(a => !excludeStats.includes(a.stat))
  if (!pool.length) return null
  const a = pool[Math.floor(Math.random() * pool.length)]
  const value = Math.floor(Math.random() * (a.max - a.min + 1)) + a.min
  return { stat: a.stat, value }
}

/** Total % bonus for a given stat across a pet's potential affixes. */
export function statBonusPct(potential, stat) {
  return (potential || []).filter(a => a.stat === stat).reduce((s, a) => s + (a.value || 0), 0)
}
