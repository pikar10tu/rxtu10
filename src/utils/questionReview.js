// ════════════════════════════════════════════════════════════
//  Peer-review ข้อสอบ — ตรรกะล้วน (ไม่แตะ Firestore/Vue)
//  verdict: 'correct' (ผ่าน) | 'fix' | 'wrong' (ทั้งคู่นับเป็น fail)
//  reviewStatus: pending | passed | conflict | failed
//  คุมคิว pull-model + leaderboard "ใครตรวจกี่ข้อ"
//
//  aggregate บนเอกสารข้อสอบเก็บแค่ตัวนับ reviewPass/reviewFail —
//  ห้ามเก็บ map uid→verdict บน doc เพราะข้อ published นักศึกษาอ่านได้ทั้งใบ
//  (รายละเอียดว่าใครตัดสินอะไรอยู่ใน subcollection reviews ที่ rules กันไว้)
// ════════════════════════════════════════════════════════════

// สรุปสถานะจากตัวนับเสียงบนเอกสารข้อสอบ
//  <2 เสียง → pending · pass>fail → passed · fail>pass → failed · เสมอ → conflict
//  (2 เสียงเสมอ = correct+fail = ขัดแย้ง รอคนที่ 3 · 3 เสียงไม่มีทางเสมอ → ตัดสินได้)
export function computeStatus(question) {
  const pass = question?.reviewPass || 0
  const fail = question?.reviewFail || 0
  if (pass + fail < 2) return 'pending'
  if (pass > fail) return 'passed'
  if (fail > pass) return 'failed'
  return 'conflict'
}

// ข้อนี้ "ต้องให้ฉันตรวจ" ไหม
//  กันตรวจข้อตัวเอง · กันตรวจซ้ำ · ครบ 2 แล้วหยุด (ยกเว้น conflict ที่รอคนที่ 3)
//  ข้อ import ไม่นับเป็น "ข้อตัวเอง" — createdBy คือคนกด import ไม่ใช่คนแต่งโจทย์
export function needsReviewBy(question, myUid) {
  if (!myUid || !question) return false
  if (question.retired) return false   // นำออกจากการใช้งานแล้ว — ไม่ต้องตรวจ
  if (question.createdBy === myUid && question.source !== 'import') return false
  const reviewedBy = question.reviewedBy || []
  if (reviewedBy.includes(myUid)) return false
  return reviewedBy.length < 2 || computeStatus(question) === 'conflict'
}

// เนื้อหาที่ผลตรวจผูกอยู่เปลี่ยนไหม (โจทย์/ตัวเลือก/เฉลย/คำอธิบาย)
//  ใช้ตัดสินว่าแก้ข้อสอบแล้วต้องล้างผลตรวจให้กลับเข้าคิว — toggle publish/หมวดไม่นับ
export function reviewContentChanged(before, after) {
  if (!before || !after) return true
  const key = q => JSON.stringify([q.question, q.choices, q.answer, q.explanation ?? null])
  return key(before) !== key(after)
}

// payload ล้างสถานะตรวจ (ใช้ตอนเนื้อหาข้อสอบเปลี่ยน → กลับเข้าคิว peer-review ใหม่)
export const REVIEW_RESET = { reviewedBy: [], reviewPass: 0, reviewFail: 0, reviewStatus: 'pending' }

// uid → จำนวนข้อที่ตรวจไปแล้ว (นับจาก reviewedBy ทั้งคลัง = ตัวนับ leaderboard)
export function tallyReviewCounts(questions) {
  const counts = {}
  for (const q of questions || []) {
    for (const uid of q.reviewedBy || []) counts[uid] = (counts[uid] || 0) + 1
  }
  return counts
}

// คิวข้อที่ฉันต้องตรวจ (subset ของคลัง)
export function nextReviewQueue(questions, myUid) {
  if (!myUid) return []
  return (questions || []).filter(q => needsReviewBy(q, myUid))
}

// ป้าย verdict / สถานะตรวจ — ใช้ร่วมหน้า Review + Questions
export const VERDICT_LABEL = { correct: 'ถูกต้อง', fix: 'ต้องแก้', wrong: 'ผิด' }
export const REVIEW_STATUS_LABEL = {
  pending: 'รอตรวจ', passed: 'ผ่านตรวจ', conflict: 'ขัดแย้ง', failed: 'ไม่ผ่าน', retired: 'นำออก',
}

// key ป้ายสถานะของข้อ — 'retired' (นำออก) ทับสถานะที่คำนวณจากตัวนับ
export function reviewStatusKey(question) {
  return question?.retired ? 'retired' : computeStatus(question)
}

// leaderboard เรียงมาก→น้อย (tiebreak ชื่อ) แมพ uid→ชื่อจริงผ่าน nameMap
export function buildLeaderboard(counts, nameMap = {}) {
  return Object.entries(counts || {})
    .map(([uid, count]) => ({ uid, count, name: nameMap[uid] || 'ไม่ระบุ' }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}
