// ประเมินการใช้ Firestore แบบ "ประมาณการในแอป" เทียบลิมิตรายวันของ Spark free tier
// ตัวนับ undercount จริง (ไม่นับ snapshot listener echo, แคชฯ) → เกณฑ์เตือนอนุรักษ์นิยม
// เป็นแค่ตัวช่วยมองความเสี่ยง — Cloud Monitoring (3a) เป็น backstop ตัวจริง

export const DAILY_READ_LIMIT  = 50000 // Spark: 50k document reads/วัน
export const DAILY_WRITE_LIMIT = 20000 // Spark: 20k document writes/วัน
export const WARN_RATIO   = 0.7 // เตือนเหลือง
export const DANGER_RATIO  = 0.9 // เตือนแดง

// คืนระดับสถานะรวม เอา ratio ที่แย่สุดของ reads/writes
export function usageStatus(reads = 0, writes = 0) {
    const ratio = Math.max(reads / DAILY_READ_LIMIT, writes / DAILY_WRITE_LIMIT)
    if (ratio >= DANGER_RATIO) return 'danger'
    if (ratio >= WARN_RATIO)   return 'warn'
    return 'ok'
}

// รวม delta แบบ pure (ไม่กลายพันธุ์ของเดิม) — ใช้ใน accumulator ต่อเซสชัน
export function addUsage(acc, reads = 0, writes = 0) {
    return {
        reads:  (acc?.reads  || 0) + reads,
        writes: (acc?.writes || 0) + writes,
    }
}

// id ของ doc usage รายวัน — `stats/usage_YYYY-MM-DD`
// 27 พ.ย. 2026: นับวันตามเวลาแปซิฟิก (America/Los_Angeles) ให้ตรงรอบรีเซ็ตโควต้า Firestore (เที่ยงคืนแปซิฟิก = บ่ายสาม/บ่ายสองไทย)
//   เดิมใช้วันที่เครื่อง (ไทย) → 1 doc คร่อมสองรอบโควต้า · doc ก่อนหน้านี้ยังเป็นวันไทย
export function usageDocId(date = new Date(), tz = 'America/Los_Angeles') {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date).map(x => [x.type, x.value]))
    return `usage_${p.year}-${p.month}-${p.day}`
}
