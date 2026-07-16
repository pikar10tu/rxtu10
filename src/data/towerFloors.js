// ════════════════════════════════════════════════════════════
//  หอคอย PvE 100 ชั้น — ทีมบอทรายชั้น (สูตร deterministic) + โบนัสรายได้
//  3 องก์: 1–20 ต้น(สนุก) · 21–69 กลาง/ปลายไต่ · 70–100 ตัน(วัดการจัดทีม)
// ════════════════════════════════════════════════════════════
import { PETS } from './index.js'
import { BATTLE_SLOTS } from './residence.js'

export const TOWER_MAX = 100

const ELS = ['fist', 'scissors', 'paper']
const RARITY_BY_TIER = ['common', 'rare', 'epic', 'legendary']
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

function rng(seed) {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** จำนวนบอท/ทีม — ก้าวแรกลุ้นชนะ (1 ตัว) แล้วไต่เป็นเต็มทีม */
export function botCount(f) {
  return f === 1 ? 1 : f === 2 ? 2 : BATTLE_SLOTS
}

// tier (rarity) boundaries — ชั้นสูงสุดของแต่ละ tier (เกิน epic = legendary)
const TIER_MAX_FLOOR = { common: 20, rare: 40, epic: 55 }

// grade ramp: 0 ถึง GRADE_ZERO_FLOOR · ไต่ 1→4 ช่วง GRADE_RAMP_START–(GRADE_V_FLOOR-1) · V(5) ที่ GRADE_V_FLOOR ขึ้นไป
const GRADE_ZERO_FLOOR = 20                     // ≤ นี้ = เกรด 0
const GRADE_RAMP_START = GRADE_ZERO_FLOOR + 1   // ชั้นแรกที่เริ่มไต่เกรด
const GRADE_V_FLOOR = 70                        // ≥ นี้ = เกรด 5 (V)
const GRADE_RAMP_DIV = 12.25                    // ตัวหารช่วงไต่ 21–69

/** tier (rarity index) ตามชั้น: common 1–20 · rare 21–40 · epic 41–55 · legendary 56–100 */
function tierOf(f) {
  if (f <= TIER_MAX_FLOOR.common) return 0
  if (f <= TIER_MAX_FLOOR.rare) return 1
  if (f <= TIER_MAX_FLOOR.epic) return 2
  return 3
}

/** เกรดบอท: 0 ถึงชั้น 20 · ไต่ 1→4 ช่วง 21–69 · V(5) ที่ชั้น 70+ */
export function botGrade(f) {
  if (f <= GRADE_ZERO_FLOOR) return 0
  if (f >= GRADE_V_FLOOR) return 5
  return clamp(1 + Math.floor((f - GRADE_RAMP_START) / GRADE_RAMP_DIV), 1, 4)
}

/** ธาตุของบอทแต่ละสล็อต
 *  - ชั้น <GRADE_V_FLOOR (หรือ <3 ตัว): ครบ 3 ธาตุ (ธาตุหักล้าง — วัดพลัง/ดวง)
 *  - ชั้น 70–100: เอน theme → "เคาน์เตอร์" (ELS[(t+2)%3]) คือคำตอบเสมอ + สลับ composition รายชั้น
 *    RPS: ELS[k] ชนะ ELS[(k+1)%3] แพ้ ELS[(k+2)%3] · mirror = neutral
 */
function floorElements(f, count) {
  if (f < GRADE_V_FLOOR || count < 3) {
    return Array.from({ length: count }, (_, i) => ELS[(f + i) % 3])
  }
  const t = f % 3
  const theme   = ELS[t]
  const counter = ELS[(t + 2) % 3]    // ธาตุที่ชนะ theme (= คำตอบผู้เล่น เสมอ)
  const variant = Math.floor(f / 3) % 2
  return variant === 0
    ? [theme, theme, theme]           // ธาตุเดียวล้วน → เคาน์เตอร์กวาด
    : [theme, theme, counter]         // 2 theme + 1 counter → เคาน์เตอร์ยังได้เปรียบ (สล็อต 3 = mirror ปลอดภัย)
}

/** ชั้น → ทีมบอท (rarity/เกรด/จำนวน/ธาตุ ตามชั้น) */
export function getFloorTeam(floor) {
  const f = clamp(Math.floor(floor) || 1, 1, TOWER_MAX)
  const rand = rng((f * 2654435761) >>> 0)
  const rarity = RARITY_BY_TIER[tierOf(f)]
  const grade = botGrade(f)
  const count = botCount(f)
  const elements = floorElements(f, count)
  const team = []
  for (let i = 0; i < count; i++) {
    const element = elements[i]
    const pool = PETS.filter(p => p.rarity === rarity && p.element === element)
    const fallback = PETS.filter(p => p.element === element)
    const src = pool.length ? pool : fallback
    const def = src[Math.floor(rand() * src.length)]
    team.push({ id: def.id, rarity: def.rarity, element: def.element, grade })
  }
  return team
}

// โบนัสรายได้ idle/วัน จากชั้นสูงสุด — ตันที่ชั้น 70 (= จุดพลังบอทตัน)
export const BONUS_CAP_FLOOR = 70      // แยกจาก TOWER_MAX โดยตั้งใจ (คุมเพดานเศรษฐกิจ)
export const TOWER_BONUS_MIN = 50      // โบนัส/วัน ชั้น 1
export const TOWER_BONUS_MAX = 20000   // โบนัส/วัน ชั้น 70+ (เพิ่มจาก 12000)
const TOWER_BONUS_POW = 1.7            // >1 = เร่งช่วงท้าย

/** ชั้นสูงสุด → โบนัสเหรียญ idle/วัน · เพิ่มทุกชั้น 1→70 แล้ว flat (ปัด 5) */
export function getTowerBonus(bestFloor) {
  const b = Math.floor(bestFloor || 0)
  if (b < 1) return 0
  const f = Math.min(BONUS_CAP_FLOOR, b)
  const t = Math.pow((f - 1) / (BONUS_CAP_FLOOR - 1), TOWER_BONUS_POW)
  const raw = TOWER_BONUS_MIN + (TOWER_BONUS_MAX - TOWER_BONUS_MIN) * t
  return Math.round(raw / 5) * 5
}

// floor → โซนแฟนซี (UI) — 5 โซน · โซนที่ 5 = ช่วงตัน "วัดฝีมือ"
const ZONES = [
  { name: 'ลานประลอง',      art: '🛡️', color: '#84cc16', from: 1,  to: 20 },
  { name: 'หอเวทเก่า',       art: '🔮', color: '#60a5fa', from: 21, to: 40 },
  { name: 'ปราการอสูร',      art: '👹', color: '#c084fc', from: 41, to: 55 },
  { name: 'ยอดหอคอยมังกร',  art: '🐉', color: '#fbbf24', from: 56, to: 69 },
  { name: 'บัลลังก์ราชันย์',  art: '👑', color: '#f43f5e', from: 70, to: 100 },
]
export function floorZone(floor) {
  const f = clamp(Math.floor(floor) || 1, 1, TOWER_MAX)
  return ZONES.find(z => f >= z.from && f <= z.to) || ZONES[ZONES.length - 1]
}
export const TOWER_BONUS_FLOORS = [20, 40, 60, 70]  // หมุดเหรียญ — ถึงชั้น 70 (โบนัส flat หลังจากนั้น)
