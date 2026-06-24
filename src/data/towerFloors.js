// ════════════════════════════════════════════════════════════
//  หอคอย PvE — ทีมบอทรายชั้น (สร้างจากสูตร ไม่เขียนมือ) + โบนัสรายได้
//  deterministic จาก floor → ทีมบอทคงที่/ทดสอบได้
// ════════════════════════════════════════════════════════════
import { PETS } from './index.js'

export const TOWER_MAX = 50

const ELS = ['fist', 'scissors', 'paper']
const RARITY_BY_TIER = ['common', 'rare', 'epic', 'legendary']

function rng(seed) {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** ชั้น → ทีมบอท 4 ตัว (rarity/เกรดไต่ตามชั้น + ธาตุผสม) */
export function getFloorTeam(floor) {
  const f = Math.max(1, Math.min(TOWER_MAX, Math.floor(floor) || 1))
  const rand = rng((f * 2654435761) >>> 0)
  const tier = Math.min(3, Math.floor((f - 1) / 12.5))  // 1-12 common · 13-25 rare · 26-38 epic · 39-50 legendary
  const grade = Math.min(5, Math.floor((f - 1) / 9))     // 0..5
  const rarity = RARITY_BY_TIER[tier]
  const team = []
  for (let i = 0; i < 4; i++) {
    const element = ELS[(f + i) % 3]
    const pool = PETS.filter(p => p.rarity === rarity && p.element === element)
    const fallback = PETS.filter(p => p.element === element)
    const src = pool.length ? pool : fallback
    const def = src[Math.floor(rand() * src.length)]
    team.push({ id: def.id, rarity: def.rarity, element: def.element, grade })
  }
  return team
}

/** ชั้นสูงสุดที่เคยผ่าน → โบนัสเหรียญ idle/วัน (flat, มี cap — ไม่ทวีคูณ) */
export function getTowerBonus(bestFloor) {
  const b = bestFloor || 0
  if (b >= 50) return 12000
  if (b >= 40) return 8000
  if (b >= 30) return 4000
  if (b >= 20) return 1500
  if (b >= 10) return 500
  return 0
}
