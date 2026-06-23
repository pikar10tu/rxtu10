// เทส questionStats — pure logic ของสถิติรายข้อ (SP2b)
// รัน: node --test src/utils/questionStats.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { tallyAnswers, pctCorrect, isProblem } from './questionStats.js'

test('tallyAnswers: นับ a/c ต่อ qid + รวมซ้ำ', () => {
  const out = tallyAnswers([
    { id: 'q1', correct: true },
    { id: 'q2', correct: false },
    { id: 'q1', correct: false },
  ])
  assert.deepEqual(out, { q1: { a: 2, c: 1 }, q2: { a: 1, c: 0 } })
})

test('tallyAnswers: ข้าม record ที่ไม่มี id + รับ array ว่าง', () => {
  assert.deepEqual(tallyAnswers([{ correct: true }, { id: null, correct: false }]), {})
  assert.deepEqual(tallyAnswers([]), {})
})

test('pctCorrect: ปัดถูก + a<=0 คืน null', () => {
  assert.equal(pctCorrect(4, 1), 25)
  assert.equal(pctCorrect(3, 2), 67)   // 66.67 → 67
  assert.equal(pctCorrect(0, 0), null)
})

test('isProblem: flag เฉพาะ a>=min และ pct<threshold', () => {
  assert.equal(isProblem({ a: 10, c: 4 }, 5, 50), true)   // 40% < 50, a>=5
  assert.equal(isProblem({ a: 10, c: 5 }, 5, 50), false)  // 50% ไม่ < 50 (ขอบไม่ flag)
  assert.equal(isProblem({ a: 3, c: 0 }, 5, 50), false)   // a<min → ไม่ flag แม้ 0%
})

test('isProblem: stat ว่าง/undefined ปลอดภัย', () => {
  assert.equal(isProblem(null, 5, 50), false)
  assert.equal(isProblem(undefined, 5, 50), false)
})
