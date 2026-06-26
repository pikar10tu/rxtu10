// src/utils/pvpRating.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { expectedScore, nextRating, PVP_RATING_START, PVP_RATING_FLOOR } from './pvpRating.js'

test('expectedScore: เรตเท่ากัน = 0.5', () => {
  assert.equal(expectedScore(1000, 1000), 0.5)
})
test('expectedScore: สมมาตร (รวมกัน = 1)', () => {
  const a = expectedScore(1200, 900), b = expectedScore(900, 1200)
  assert.ok(Math.abs((a + b) - 1) < 1e-9)
})
test('nextRating: ชนะได้แต้มขึ้น แพ้แต้มลง', () => {
  assert.ok(nextRating(1000, 1000, true) > 1000)
  assert.ok(nextRating(1000, 1000, false) < 1000)
})
test('nextRating: ชนะคนแกร่งกว่าได้เยอะกว่าชนะคนอ่อนกว่า', () => {
  assert.ok(nextRating(1000, 1400, true) > nextRating(1000, 600, true))
})
test('nextRating: mult 0.5 = delta ครึ่งของ mult 1 (เรตเท่ากัน)', () => {
  const full = nextRating(1000, 1000, true, { mult: 1 }) - 1000
  const half = nextRating(1000, 1000, true, { mult: 0.5 }) - 1000
  assert.equal(half, full / 2)
})
test('nextRating: clamp ไม่ต่ำกว่า floor', () => {
  // เรตใกล้ floor + แพ้คู่สูสี → delta ลบเยอะพอจะหลุด floor → ต้องถูก clamp ที่ floor
  assert.equal(nextRating(105, 105, false), PVP_RATING_FLOOR)
})
test('ค่าเริ่ม 1000', () => { assert.equal(PVP_RATING_START, 1000) })
