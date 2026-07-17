import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getFloorTeam, getTowerBonus, TOWER_MAX, floorZone, botCount, botGrade, TOWER_BONUS_FLOORS, BONUS_CAP_FLOOR } from './towerFloors.js'

test('TOWER_MAX = 100', () => { assert.equal(TOWER_MAX, 100) })

test('botCount: ชั้น 1=1, ชั้น 2=2, ชั้น 3+=3', () => {
  assert.equal(botCount(1), 1)
  assert.equal(botCount(2), 2)
  assert.equal(botCount(3), 3)
  assert.equal(botCount(50), 3)
  assert.equal(botCount(100), 3)
})

test('getFloorTeam: ยาวตาม botCount + deterministic + fields ครบ', () => {
  assert.equal(getFloorTeam(1).length, 1)
  assert.equal(getFloorTeam(2).length, 2)
  for (const f of [3, 20, 55, 70, 100]) {
    const t = getFloorTeam(f)
    assert.equal(t.length, 3)
    assert.deepEqual(getFloorTeam(f), t)  // deterministic
    t.forEach(p => { assert.ok(p.id && p.rarity && p.element); assert.ok(p.grade >= 0 && p.grade <= 5) })
  }
})

test('botGrade: 0 ถึงชั้น 20, ไต่ 1→4, V แตะที่ชั้น 70 พอดี, คง V ถึง 100', () => {
  assert.equal(botGrade(1), 0)
  assert.equal(botGrade(20), 0)
  assert.equal(botGrade(21), 1)
  assert.equal(botGrade(69), 4)
  assert.equal(botGrade(70), 5)   // first V ที่ 70 ไม่ใช่ 65
  assert.equal(botGrade(100), 5)
})

test('getFloorTeam: tier/rarity boundary ถูกต้อง (common/rare/epic/legendary)', () => {
  const rarityAt = (f) => getFloorTeam(f)[0].rarity
  assert.equal(rarityAt(20), 'common')
  assert.equal(rarityAt(21), 'rare')
  assert.equal(rarityAt(40), 'rare')
  assert.equal(rarityAt(41), 'epic')
  assert.equal(rarityAt(55), 'epic')
  assert.equal(rarityAt(56), 'legendary')
  assert.equal(rarityAt(100), 'legendary')
})

test('เกรดเฉลี่ยชั้นสูง ≥ ชั้นต่ำ (หาร length จริง)', () => {
  const avg = (f) => { const t = getFloorTeam(f); return t.reduce((s, p) => s + p.grade, 0) / t.length }
  assert.ok(avg(100) >= avg(20))
  assert.ok(avg(60) >= avg(30))
})

test('getTowerBonus: ตันที่ชั้น 70 = 20000, MIN ชั้น 1 = 50, flat 71–100', () => {
  assert.equal(getTowerBonus(0), 0)
  assert.equal(getTowerBonus(1), 50)
  assert.equal(getTowerBonus(70), 20000)
  assert.equal(getTowerBonus(100), 20000)   // flat หลัง cap
  assert.equal(getTowerBonus(70.9), 20000)  // floor
  assert.equal(BONUS_CAP_FLOOR, 70)
})

test('getTowerBonus: strictly-increasing ชั้น 1→70 แล้ว flat 70→100', () => {
  let prev = getTowerBonus(1)
  for (let f = 2; f <= BONUS_CAP_FLOOR; f++) {
    const b = getTowerBonus(f)
    assert.ok(b > prev, `ชั้น ${f} (${b}) ต้อง > ชั้น ${f - 1} (${prev})`)
    prev = b
  }
  for (let f = 71; f <= TOWER_MAX; f++) assert.equal(getTowerBonus(f), 20000)
})

test('floorZone: 5 โซนใหม่ ขอบเขตถูก', () => {
  assert.equal(floorZone(1).name, 'ลานประลอง')
  assert.equal(floorZone(20).name, 'ลานประลอง')
  assert.equal(floorZone(21).name, 'หอเวทเก่า')
  assert.equal(floorZone(40).name, 'หอเวทเก่า')
  assert.equal(floorZone(41).name, 'ปราการอสูร')
  assert.equal(floorZone(55).name, 'ปราการอสูร')
  assert.equal(floorZone(56).name, 'ยอดหอคอยมังกร')
  assert.equal(floorZone(69).name, 'ยอดหอคอยมังกร')
  assert.equal(floorZone(70).name, 'บัลลังก์ราชันย์')
  assert.equal(floorZone(100).name, 'บัลลังก์ราชันย์')
})

test('floorZone: clamp นอกช่วง', () => {
  assert.equal(floorZone(0).name, 'ลานประลอง')
  assert.equal(floorZone(999).name, 'บัลลังก์ราชันย์')
})

test('TOWER_BONUS_FLOORS = หมุดเหรียญถึงชั้น 70 เท่านั้น', () => {
  assert.deepEqual(TOWER_BONUS_FLOORS, [20, 40, 60, 70])
})

test('ธาตุชั้น <70 = ครบ 3 ธาตุ (ไม่ซ้ำ)', () => {
  const els = getFloorTeam(50).map(p => p.element)
  assert.equal(new Set(els).size, 3)
})

test('ธาตุชั้น 70+ = เอน (มีธาตุซ้ำ ไม่ครบ 3) + deterministic', () => {
  for (const f of [70, 71, 72, 85, 100]) {
    const els = getFloorTeam(f).map(p => p.element)
    assert.equal(els.length, 3)
    assert.ok(new Set(els).size < 3, `ชั้น ${f} ควรมีธาตุซ้ำ (เอน) ได้ ${els}`)
    assert.deepEqual(getFloorTeam(f).map(p => p.element), els)  // deterministic
  }
})

test('ชั้น 70+: ธาตุเอนให้ "เคาน์เตอร์" ชนะ — ไม่มี victim slot (กันกับดัก (t+1))', () => {
  // RPS: ELS[k] ชนะ ELS[(k+1)%3] → fist>scissors>paper>fist
  const BEATS = { fist: 'scissors', scissors: 'paper', paper: 'fist' }
  for (const f of [70, 71, 72, 73, 80, 90, 99, 100]) {
    const els = getFloorTeam(f).map(p => p.element)
    const counts = els.reduce((m, e) => (m[e] = (m[e] || 0) + 1, m), {})
    const theme = Object.keys(counts).find(e => counts[e] >= 2)
    assert.ok(theme, `ชั้น ${f} ต้องมีธาตุ theme ซ้ำ ≥2`)
    const victim = BEATS[theme]                                   // ธาตุที่ theme ชนะ (ห้ามอยู่ในทีม)
    const counter = Object.keys(BEATS).find(e => BEATS[e] === theme) // ธาตุที่ชนะ theme (= คำตอบผู้เล่น)
    assert.ok(!els.includes(victim), `ชั้น ${f}: ห้ามมี victim(${victim}) — จะทำให้ก๊อป theme ชนะแทนเคาน์เตอร์`)
    els.forEach(e => assert.ok(e === theme || e === counter, `ชั้น ${f}: ธาตุ ${e} ต้องเป็น theme หรือ counter เท่านั้น`))
  }
})
