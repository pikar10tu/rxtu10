// เทส questionReview — pure logic สถานะ/คิว/leaderboard การตรวจข้อสอบ
// รัน: node --test src/utils/questionReview.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { computeStatus, needsReviewBy, tallyReviewCounts, nextReviewQueue, buildLeaderboard } from './questionReview.js'

// ── computeStatus ──
test('ยังไม่มีเสียง → pending', () => {
  assert.equal(computeStatus({}), 'pending')
  assert.equal(computeStatus(null), 'pending')
})
test('1 เสียง (ยังไม่ครบ 2) → pending', () => {
  assert.equal(computeStatus({ a: 'correct' }), 'pending')
  assert.equal(computeStatus({ a: 'wrong' }), 'pending')
})
test('correct + correct → passed', () => {
  assert.equal(computeStatus({ a: 'correct', b: 'correct' }), 'passed')
})
test('correct + fix → conflict', () => {
  assert.equal(computeStatus({ a: 'correct', b: 'fix' }), 'conflict')
})
test('correct + wrong → conflict', () => {
  assert.equal(computeStatus({ a: 'correct', b: 'wrong' }), 'conflict')
})
test('fix + wrong → failed (สองฝั่ง fail นับเป็น failed)', () => {
  assert.equal(computeStatus({ a: 'fix', b: 'wrong' }), 'failed')
})
test('wrong + wrong → failed', () => {
  assert.equal(computeStatus({ a: 'wrong', b: 'wrong' }), 'failed')
})
test('คนที่ 3 ตัดสิน conflict → เสียงข้างมากเป็น passed', () => {
  assert.equal(computeStatus({ a: 'correct', b: 'wrong', c: 'correct' }), 'passed')
})
test('คนที่ 3 ตัดสิน conflict → เสียงข้างมากเป็น failed', () => {
  assert.equal(computeStatus({ a: 'correct', b: 'wrong', c: 'fix' }), 'failed')
})

// ── needsReviewBy ──
test('ข้อตัวเอง (createdBy == me) → ไม่ต้องตรวจ', () => {
  assert.equal(needsReviewBy({ createdBy: 'me', reviewedBy: [] }, 'me'), false)
})
test('ตรวจไปแล้ว (อยู่ใน reviewedBy) → ไม่ต้องตรวจ', () => {
  assert.equal(needsReviewBy({ reviewedBy: ['me'] }, 'me'), false)
})
test('ข้อใหม่ ยังไม่มีใครตรวจ → ต้องตรวจ', () => {
  assert.equal(needsReviewBy({ reviewedBy: [] }, 'me'), true)
  assert.equal(needsReviewBy({}, 'me'), true)
})
test('มี 1 เสียงจากคนอื่น → ยังต้องตรวจ (หาให้ครบ 2)', () => {
  assert.equal(needsReviewBy({ reviewedBy: ['x'], reviewVerdicts: { x: 'correct' } }, 'me'), true)
})
test('ครบ 2 เสียง passed → ไม่ต้องตรวจ', () => {
  const q = { reviewedBy: ['x', 'y'], reviewVerdicts: { x: 'correct', y: 'correct' } }
  assert.equal(needsReviewBy(q, 'me'), false)
})
test('ครบ 2 เสียง failed → ไม่ต้องตรวจ', () => {
  const q = { reviewedBy: ['x', 'y'], reviewVerdicts: { x: 'wrong', y: 'fix' } }
  assert.equal(needsReviewBy(q, 'me'), false)
})
test('conflict (2 เสียงขัดแย้ง) → คนที่ 3 ต้องตรวจ', () => {
  const q = { reviewedBy: ['x', 'y'], reviewVerdicts: { x: 'correct', y: 'wrong' } }
  assert.equal(needsReviewBy(q, 'me'), true)
})
test('conflict แต่ฉันเป็น 1 ใน 2 คนเดิม → ไม่ต้องตรวจซ้ำ', () => {
  const q = { reviewedBy: ['me', 'y'], reviewVerdicts: { me: 'correct', y: 'wrong' } }
  assert.equal(needsReviewBy(q, 'me'), false)
})
test('conflict ที่คนที่ 3 ตัดสินแล้ว → ไม่ต้องตรวจ', () => {
  const q = { reviewedBy: ['x', 'y', 'z'], reviewVerdicts: { x: 'correct', y: 'wrong', z: 'correct' } }
  assert.equal(needsReviewBy(q, 'me'), false)
})

// ── tallyReviewCounts ──
test('นับจำนวนข้อที่แต่ละ uid ตรวจ', () => {
  const qs = [
    { reviewedBy: ['a', 'b'] },
    { reviewedBy: ['a'] },
    { reviewedBy: [] },
    { /* ไม่มี field */ },
  ]
  assert.deepEqual(tallyReviewCounts(qs), { a: 2, b: 1 })
})
test('คลังว่าง → object ว่าง', () => {
  assert.deepEqual(tallyReviewCounts([]), {})
})

// ── nextReviewQueue ──
test('คืนเฉพาะข้อที่ฉันต้องตรวจ (กันข้อตัวเอง/ตรวจซ้ำ/ครบแล้ว)', () => {
  const qs = [
    { id: '1', createdBy: 'me', reviewedBy: [] },                                  // ข้อตัวเอง
    { id: '2', reviewedBy: ['me'] },                                               // ตรวจแล้ว
    { id: '3', reviewedBy: ['x', 'y'], reviewVerdicts: { x: 'correct', y: 'correct' } }, // passed
    { id: '4', reviewedBy: [] },                                                   // ใหม่ → ต้องตรวจ
    { id: '5', reviewedBy: ['x'], reviewVerdicts: { x: 'correct' } },              // 1 เสียง → ต้องตรวจ
  ]
  assert.deepEqual(nextReviewQueue(qs, 'me').map(q => q.id), ['4', '5'])
})
test('ไม่มี myUid → คิวว่าง', () => {
  assert.deepEqual(nextReviewQueue([{ reviewedBy: [] }], null), [])
})

// ── buildLeaderboard ──
test('เรียงมาก→น้อย + แมพชื่อจาก nameMap', () => {
  const rows = buildLeaderboard({ a: 3, b: 5, c: 1 }, { a: 'Ann', b: 'Bee', c: 'Cee' })
  assert.deepEqual(rows, [
    { uid: 'b', name: 'Bee', count: 5 },
    { uid: 'a', name: 'Ann', count: 3 },
    { uid: 'c', name: 'Cee', count: 1 },
  ])
})
test('uid ไม่มีใน nameMap → ชื่อ "ไม่ระบุ"', () => {
  const rows = buildLeaderboard({ z: 2 }, {})
  assert.equal(rows[0].name, 'ไม่ระบุ')
})
test('count เท่ากัน → tiebreak ด้วยชื่อ', () => {
  const rows = buildLeaderboard({ a: 2, b: 2 }, { a: 'Beta', b: 'Alpha' })
  assert.deepEqual(rows.map(r => r.name), ['Alpha', 'Beta'])
})
