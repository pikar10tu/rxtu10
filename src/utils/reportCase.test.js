import test from 'node:test'
import assert from 'node:assert/strict'
import { canHandleReport, nextReportGroup, snapshotDiffers } from './reportCase.js'

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
  assert.equal(nextReportGroup(gs, new Set()).questionId, 'a')
  assert.equal(nextReportGroup(gs, new Set(['a'])).questionId, 'b')
  assert.equal(nextReportGroup(gs, new Set(['a', 'b'])), null)
  assert.equal(nextReportGroup(null, new Set()), null)
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
