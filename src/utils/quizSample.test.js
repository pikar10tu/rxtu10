// เทส quizSample — รวมผล windowed query 2 รอบ → dedup ด้วย id → ตัดให้เหลือ ≤ n
// รัน: node --test src/utils/quizSample.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { quizSample } from './quizSample.js'

const docs = (...ids) => ids.map(id => ({ id, question: 'Q' + id }))

test('first ครบ N แล้ว → คืน N ข้อแรก ไม่แตะ wrap', () => {
  const r = quizSample(docs(1, 2, 3, 4, 5), docs(9), 3)
  assert.equal(r.length, 3)
  assert.deepEqual(r.map(d => d.id), [1, 2, 3])
})

test('first ไม่ครบ → เติมจาก wrap จนครบ N', () => {
  const r = quizSample(docs(1, 2), docs(1, 2, 3, 4), 3)
  assert.equal(r.length, 3)
  assert.deepEqual(r.map(d => d.id), [1, 2, 3])
})

test('dedup: ไม่มี id ซ้ำในผลลัพธ์', () => {
  const r = quizSample(docs(1, 2, 3), docs(1, 2, 3), 5)
  assert.deepEqual(r.map(d => d.id), [1, 2, 3])
})

test('ข้อรวมน้อยกว่า N → คืนเท่าที่มี ไม่ error', () => {
  const r = quizSample(docs(1, 2), docs(1, 2), 15)
  assert.equal(r.length, 2)
})

test('ว่างทั้งคู่ → คืน []', () => {
  assert.deepEqual(quizSample([], [], 15), [])
})
