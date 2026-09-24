// ร้านตกแต่ง — ตรรกะล้วน (ไม่แตะ Firestore/Vue) · เทส: node --test src/utils/cosmetics.test.js
import { getCosmetic } from '../data/cosmetics.js'

/** ของที่ใส่อยู่ + ของที่มี จาก user doc (กันค่าเพี้ยน/ของที่ถูกลบจากร้าน) */
export function cosOf(u) {
  const c = u?.cosmetics || {}
  const owned = Array.isArray(c.owned) ? c.owned.filter(id => getCosmetic(id)) : []
  const wear = (k) => (c[k] && owned.includes(c[k]) && getCosmetic(c[k])?.kind === k) ? c[k] : null
  return { owned, n: wear('n'), f: wear('f'), b: wear('b'), g: wear('g') }
}

/** ซื้อได้ไหม → { ok, reason: 'unknown'|'owned'|'coins', price } */
export function canBuy(u, id) {
  const item = getCosmetic(id)
  if (!item) return { ok: false, reason: 'unknown', price: 0 }
  if (cosOf(u).owned.includes(id)) return { ok: false, reason: 'owned', price: item.price }
  if ((u?.coins || 0) < item.price) return { ok: false, reason: 'coins', price: item.price }
  return { ok: true, reason: null, price: item.price }
}

/** ค่า cosmetics ใหม่หลังซื้อ (ใส่ให้ทันที) */
export function afterBuy(u, id) {
  const cur = cosOf(u)
  const kind = getCosmetic(id).kind
  return { ...cur, owned: [...cur.owned, id], [kind]: id }
}

/** ใส่/ถอด (id = null ถอดหมวดนั้น) — ใส่ได้เฉพาะของที่มี */
export function afterWear(u, kind, id) {
  const cur = cosOf(u)
  if (id && !cur.owned.includes(id)) return cur
  return { ...cur, [kind]: id || null }
}

/** ชิ้นที่ทั้งรุ่นเห็น (ขี่แถว roster) — เฉพาะที่ใส่อยู่ · ไม่มีเลย = null (ไม่ใส่คีย์ในแถว) */
export function rosterCos(u) {
  const { n, f, b } = cosOf(u)
  const out = {}
  if (n) out.n = n
  if (f) out.f = f
  if (b) out.b = b
  return Object.keys(out).length ? out : null
}
