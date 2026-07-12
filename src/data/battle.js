// ════════════════════════════════════════════════════════════
//  Battle combat constants — พอร์ตจาก scripts/battle-sim.mjs (จูนแล้ว)
//  ⚠️ ชุดเลขนี้ตั้งใจ "flatter" กว่ารายได้ idle (petUtils) เพื่อกัน snowball ในสนามสู้
//     (ดู docs/pet-system-overhaul-audit — P1 จะรวมเป็น petPower ตัวเดียว)
// ════════════════════════════════════════════════════════════
import { elementBeats } from './index.js'
import { combatStats } from './petPower.js'

export const BATTLE_CFG = {
  teamSize: 4, maxRounds: 30,   // maxRounds = legacy (ไม่ใช้เป็น cap แล้ว ดู maxTurns)
  maxTurns: 300,                // cap จำนวนการตีรวม กันลูปยาวผิดปกติ (1 ตัวออกตี = 1 turn)
  elementAdv: 1.20, elementDis: 0.83,
  critRate: 0.12, critMult: 1.6, variance: 0.22,
}

/** pet → combat unit (ย้ายตรรกะไป petPower — เลขเท่าเดิม) */
export const buildCombatant = combatStats

/** ตัวคูณดาเมจตามธาตุ: ได้เปรียบ 1.20 / เสียเปรียบ 0.83 / เสมอ 1 */
export function elementMult(attEl, defEl) {
  if (elementBeats(attEl, defEl)) return BATTLE_CFG.elementAdv
  if (elementBeats(defEl, attEl)) return BATTLE_CFG.elementDis
  return 1
}
