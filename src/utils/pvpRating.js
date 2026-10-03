// PvP core — pure: ค่าคงที่ + ระบบเรต (Elo-ish) · ฉีดค่าได้ทุกฟังก์ชัน
export const PVP_RATING_START = 1000   // แต้มประลองเริ่มต้น
export const PVP_RATING_FLOOR = 100    // แต้มต่ำสุด (กันติดลบ)
export const PVP_K = 32                // ความไวของเรต
export const BOT_RATING_MULT = 0.5     // บอทให้แต้มครึ่งของคนจริง
export const PVP_DAILY_ATTACKS = 5     // โควต้าบุก/วัน (รวมคน+บอท)

/** โอกาสชนะคาดหวังของ my ต่อ opp (Elo) */
export function expectedScore(my, opp) {
  return 1 / (1 + Math.pow(10, (opp - my) / 400))
}

// ── เคิร์ฟขึ้นยากตามแต้ม (user เคาะ 3 ต.ค. 2026: "ช่วงแรกดันง่าย ช่วงหลังดันยาก เริ่ม 1000 ไปจบประมาณ 2000") ──
// ตอนชนะ แต้มที่ได้คูณ climbMult(แต้มตัวเอง): 1000 → ×1.25 · 1500 → ×0.73 · 1600 → ×0.62 · 2000 → ×0.2 (ต่ำสุด ×0.15)
// ตอนแพ้ไม่ลดตัวคูณ ⇒ แต้มสูงต้องชนะบ่อยกว่าแพ้มากถึงจะขึ้น (1600 ต้องชนะ ~62% · 2000 ต้อง ~83%) = เพดานธรรมชาติแถว 2000
// ต่ำกว่า 1100 แพ้เสียแต้มแค่ 75% (ไม่ให้มือใหม่ท้อ) · แต้มที่ใครมีอยู่แล้วไม่ถูกแตะ
export const CLIMB_TOP = 1.25, CLIMB_SLOPE = 1.05 / 1000, CLIMB_MIN = 0.15
export const SOFT_LOSS_BELOW = 1100, SOFT_LOSS_MULT = 0.75
export function climbMult(rating) {
  return Math.max(CLIMB_MIN, Math.min(CLIMB_TOP, CLIMB_TOP - (rating - PVP_RATING_START) * CLIMB_SLOPE))
}

/** เรตใหม่หลังสู้ · mult=1 คนจริง, 0.5 บอท · clamp ≥ floor */
export function nextRating(my, opp, won, { K = PVP_K, mult = 1 } = {}) {
  let delta = mult * K * ((won ? 1 : 0) - expectedScore(my, opp))
  if (won) delta *= climbMult(my)
  else if (my < SOFT_LOSS_BELOW) delta *= SOFT_LOSS_MULT
  return Math.max(PVP_RATING_FLOOR, Math.round(my + delta))
}
