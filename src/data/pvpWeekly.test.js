import { test } from 'node:test'
import assert from 'node:assert/strict'
import { WEEKLY_EFFECTS, activeWeekly, statMult, weeklyRules } from './pvpWeekly.js'
import { simulateBattle } from '../utils/battleEngine.js'

const NOW = 1_800_000_000_000
const team = [{ id: 'cat', rarity: 'common', element: 'fist', grade: 0 }, { id: 'dog', rarity: 'rare', element: 'paper', grade: 0 }]

test('มี 15 อัน id ไม่ซ้ำ', () => {
  assert.equal(WEEKLY_EFFECTS.length, 15)
  assert.equal(new Set(WEEKLY_EFFECTS.map(e => e.id)).size, 15)
})
test('activeWeekly: หมดเวลา/ไม่รู้จัก = null', () => {
  assert.equal(activeWeekly({ id: 'burn', endsAt: NOW - 1 }, NOW), null)
  assert.equal(activeWeekly({ id: 'nope', endsAt: NOW + 1 }, NOW), null)
  assert.equal(activeWeekly(null, NOW), null)
  assert.equal(activeWeekly({ id: 'burn', endsAt: NOW + 1 }, NOW).id, 'burn')
})
test('statMult ตามสาย/หัวแถว', () => {
  assert.deepEqual(statMult(weeklyRules('elFist'), { element: 'fist' }, 1), { atk: 1.2, hp: 1.2 })
  assert.deepEqual(statMult(weeklyRules('elFist'), { element: 'paper' }, 1), { atk: 1, hp: 1 })
  assert.deepEqual(statMult(weeklyRules('vanguard'), {}, 1), { atk: 1, hp: 1 })
  assert.equal(statMult(weeklyRules('vanguard'), {}, 0).atk, 1.3)
})
test('ไม่ส่ง weekly = ผลเหมือนเดิมเป๊ะ', () => {
  const a = simulateBattle(team, team, 42), b = simulateBattle(team, team, 42, {})
  assert.deepEqual(a, b)
})
test('siege: maxHp ใน units ขึ้น 40%', () => {
  const a = simulateBattle(team, team, 42), b = simulateBattle(team, team, 42, { weekly: 'siege' })
  assert.ok(Math.abs(b.units.A0.maxHp / a.units.A0.maxHp - 1.4) < 0.05)   // units ปัดเศษแล้ว
})
test('burn/spring: มี event จบรอบ ไม่มีใครตายเพราะไหม้', () => {
  for (const id of ['burn', 'spring']) {
    const r = simulateBattle(team, team, 7, { weekly: id })
    const evs = r.log.filter(e => e.effect === (id === 'burn' ? 'weeklyBurn' : 'weeklyHeal'))
    assert.ok(evs.length > 0)
    for (const e of evs) for (const v of Object.values(e.hpMap)) assert.ok(v >= 1 && v <= 100)
  }
})
test('ทุกเอฟเฟกต์รันจบได้', () => {
  for (const w of WEEKLY_EFFECTS) assert.ok(['A', 'B'].includes(simulateBattle(team, team, 3, { weekly: w.id }).winner))
})
