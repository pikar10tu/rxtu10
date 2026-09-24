import test from 'node:test'
import assert from 'node:assert/strict'
import { canHandleReport, nextReportGroup, snapshotDiffers, fixedAfterReport, questionChangedSince } from './reportCase.js'

test('canHandleReport — กันคนตรวจ/แก้/แต่งข้อนั้นเอง', () => {
  assert.equal(canHandleReport({ reviewedBy: [] }, 'u'), true)
  assert.equal(canHandleReport({ reviewedBy: ['u'] }, 'u'), false)
  assert.equal(canHandleReport({ lastFixBy: 'u' }, 'u'), false)
  assert.equal(canHandleReport({ createdBy: 'u' }, 'u'), false)
  assert.equal(canHandleReport({ createdBy: 'u', source: 'import' }, 'u'), true)
  assert.equal(canHandleReport(null, 'u'), false)
  assert.equal(canHandleReport({}, null), false)
})

test('nextReportGroup — ข้ามกลุ่มที่ข้ามไว้ เรียงตามลำดับเดิม', () => {
  const gs = [{ questionId: 'a' }, { questionId: 'b' }]
  const first = () => 0
  assert.equal(nextReportGroup(gs, new Set(), first).questionId, 'a')
  assert.equal(nextReportGroup(gs, new Set(['a']), first).questionId, 'b')
  assert.equal(nextReportGroup(gs, new Set(['a', 'b']), first), null)
  assert.equal(nextReportGroup(null, new Set(), first), null)
})

test('nextReportGroup — สุ่มเท่ากันใน window กลุ่มแรกที่ยังไม่ข้าม (กันทุกคนได้ข้อเดียวกัน)', () => {
  const gs = ['a', 'b', 'c', 'd', 'e'].map(questionId => ({ questionId }))
  const none = new Set()
  assert.equal(nextReportGroup(gs, none, () => 0).questionId, 'a')
  assert.equal(nextReportGroup(gs, none, () => 0.34).questionId, 'b')
  assert.equal(nextReportGroup(gs, none, () => 0.99).questionId, 'c')          // window = 3 ค่าเริ่มต้น → ไม่เลย c
  assert.equal(nextReportGroup(gs, none, () => 0.99, 5).questionId, 'e')
  assert.equal(nextReportGroup(gs, none, () => 0.99, 1).questionId, 'a')
  // ข้ามก่อนแล้วค่อยตัด window
  assert.equal(nextReportGroup(gs, new Set(['a', 'b']), () => 0.99).questionId, 'e')
  // เหลือน้อยกว่า window
  assert.equal(nextReportGroup(gs.slice(0, 2), none, () => 0.99).questionId, 'b')
  // ค่าเริ่มต้นของ rnd ใช้ได้ (ไม่พัง) และได้กลุ่มใน window
  assert.ok(['a', 'b', 'c'].includes(nextReportGroup(gs, none).questionId))
})

test('fixedAfterReport — ข้อถูกแก้หลังรีพอร์ทล่าสุดไหม รองรับ Timestamp/seconds/Date/number', () => {
  const ts = ms => ({ toMillis: () => ms })
  const group = { reports: [{ createdAt: ts(2000) }, { createdAt: { seconds: 1 } }] }
  assert.equal(fixedAfterReport({ lastFixAt: ts(3000) }, group), true)
  assert.equal(fixedAfterReport({ lastFixAt: { seconds: 3 } }, group), true)
  assert.equal(fixedAfterReport({ lastFixAt: new Date(3000) }, group), true)
  assert.equal(fixedAfterReport({ lastFixAt: 3000 }, group), true)
  assert.equal(fixedAfterReport({ lastFixAt: 1500 }, group), false)   // แก้ก่อนรีพอร์ทล่าสุด
  assert.equal(fixedAfterReport({ lastFixAt: 2000 }, group), false)
  // ไม่พึ่งลำดับใน group.reports — หาใหม่สุดเอง
  assert.equal(fixedAfterReport({ lastFixAt: 1500 }, { reports: [{ createdAt: 1000 }, { createdAt: ts(2000) }] }), false)
  assert.equal(fixedAfterReport({}, group), false)
  assert.equal(fixedAfterReport(null, group), false)
  assert.equal(fixedAfterReport({ lastFixAt: 3000 }, null), false)
  assert.equal(fixedAfterReport({ lastFixAt: 3000 }, { reports: [] }), false)
})

test('snapshotDiffers — ไม่สนลำดับตัวเลือก (ควิซสลับตำแหน่ง) แต่จับโจทย์/ตัวเลือก/เฉลยที่เปลี่ยน', () => {
  const q = { question: 'Q', choices: ['a', 'b', 'c'], answer: 1 }
  const snap = { question: 'Q', choices: ['c', 'a', 'b'], answerText: 'b' }
  assert.equal(snapshotDiffers(snap, q), false)
  assert.equal(snapshotDiffers({ ...snap, answerText: 'c' }, q), true)
  assert.equal(snapshotDiffers({ ...snap, question: 'Q2' }, q), true)
  assert.equal(snapshotDiffers({ ...snap, choices: ['a', 'b', 'x'] }, q), true)
  assert.equal(snapshotDiffers(null, q), false)
})

test('questionChangedSince — ข้อสดต่างจากที่โหลดไว้ไหม (กันตัดสินทับคนอื่น)', () => {
  const ts = ms => ({ toMillis: () => ms })
  const q = { id: 'x', question: 'Q', choices: ['a', 'b'], answer: 0, updatedAt: ts(1000) }
  assert.equal(questionChangedSince(q, { ...q, updatedAt: { seconds: 1 } }), false)   // Timestamp คนละรูปแบบ ค่าเดียวกัน
  assert.equal(questionChangedSince(q, { ...q, reviewedBy: ['u'], reviewPass: 1 }), false)   // โหวตไม่นับว่าเปลี่ยนเนื้อหา
  assert.equal(questionChangedSince(q, { ...q, answer: 1 }), true)        // qhash ไม่ครอบเฉลย แต่ตัวนี้ต้องจับได้
  assert.equal(questionChangedSince(q, { ...q, choices: ['a', 'c'] }), true)
  assert.equal(questionChangedSince(q, { ...q, retired: true }), true)
  assert.equal(questionChangedSince(q, { ...q, lastFixAt: ts(2000) }), true)
  assert.equal(questionChangedSince(q, { ...q, updatedAt: ts(2000) }), true)
  assert.equal(questionChangedSince(q, null), true)                        // ถูกลบ
  assert.equal(questionChangedSince(null, q), true)
  assert.equal(questionChangedSince(null, null), false)
})
