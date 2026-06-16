// ════════════════════════════════════════════════════════════
//  countdown — pure logic นับถอยหลังสู่วันสอบ (data-driven)
//  วันสอบอยู่ใน data/exams.js · นับเป็น "วันปฏิทินไทย" (+07) ไม่อิงเวลาเครื่อง
// ════════════════════════════════════════════════════════════
const DAY = 86400000
const TZ = 7 * 3600000 // bucket เป็นวันปฏิทินไทย (+07) → "วันนี้/พรุ่งนี้" ตรงกับคนไทย

function dayIndex(ms) { return Math.floor((ms + TZ) / DAY) }

// จำนวนวันจาก now ถึง dateISO (จำนวนเต็ม, ตามวันปฏิทินไทย) · null ถ้า date พัง
export function daysUntil(dateISO, now = Date.now()) {
  const t = new Date(dateISO).getTime()
  if (Number.isNaN(t)) return null
  return dayIndex(t) - dayIndex(now)
}

// วันสอบที่ยังไม่ผ่าน (days >= 0) เรียงใกล้สุดก่อน + แนบ days
export function upcomingExams(exams, now = Date.now()) {
  return (exams || [])
    .map(e => ({ ...e, days: daysUntil(e.date, now) }))
    .filter(e => e.days !== null && e.days >= 0)
    .sort((a, b) => a.days - b.days)
}
