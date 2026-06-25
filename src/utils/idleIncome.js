// idle income — pure: คิดเหรียญสะสม โดยบัฟ ×mult เฉพาะ "ช่วงที่บัฟ active จริง"
// (เดิม useDaily คูณบัฟทั้งก้อนตามสถานะ ณ ตอนกดเก็บ → เก็บจังหวะดีได้ ×1.5 ทั้ง 24ชม.
//  แม้บัฟเพิ่งเปิดชั่วโมงเดียว และกลับกัน. ฟังก์ชันนี้คิดตามเวลาที่บัฟครอบจริง)
export const DAY_MS = 24 * 60 * 60 * 1000

/**
 * @param baseRatePerDay เรท/วัน ก่อนบัฟ (บ้าน+เพ็ท+หอคอย × โบนัส tag แล้ว)
 * @param lastMs ms เก็บรายได้ครั้งล่าสุด · now ms ปัจจุบัน
 * @param buffFrom/buffUntil ช่วงบัฟ active จริง [from, until] (รองรับสแตคต่อเวลา = until ยาวเกิน 24ชม.)
 * @returns เหรียญสะสม (floor) — หน้าต่างสะสม cap 24ชม.
 */
export function accruedCoins({ baseRatePerDay, lastMs, now, buffFrom = 0, buffUntil = 0, buffMult = 1.5 }) {
  if (!(baseRatePerDay > 0) || !(now > lastMs)) return 0
  const winStart = Math.max(lastMs, now - DAY_MS)   // cap สะสม 24ชม.
  const totalMs = now - winStart
  let buffedMs = 0
  if (buffUntil > buffFrom && buffMult !== 1) {
    // ส่วนที่หน้าต่างสะสม [winStart, now] ทับช่วงบัฟ [buffFrom, buffUntil]
    buffedMs = Math.max(0, Math.min(now, buffUntil) - Math.max(winStart, buffFrom))
  }
  const weightedMs = (totalMs - buffedMs) + buffMult * buffedMs
  return Math.floor(baseRatePerDay * weightedMs / DAY_MS)
}
