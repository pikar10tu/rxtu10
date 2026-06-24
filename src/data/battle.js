// ════════════════════════════════════════════════════════════
//  Battle combat constants — พอร์ตจาก scripts/battle-sim.mjs (จูนแล้ว)
//  ⚠️ ชุดเลขนี้ "flatter" กว่า BASE_STATS/STAT_MULTI ใน data/index.js
//     (เดิมใช้แค่ petStats() แสดงผล) — battle ใช้ชุดนี้
// ════════════════════════════════════════════════════════════
import { elementBeats } from './index.js'

export const BATTLE_CFG = {
  teamSize: 4, maxRounds: 30,
  elementAdv: 1.20, elementDis: 0.83,
  critRate: 0.12, critMult: 1.6, variance: 0.22,
}

const COMBAT_BASE = {
  common:    { atk: 10, hp: 50 },
  rare:      { atk: 11, hp: 56 },
  epic:      { atk: 13, hp: 63 },
  legendary: { atk: 14, hp: 70 },
}
// index = grade 0..5 (in-game cap = 5)
const COMBAT_GRADE = [1.0, 1.06, 1.12, 1.19, 1.26, 1.34]
const ELEMENT_BIAS = {
  fist:     { atk: 1.2,  hp: 0.85 },
  scissors: { atk: 1.0,  hp: 1.0  },
  paper:    { atk: 0.85, hp: 1.2  },
}

/** pet { id, rarity, element, grade } → combat unit (เกรด clamp 0..5) */
export function buildCombatant(pet) {
  const base = COMBAT_BASE[pet?.rarity] || COMBAT_BASE.common
  const g = Math.min(COMBAT_GRADE.length - 1, Math.max(0, pet?.grade || 0))
  const bias = ELEMENT_BIAS[pet?.element] || ELEMENT_BIAS.scissors
  const atk = base.atk * COMBAT_GRADE[g] * bias.atk
  const maxHp = base.hp * COMBAT_GRADE[g] * bias.hp
  return { id: pet?.id || null, element: pet?.element || 'scissors', atk, maxHp, hp: maxHp }
}

/** ตัวคูณดาเมจตามธาตุ: ได้เปรียบ 1.20 / เสียเปรียบ 0.83 / เสมอ 1 */
export function elementMult(attEl, defEl) {
  if (elementBeats(attEl, defEl)) return BATTLE_CFG.elementAdv
  if (elementBeats(defEl, attEl)) return BATTLE_CFG.elementDis
  return 1
}
