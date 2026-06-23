// เหรียญข้อสอบ (SP1) — pure logic · เพดาน/วัน ผูกกับเลเวลบ้าน
import { residenceDailyIncome } from '../data/residence.js'

// เพดานเหรียญข้อสอบต่อวัน = มากสุดระหว่างพื้น กับ รายได้บ้าน/วัน ของเลเวลนั้น
export function quizDailyCap(level, floor) {
  return Math.max(floor, residenceDailyIncome(level))
}

// เหรียญที่ได้รอบนี้ (clamp 0..เพดานที่เหลือ)
export function quizGrant(correct, earnedToday, cap, perCorrect) {
  return Math.max(0, Math.min(correct * perCorrect, cap - earnedToday))
}
