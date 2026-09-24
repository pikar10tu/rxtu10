// ════════════════════════════════════════════════════════════
//  reportCase — ตรรกะล้วนของการ์ด "ข้อที่ถูกรีพอร์ท" ในหน้าตรวจ (24 ก.ย. 2026)
//  การ์ดรีพอร์ทขึ้นก่อนคิวปกติ · ถาม "ผู้แจ้งพูดถูกไหม" → ไม่ผิด / แก้ / นำออก
//  ดู docs/superpowers/specs/2026-09-24-report-case-flow-design.md
// ════════════════════════════════════════════════════════════

// ใครตัดสินรีพอร์ทข้อนี้ได้ — กันตัดสินงานตัวเอง และให้ rules isReviewSubmit ผ่านเสมอตอนตอบ "ไม่ผิด"
//  (ไม่เช็คจำนวนเสียงแบบ needsReviewBy: ข้อที่ผ่านตรวจแล้วก็ถูกรีพอร์ทได้)
export function canHandleReport(q, uid) {
  if (!q || !uid) return false
  if ((q.reviewedBy || []).includes(uid)) return false
  if (q.lastFixBy === uid) return false
  if (q.createdBy === uid && q.source !== 'import') return false
  return true
}

// กลุ่มรีพอร์ทถัดไปที่ยังไม่ได้ข้ามในเซสชันนี้ (groups เรียงใหม่สุดก่อนมาจาก groupReports แล้ว)
export function nextReportGroup(groups, skippedIds) {
  return (groups || []).find(g => !skippedIds?.has(g.questionId)) || null
}

// ข้อตอนนี้ต่างจากตอนที่นักศึกษาแจ้งไหม — ตัวเลือกเทียบแบบไม่สนลำดับ เพราะควิซสลับตำแหน่ง
// (snapshot เก็บ answerText ไม่ใช่ index ด้วยเหตุผลเดียวกัน)
export function snapshotDiffers(snapshot, q) {
  if (!snapshot || !q) return false
  const norm = a => [...(a || [])].map(String).sort().join('\u0001')
  return (snapshot.question || '') !== (q.question || '')
    || norm(snapshot.choices) !== norm(q.choices)
    || (snapshot.answerText ?? '') !== (q.choices?.[q.answer] ?? '')
}
