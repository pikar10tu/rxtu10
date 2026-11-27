// 🧍 ตู้เสื้อผ้าตุ๊กตา — ตรรกะล้วน (ไม่แตะ Firestore/Vue) · เทส: node --test src/utils/doll.test.js
// users/{uid}.doll = { owned: [id…], eq: { s,c,h,e,m,t,b,k,o,x,a,i,w } } (handover §6)
// แบบเดียวกับ utils/cosmetics.js: ซื้อครั้งเดียวเก็บถาวร · ใส่ได้ช่องละ 1 · ลองใส่ก่อนซื้อ · ซื้อรวดเดียวทั้งชุดที่ลอง
import { hiddenSlots } from './dollRender.js'
import { PART, SKINS, HAIRC, FREE, DEFAULT_EQ, REQUIRED, SETS } from '../data/dollParts.js'
import { questUnlocked } from './dollQuests.js'

const SLOT_KEYS = ['s', 'c', 'h', 'e', 'm', 'f', 'j', 't', 'b', 'k', 'n', 'x', 'a', 'r', 'i', 'w']

/** ชิ้นที่เคยอยู่ช่องอื่นแล้วย้ายช่อง (27 พ.ย. แมสก์/ต่างหู a → r) — ย้ายตาม slot ปัจจุบันของชิ้น · ช่องปลายทางมีของอยู่แล้วไม่ทับ */
export function migrateEq(eq) {
  if (!eq || typeof eq !== 'object') return eq
  const out = { ...eq }
  for (const [k, id] of Object.entries(eq)) {
    const s = PART[id]?.slot
    if (s && s !== k && k !== 's' && k !== 'c') { delete out[k]; if (!out[s]) out[s] = id }
  }
  return out
}
const isColor = (k, v) => (k === 's' ? SKINS : HAIRC).some(o => o.id === v)

/** ชิ้นนี้ฟรีไหม (สีผิว/สีผมฟรีหมด) */
export const isFree = (id) => FREE.has(id)

/** ของที่มี + ชุดที่ใส่ จาก user doc — กันค่าเพี้ยน/ชิ้นที่ถูกลบ/ใส่ของที่ไม่มี */
export function dollOf(u) {
  const d = u?.doll || {}
  const bought = Array.isArray(d.owned) ? d.owned.filter(id => PART[id] && !isFree(id)) : []
  // 🏅 ชุดภารกิจ: ทำเงื่อนไขครบ = มีของ (ไม่ต้องเขียน owned · 27 พ.ย.)
  const owned = [...new Set([...bought, ...questUnlocked(u)])]
  const has = (id) => isFree(id) || owned.includes(id)
  const raw = d.eq && typeof d.eq === 'object' ? migrateEq(d.eq) : DEFAULT_EQ   // ยังไม่เคยแต่ง = ชุดเริ่มต้น (รวมรองเท้า)
  const eq = {}
  for (const k of SLOT_KEYS) {
    const v = raw[k]
    if (k === 's' || k === 'c') { eq[k] = isColor(k, v) ? v : DEFAULT_EQ[k]; continue }
    if (v && PART[v]?.slot === k && has(v)) eq[k] = v
    else if (REQUIRED.includes(k)) eq[k] = DEFAULT_EQ[k]
  }
  return { owned, eq }
}

/** ลองใส่ชิ้น id ในช่อง slot (id = null ถอด) · คืน eq ใหม่ — ไม่สนว่ามีของไหม (ลองได้ทุกชิ้น)
 *  กติกาชุดเต็มตัว (handover §4): เลือกท่อนล่างขณะใส่ชุดเต็มตัว = ถอดชุดกลับเป็นเสื้อเริ่มต้น */
export function tryOn(eq, slot, id) {
  const next = { ...eq }
  if (!id) {
    if (REQUIRED.includes(slot)) return next
    delete next[slot]; return next
  }
  next[slot] = id
  if (slot === 'b' && PART[eq.t]?.full) next.t = DEFAULT_EQ.t
  return next
}

/** ชิ้นที่ต้องซื้อถ้าจะใส่ชุดนี้ → { items: [part…], total } (ไม่นับช่องที่ถูกชุดเต็มตัวบัง) */
export function cartFor(u, eq) {
  const { owned } = dollOf(u)
  const covered = new Set()
  for (const id of Object.values(eq)) { const p = PART[id]; if (p?.full) covered.add('b'); for (const c of p?.covers || []) covered.add(c) }
  const items = []
  for (const [k, id] of Object.entries(eq)) {
    if (k === 's' || k === 'c' || covered.has(k)) continue
    const p = PART[id]
    if (p && !isFree(id) && !owned.includes(id)) items.push(p)
  }
  return { items, total: items.reduce((a, p) => a + p.price, 0) }
}

/** ซื้อทั้งชุดได้ไหม → { ok, reason: 'none'|'limited'|'coins'|null, total } · limited = ของลิมิเต็ด ได้จากจดหมายเท่านั้น */
export function canBuyCart(u, eq) {
  const { items, total } = cartFor(u, eq)
  if (!items.length) return { ok: false, reason: 'none', total: 0 }
  if (items.some(p => p.limited)) return { ok: false, reason: 'limited', total }
  if ((u?.coins || 0) < total) return { ok: false, reason: 'coins', total }
  return { ok: true, reason: null, total }
}

/** ค่า doll ใหม่หลังซื้อทั้งชุด (ใส่ให้ทันที) */
export function afterBuyCart(u, eq) {
  const cur = dollOf(u)
  const { items } = cartFor(u, eq)
  const owned = [...cur.owned, ...items.map(p => p.id).filter(id => !cur.owned.includes(id))]
  return dollOf({ doll: { owned, eq } })
}

/** ใส่ชุดที่ลอง (เฉพาะเมื่อมีครบทุกชิ้นแล้ว) — ไม่ครบ = คืนของเดิม */
export function afterEquip(u, eq) {
  if (cartFor(u, eq).items.length) return dollOf(u)
  return dollOf({ doll: { owned: dollOf(u).owned, eq } })
}

/** ชุดที่ลองต่างจากที่ใส่อยู่ไหม */
export function sameEq(a, b) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const k of keys) if ((a[k] || null) !== (b[k] || null)) return false
  return true
}

// ✨ ออร่าทุกชิ้นที่ใส่และมีออร่า (user 19 พ.ย.: ใส่ของแพงหลายชิ้น = ออร่าหลายอัน) · แพงสุดก่อน · ชิ้นที่ถูกชุดเต็มตัวบังไม่นับ
export function aurasOf(eq) {
  const list = []
  const hidden = hiddenSlots(eq || {})   // 24 พ.ย. ชิ้นที่ถูกชุดบัง (covers/full) ไม่มีออร่า — เดิมเช็คแค่ b
  for (const [k, id] of Object.entries(eq || {})) {
    if (k === 's' || k === 'c') continue
    const p = PART[id]
    if (!p?.aura || p.slot !== k) continue
    if (hidden.has(k)) continue
    list.push(p)
  }
  const auras = list.sort((a, b) => b.price - a.price).map(p => p.aura)
  // 🎁 ครบเซ็ต → ออร่าเพิ่ม
  const worn = new Set(Object.entries(eq || {}).filter(([k, id]) => PART[id]?.slot === k).map(([, id]) => id))
  // 27 พ.ย. user: ครบเซ็ตทุกเซ็ต = เส้นแสงเรืองรอบตัว (glow) ยืนพื้น + ออร่าเฉพาะเซ็ต (หมอก/อนุภาค) · ขึ้นหน้าแถวให้ไม่โดนตัดเพดานอนุภาค 3 แหล่ง
  const setAuras = []
  for (const set of SETS) if (set.parts.every(id => worn.has(id))) setAuras.push({ type: 'glow', color: set.glow || set.aura.color }, set.aura)
  auras.unshift(...setAuras)
  return auras
}

/** เซ็ตที่ใส่ครบอยู่ (โชว์ป้ายในห้องแต่งตัว) */
export function setsWorn(eq) {
  const worn = new Set(Object.entries(eq || {}).filter(([k, id]) => PART[id]?.slot === k).map(([, id]) => id))
  return SETS.filter(s => s.parts.every(id => worn.has(id)))
}
