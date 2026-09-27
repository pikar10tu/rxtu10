import { test } from 'node:test'
import assert from 'node:assert/strict'
import { dailyView, bumpDaily, canClaimDaily } from './pvpDaily.js'

test('ข้ามวัน = เริ่ม 0', () => assert.deepEqual(dailyView({ date: '2026-09-27', n: 9, claimed: true }, '2026-09-28'), { date: '2026-09-28', n: 0, claimed: false }))
test('นับ + รับได้เมื่อครบ 5 และยังไม่รับ', () => {
  let pd = null
  for (let i = 0; i < 4; i++) pd = bumpDaily(pd, 'd')
  assert.equal(canClaimDaily(pd, 'd'), false)
  pd = bumpDaily(pd, 'd')
  assert.equal(canClaimDaily(pd, 'd'), true)
  assert.equal(canClaimDaily({ ...pd, claimed: true }, 'd'), false)
})
