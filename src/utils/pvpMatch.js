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

// ── จับคู่สูสีสำหรับคนนอกท็อป 10 (21 พ.ย. 2026 · user: "คนเข้ามาลอง เจอคน full build ตบ แล้วเลิกเล่น") ──
//  นอกท็อป 10 = เจอเฉพาะคนที่พลังทีม ≤ ของเรา × FAIR_SLACK (ใกล้เคียงหรืออ่อนกว่า) · ท็อป 10 = ไม่จำกัดเหมือนเดิม
//  พลังทีมไม่โชว์บนเว็บ (ผู้เล่นไม่รู้ว่าโดนกรอง) · ไม่มีใครเข้าเกณฑ์ = ให้ caller ใช้บอทพลังใกล้เรา
export const FAIR_TOP = 10
export const FAIR_SLACK = 1.1

// 🔢 matchPower — คะแนนบิลด์ไว้จับคู่ (ไม่โชว์บนจอ) = Σ 1.32^(เกรด + ออฟเซ็ตตามระดับ) ของเพ็ทในทีม
//  ทำไมไม่ใช้ teamPower ตรงๆ: teamPower นับแค่ค่าพลัง (atk×hp) ไม่เห็นพาสสีฟ
//  sim 21 พ.ย. 2026 (ทีมเกรด 0 vs ทีมธรรมดาเกรด k, 300 ไฟต์/ช่อง):
//    ตำนาน G0 ≈ ธรรมดา G1.5 · มหากาพย์ G0 ≈ ธรรมดา G0 · แรร์ G0 แพ้ธรรมดา G0 97% (ปัญหาบาลานซ์เดิม ดู memory pet balance)
//  ทีมผสมสุ่ม 6,000 คู่: ทายผู้ชนะถูก teamPower 76% → matchPower 79%
//  1.32 = อัตราเพิ่มพลังต่อเกรดโดยประมาณ (COMBAT_GRADE ใน data/petPower.js)
export const RARITY_GRADE_OFFSET = { common: 0, rare: -1, epic: 0, legendary: 1.5 }
/** เกรดเฉลี่ยแบบนับระดับ (เกรด + ออฟเซ็ต) ของทีม · 0 = ธรรมดาเกรด 0 · 6.5 = ตำนานเกรด 5 */
export function effGrade(team) {
  const t = (team || []).filter(Boolean)
  if (!t.length) return 0
  return t.reduce((s, p) => s + (Number(p?.grade) || 0) + (RARITY_GRADE_OFFSET[p?.rarity] || 0), 0) / t.length
}
// 🏅 ตัวคูณแต้มตอนชนะตามระดับทีม (user 21 พ.ย.: ทีมแกร่งตีกันได้แต้มเยอะ ทีมอ่อนตีกันได้น้อย ⇒ อยากอัพเพ็ท/จัดทีม)
//  ระดับ = เกรดเฉลี่ยของสองทีม (นับระดับ) เทียบเพดาน 6.5 → ×0.6 (อ่อนสุด) … ×1.5 (บิลด์เต็ม) · แพ้ไม่คูณ
export const TIER_MULT_MIN = 0.6
export const TIER_MULT_MAX = 1.5
const EFF_MAX = 5 + RARITY_GRADE_OFFSET.legendary
export function tierMult(teamA, teamB) {
  const lv = Math.min(1, Math.max(0, (effGrade(teamA) + effGrade(teamB)) / 2 / EFF_MAX))
  return Math.round((TIER_MULT_MIN + (TIER_MULT_MAX - TIER_MULT_MIN) * lv) * 100) / 100
}

export function matchPower(team) {
  return (team || []).reduce((s, p) => s + Math.pow(1.32, (Number(p?.grade) || 0) + (RARITY_GRADE_OFFSET[p?.rarity] || 0)), 0)
}
/** @param powerOf (team) => number — ส่ง teamPower เข้ามา (ไฟล์นี้ไม่ผูกกับสูตรพลัง) */
export function fairCandidates(candidates, myPower, myRank, powerOf, slack = FAIR_SLACK) {
  const list = candidates || []
  if (myRank && myRank <= FAIR_TOP) return list
  const cap = (Number(myPower) || 0) * slack
  return list.filter(c => powerOf(c.team) <= cap)
}

/** คิวคู่ล่าสุด (ใหม่สุดหน้า) เก็บ RECENT_BLOCK คน · บอทไม่นับ */
export const pushRecent = (recent, uid) =>
  uid ? [uid, ...(Array.isArray(recent) ? recent : []).filter(u => u !== uid)].slice(0, RECENT_BLOCK) : (recent || [])
