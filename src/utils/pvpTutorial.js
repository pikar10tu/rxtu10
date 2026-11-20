// 🐣 ไฟต์ซ้อมกับหุ่น 5 ตาแรกของสนามประลอง (21 พ.ย. 2026 · user เคาะ) — pure · เทส: node --test src/utils/pvpTutorial.test.js
//
// • ใครต้องซ้อม: คนที่ยังไม่มี pvpTut และ (สู้มาไม่ถึง TUT_ELIGIBLE_BELOW ตา หรือ ยังไม่มีตำนานขั้น V)
//   เมื่อเริ่มซ้อมแล้ว pvpTut ถูกเขียนเป็นตัวเลข ⇒ ไม่หลุดเกณฑ์กลางทาง
// • ซ้อมยังไม่ครบ = ปุ่มหาคู่จริงยังล็อก (ปุ่มกลายเป็น "ซ้อมกับหุ่น") · ไฟต์ซ้อมไม่ใช้พลังงาน ไม่แตะแต้ม/เหรียญ
// • จบแต่ละตา (ชนะหรือแพ้) เลือกรับเพ็ทตำนาน 1 ใน 3 — กดรับแล้วตานั้นถึงนับ · ออกก่อนกดรับ = ตานั้นไม่นับ ต้องสู้ใหม่
//   ได้ตัวซ้ำ = สำเนาไว้อัพขั้น (เต็มเพดาน → ประกายดาว เหมือนกาชา)
import { PETS } from '../data/index.js'
import { mergeRolls } from './gachaMerge.js'

// ชื่ออีเวนต์บนจอ (มือใหม่ + คนกลับมาเล่น) — เปลี่ยนชื่อที่นี่ที่เดียว
export const TUT_EVENT = { icon: '🏕️', name: 'ค่ายฝึกนักประลอง' }
export const TUT_FIGHTS = 5
export const TUT_ELIGIBLE_BELOW = 20
export const TUT_LEGENDS = ['whale', 'ouroboros', 'sol']   // ✋ คุณวาฬ · ✌️ อูโรโบรอส · ✊ ซอล (ธาตุละตัว)

/** มีเพ็ทตำนานขั้น V (เกรด 5) แล้วหรือยัง */
export function hasLegendV(user) {
  return (user?.pets || []).some(p => (p?.rarity || PETS.find(d => d.id === p?.id)?.rarity) === 'legendary' && (Number(p?.grade) || 0) >= 5)
}
/** มีสิทธิ์เข้าร่วม: สู้ < 20 ตา หรือ ยังไม่มีตำนานขั้น V (user 21 พ.ย. — มือใหม่ + คนกลับมาเล่น) */
export const tutEligible = (user) => (user?.pvpFightsTotal || 0) < TUT_ELIGIBLE_BELOW || !hasLegendV(user)

/** จำนวนตาซ้อมที่ทำครบแล้ว (0..TUT_FIGHTS) */
export function tutDone(user) {
  const v = user?.pvpTut
  if (typeof v === 'number' && Number.isFinite(v)) return Math.max(0, Math.min(TUT_FIGHTS, Math.floor(v)))
  return tutEligible(user) ? 0 : TUT_FIGHTS
}
export const inTutorial = (user) => tutDone(user) < TUT_FIGHTS

/**
 * patch ตอนกดรับตำนานหลังไฟต์ซ้อม · คืน null ถ้าไม่ได้อยู่ในช่วงซ้อม/เลือกตัวนอกรายการ
 * @returns {{ pets, pvpTut, dust, summary }}
 */
export function tutorialClaim(user, petId) {
  if (!inTutorial(user) || !TUT_LEGENDS.includes(petId)) return null
  const { pets, dust, summary } = mergeRolls(user?.pets || [], [{ id: petId }], PETS)
  return { pets, pvpTut: tutDone(user) + 1, dust, summary: summary[0] || null }
}

// ไกด์ทีละเรื่อง (user 21 พ.ย.: ภาษาธรรมชาติ · ไม่บอกกลไกจับคู่ — ความลับ)
// ⚠️ ข้อความต้องจริงตามระบบเกม · ช่องจัดทีมคงที่ 3 ห้ามเขียนว่าอัปบ้านได้ช่องเพิ่ม
// ลำดับ (user 21 พ.ย.): ต้อนรับ → อัญเชิญ → ธาตุ → อัพขั้น → ซ้อมครบ
export const TUT_GUIDE = [
  'ยินดีต้อนรับสู่สนามประลอง! ช่วงแรกซ้อมกับหุ่นกันก่อน เลือกตัวที่คุณชอบแล้วมาลุยกันเลย!',
  'อยากได้เพ็ทเพิ่ม ไปอัญเชิญที่ร้านค้าได้เลย มีหลายตัวก็จัดทีมได้หลากหลาย',
  'เพ็ทมี 3 ธาตุ ✊ ✌️ ✋ ที่ชนะทางกัน ลองจัดทีมให้มีหลายธาตุ จะรับมือศัตรูได้ง่ายขึ้น',
  'ได้เพ็ทตัวซ้ำไม่เสียเปล่านะ เอาไปอัพขั้นที่หน้าเพ็ทได้ ยิ่งขั้นสูงก็ยิ่งแรงขึ้นเยอะ',
  'ซ้อมครบแล้ว เก่งมาก! ต่อจากนี้ไปลุยกับเพื่อนๆ ในสนามได้เลย',
]
export const guideOf = (fightNo) => TUT_GUIDE[Math.min(Math.max(1, fightNo), TUT_GUIDE.length) - 1]
