import { test } from 'node:test'
import assert from 'node:assert/strict'
import { accruedCoins, DAY_MS } from './idleIncome.js'

const H = 60 * 60 * 1000
const RATE = 2400 // เรท/วัน ก่อนบัฟ → 100/ชม.

test('ไม่มีบัฟ: สะสมตามเรทตรงๆ (12ชม. = ครึ่งวัน)', () => {
  assert.equal(accruedCoins({ baseRatePerDay: RATE, lastMs: 0, now: 12 * H, buffUntil: 0 }), 1200)
})

test('บัฟครอบทั้งหน้าต่าง: ×1.5 ทั้งก้อน', () => {
  // window [0,12ชม], buff [0,24ชม] ครอบเต็ม
  assert.equal(accruedCoins({ baseRatePerDay: RATE, lastMs: 0, now: 12 * H, buffFrom: 0, buffUntil: 24 * H }), 1800)
})

test('บัฟครอบครึ่งหน้าต่าง: ครึ่งแรก ×1.5 ครึ่งหลัง ×1', () => {
  // window [0,12ชม], buff [0,6ชม] → ทับ [0,6ชม] = 6ชม.
  // weighted = 6ชม ×1 + 6ชม ×1.5 = 15ชม → 2400×15/24 = 1500
  assert.equal(accruedCoins({ baseRatePerDay: RATE, lastMs: 0, now: 12 * H, buffFrom: 0, buffUntil: 6 * H }), 1500)
})

test('บัฟหมดก่อนหน้าต่างเริ่ม: ไม่ได้ ×1.5 เลย', () => {
  // window [10ชม,12ชม], buff [0,8ชม] ไม่ทับ → ×1 ล้วน = 2ชม → 200
  assert.equal(accruedCoins({ baseRatePerDay: RATE, lastMs: 10 * H, now: 12 * H, buffFrom: 0, buffUntil: 8 * H }), 200)
})

test('เกิน 24ชม.: cap หน้าต่างที่ 24ชม.', () => {
  assert.equal(accruedCoins({ baseRatePerDay: RATE, lastMs: 0, now: 48 * H, buffUntil: 0 }), RATE)
})

test('บัฟสแตค (until ยาว >24ชม): เครดิตทั้งหน้าต่างเพราะบัฟครอบจริง', () => {
  // บัฟเริ่ม 0 ต่อเวลาจน until=40ชม. · window [12ชม,24ชม] (cap) ทับ [0,40ชม] เต็ม → ×1.5
  assert.equal(accruedCoins({ baseRatePerDay: RATE, lastMs: 12 * H, now: 24 * H, buffFrom: 0, buffUntil: 40 * H }), 1800)
})

test('เรท 0 หรือ now ≤ lastMs → 0', () => {
  assert.equal(accruedCoins({ baseRatePerDay: 0, lastMs: 0, now: 12 * H }), 0)
  assert.equal(accruedCoins({ baseRatePerDay: RATE, lastMs: 12 * H, now: 12 * H }), 0)
})

test('DAY_MS = 24ชม.', () => {
  assert.equal(DAY_MS, 24 * H)
})
