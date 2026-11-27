import { test } from 'node:test'
import assert from 'node:assert/strict'
import { questStats, questProgress, questUnlocked, nextDailyStreak, progressText } from './dollQuests.js'

test('ตัวนับเดิมนับย้อนหลัง: หอคอย · สนามประลอง · ฟาร์ม · ข้อถูก', () => {
  const st = questStats({ towerBest: 52, pvpFightsTotal: 3, farm: { harvests: { a: 60, b: 45 } }, study: { gs: { g1: { c: 400, t: 500 }, g2: { c: 650, t: 700 } } } })
  assert.equal(st.towerFloor, 52); assert.equal(st.arenaFights, 3); assert.equal(st.harvests, 105); assert.equal(st.quizCorrect, 1050)
})

test('ครบเงื่อนไข = ได้ทั้ง 3 ชิ้นของเซ็ต · ยังไม่ครบ = ไม่ได้', () => {
  const ids = questUnlocked({ towerBest: 50, quest: { zlib: 7199 } })
  assert.deepEqual(ids.sort(), ['f70', 'i21', 'x63'])
  assert.ok(questUnlocked({ quest: { zlib: 7200 } }).includes('a20'))
})

test('ความคืบหน้าไม่เกินเป้า + ข้อความเวลา', () => {
  const p = questProgress({ quest: { zcafe: 99999 } }).cafe
  assert.equal(p.have, 7200); assert.ok(p.done)
  assert.equal(progressText({ have: 5400, need: 7200, unit: 'sec' }), '1:30 ชม. / 2:00 ชม.')
  assert.equal(progressText({ have: 600, need: 7200, unit: 'sec' }), '10 นาที / 2:00 ชม.')
})

test('สตรีคข้อสอบประจำวัน', () => {
  assert.deepEqual(nextDailyStreak(undefined, '2026-11-27', '2026-11-26'), { dDay: '2026-11-27', dStreak: 1, dBest: 1 })
  assert.equal(nextDailyStreak({ dDay: '2026-11-26', dStreak: 4, dBest: 4 }, '2026-11-27', '2026-11-26').dStreak, 5)
  assert.equal(nextDailyStreak({ dDay: '2026-11-27', dStreak: 5, dBest: 5 }, '2026-11-27', '2026-11-26').dStreak, 5)
  const broke = nextDailyStreak({ dDay: '2026-11-20', dStreak: 4, dBest: 4 }, '2026-11-27', '2026-11-26')
  assert.equal(broke.dStreak, 1); assert.equal(broke.dBest, 4)
})

test('สตรีคย้อนหลังจาก dc.days', async () => {
  const { longestRun } = await import('./dollQuests.js')
  assert.equal(longestRun(['2026-11-20', '2026-11-21', '2026-11-22', '2026-11-24', '2026-11-25']), 3)
  assert.equal(questStats({ dc: { days: ['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05'] } }).dailyStreak, 5)
})
