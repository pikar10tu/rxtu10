import { test } from 'node:test'
import assert from 'node:assert/strict'
import { accruedCoins, DAY_MS } from './idleIncome.js'

const H = 60 * 60 * 1000
const RATE = 2400 // เรท/วัน ก่อนบัฟ → 100/ชม.

test('ไม่มีบัฟ: สะสมตามเรทตรงๆ (12ชม. = ครึ่งวัน)', () => {
  assert.equal(accruedCoins({ baseRatePerDay: RATE, lastMs: 0, now: 12 * H, buffUntil: 0 }), 1200)
})

test('บัฟครอบทั้งหน้าต่าง: ×1.5 ทั้งก้อน', () => {
  // window [0,12ชม], buff [24ชม−24ชม, 24ชม] = [0,24ชม] ครอบเต็ม
  assert.equal(accruedCoins({ baseRatePerDay: RATE, lastMs: 0, now: 12 * H, buffUntil: 24 * H }), 1800)
})

test('บัฟครอบครึ่งหน้าต่าง: ครึ่งแรก ×1.5 ครึ่งหลัง ×1', () => {
  // window [0,12ชม], buff [6ชม−24ชม, 6ชม] → ทับ [0,6ชม] = 6ชม.
  // weighted = 6ชม ×1 + 6ชม ×1.5 = 15ชม → 2400×15/24 = 1500
  assert.equal(accruedCoins({ baseRatePerDay: RATE, lastMs: 0, now: 12 * H, buffUntil: 6 * H }), 1500)
})

test('บัฟหมดก่อนหน้าต่างเริ่ม: ไม่ได้ ×1.5 เลย', () => {
  // window [10ชม,12ชม], buff [−.., 8ชม] ไม่ทับ → ×1 ล้วน = 2ชม → 200
  assert.equal(accruedCoins({ baseRatePerDay: RATE, lastMs: 10 * H, now: 12 * H, buffUntil: 8 * H }), 200)
})

test('เกิน 24ชม.: cap หน้าต่างที่ 24ชม.', () => {
  assert.equal(accruedCoins({ baseRatePerDay: RATE, lastMs: 0, now: 48 * H, buffUntil: 0 }), RATE)
})

test('เกิน 24ชม. + บัฟครอบทั้ง cap: ×1.5 เต็ม', () => {
  // window [24ชม,48ชม], buff [24ชม,48ชม] ครอบเต็ม → 2400×1.5 = 3600
  assert.equal(accruedCoins({ baseRatePerDay: RATE, lastMs: 0, now: 48 * H, buffUntil: 48 * H }), 3600)
})

test('เรท 0 หรือ now ≤ lastMs → 0', () => {
  assert.equal(accruedCoins({ baseRatePerDay: 0, lastMs: 0, now: 12 * H }), 0)
  assert.equal(accruedCoins({ baseRatePerDay: RATE, lastMs: 12 * H, now: 12 * H }), 0)
})

test('DAY_MS = 24ชม.', () => {
  assert.equal(DAY_MS, 24 * H)
})
