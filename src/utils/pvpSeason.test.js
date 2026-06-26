// src/utils/pvpSeason.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { currentSeasonId, applySeasonReset } from './pvpSeason.js'

test('currentSeasonId: YYYY-MM (เดือนมี padding)', () => {
  assert.equal(currentSeasonId(new Date(2026, 0, 15)), '2026-01')
  assert.equal(currentSeasonId(new Date(2026, 11, 1)), '2026-12')
})
test('applySeasonReset: ซีซั่นเดิม = คืนตัวเดิม (ไม่แตะ)', () => {
  const pvp = { rating: 1300, wins: 5, losses: 2, seasonId: '2026-06' }
  assert.equal(applySeasonReset(pvp, '2026-06'), pvp)
})
test('applySeasonReset: ข้ามซีซั่น = บีบเข้ากลางครึ่งทาง + รี wins/losses + stamp', () => {
  const r = applySeasonReset({ rating: 1400, wins: 9, losses: 3, seasonId: '2026-05' }, '2026-06')
  assert.deepEqual(r, { rating: 1200, wins: 0, losses: 0, seasonId: '2026-06' })
})
test('applySeasonReset: ต่ำกว่าฐาน → ดันขึ้นเข้ากลาง', () => {
  assert.equal(applySeasonReset({ rating: 800, seasonId: '2026-05' }, '2026-06').rating, 900)
})
test('applySeasonReset: pvp ว่าง (null) → เริ่มค่าฐาน + stamp', () => {
  assert.deepEqual(applySeasonReset(null, '2026-06'), { rating: 1000, wins: 0, losses: 0, seasonId: '2026-06' })
})
