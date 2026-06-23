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

// วันสอบที่ยังไม่ผ่าน เรียงใกล้สุดก่อน + แนบ days (นับถอยหลังถึงวันแรก = date)
// สอบหลายวัน (มี dateEnd): ยังโชว์จนจบวันสุดท้าย — กรองด้วย dateEnd ถ้ามี ไม่งั้นใช้ date
export function upcomingExams(exams, now = Date.now()) {
  return (exams || [])
    .map(e => ({ ...e, days: daysUntil(e.date, now) }))
    .filter(e => {
      if (e.days === null) return false
      const endDays = daysUntil(e.dateEnd || e.date, now)
      return endDays !== null && endDays >= 0
    })
    .sort((a, b) => a.days - b.days)
}
