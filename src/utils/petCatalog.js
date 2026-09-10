// src/utils/petCatalog.js
// ด่านเดียวที่ตอบว่า "ตอนนี้เพ็ทตัวไหนแจกให้ผู้เล่นได้" — pure ทั้งหมด ไม่แตะ store/Firestore
// สเปก: docs/superpowers/specs/2026-09-10-passive-v2-p3-design.md §2
//
// 🔑 `wave` คือ "รุ่นที่เข้าเกม" ไม่ใช่ "ยังไม่เปิด" — ฟิลด์นี้อยู่ถาวร ไม่ถูกลบตอนเปิดตัว (P5)
//    ของที่ต้องนิ่งตลอดกาล (ทีมบอทหอคอย) อ้าง `wave1Pets()` · ของที่เปิดตามอีเวนต์อ้าง `releasedPets()`
//
// 🔴 ดีฟอลต์ต้องปิดเสมอ: ไม่มี config / config รูปพัง = คืนแค่ wave 1
//    (flag ใน Firestore เป็นค่าที่เดาจากรีโปไม่ได้ — fail-open แปลว่าเพ็ทที่ยังไม่เปิดตัวหลุดออกกาชาเงียบๆ)
import { PETS } from '../data/index.js'

/** ms จาก endsAt ที่รับได้ทั้งเลขล้วนและ Firestore Timestamp — อ่านไม่ออกคืน null (= ยังไม่เปิด) */
function endsAtMs(gachaEvent) {
  const raw = gachaEvent && typeof gachaEvent === 'object' ? gachaEvent.endsAt : null
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw
  if (raw && typeof raw === 'object' && typeof raw.seconds === 'number') return raw.seconds * 1000
  return null
}

/** เพ็ทรุ่นแรก 27 ตัว — คลังที่ต้องนิ่งตลอดกาล */
export const wave1Pets = () => PETS.filter(p => p.wave !== 2)

/** เพ็ทที่ "แจกให้ผู้เล่นได้" ตอนนี้ · อีเวนต์หมดเวลาแล้ว = ไหลเข้าคลังปกติเองโดยไม่ต้องกดปุ่ม */
export function releasedPets(gachaEvent = null, now = Date.now()) {
  const ends = endsAtMs(gachaEvent)
  if (ends !== null && now > ends) return PETS.slice()
  return wave1Pets()
}
