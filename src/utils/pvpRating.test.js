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

// ── เคิร์ฟขึ้นยากตามแต้ม (3 ต.ค. 2026) ──
import { climbMult } from './pvpRating.js'
test('climbMult: ช่วงแรกได้เยอะ ช่วงหลังได้น้อย · มีพื้นต่ำสุด', () => {
  assert.equal(climbMult(1000), 1.25)
  assert.ok(climbMult(1600) < 0.7 && climbMult(1600) > 0.55)
  assert.ok(Math.abs(climbMult(2000) - 0.2) < 1e-9)
  assert.equal(climbMult(3000), 0.15)
  assert.equal(climbMult(500), 1.25)
})
test('nextRating: ชนะคู่เท่ากันที่ 1600 ได้น้อยกว่าที่ 1000 มาก แต่แพ้เสียเท่าเดิม', () => {
  const g1000 = nextRating(1000, 1000, true) - 1000
  const g1600 = nextRating(1600, 1600, true) - 1600
  assert.equal(g1000, 20)
  assert.equal(g1600, 10)
  assert.equal(nextRating(1600, 1600, false), 1584)
})
test('nextRating: ต่ำกว่า 1100 แพ้เสียแต้มเบาลง', () => {
  assert.equal(nextRating(1000, 1000, false), 988)
})
