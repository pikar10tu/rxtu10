import { test } from 'node:test'
import assert from 'node:assert/strict'
import { dunWinsToday, dunReward, bonusLeft, dunWinPatch, tierUnlocked } from './dungeon.js'
import { PUMPKIN_DUNGEON } from '../data/dungeons.js'

const EV = { id: 'hw26' }
const T3 = PUMPKIN_DUNGEON.tiers[2]
const inc = (n) => ({ inc: n })

test('นับตาชนะเฉพาะวันนี้ของอีเวนต์นี้', () => {
  assert.equal(dunWinsToday({ evt: { id: 'hw26', dun: { d: '2026-10-25', n: 3 } } }, EV, '2026-10-25'), 3)
  assert.equal(dunWinsToday({ evt: { id: 'hw26', dun: { d: '2026-10-24', n: 3 } } }, EV, '2026-10-25'), 0)
  assert.equal(dunWinsToday({ evt: { id: 'old', dun: { d: '2026-10-25', n: 3 } } }, EV, '2026-10-25'), 0)
})

test('5 ตาแรก x5 แล้วเหลือฐาน', () => {
  assert.equal(dunReward(T3, 0), 15)
  assert.equal(dunReward(T3, 4), 15)
  assert.equal(dunReward(T3, 5), 3)
  assert.equal(bonusLeft(2), 3)
  assert.equal(bonusLeft(9), 0)
})

test('patch: อีเวนต์เดิม increment + นับตา · ยังไม่มี evt เขียนทั้งก้อน', () => {
  const u = { evt: { id: 'hw26', pts: 10, buy: { a: 1 }, dun: { d: '2026-10-25', n: 5 } } }
  const p = dunWinPatch(u, EV, T3, '2026-10-25', inc)
  assert.equal(p.pts, 3)
  assert.deepEqual(p.server, { 'evt.pts': { inc: 3 }, 'evt.got': { inc: 3 }, 'evt.dun': { d: '2026-10-25', n: 6 }, 'evt.dc': 3 })
  assert.equal(p.local.evt.pts, 13)
  assert.deepEqual(p.local.evt.buy, { a: 1 })
  const q = dunWinPatch({}, EV, T3, '2026-10-25', inc)
  assert.deepEqual(q.server, { evt: { id: 'hw26', pts: 15, got: 15, buy: {}, dun: { d: '2026-10-25', n: 1 }, dc: 3 } })
})

test('ปลดขั้นตามลำดับ', () => {
  const [t1, t2, t3] = PUMPKIN_DUNGEON.tiers
  assert.equal(tierUnlocked({}, EV, t1), true)
  assert.equal(tierUnlocked({}, EV, t2), false)
  assert.equal(tierUnlocked({ evt: { id: 'hw26', dc: 1 } }, EV, t2), true)
  assert.equal(tierUnlocked({ evt: { id: 'hw26', dc: 1 } }, EV, t3), false)
})
