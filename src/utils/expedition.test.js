import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  partyPower, elementMatches, expeditionSeed, resolveRewards, expeditionState,
} from './expedition.js'
import { DURATIONS, MISSIONS } from '../data/expeditions.js'

const dur = (id) => DURATIONS.find(d => d.id === id)
const SHORT = dur('short'), LONG = dur('long')
const MIS_FIST = MISSIONS.find(m => m.element === 'fist')

const lowParty = [
  { id: 'a', rarity: 'common', element: 'fist', grade: 0 },
  { id: 'b', rarity: 'common', element: 'scissors', grade: 0 },
  { id: 'c', rarity: 'common', element: 'paper', grade: 0 },
]
const highParty = [
  { id: 'a', rarity: 'legendary', element: 'fist', grade: 5 },
  { id: 'b', rarity: 'legendary', element: 'fist', grade: 5 },
  { id: 'c', rarity: 'legendary', element: 'fist', grade: 5 },
]

test('partyPower: สายเก่ง > สายอ่อน', () => {
  assert.ok(partyPower(highParty) > partyPower(lowParty))
})
test('partyPower: common grade0 = น้ำหนัก 1 ต่อตัว', () => {
  assert.equal(partyPower(lowParty), 3)
})
test('elementMatches: นับตัวธาตุตรง', () => {
  assert.equal(elementMatches(highParty, 'fist'), 3)
  assert.equal(elementMatches(lowParty, 'fist'), 1)
})
test('expeditionSeed: deterministic (input เดิม → seed เดิม) + ต่าง input → ต่าง seed', () => {
  const a = { petIds: ['a', 'b', 'c'], startedAt: 1000, missionId: 'forest', durationId: 'short' }
  assert.equal(expeditionSeed(a), expeditionSeed({ ...a }))
  assert.notEqual(expeditionSeed(a), expeditionSeed({ ...a, startedAt: 1001 }))
})
test('resolveRewards: ได้เหรียญ > 0 และ clamp ไม่เกิน coinCap', () => {
  const r = resolveRewards(highParty, MIS_FIST, LONG, 12345)
  const coin = r.find(x => x.type === 'coins')
  assert.ok(coin && coin.amount > 0)
  assert.ok(coin.amount <= LONG.coinCap)
})
test('resolveRewards: สายเก่ง+ธาตุตรง ได้เหรียญมากกว่าสายอ่อน (มิชชัน/เวลา/seed เดียวกัน)', () => {
  const hi = resolveRewards(highParty, MIS_FIST, LONG, 7).find(x => x.type === 'coins').amount
  const lo = resolveRewards(lowParty, MIS_FIST, LONG, 7).find(x => x.type === 'coins').amount
  assert.ok(hi > lo)
})
test('resolveRewards: deterministic (party/mission/duration/seed เดิม → ผลเดิม)', () => {
  assert.deepEqual(
    resolveRewards(highParty, MIS_FIST, LONG, 999),
    resolveRewards(highParty, MIS_FIST, LONG, 999),
  )
})
test('expeditionState: null → idle', () => {
  assert.equal(expeditionState(null, 1000), 'idle')
})
test('expeditionState: endsAt อนาคต → active, อดีต → ready', () => {
  assert.equal(expeditionState({ endsAt: 5000 }, 1000), 'active')
  assert.equal(expeditionState({ endsAt: 5000 }, 9000), 'ready')
})
