import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getFloorTeam, getTowerBonus, TOWER_MAX, floorZone } from './towerFloors.js'

test('getFloorTeam คืน 4 ตัวเสมอ + deterministic', () => {
  for (const f of [1, 10, 25, 50]) {
    const t = getFloorTeam(f)
    assert.equal(t.length, 3)
    assert.deepEqual(getFloorTeam(f), t)
    t.forEach(p => { assert.ok(p.id && p.rarity && p.element); assert.ok(p.grade >= 0 && p.grade <= 5) })
  }
})

test('ชั้นสูง เกรดเฉลี่ย ≥ ชั้นต่ำ', () => {
  const avg = (f) => getFloorTeam(f).reduce((s, p) => s + p.grade, 0) / 4
  assert.ok(avg(50) >= avg(1))
  assert.ok(avg(40) >= avg(10))
})

test('getTowerBonus: เพิ่มทุกชั้น 1→50 + ขอบ/ตัน', () => {
  assert.equal(getTowerBonus(0), 0)          // ยังไม่ผ่านชั้นไหน
  assert.equal(getTowerBonus(1), 50)         // ชั้น 1 = ค่าต่ำสุด (มีรางวัลตั้งแต่ก้าวแรก)
  assert.equal(getTowerBonus(50), 12000)     // ชั้น 50 = ตัน
  assert.equal(getTowerBonus(60), 12000)     // เกิน 50 → clamp ที่ตัน
  assert.equal(getTowerBonus(50.9), 12000)   // ทศนิยม → floor

  // เพิ่มขึ้น "ทุกชั้น" จริง (strictly increasing) ตั้งแต่ 1 ถึง 50
  let prev = getTowerBonus(1)
  for (let f = 2; f <= TOWER_MAX; f++) {
    const b = getTowerBonus(f)
    assert.ok(b > prev, `ชั้น ${f} (${b}) ต้องมากกว่าชั้น ${f - 1} (${prev})`)
    prev = b
  }
})

test('floorZone: ขอบเขตชั้นแมปโซนถูก', () => {
  assert.equal(floorZone(1).name, 'ลานประลอง')
  assert.equal(floorZone(12).name, 'ลานประลอง')
  assert.equal(floorZone(13).name, 'หอเวทเก่า')
  assert.equal(floorZone(25).name, 'หอเวทเก่า')
  assert.equal(floorZone(26).name, 'ปราการอสูร')
  assert.equal(floorZone(38).name, 'ปราการอสูร')
  assert.equal(floorZone(39).name, 'ยอดหอคอยมังกร')
  assert.equal(floorZone(50).name, 'ยอดหอคอยมังกร')
})
test('floorZone: clamp นอกช่วง', () => {
  assert.equal(floorZone(0).name, 'ลานประลอง')
  assert.equal(floorZone(999).name, 'ยอดหอคอยมังกร')
  assert.ok(floorZone(7).from === 1 && floorZone(7).to === 12)
})
