// ════════════════════════════════════════════════════════════
//  reportCase — ตรรกะล้วนของการ์ด "ข้อที่ถูกรีพอร์ท" ในหน้าตรวจ (24 ก.ย. 2026)
//  การ์ดรีพอร์ทขึ้นก่อนคิวปกติ · ถาม "ผู้แจ้งพูดถูกไหม" → ไม่ผิด / แก้ / นำออก
//  ดู docs/superpowers/specs/2026-09-24-report-case-flow-design.md
// ════════════════════════════════════════════════════════════
import { toMs } from './questionReport.js'
import { draftFrom, draftPayload } from './questionDraft.js'
import { verdictContentChanged } from './questionReview.js'

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
//  สุ่มเท่ากันใน `window` กลุ่มแรกที่ยังไม่ข้าม — ไม่งั้นทีมวิชาการทุกคนได้ข้อเดียวกันพร้อมกัน
//  แล้วแก้ทับกัน (final review I1) · ยังเอียงไปทางใหม่สุดเพราะสุ่มแค่หัวแถว
export function nextReportGroup(groups, skippedIds, rnd = Math.random, window = 3) {
  const open = (groups || []).filter(g => !skippedIds?.has(g.questionId))
  if (!open.length) return null
  const n = Math.max(1, Math.min(window, open.length))
  return open[Math.min(n - 1, Math.floor(rnd() * n))]
}

// ข้อถูกแก้ (lastFixAt) หลังรีพอร์ทฉบับใหม่สุดของกลุ่มไหม — ถ้าใช่ แปลว่ามีคนแก้ไปแล้วแต่รีพอร์ทยังไม่ปิด
//  (เช่นแก้สำเร็จแต่ปิดรีพอร์ทล้ม แล้วรีโหลดหน้า) → การ์ดโหมด "จัดการแล้ว" ให้ปิด+ให้รางวัลได้ทุกคน (final review I2)
export function fixedAfterReport(q, group) {
  const fixMs = toMs(q?.lastFixAt)
  const reports = group?.reports || []
  if (!fixMs || !reports.length) return false
  const newest = Math.max(...reports.map(r => toMs(r.createdAt)))
  return fixMs > newest
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

// ข้อสด (อ่านใหม่ก่อนเขียน) ต่างจากตัวที่โหลดมาตอนเปิดการ์ดไหม — กันกรณีคนอื่นแก้/นำออกไปก่อนเรากดตัดสิน
//  เทียบเนื้อหาชั้นตัดสินด้วยสูตรเดียวกับฝั่งเขียน (qhash ครอบแค่โจทย์ แก้ตัวเลือก/เฉลยแล้วไม่เปลี่ยน)
//  + ตราเวลา updatedAt/lastFixAt + retired · ไม่นับการโหวต (reviewedBy/reviewPass) ว่าเป็นการเปลี่ยน
export function questionChangedSince(loaded, fresh) {
  if (!loaded || !fresh) return !!loaded !== !!fresh
  if (!!loaded.retired !== !!fresh.retired) return true
  if (toMs(loaded.lastFixAt) !== toMs(fresh.lastFixAt)) return true
  if (toMs(loaded.updatedAt) !== toMs(fresh.updatedAt)) return true
  return verdictContentChanged(draftPayload(draftFrom(loaded)), draftPayload(draftFrom(fresh)))
}
