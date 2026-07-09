// ════════════════════════════════════════════════════════════
//  หอคอย PvE — ทีมบอทรายชั้น (สร้างจากสูตร ไม่เขียนมือ) + โบนัสรายได้
//  deterministic จาก floor → ทีมบอทคงที่/ทดสอบได้
// ════════════════════════════════════════════════════════════
import { PETS } from './index.js'
import { BATTLE_SLOTS } from './residence.js'

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

/** ชั้น → ทีมบอท 3 ตัว (rarity/เกรดไต่ตามชั้น + ธาตุผสม) */
export function getFloorTeam(floor) {
  const f = Math.max(1, Math.min(TOWER_MAX, Math.floor(floor) || 1))
  const rand = rng((f * 2654435761) >>> 0)
  const tier = Math.min(3, Math.floor((f - 1) / 12.5))  // 1-12 common · 13-25 rare · 26-38 epic · 39-50 legendary
  const grade = Math.min(5, Math.floor((f - 1) / 9))     // 0..5
  const rarity = RARITY_BY_TIER[tier]
  const team = []
  for (let i = 0; i < BATTLE_SLOTS; i++) {
    const element = ELS[(f + i) % 3]
    const pool = PETS.filter(p => p.rarity === rarity && p.element === element)
    const fallback = PETS.filter(p => p.element === element)
    const src = pool.length ? pool : fallback
    const def = src[Math.floor(rand() * src.length)]
    team.push({ id: def.id, rarity: def.rarity, element: def.element, grade })
  }
  return team
}

// โบนัสรายได้ idle/วัน จากชั้นสูงสุด — เพิ่มขึ้น "ทุกชั้น" (ไม่ใช่ขั้นบันได) · ตันที่ชั้น 50
export const TOWER_BONUS_MIN = 50      // โบนัส/วัน ที่ชั้น 1 (ก้าวแรกก็ได้รางวัล)
export const TOWER_BONUS_MAX = 12000   // โบนัส/วัน ที่ชั้น 50 (ตัน — คงเดิมเพื่อสมดุลปลายเกม)
const TOWER_BONUS_POW = 1.7            // >1 = เร่งขึ้นช่วงท้าย (ชั้นสูงคุ้มกว่าตามความยาก)

/** ชั้นสูงสุดที่เคยผ่าน → โบนัสเหรียญ idle/วัน · เพิ่มทุกชั้น 1→50 แล้วตัน (ปัดลง 5) */
export function getTowerBonus(bestFloor) {
  const b = Math.floor(bestFloor || 0)
  if (b < 1) return 0
  const f = Math.min(TOWER_MAX, b)
  const t = Math.pow((f - 1) / (TOWER_MAX - 1), TOWER_BONUS_POW)  // 0 ที่ชั้น 1 → 1 ที่ชั้น 50
  const raw = TOWER_BONUS_MIN + (TOWER_BONUS_MAX - TOWER_BONUS_MIN) * t
  return Math.round(raw / 5) * 5
}

// floor → โซนแฟนซีตาม tier (UI หอคอย) — ช่วงเดียวกับ getFloorTeam (tier 12.5)
const ZONES = [
  { name: 'ลานประลอง',     art: '🛡️', color: '#84cc16', from: 1,  to: 12 },
  { name: 'หอเวทเก่า',      art: '🔮', color: '#60a5fa', from: 13, to: 25 },
  { name: 'ปราการอสูร',     art: '👹', color: '#c084fc', from: 26, to: 38 },
  { name: 'ยอดหอคอยมังกร', art: '🐉', color: '#fbbf24', from: 39, to: 50 },
]
export function floorZone(floor) {
  const f = Math.max(1, Math.min(TOWER_MAX, Math.floor(floor) || 1))
  return ZONES.find(z => f >= z.from && f <= z.to) || ZONES[ZONES.length - 1]
}
export const TOWER_BONUS_FLOORS = [10, 20, 30, 40, 50]  // แลนด์มาร์กหลักสิบ (หมุดอ้างอิงบนแถบ — โบนัสจริงเพิ่มทุกชั้น)
