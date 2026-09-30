import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildPvpGuide, buildHof } from './pvpGuide.js'
import { canUseAntiLoss } from './antiLoss.js'
import { claimableMilestones, nextMilestone, sumRewards, milestonesOpen, prevSeasonId } from '../data/towerMilestones.js'

const row = (ids, r = 1000, pw = 0, pl = 0) => ({ tm: ids.map(i => ({ i, g: 5 })), r, pw, pl })

test('use = % ของทีมที่ใส่ · ไม่นับคนไม่มีทีม', () => {
  const g = buildPvpGuide({ a: row(['lion', 'cat']), b: row(['lion']), c: row([]), d: row(['cat', 'cat']) })
  assert.equal(g.teams, 3)
  assert.deepEqual(g.use.slice(0, 2), [{ id: 'cat', v: 67 }, { id: 'lion', v: 67 }])
})

test('top นับเฉพาะคนที่ลงสนามแล้ว', () => {
  const g = buildPvpGuide({ a: row(['lion'], 1500, 3, 0), b: row(['cat'], 2000, 0, 0) })
  assert.deepEqual(g.top, [{ id: 'lion', v: 1 }])
})

test('win ต้องมีคนใช้ ≥3 และไฟต์ ≥10', () => {
  const rows = { a: row(['x'], 1, 10, 0), b: row(['y'], 1, 3, 1), c: row(['y'], 1, 3, 1), d: row(['y'], 1, 2, 2) }
  const g = buildPvpGuide(rows)
  assert.deepEqual(g.win, [{ id: 'y', v: 67, n: 3 }])
})

test('buildHof เรียงอันดับ + ทีมจาก roster', () => {
  const h = buildHof('2026-09', [{ uid: 'b', arena: { rank: 2, rating: 1600 } }, { uid: 'a', arena: { rank: 1, rating: 1700 } }, { uid: 'c', arena: { rank: 4, rating: 1 } }],
    { a: { n: 'A', tm: [{ i: 'lion', g: 5 }] } })
  assert.equal(h.season, '2026-09')
  assert.deepEqual(h.top.map(t => t.n), ['A', '?'])
  assert.deepEqual(h.top[0].tm, [{ i: 'lion', g: 5 }])
  assert.equal(buildHof('x', [], {}), null)
})

test('ยาแก้แพ้ใช้ได้เฉพาะตาล่าสุดที่แพ้', () => {
  const loss = { from: 1240, to: 1226, season: '2026-10' }
  assert.equal(canUseAntiLoss(loss, { rating: 1226, seasonId: '2026-10' }, 1), true)
  assert.equal(canUseAntiLoss(loss, { rating: 1244, seasonId: '2026-10' }, 1), false)   // มีตาใหม่แล้ว
  assert.equal(canUseAntiLoss(loss, { rating: 1226, seasonId: '2026-10' }, 0), false)
  assert.equal(canUseAntiLoss({ ...loss, to: 1240 }, { rating: 1240, seasonId: '2026-10' }, 1), false)
})

test('รางวัลขั้นหอคอย', () => {
  assert.deepEqual(claimableMilestones(35, [10]).map(m => m.f), [20, 30])
  assert.equal(nextMilestone(35).f, 40)
  assert.equal(nextMilestone(100), null)
  assert.deepEqual(sumRewards(claimableMilestones(100, [])), { coins: 108000, tickets: 50, antiLoss: 6 })
})

test('รางวัลขั้นเปิดตั้งแต่ ต.ค. 2026 หลังแจกซีซั่นก่อนเสร็จ', () => {
  assert.equal(prevSeasonId('2027-01'), '2026-12')
  assert.equal(milestonesOpen('2026-09', { '2026-08': { status: 'done' } }), false)
  assert.equal(milestonesOpen('2026-10', {}), false)
  assert.equal(milestonesOpen('2026-10', { '2026-09': { status: 'sending' } }), false)
  assert.equal(milestonesOpen('2026-10', { '2026-09': { status: 'done' } }), true)
  assert.equal(milestonesOpen('2026-11', { '2026-09': { status: 'done' } }), false)
})
