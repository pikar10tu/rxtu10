// คอมเมนต์รายข้อ (thread วิชาการ↔อาจารย์) — pure helpers + เทส
import { cleanText, LIMITS } from './text.js'

// สร้าง object คอมเมนต์ (ไม่มี createdAt — caller เติม serverTimestamp ตอนเขียน)
// คืน null ถ้า text ว่างหลัง clean (กันคอมเมนต์เปล่า)
export function buildComment({ text, uid, name, role }) {
  const clean = cleanText(text, LIMITS.comment)
  if (!clean) return null
  return {
    text: clean,
    authorUid: uid || '',
    authorName: name || 'ไม่ระบุ',
    authorRole: role || 'student',
  }
}

// เรียงเก่า→ใหม่ ตาม createdAt — รองรับ Firestore Timestamp ({seconds}/toMillis),
// number (ms), และ null/pending (serverTimestamp ยังไม่ลง → ไว้ท้ายสุด)
export function sortComments(list) {
  const ms = (c) => {
    const t = c && c.createdAt
    if (!t) return Infinity
    if (typeof t === 'number') return t
    if (typeof t.toMillis === 'function') return t.toMillis()
    if (typeof t.seconds === 'number') return t.seconds * 1000
    return Infinity
  }
  return [...(Array.isArray(list) ? list : [])].sort((a, b) => ms(a) - ms(b))
}
