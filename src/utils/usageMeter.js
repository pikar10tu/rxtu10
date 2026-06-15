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

// id ของ doc usage รายวัน (อิงวันที่ท้องถิ่น) — `stats/usage_YYYY-MM-DD`
export function usageDocId(date = new Date()) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `usage_${y}-${m}-${d}`
}
