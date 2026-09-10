// src/utils/gachaEvent.js
// สถานะ "ตู้อัญเชิญพิเศษ" — pure ทั้งหมด อ่านจาก config/app.gachaEvent
// สเปก: docs/superpowers/specs/2026-09-03-passive-v2-design.md §6 · แผน: plans/2026-09-11-passive-v2-p5-event-gacha.md
//
// 🔴 ตู้ปิดเองด้วยนาฬิกาเท่านั้น — ไม่มีธง "ปิดแล้ว" แยก และไม่มีปุ่มแอดมินที่ต้องกดเพื่อให้เพ็ทไหลเข้าตู้ปกติ
//    คลังที่แจกได้ (`releasedPets` ใน petCatalog.js) อ่าน `endsAt` ตัวเดียวกันนี้ ⇒ เส้นเวลาต่อกันสนิท
//    (มีเทสตรึงไว้ว่าไม่มีช่วงที่ตู้ปิดแล้วแต่เพ็ทยังไม่ไหลเข้าคลังปกติ)
// 🔴 รูปคอนฟิกพัง/อ่านไม่ออก = ถือว่าไม่มีอีเวนต์ ห้าม fail-open — คอนฟิกมาจาก Firestore ซึ่งเดาจากรีโปไม่ได้
// ⚠️ `endsAt` ต้องเป็นมิลลิวินาที (number) หรือ Firestore Timestamp เท่านั้น — ห้ามเขียนด้วย serverTimestamp()
//    เพราะ snapshot ที่ยังไม่ยืนยันส่งค่ากลับมาเป็น null แล้วอีเวนต์จะหายเงียบ (CLAUDE.md ข้อ 10)

/** ตัวเด่นตั้งต้น = legendary รุ่น 2 ทั้งสามตัว · อยู่ในโค้ดเพื่อไม่ให้แอดมินต้องพิมพ์ id เอง (user เคาะ 11 ก.ย.)
 *  คอนฟิกยังทับได้ เผื่ออีเวนต์รอบหน้าใช้ตัวอื่น */
export const EVENT_FEATURED = ['lion', 'virus', 'gorilla']

function endsAtMs(ev) {
  const raw = ev && typeof ev === 'object' ? ev.endsAt : null
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw
  if (raw && typeof raw === 'object' && typeof raw.seconds === 'number') return raw.seconds * 1000
  return null
}

/** สถานะอีเวนต์ ณ เวลา now — `active` เป็นจริงจนถึงวินาที endsAt พอดี */
export function eventState(gachaEvent, now = Date.now()) {
  const endsAt = endsAtMs(gachaEvent)
  const active = endsAt !== null && now <= endsAt
  const featured = Array.isArray(gachaEvent?.featured) && gachaEvent.featured.length
    ? gachaEvent.featured
    : EVENT_FEATURED
  return {
    active,
    name: gachaEvent?.name || 'อัญเชิญพิเศษ',
    endsAt,
    featured,
    msLeft: active ? endsAt - now : 0,
  }
}

/** legendary ที่ตู้อีเวนต์ให้ได้ — ตัวเด่นที่ยังไม่มีมาก่อนเสมอ ครบแล้วตกไปทั้งกอง
 *  🔑 ใช้กลไก new-first เดิมของ pickLegendary() ไม่ได้เขียนสุ่มใหม่ — แค่ส่งรายชื่อที่แคบลงเข้าไป
 *  ⚠️ กรอง id ที่ไม่มีในคลังทิ้งเสมอ — ไม่งั้นคอนฟิกพิมพ์ผิดจะกลายเป็นการแจกเพ็ทที่ไม่มีตัวตน */
export function eventLegendaryIds(featured, ownedLegendaryIds, catalog) {
  const all = (catalog || []).filter(p => p.rarity === 'legendary').map(p => p.id)
  const valid = (featured || []).filter(id => all.includes(id))
  const owned = new Set(ownedLegendaryIds || [])
  const unowned = valid.filter(id => !owned.has(id))
  return unowned.length ? unowned : all
}

/** "เหลืออีก X วัน HH:MM" — ข้อความเดียวที่ทั้งหน้าร้านและแอดมินใช้ (ห้ามเขียนซ้ำสองที่แล้วเพี้ยนกันเอง) */
export function timeLeftText(msLeft) {
  const ms = Math.max(0, msLeft || 0)
  const total = Math.floor(ms / 1000)
  const d = Math.floor(total / 86400)
  const h = Math.floor((total % 86400) / 3600)
  const m = Math.floor((total % 3600) / 60)
  const hh = String(h).padStart(2, '0')
  const mm = String(m).padStart(2, '0')
  return d > 0 ? `${d} วัน ${hh}:${mm}` : `${hh}:${mm}`
}
