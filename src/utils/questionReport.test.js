// เทส questionReport — pure logic ของฟีเจอร์แจ้งข้อสอบผิด (Phase 5)
// รัน: node --test src/utils/questionReport.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { reportDocId, buildSnapshot, groupReports, resolvePayload } from './questionReport.js'

test('reportDocId: deterministic ${questionId}__${uid}', () => {
  assert.equal(reportDocId('q1', 'u1'), 'q1__u1')
})

test('buildSnapshot: ตัด field + answerText = ข้อความ choices[answer]', () => {
  const snap = buildSnapshot({ question: 'Q', category: 'C', choices: ['ก', 'ข', 'ค'], answer: 2, explanation: 'E', extra: 'x' })
  assert.deepEqual(snap, { question: 'Q', category: 'C', choices: ['ก', 'ข', 'ค'], answerText: 'ค', explanation: 'E' })
})

test('buildSnapshot: กัน field undefined → ค่าว่าง ไม่ throw', () => {
  assert.deepEqual(buildSnapshot({}), { question: '', category: '', choices: [], answerText: '', explanation: '' })
  assert.deepEqual(buildSnapshot(undefined), { question: '', category: '', choices: [], answerText: '', explanation: '' })
})

test('groupReports: นับถูก / แยก questionId / เรียงใหม่สุดก่อน', () => {
  const reports = [
    { id: 'q1__a', questionId: 'q1', createdAt: 100, questionSnapshot: { question: 'A' } },
    { id: 'q2__b', questionId: 'q2', createdAt: 300, questionSnapshot: { question: 'B' } },
    { id: 'q1__c', questionId: 'q1', createdAt: 200, questionSnapshot: { question: 'A2' } },
  ]
  const g = groupReports(reports)
  assert.equal(g.length, 2)
  assert.equal(g[0].questionId, 'q2')          // กลุ่มใหม่สุด (300) ก่อน
  assert.equal(g[1].questionId, 'q1')
  assert.equal(g[1].count, 2)
  assert.equal(g[1].reports[0].createdAt, 200) // ในกลุ่มเรียงใหม่สุดก่อน
  assert.equal(g[1].snapshot.question, 'A2')   // snapshot = report ใหม่สุดของกลุ่ม
})

test('resolvePayload valid: stamp reward + rewardDelivered:false (ไม่มี resolvedAt — caller เติม)', () => {
  assert.deepEqual(resolvePayload('valid', 50), { status: 'resolved', verdict: 'valid', rewardAmount: 50, rewardDelivered: false })
})

test('resolvePayload invalid: ไม่มีรางวัล', () => {
  assert.deepEqual(resolvePayload('invalid', 50), { status: 'resolved', verdict: 'invalid', rewardAmount: 0 })
})
