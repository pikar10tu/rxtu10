// 📚 เทศกาลสอบ (user สั่ง 27 พ.ย. 2026) — เหรียญจากข้อสอบ/ทบทวนการ์ด/โฟกัส ×2 จนสิ้น ธ.ค. 2026 (เวลาไทย)
// ใช้ตัวนี้ตัวเดียวทุกจุด · หมดเวลาแล้วกลับ ×1 เอง ไม่ต้อง deploy
export const EXAM_FEST_START = Date.parse('2026-11-27T00:00:00+07:00')
export const EXAM_FEST_END = Date.parse('2027-01-01T00:00:00+07:00')
export const EXAM_FEST_MULTI = 2

export const examFestOn = (now = Date.now()) => now >= EXAM_FEST_START && now < EXAM_FEST_END
export const examFestMulti = (now = Date.now()) => (examFestOn(now) ? EXAM_FEST_MULTI : 1)
