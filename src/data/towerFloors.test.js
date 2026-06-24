import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getFloorTeam, getTowerBonus, TOWER_MAX } from './towerFloors.js'

test('getFloorTeam คืน 4 ตัวเสมอ + deterministic', () => {
  for (const f of [1, 10, 25, 50]) {
    const t = getFloorTeam(f)
    assert.equal(t.length, 4)
    assert.deepEqual(getFloorTeam(f), t)
    t.forEach(p => { assert.ok(p.id && p.rarity && p.element); assert.ok(p.grade >= 0 && p.grade <= 5) })
  }
})

test('ชั้นสูง เกรดเฉลี่ย ≥ ชั้นต่ำ', () => {
  const avg = (f) => getFloorTeam(f).reduce((s, p) => s + p.grade, 0) / 4
  assert.ok(avg(50) >= avg(1))
  assert.ok(avg(40) >= avg(10))
})

test('getTowerBonus: monotonic + ขอบ ladder', () => {
  assert.equal(getTowerBonus(0), 0)
  assert.equal(getTowerBonus(9), 0)
  assert.equal(getTowerBonus(10), 500)
  assert.equal(getTowerBonus(20), 1500)
  assert.equal(getTowerBonus(30), 4000)
  assert.equal(getTowerBonus(40), 8000)
  assert.equal(getTowerBonus(50), 12000)
  let prev = 0
  for (let f = 0; f <= TOWER_MAX; f++) { const b = getTowerBonus(f); assert.ok(b >= prev); prev = b }
})
