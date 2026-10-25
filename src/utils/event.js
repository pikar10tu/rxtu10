// อีเวนต์ประจำเดือน — ตรรกะล้วน (ไม่แตะ Firestore/Vue) · เทส: node --test src/utils/event.test.js
import { EVENTS } from '../data/events.js'
import { getCosmetic } from '../data/cosmetics.js'

/** อีเวนต์ที่เปิดอยู่ ณ now หรือ null */
export function activeEvent(now = Date.now(), list = EVENTS) {
  return list.find(e => now >= e.start && now <= e.end) || null
}

/** สถานะอีเวนต์ของผู้ใช้ — ค่าของอีเวนต์เก่าไม่นับ */
export function evtOf(u, ev) {
  const e = u?.evt
  if (!ev || !e || e.id !== ev.id) return { id: ev?.id || null, pts: 0, buy: {} }
  const out = { id: e.id, pts: Math.max(0, Number(e.pts) || 0), buy: e.buy && typeof e.buy === 'object' ? e.buy : {} }
  if (e.dun) out.dun = e.dun   // ตาชนะดันวันนี้ (utils/dungeon.js) — ต้องพกไว้ ไม่งั้นแลกของแล้วเขียนทั้งก้อนทับหาย
  if (e.dc) out.dc = Number(e.dc) || 0     // ขั้นดันเจี้ยนสูงสุดที่เคยผ่าน (ปลดขั้นถัดไป)
  if (e.got) out.got = Number(e.got) || 0  // แต้มที่เก็บได้รวมทั้งอีเวนต์ (ไม่หักตอนแลก) — achievement นักล่าฟักทอง
  return out
}

/** แต้มที่ได้จากรอบข้อสอบ */
export function quizPts(ev, answered, correct) {
  if (!ev) return 0
  return Math.max(0, answered | 0) * ev.perAnswer + Math.max(0, correct | 0) * ev.perCorrect
}

/** patch ให้แต้มจากข้อสอบ → { local, server } หรือ null
 *  อีเวนต์เดียวกัน = increment (ไม่ทับ buy) · อีเวนต์ใหม่ = เขียนทั้งก้อน */
export function grantPatch(u, ev, pts, inc) {
  if (!ev || !pts) return null
  const cur = evtOf(u, ev)
  const local = { evt: { ...cur, id: ev.id, pts: cur.pts + pts, got: (cur.got || 0) + pts } }
  const same = u?.evt?.id === ev.id
  const server = same ? { 'evt.pts': inc(pts), 'evt.got': inc(pts) } : { evt: { id: ev.id, pts, got: pts, buy: {} } }
  return { local, server }
}

/** ของในร้านอีเวนต์ = ของแต่งตัว (ev ตรง) + ของจิปาถะ */
export function shopItems(ev, cosmetics) {
  if (!ev) return []
  return [
    ...cosmetics.filter(c => c.ev === ev.id).map(c => ({ ...c, type: 'cos', price: c.pk })),
    ...ev.misc.map(m => ({ ...m, type: 'misc' })),
  ]
}

/** แลกได้ไหม → { ok, reason: 'unknown'|'owned'|'max'|'pts' } */
export function canRedeem(u, ev, item) {
  if (!ev || !item) return { ok: false, reason: 'unknown' }
  const cur = evtOf(u, ev)
  if (item.type === 'cos') {
    if (!getCosmetic(item.id)) return { ok: false, reason: 'unknown' }
    if ((u?.cosmetics?.owned || []).includes(item.id)) return { ok: false, reason: 'owned' }
  } else if ((cur.buy[item.id] || 0) >= item.max) return { ok: false, reason: 'max' }
  if (cur.pts < item.price) return { ok: false, reason: 'pts' }
  return { ok: true, reason: null }
}

/** evt ใหม่หลังแลก (ทั้งก้อน — เขียนครั้งละคนเดียว ไม่ชนใคร) */
export function evtAfterRedeem(u, ev, item) {
  const cur = evtOf(u, ev)
  return { ...cur, id: ev.id, pts: cur.pts - item.price, buy: { ...cur.buy, [item.id]: (cur.buy[item.id] || 0) + 1 } }
}

/** แลกแต้มเป็นเหรียญ n แต้ม → { ok, evt, coins } (evt ทั้งก้อน — พก buy/dun ไปด้วย) */
export function exchangePatch(u, ev, n) {
  const cur = evtOf(u, ev)
  const k = Math.floor(Number(n) || 0)
  if (!ev || !ev.coinRate || k <= 0 || k > cur.pts) return { ok: false }
  return { ok: true, evt: { ...cur, id: ev.id, pts: cur.pts - k }, coins: k * ev.coinRate }
}

/** achievement นักล่าฟักทอง: เก็บแต้มรวมทั้งอีเวนต์ครบเท่านี้ */
export const EVT_HUNTER_GOAL = 500
