// เทส quizReward — pure logic เหรียญข้อสอบ (SP1: 100/ข้อ เพดานตามบ้าน)
// รัน: node --test src/utils/quizReward.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { quizDailyCap, quizGrant } from './quizReward.js'

test('quizDailyCap: บ้านเล็ก (Lv1 income 300) < พื้น → ใช้พื้น', () => {
  assert.equal(quizDailyCap(1, 1000), 1000)
})
test('quizDailyCap: บ้านใหญ่ (Lv15 income 140000) → ใช้รายได้บ้าน', () => {
  assert.equal(quizDailyCap(15, 1000), 140000)
})
test('quizDailyCap: level หาย/undefined → clamp Lv1 → ใช้พื้น', () => {
  assert.equal(quizDailyCap(undefined, 1000), 1000)
})
test('quizGrant: คูณ perCorrect ภายในเพดาน', () => {
  assert.equal(quizGrant(3, 0, 1000, 100), 300)
})
test('quizGrant: เกินเพดานที่เหลือ → clamp', () => {
  assert.equal(quizGrant(20, 0, 1000, 100), 1000)   // 2000 → 1000
  assert.equal(quizGrant(5, 800, 1000, 100), 200)   // เหลือ 200
})
test('quizGrant: เต็มเพดานแล้ว → 0 (ไม่ติดลบ)', () => {
  assert.equal(quizGrant(5, 1000, 1000, 100), 0)
  assert.equal(quizGrant(5, 1200, 1000, 100), 0)
})
