// ════════════════════════════════════════════════════════════
//  ความชำนาญฟาร์ม (ดาวต่อพืช) + พืชทอง — user เคาะ 28 ก.ย. 2026
//  • ดาวนับจากจำนวนครั้งที่เก็บเกี่ยวพืชชนิดนั้น: 10 / 50 / 100 → ★ / ★★ / ★★★
//  • ทุกครั้งที่เก็บ มีโอกาสได้ "พืชทอง" ตามดาว ณ ตอนนั้น 1 / 3 / 5 / 7 %
//    🔒 ห้ามโชว์เปอร์เซ็นต์บนจอ (user สั่ง: ดูไม่ออกจนกว่าจะเก็บเกี่ยว)
//  • พืชทองขาย ×3 ของราคาปกติ · เก็บแยกใน farm.gold · ส่งออเดอร์ไม่ได้
//  เก็บใน user doc: farm.harvests {cropId: n} · farm.gold {cropId: qty} · farm.goldFound {cropId: true}
// ════════════════════════════════════════════════════════════

export const MASTERY_CUTS = [10, 50, 100]
export const GOLD_CHANCE = [0.01, 0.03, 0.05, 0.07]
export const GOLD_SELL_MULT = 3

const count = (n) => {
  const v = Math.floor(Number(n))
  return Number.isFinite(v) && v > 0 ? v : 0
}

/** จำนวนครั้งที่เก็บ → ดาว 0..3 */
export function masteryStars(harvests) {
  const n = count(harvests)
  return MASTERY_CUTS.filter((c) => n >= c).length
}

/** เป้าดาวถัดไป · null = ครบ 3 ดาวแล้ว */
export function nextMasteryCut(harvests) {
  const n = count(harvests)
  return MASTERY_CUTS.find((c) => n < c) ?? null
}

/** สุ่มว่าการเก็บครั้งนี้ได้ทองไหม — ใช้ดาว "ก่อน" เก็บครั้งนี้ · rand ฉีดได้เพื่อเทส */
export function rollGold(harvestsBefore, rand = Math.random) {
  return rand() < GOLD_CHANCE[masteryStars(harvestsBefore)]
}

/** คีย์รูปทองของพืช (ไฟล์ public/herbs/<id>-gold.webp) */
export const goldEmoji = (crop) => (crop?.emoji ? `${crop.emoji}:gold` : '')

/** ราคาขายพืชทอง 1 ผล */
export const goldPrice = (crop) => (crop?.sellPrice || 0) * GOLD_SELL_MULT
