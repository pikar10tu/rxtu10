// สนามประลอง — ตรรกะล้วน (ไม่แตะ Firestore/Vue) · เทส: node --test src/utils/arenas.test.js
// ข้อมูลผู้เล่น: users.arenas = { owned: [id], on: id|null, champ: { 'YYYY-MM': อันดับ } }
import { ARENAS, DEFAULT_ARENA, getArena, arenaPrice } from '../data/arenas.js'

const TZ = 7 * 3600000   // ช่วงขายลิมิเต็ดตัดตามเวลาไทย (เหมือน pvpSeason)

/** ของที่มี/ใส่อยู่ จาก user doc — กรองของนอกทะเบียน · สนามฟรีมีเสมอ · on ไม่อยู่ใน owned = สนามฟรี */
export function arenaOf(u) {
  const a = u?.arenas || {}
  const owned = [DEFAULT_ARENA, ...(Array.isArray(a.owned) ? a.owned : [])
    .filter(id => id !== DEFAULT_ARENA && getArena(id))]
  const on = a.on && owned.includes(a.on) ? a.on : DEFAULT_ARENA
  const champ = a.champ && typeof a.champ === 'object' ? { ...a.champ } : {}
  return { owned: [...new Set(owned)], on, champ }
}

const thDay = (now) => new Date(now + TZ).toISOString().slice(0, 10)   // 'YYYY-MM-DD' เวลาไทย

/** ซื้อได้ตอนนี้ไหม (ไม่สนว่ามีแล้วหรือยัง) */
export function onSale(a, now = Date.now()) {
  if (!a) return false
  if (a.src === 'shop') return true
  if (a.src !== 'limited' || !a.sale) return false
  const d = thDay(now)
  return d >= a.sale.from && d <= a.sale.to
}

/** รายการในแท็บร้าน — ของที่ขายอยู่ และยังไม่มี */
export function shopList(u, now = Date.now()) {
  const { owned } = arenaOf(u)
  return ARENAS.filter(a => onSale(a, now) && !owned.includes(a.id))
}

/** → { ok, reason: 'unknown'|'owned'|'closed'|'coins'|null, price } */
export function canBuyArena(u, id, now = Date.now()) {
  const a = getArena(id)
  if (!a) return { ok: false, reason: 'unknown', price: 0 }
  const price = arenaPrice(a)
  if (arenaOf(u).owned.includes(id)) return { ok: false, reason: 'owned', price }
  if (!onSale(a, now)) return { ok: false, reason: 'closed', price }
  if ((u?.coins || 0) < price) return { ok: false, reason: 'coins', price }
  return { ok: true, reason: null, price }
}

/** ค่า arenas ใหม่หลังซื้อ (ใส่ทันที) */
export function afterBuyArena(u, id) {
  const cur = arenaOf(u)
  return { ...cur, owned: [...cur.owned, id], on: id }
}

/** ใส่สนาม — ใส่ได้เฉพาะของที่มี */
export function afterWearArena(u, id) {
  const cur = arenaOf(u)
  return cur.owned.includes(id) ? { ...cur, on: id } : cur
}

/** ค่าที่ขี่แถว roster: สนามฟรี = null (ไม่ใส่คีย์) · แชมป์พ่วงอันดับ 'ch-2026-09#3' */
export function rosterArena(u) {
  const { on, champ } = arenaOf(u)
  if (on === DEFAULT_ARENA) return null
  const a = getArena(on)
  if (a?.src === 'champ') return `${on}#${Number(champ[a.season]) || 10}`
  return on
}

/** สตริงแบบแถว roster → { id, rank } · 'tower' = พื้นหอคอย · ไม่รู้จัก = สนามฟรี
 *  rank 4–10 ยุบเป็น 10 เพราะใช้ป้ายเดียวกัน */
export function parseArenaRef(ref) {
  if (ref === 'tower') return { id: 'tower', rank: null }
  const [id, r] = String(ref || '').split('#')
  const a = getArena(id)
  if (!a) return { id: DEFAULT_ARENA, rank: null }
  if (a.src !== 'champ') return { id, rank: null }
  const n = Number(r)
  return { id, rank: n >= 1 && n <= 3 ? n : 10 }
}
