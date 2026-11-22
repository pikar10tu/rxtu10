// กติกาย่อยแบบ pure — ไม่มี state machine ที่นี่ (ดู engine.js)
import { GAME, GROUPS, TILES, SIDES, TOURS, GROUP_TILES } from '../../data/tycoon/board.js'

// rng แบบ seed (mulberry32) — state เป็นตัวเลขเดียว เก็บใน game state ได้ ทุกเครื่องเล่นซ้ำได้เหมือนกัน
export function rngNext(s) {
  let t = (s + 0x6D2B79F5) >>> 0
  let r = Math.imul(t ^ (t >>> 15), t | 1)
  r ^= r + Math.imul(r ^ (r >>> 7), r | 61)
  return { s: t, v: ((r ^ (r >>> 14)) >>> 0) / 4294967296 }
}

export const landPrice = (idx) => TILES[idx].type === 'tour' ? GAME.tourPrice : GROUPS[TILES[idx].group].land
export const houseCost = (idx) => Math.round(landPrice(idx) * 0.5)
export const landmarkCost = (idx) => Math.round(landPrice(idx) * 1.5)
// level: 0 = ที่ดินเปล่า · 1–3 = บ้าน · 4 = แลนด์มาร์ค
const TOLL_MULT = [0.2, 0.6, 1.4, 2.8, 5]

/** ค่าผ่านทางฐาน (ยังไม่คูณเทศกาล/ไฟดับ) */
export function baseToll(idx, level, tiles) {
  if (TILES[idx].type === 'tour') {
    const owner = tiles[idx]?.owner
    const n = TOURS.filter(t => tiles[t]?.owner === owner).length
    return GAME.tourToll * n
  }
  return Math.round(landPrice(idx) * TOLL_MULT[level])
}

/** มูลค่าที่ลงทุนไป (ใช้คิดซื้อต่อ/ขายคืน/ทรัพย์สิน) */
export function propertyValue(idx, level) {
  if (TILES[idx].type === 'tour') return GAME.tourPrice
  const houses = Math.min(level, 3)
  return landPrice(idx) + houses * houseCost(idx) + (level === 4 ? landmarkCost(idx) : 0)
}

export const takeoverPrice = (idx, level) => propertyValue(idx, level) * 2
export const sellPrice = (idx, level) => Math.floor(propertyValue(idx, level) / 2)
/** เพดานบ้านในตาเดียว: ยังไม่เคยผ่านจุดเริ่มต้น 2 · ผ่านแล้ว 3 */
export const maxHouses = (laps) => (laps >= 1 ? 3 : 2)
export const canTakeover = (idx, level) => TILES[idx].type === 'city' && level < 4

export function netWorth(player, seat, tiles) {
  let v = player.cash
  for (const [i, t] of Object.entries(tiles)) if (t.owner === seat) v += propertyValue(+i, t.level)
  return v
}

/** ชนะพิเศษ → 'line' | 'triple' | 'tour' | null */
export function specialWin(seat, tiles) {
  const own = (i) => tiles[i]?.owner === seat
  if (SIDES.some(side => side.filter(i => TILES[i].type === 'city' || TILES[i].type === 'tour').every(own))) return 'line'
  if (GROUP_TILES.filter(g => g.every(own)).length >= 3) return 'triple'
  if (TOURS.every(own)) return 'tour'
  return null
}
