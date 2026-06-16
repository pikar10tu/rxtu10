import { PLE_CC_DATE } from '../firebase/config.js'

// ── วันสอบสำหรับการ์ดนับถอยหลัง (Study tab) ──
// เพิ่มวันสอบใหม่ (มิดเทอม/ไฟนอล) ได้ที่นี่ที่เดียว — การ์ดจะโชว์อัตโนมัติ
// เรียงเองไม่ต้อง (upcomingExams เรียงให้ตามวันใกล้สุด) · วันที่ผ่านแล้วจะถูกซ่อนเอง
// รูปแบบ: { id, label, date (ISO +07), emoji }
export const EXAMS = [
  { id: 'ple-cc', label: 'สอบใบประกอบฯ (PLE: CC)', date: PLE_CC_DATE, emoji: '🎯' },
  // ตัวอย่างที่จะเพิ่มภายหลัง:
  // { id: 'midterm-1', label: 'สอบกลางภาค', date: '2026-08-10T00:00:00+07:00', emoji: '📝' },
  // { id: 'final-1',   label: 'สอบปลายภาค', date: '2026-10-12T00:00:00+07:00', emoji: '📚' },
]
