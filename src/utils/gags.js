// ════════════════════════════════════════════════════════════
//  achievement ลับ (กิมมิคตลก) — ตัวนับในหน่วยความจำล้วน (ไม่เขียน Firestore จนกว่าจะปลด)
//  user ขอ 25 ก.ย. 2026 · ปลดผ่าน grantSecret() ใน composables/useAchievements.js
//  เทส: node --test src/utils/gags.test.js
// ════════════════════════════════════════════════════════════

/** ตัวนับ "กดรัว": กดห่างกันไม่เกิน gapMs นับต่อ · ห่างเกิน = เริ่มนับ 1 ใหม่ · คืนจำนวนครั้งติดกันล่าสุด */
export function makeStreak(gapMs) {
  let n = 0
  let last = -Infinity
  return {
    hit(now = Date.now()) {
      n = now - last <= gapMs ? n + 1 : 1
      last = now
      return n
    },
    reset() { n = 0; last = -Infinity },
  }
}

/** ส่องโปรไฟล์ติดกัน: นับคน (ไม่ซ้ำ) ที่เปิดดูโดยไม่ไปทำอย่างอื่น · ย้ายหน้า = reset (router.afterEach) */
const seen = new Set()
export function noteProfileView(uid) {
  if (uid) seen.add(uid)
  return seen.size
}
export function resetProfileStreak() { seen.clear() }

/** ตี 1 – ตี 4 ตามเวลาไทย (+07) */
export function isOwlHour(now = Date.now()) {
  const h = new Date(now + 7 * 3600000).getUTCHours()
  return h >= 1 && h < 5
}
