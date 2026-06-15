// เทส parseImport — pure function แปลง JSON text → { rows, skipped, error }
// รัน: node --test src/utils/importQuestions.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseImport } from './importQuestions.js'
import { LIMITS } from './text.js'

const one = (obj) => JSON.stringify([obj])

test('นำเข้าข้อที่ถูกต้อง 1 ข้อ → rows 1 ข้อ, ไม่ข้าม', () => {
  const r = parseImport(one({
    question: 'ยาใดเป็น first-line', choices: ['A', 'B', 'C', 'D'], answer: 2,
    category: 'ยาปฏิชีวนะ', explanation: 'เพราะ X',
  }))
  assert.equal(r.error, null)
  assert.equal(r.skipped.length, 0)
  assert.equal(r.rows.length, 1)
  assert.deepEqual(r.rows[0], {
    question: 'ยาใดเป็น first-line', choices: ['A', 'B', 'C', 'D'], answer: 2,
    category: 'ยาปฏิชีวนะ', explanation: 'เพราะ X', isPublished: false,
  })
})

test('บังคับ isPublished:false เสมอ แม้ JSON ส่ง true มา', () => {
  const r = parseImport(one({ question: 'Q', choices: ['a', 'b'], answer: 0, isPublished: true }))
  assert.equal(r.rows.length, 1)
  assert.equal(r.rows[0].isPublished, false)
})

test('answer เกินช่วง → clamp เป็น 0 (เหมือน save())', () => {
  const r = parseImport(one({ question: 'Q', choices: ['a', 'b'], answer: 9 }))
  assert.equal(r.rows[0].answer, 0)
})

test('answer เป็น string "1" → coerce เป็นเลข 1', () => {
  const r = parseImport(one({ question: 'Q', choices: ['a', 'b'], answer: '1' }))
  assert.equal(r.rows[0].answer, 1)
})

test('answer หาย → default 0', () => {
  const r = parseImport(one({ question: 'Q', choices: ['a', 'b'] }))
  assert.equal(r.rows[0].answer, 0)
})

test('ตัวเลือกว่างถูก drop และนับเฉพาะที่ไม่ว่าง', () => {
  const r = parseImport(one({ question: 'Q', choices: ['a', '', '  ', 'b', ''], answer: 0 }))
  assert.deepEqual(r.rows[0].choices, ['a', 'b'])
})

test('ตัวเลือกไม่ว่าง < 2 → ข้าม', () => {
  const r = parseImport(one({ question: 'Q', choices: ['a', '', ''], answer: 0 }))
  assert.equal(r.rows.length, 0)
  assert.equal(r.skipped.length, 1)
  assert.equal(r.skipped[0].index, 0)
})

test('ไม่มีโจทย์ (ว่าง/มีแต่ช่องว่าง) → ข้าม', () => {
  const r = parseImport(one({ question: '   ', choices: ['a', 'b'], answer: 0 }))
  assert.equal(r.rows.length, 0)
  assert.equal(r.skipped.length, 1)
})

test('choices ไม่ใช่ array → ข้าม', () => {
  const r = parseImport(one({ question: 'Q', choices: 'a,b', answer: 0 }))
  assert.equal(r.rows.length, 0)
  assert.equal(r.skipped.length, 1)
})

test('category/explanation ไม่ส่งมา → เป็น null', () => {
  const r = parseImport(one({ question: 'Q', choices: ['a', 'b'], answer: 0 }))
  assert.equal(r.rows[0].category, null)
  assert.equal(r.rows[0].explanation, null)
})

test('field เกินความยาว LIMITS → ถูกตัด ไม่ข้าม', () => {
  const longQ = 'ก'.repeat(LIMITS.question + 50)
  const r = parseImport(one({ question: longQ, choices: ['a', 'b'], answer: 0 }))
  assert.equal(r.rows.length, 1)
  assert.equal(r.rows[0].question.length, LIMITS.question)
})

test('JSON พัง → error ถูกตั้ง, rows ว่าง', () => {
  const r = parseImport('{ not valid json ]')
  assert.ok(r.error)
  assert.equal(r.rows.length, 0)
})

test('JSON ไม่ใช่ array (เป็น object) → error ถูกตั้ง', () => {
  const r = parseImport(JSON.stringify({ question: 'Q' }))
  assert.ok(r.error)
})

test('ข้อความว่าง → error ถูกตั้ง', () => {
  const r = parseImport('   ')
  assert.ok(r.error)
})

test('คละถูก/ผิด → แยก rows กับ skipped ถูกต้อง', () => {
  const r = parseImport(JSON.stringify([
    { question: 'ดี1', choices: ['a', 'b'], answer: 1 },        // ok
    { question: '', choices: ['a', 'b'], answer: 0 },            // skip: no question
    { question: 'ดี2', choices: ['a', 'b', 'c'], answer: 5 },    // ok (answer clamp 0)
    { question: 'ผิด', choices: ['only'], answer: 0 },           // skip: <2 choices
  ]))
  assert.equal(r.error, null)
  assert.equal(r.rows.length, 2)
  assert.equal(r.skipped.length, 2)
  assert.deepEqual(r.skipped.map(s => s.index), [1, 3])
  assert.equal(r.rows[1].answer, 0) // clamp
})

test('item ไม่ใช่ object (เช่น string/null) → ข้าม', () => {
  const r = parseImport(JSON.stringify(['hello', null, 42]))
  assert.equal(r.rows.length, 0)
  assert.equal(r.skipped.length, 3)
})
