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

// 💸 ประมาณค่าใช้จ่ายรายเดือน (28 พ.ย. 2026 · user) — ราคาจริงจาก Cloud Billing Catalog โซน Singapore (asia-southeast1) ดึง 28 พ.ย. 2026
//   ฟรีต่อวัน: อ่าน 50k · เขียน 20k · ลบ 20k → ส่วนเกินคิดตามราคาต่อชิ้น · RTDB ฟรี 10 GB/เดือน (ดาวน์โหลด) + 1 GB เก็บข้อมูล
export const PRICE = {
  read: 0.0369 / 100000,      // USD ต่อ 1 document read (Singapore)
  write: 0.1107 / 100000,     // USD ต่อ 1 document write
  rtdbGB: 1,                  // USD ต่อ GB ดาวน์โหลด RTDB เกิน 10 GB/เดือน
  rtdbStoreGB: 5,             // USD ต่อ GB/เดือน เก็บข้อมูล RTDB เกิน 1 GB
  claudePro: 21.4,            // USD/เดือน Claude Pro $20 + VAT 7% (user 28 พ.ย.)
}
export const FREE_MONTH = { rtdbGB: 10, rtdbStoreGB: 1 }
export const FX_FALLBACK = 33   // บาท/ดอลลาร์ ใช้ตอนดึงอัตราสดไม่ได้

/** ค่า Firestore ต่อวัน (USD) จากยอดอ่าน/เขียนของวันนั้น */
// 🎯 ตัวคูณปรับเทียบ: ตัวนับในแอปนับขาด (listener/แคช ฯลฯ) + บิลจริงมีค่าอื่นปน → คูณยอดอ่าน/เขียนด้วย k ก่อนคิดเงิน
//   k หาจากบิลจริง: เลือก k ที่ทำให้ผลรวมค่าประมาณช่วงเดียวกัน = บิลจริง (คิดส่วนเกินโควต้าทีละวัน ไม่ใช่เทียบสัดส่วนตรงๆ
//   เพราะวันที่ไม่เกินโควต้าเป็น 0 บาท · บัญญัติไตรยางค์ตรงๆ จะเพี้ยน)
//   ค่าตั้งต้น 28 พ.ย. 2026: บิลจริง 1–27 พ.ย. = ฿17.98 → k ≈ 2.5
export const CAL_DEFAULT = { k: 2.5, note: 'บิลจริง 1–27 พ.ย. 2026 ฿17.98' }
export function dayCost({ reads = 0, writes = 0 } = {}, k = 1) {
  return Math.max(0, reads * k - DAILY_READ_LIMIT) * PRICE.read + Math.max(0, writes * k - DAILY_WRITE_LIMIT) * PRICE.write
}
/** หา k จากบิลจริง (USD) ของช่วงวันเดียวกับ days · bisection · คืน null ถ้าหาไม่ได้ (เช่น ยอดน้อยจนไม่เกินโควต้าแม้คูณ 50) */
export function solveK(days = [], actualUsd = 0) {
  const sum = (k) => days.reduce((s, d) => s + dayCost(d, k), 0)
  if (!(actualUsd > 0) || sum(50) < actualUsd) return null
  let lo = 0.1, hi = 50
  for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (sum(m) < actualUsd) lo = m; else hi = m }
  return Math.round(((lo + hi) / 2) * 100) / 100
}
/** ประมาณรายเดือน: เฉลี่ยจากวันที่มีข้อมูล × 30 · คืน { firestore, claude, total } เป็น USD */
export function monthEstimate(days = [], k = 1) {
  const used = days.filter(d => d && (d.reads || d.writes))
  const avg = used.length ? used.reduce((s, d) => s + dayCost(d, k), 0) / used.length : 0
  const firestore = avg * 30
  return { firestore, claude: PRICE.claudePro, total: firestore + PRICE.claudePro, days: used.length }
}
