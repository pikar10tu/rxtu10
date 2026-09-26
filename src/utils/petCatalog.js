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

/** wave ของอีเวนต์ใน config — config ก.ย. เขียนก่อนมีฟิลด์นี้ (มีแต่ endsAt) ⇒ ถือเป็น 2
 *  ไม่มี config/อ่าน endsAt ไม่ออก = 1 (fail-closed: ไม่ปล่อยรุ่นใหม่) */
export function eventWave(gachaEvent) {
  if (endsAtMs(gachaEvent) === null) return 1
  const w = Number(gachaEvent.wave)
  return Number.isInteger(w) && w >= 2 ? w : 2
}

const waveOf = (p) => p.wave || 1

/** เพ็ทรุ่นแรก — คลังที่ต้องนิ่งตลอดกาล (บอทหอคอย) */
export const wave1Pets = () => PETS.filter(p => waveOf(p) === 1)

/** "ตู้ปกติ" แจกอะไรได้ตอนนี้ — รุ่นของอีเวนต์ปัจจุบันเข้าตู้ปกติเมื่ออีเวนต์จบเท่านั้น
 *  (user: ตู้คงที่เลือกได้ทุกตัว ยกเว้นตัวใหม่ของเดือนนั้น) · รุ่นที่ใหม่กว่าอีเวนต์ = ยังไม่เปิดตัว ไม่มีทางหลุด */
export function releasedPets(gachaEvent = null, now = Date.now()) {
  const w = eventWave(gachaEvent)
  const ends = endsAtMs(gachaEvent)
  const max = ends !== null && now > ends ? w : w - 1
  return PETS.filter(p => waveOf(p) <= Math.max(1, max))
}

/** "หาได้จริงตอนนี้" = ตู้ปกติ + รุ่นของอีเวนต์ถ้าตู้ธีมยังเปิด — ใช้กับตัวหาร x/y · เควสเก็บครบ */
export function obtainablePets(gachaEvent = null, now = Date.now()) {
  if (!eventOpen(gachaEvent, now)) return releasedPets(gachaEvent, now)
  const w = eventWave(gachaEvent)
  return PETS.filter(p => waveOf(p) <= w)
}

/** ตู้อีเวนต์ยังเปิดอยู่ไหม — ตรรกะเดียวกับ gachaEvent.eventState() แต่เก็บไว้ที่นี่เพื่อไม่ให้สองไฟล์อ้างวนกัน */
function eventOpen(gachaEvent, now) {
  const ends = endsAtMs(gachaEvent)
  return ends !== null && now <= ends
}
