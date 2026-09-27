// src/utils/pvpMatch.js
// PvP matchmaking — pure: คัดย่านเรตใกล้แล้วสุ่ม · บอทเติมช่องที่เหลือใน useArena
// รับ candidate ที่ rosterOpponents() กรองมาแล้ว (ไม่มีตัวเอง · มีทีม · มี rating)
import { mulberry32 } from './seededRng.js'

export const BOARD_SIZE  = 5    // ขนาดกระดาน = เท่าโควตาบุก/วัน (คนจริงก่อน บอทเติมที่เหลือ)
export const NEAR_WINDOW = 12   // เอาคนเรตใกล้สุด N คนเป็น "ย่านใกล้" ก่อนสุ่ม

/** สับไพ่ในที่ (Fisher-Yates) ด้วย rng ที่ส่งเข้ามา */
function shuffle(arr, rand) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp
  }
  return arr
}

/**
 * สุ่มคนจริง n คนในย่านเรตใกล้ myRating (seeded → นิ่งต่อ seed เดียวกัน)
 *
 * ⚠️ ต้องสับไพ่ 2 รอบ ทำครึ่งเดียวไม่แก้ปัญหา:
 *   รอบ 1 (ก่อน sort) — ตอนเปิดตัวทั้งชั้นปียังไม่เคยเล่น PvP เรตจึงเท่ากันหมดที่ 1000
 *     ⇒ ระยะห่างเป็น 0 เท่ากันทุกคน ⇒ sort เสถียรไม่สลับอะไรเลย
 *     ⇒ ย่านใกล้กลายเป็น "12 คนแรกตามลำดับคีย์ใน roster doc" ตายตัวถาวร (เพื่อน 93/105 ไม่มีวันโผล่)
 *     สับก่อน sort ⇒ คนที่ระยะเท่ากันคงลำดับที่เพิ่งสับไว้ = สลับที่กันจริงตาม seed
 *   รอบ 2 (หลังตัดย่าน) — สุ่มผู้ท้าชิงจากย่านใกล้ตามปกติ
 */
export function pickHumanOpponents(candidates, myRating, seed = 0, n = BOARD_SIZE, window = NEAR_WINDOW) {
  const rand = mulberry32(seed >>> 0)
  // copy ก่อน — candidates มาจาก computed ของ store ห้าม mutate
  const near = shuffle([...(candidates || [])], rand)
    .sort((a, b) => Math.abs(a.rating - myRating) - Math.abs(b.rating - myRating))
    .slice(0, Math.max(window, n))
  return shuffle(near, rand).slice(0, n)
}

// ── Matchmaking สุ่มคู่เดียว (28 ก.ย. 2026 — แทนกระดานเลือกคู่) ──
//  ห้ามได้คนเดิมติด + กันสลับ A-B-A-B: บล็อกคู่ล่าสุด RECENT_BLOCK คน
//  คนในย่านน้อย ค่อยๆ ผ่อน (บล็อก 3 → 2 → 1) · เหลือแต่คนล่าสุดคนเดียว = คืน null ให้ caller ใช้บอท
export const RECENT_BLOCK = 3

export function pickMatch(candidates, myRating, recent = [], seed = 0, window = NEAR_WINDOW) {
  const rand = mulberry32(seed >>> 0)
  const near = shuffle([...(candidates || [])], rand)
    .sort((a, b) => Math.abs(a.rating - myRating) - Math.abs(b.rating - myRating))
    .slice(0, window)
  if (!near.length) return null
  const rec = Array.isArray(recent) ? recent : []
  if (!rec.length) return near[Math.floor(rand() * near.length)]
  for (let k = Math.min(RECENT_BLOCK, rec.length); k >= 1; k--) {
    const block = new Set(rec.slice(0, k))
    const pool = near.filter(c => !block.has(c.uid))
    if (pool.length) return pool[Math.floor(rand() * pool.length)]
  }
  return null
}

/** คิวคู่ล่าสุด (ใหม่สุดหน้า) เก็บ RECENT_BLOCK คน · บอทไม่นับ */
export const pushRecent = (recent, uid) =>
  uid ? [uid, ...(Array.isArray(recent) ? recent : []).filter(u => u !== uid)].slice(0, RECENT_BLOCK) : (recent || [])
