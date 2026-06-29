// ════════════════════════════════════════════════════════════
//  Peer-review ข้อสอบ — ตรรกะล้วน (ไม่แตะ Firestore/Vue)
//  verdict: 'correct' (ผ่าน) | 'fix' | 'wrong' (ทั้งคู่นับเป็น fail)
//  reviewStatus: pending | passed | conflict | failed
//  คุมคิว pull-model + leaderboard "ใครตรวจกี่ข้อ"
// ════════════════════════════════════════════════════════════

// สรุปสถานะจาก verdict ทั้งหมดของข้อหนึ่ง
//  <2 เสียง → pending · pass>fail → passed · fail>pass → failed · เสมอ → conflict
//  (2 เสียงเสมอ = correct+fail = ขัดแย้ง รอคนที่ 3 · 3 เสียงไม่มีทางเสมอ → ตัดสินได้)
export function computeStatus(verdictsMap) {
  const verdicts = Object.values(verdictsMap || {})
  if (verdicts.length < 2) return 'pending'
  let pass = 0, fail = 0
  for (const v of verdicts) (v === 'correct' ? pass++ : fail++)
  if (pass > fail) return 'passed'
  if (fail > pass) return 'failed'
  return 'conflict'
}

// ข้อนี้ "ต้องให้ฉันตรวจ" ไหม
//  กันตรวจข้อตัวเอง · กันตรวจซ้ำ · ครบ 2 แล้วหยุด (ยกเว้น conflict ที่รอคนที่ 3)
export function needsReviewBy(question, myUid) {
  if (!myUid || !question) return false
  if (question.createdBy === myUid) return false
  const reviewedBy = question.reviewedBy || []
  if (reviewedBy.includes(myUid)) return false
  const status = computeStatus(question.reviewVerdicts || {})
  return reviewedBy.length < 2 || status === 'conflict'
}

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

// leaderboard เรียงมาก→น้อย (tiebreak ชื่อ) แมพ uid→ชื่อจริงผ่าน nameMap
export function buildLeaderboard(counts, nameMap = {}) {
  return Object.entries(counts || {})
    .map(([uid, count]) => ({ uid, count, name: nameMap[uid] || 'ไม่ระบุ' }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}
