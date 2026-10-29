/**
 * สลับข้อ/สลับตัวเลือกของข้อสอบ — ใช้ร่วมโดย QuizView และ TimeAttackView
 * เทส: node --test src/utils/quizShuffle.test.js
 */

/** สลับลำดับ — คืน array ใหม่ ไม่แตะต้นฉบับ (Fisher–Yates) */
export function shuffle(arr) {
  const a = (arr || []).slice()
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}

/**
 * ตัวเลือกที่อ้างถึงตัวเลือกอื่น ("ถูกทุกข้อ", "ทุกข้อข้างต้น", "ไม่มีข้อถูก", "ข้อ 1 และ 2")
 * — ต้องอยู่ตำแหน่งเดิม ไม่งั้นความหมายพังหลังสลับ
 */
const PINNED_RE = /ทุกข้อ|ข้างต้น|ไม่มีข้อ(ใด|ถูก|ผิด)|ผิดทั้งหมด|ถูกทั้งหมด|ทั้งหมดที่กล่าว|ข้อ\s*[0-9ก-จ]\s*(,|และ)|เฉพาะข้อ|(all|none) of the above/i
export function isPinnedChoice(c) {
  return PINNED_RE.test(String(c ?? ''))
}

/**
 * สลับตำแหน่งตัวเลือกในข้อหนึ่ง + remap index เฉลยให้ตรงตำแหน่งใหม่
 * (กันคนจำว่า "เฉลยคือข้อ ก" จากการทำซ้ำ — ให้จำเนื้อหาแทน)
 * ตัวเลือกที่ปักไว้ (isPinnedChoice) คงที่เดิม สลับเฉพาะตัวปกติ
 */
export function shuffleChoices(q) {
  const free = q.choices.map((c, i) => i).filter(i => !isPinnedChoice(q.choices[i]))
  const mixed = shuffle(free)
  const order = q.choices.map((c, i) => (isPinnedChoice(c) ? i : mixed[free.indexOf(i)]))
  return {
    ...q,
    choices: order.map(i => q.choices[i]),
    answer: order.indexOf(q.answer),
  }
}
