// ════════════════════════════════════════════════════════════
//  petPower — แหล่งพลังเพ็ทเดียว (income/combat/expedition) + เพดานเกรด
//  ⚠️ ค่าทั้งหมดย้ายมาแบบ verbatim จาก petUtils/battle/expeditions — เลขเท่าเดิม
//     3 เส้นตั้งใจต่างกัน (สู้ flat กัน snowball · income ชัน) — ดู docs/pet-system-overhaul-audit
// ════════════════════════════════════════════════════════════
export const MAX_GRADE = 5
export const RARITY_ORDER = ['common', 'rare', 'epic', 'legendary']
export const clampGrade = (g) => Math.min(MAX_GRADE, Math.max(0, g || 0))

// ── income (จาก petUtils.js) ──
export const RARITY_DAILY_BASE = { common: 15, rare: 38, epic: 85, legendary: 175 }
export const GRADE_MULTI_V2 = [1.0, 2.0, 3.5, 5.5, 8.0, 12.0]

// ── combat (จาก battle.js) ──
export const COMBAT_BASE = {
  common:    { atk: 10, hp: 50 },
  rare:      { atk: 11, hp: 56 },
  epic:      { atk: 13, hp: 63 },
  legendary: { atk: 14, hp: 70 },
}
export const COMBAT_GRADE = [1.0, 1.15, 1.32, 1.52, 1.74, 2.0]
export const ELEMENT_BIAS = {
  fist:     { atk: 1.2,  hp: 0.85 },
  scissors: { atk: 1.0,  hp: 1.0  },
  paper:    { atk: 0.85, hp: 1.2  },
}

// ── expedition (จาก expeditions.js) ──
export const RARITY_WEIGHT = { common: 1, rare: 2, epic: 4, legendary: 7 }
export const EXP_GRADE_K = 0.15

/** pet → combat unit (= buildCombatant เดิม) */
export function combatStats(pet) {
  const base = COMBAT_BASE[pet?.rarity] || COMBAT_BASE.common
  const g = clampGrade(pet?.grade)
  const bias = ELEMENT_BIAS[pet?.element] || ELEMENT_BIAS.scissors
  const atk = base.atk * COMBAT_GRADE[g] * bias.atk
  const maxHp = base.hp * COMBAT_GRADE[g] * bias.hp
  return { id: pet?.id || null, element: pet?.element || 'scissors', atk, maxHp, hp: maxHp }
}

/** รายได้/วันต่อ 1 ตัว (= petDailyCoins เดิม รวม potential dailyCoins%) */
export function petDailyCoins(pet) {
  if (!pet) return 0
  const base = RARITY_DAILY_BASE[pet.rarity] ?? RARITY_DAILY_BASE.common
  const g = clampGrade(pet.grade)
  let coins = base * GRADE_MULTI_V2[g]
  if (Array.isArray(pet.potential)) {
    const bonus = pet.potential
      .filter(a => a?.stat === 'dailyCoins')
      .reduce((s, a) => s + (a.value || 0), 0)
    if (bonus) coins *= 1 + bonus / 100
  }
  return Math.round(coins)
}

/** น้ำหนักคุณภาพ expedition ต่อ 1 ตัว (= term ใน partyPower เดิม — ไม่ clamp) */
export function expWeight(pet) {
  const w = RARITY_WEIGHT[pet?.rarity] || RARITY_WEIGHT.common
  return w * (1 + (pet?.grade || 0) * EXP_GRADE_K)
}
